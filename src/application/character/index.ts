import Core from "../core";
import {AnimationAction, AnimationMixer, Box3, Line3, Matrix4, Mesh, Group, Object3D, Quaternion, Raycaster, Vector3, BoxGeometry, MeshBasicMaterial} from "three";
import {CHARACTER_IDLE_ACTION_URL, CHARACTER_JUMP_ACTION_URL, CHARACTER_URL, CHARACTER_WALK_ACTION_URL, ON_KEY_DOWN} from "@/application/Constants";
import {isBVHGeometry, isMesh} from "../utils/typeAssert";

type PlayerParams = Partial<{
	is_first_person: boolean,
	reset_position: Vector3,
	reset_y: number,
	speed: number,
	jump_height: number,
	gravity: number
}>

const default_paramas: PlayerParams = {
	is_first_person: false,
	reset_position: new Vector3(-10, 2.5, 10),
	reset_y: -25,
	speed: 3,
	jump_height: 12,
	gravity: -30
};

type Actions = "idle" | "walk" | "jump";

export default class Character {
	private core: Core;

	private camera_raycaster: Raycaster = new Raycaster();

	private mixer: AnimationMixer | undefined;
	private cur_action: Actions = "idle";
	private actions: Record<Actions, AnimationAction | undefined> = {
		"idle": undefined,
		"walk": undefined,
		"jump": undefined
	};
	private character!: Group;
	character_shape!: Mesh;
	private capsule_info = {
		radius: 0.5,
		segment: new Line3(
			new Vector3(),
			new Vector3(0, -10, 0.0)
		)
	};

	private reset_position: Vector3; // 重生点
	private reset_y: number; // 重生掉落高度
	private is_first_person: boolean; // 是否第一人称
	private gravity: number; // 重力
	private jump_height: number; // 跳跃高度
	private speed: number; // 速度
	private player_is_on_ground = false; // 是否在地面
	private velocity = new Vector3();
	private rotate_quarternion = new Quaternion();
	private rotate_angle = new Vector3(0, 1, 0);
	private last_direction_angle: number | undefined;

	private up_vector = new Vector3(0, 1, 0);
	private temp_vector = new Vector3();
	private temp_vector2 = new Vector3();
	private temp_box = new Box3();
	private temp_mat = new Matrix4();
	private temp_segment = new Line3();

	constructor(params?: PlayerParams) {
		this.core = new Core();

		if (params) {
			params = {
				...default_paramas,
				...params
			};
		} else {
			params = default_paramas;
		}

		this.camera_raycaster.far = 5;

		this.is_first_person = params.is_first_person!;
		this.reset_position = params.reset_position!;
		this.reset_y = params.reset_y!;
		this.gravity = params.gravity!;
		this.jump_height = params.jump_height!;
		this.speed = params.speed!;

		this._createCharacter();

		this.core.$on(ON_KEY_DOWN, this._onKeyDown.bind(this));
	}

	update(delta_time: number, scene_collider: Mesh | null) {
		if (!scene_collider || !this.character) return;

		this._updateControls();

		this._updateCharacter(delta_time);

		this._checkCollision(delta_time, scene_collider);

		this._updateCharacterShape();

		this.core.camera.position.sub(this.core.orbit_controls.target);
		this.core.orbit_controls.target.copy(this.character.position);
		this.core.camera.position.add(this.character.position);

		this._checkCameraCollision([scene_collider]);

		this._checkReset();
	}

	/*
	* 添加角色模型&人物动画
	* */
	private async _createCharacter() {
		const model = (await this.core.loader.gltf_loader.loadAsync(CHARACTER_URL)).scene;
		const walk = (await this.core.loader.fbx_loader.loadAsync(CHARACTER_WALK_ACTION_URL)).animations[0];
		const idle = (await this.core.loader.fbx_loader.loadAsync(CHARACTER_IDLE_ACTION_URL)).animations[0];
		const jump = (await this.core.loader.fbx_loader.loadAsync(CHARACTER_JUMP_ACTION_URL)).animations[0];
		this.character = model;

		this.character.scale.set(0.1, 0.1, 0.1);

		this.character.animations = [walk, idle, jump];
		this.mixer = new AnimationMixer(this.character);
		this.actions["walk"] = this.mixer.clipAction(this.character.animations[0]);
		this.actions["idle"] = this.mixer.clipAction(this.character.animations[1]);
		this.actions["jump"] = this.mixer.clipAction(this.character.animations[2]);

		this.actions["idle"].play();

		this.cur_action = "idle";

		this.character.children[0].position.set(0, -15, 0);
		this.character.traverse(item => {
			if (isMesh(item)) {
				item.castShadow = true;
			}
		});

		this.core.scene.add(this.character);

		this._createCharacterShape();

		this.reset();
	}

	/*
	* 创建角色包围盒
	* */
	private _createCharacterShape() {
		this.character_shape = new Mesh(
			new BoxGeometry(0.8, 1.7, 0.8),
			new MeshBasicMaterial({
				color: 0xff9900,
				wireframe: true
			})
		);

		this.character_shape.visible = false;

		this.core.scene.add(this.character_shape);
	}

	/*
	* 更新角色包围盒当前位置
	* */
	private _updateCharacterShape() {
		if (this.character_shape && this.character) {
			this.character_shape.position.copy(this.character.position.clone());
			this.character_shape.translateY(-0.5);
		}
	}

	private _onKeyDown([key_code]: [keycode: string]) {
		if (key_code === "Space") {
			this._characterJump();
		}
		if (key_code === "KeyV") {
			this._switchPersonView();
		}
	}

	private _updateControls() {
		if (this.is_first_person) {
			this.core.orbit_controls.maxPolarAngle = Math.PI;
			this.core.orbit_controls.minDistance = 1e-4;
			this.core.orbit_controls.maxDistance = 1e-4;
		} else {
			// this.core.orbit_controls.maxPolarAngle = Math.PI / 2;
			this.core.orbit_controls.minDistance = 2;
			this.core.orbit_controls.maxDistance = 5;
		}
	}

	/*
	* 更新角色移动、方位朝向、动作
	* */
	private _updateCharacter(delta_time: number) {
		if (this.player_is_on_ground) {
			this.velocity.y = delta_time * this.gravity;
		} else {
			this.velocity.y += delta_time * this.gravity;
		}
		this.character.position.addScaledVector(this.velocity, delta_time);

		this.updateDirection();

		this.updateAction(delta_time);

		// 控制移动
		const angle = this.core.orbit_controls.getAzimuthalAngle();
		if (this.core.control.key_status["KeyW"]) {
			this.temp_vector.set(0, 0, -1).applyAxisAngle(this.up_vector, angle);
			this.character.position.addScaledVector(this.temp_vector, this.speed * delta_time);
		}

		if (this.core.control.key_status["KeyS"]) {
			this.temp_vector.set(0, 0, 1).applyAxisAngle(this.up_vector, angle);
			this.character.position.addScaledVector(this.temp_vector, this.speed * delta_time);
		}

		if (this.core.control.key_status["KeyA"]) {
			this.temp_vector.set(-1, 0, 0).applyAxisAngle(this.up_vector, angle);
			this.character.position.addScaledVector(this.temp_vector, this.speed * delta_time);
		}

		if (this.core.control.key_status["KeyD"]) {
			this.temp_vector.set(1, 0, 0).applyAxisAngle(this.up_vector, angle);
			this.character.position.addScaledVector(this.temp_vector, this.speed * delta_time);
		}

		this.character.updateMatrixWorld();
	}

	/*
	* 控制角色方向
	* */
	private updateDirection() {
		if (!this.core.control.key_status["KeyW"] && !this.core.control.key_status["KeyS"] && !this.core.control.key_status["KeyA"] && !this.core.control.key_status["KeyD"] && !this.core.control.key_status["Space"]) {
			return;
		}

		const quaternion_helper = this.character.quaternion.clone();

		let direction_offset = typeof this.last_direction_angle === "number" ? this.last_direction_angle : Math.PI; // w

		if (this.core.control.key_status["KeyS"]) {
			if (this.core.control.key_status["KeyA"] && this.core.control.key_status["KeyD"]) {
				direction_offset = -Math.PI / 4 + Math.PI / 4; // s+a+d
			} else if (this.core.control.key_status["KeyA"]) {
				direction_offset = -Math.PI / 4; // s+a
			} else if (this.core.control.key_status["KeyD"]) {
				direction_offset = Math.PI / 4; // s+d
			} else {
				direction_offset = -Math.PI / 4 + Math.PI / 4; // s
			}
		} else if (this.core.control.key_status["KeyW"]) {
			if (this.core.control.key_status["KeyA"] && this.core.control.key_status["KeyD"]) { // w+a+d
				direction_offset = Math.PI;
			} else if (this.core.control.key_status["KeyA"]) {
				direction_offset = -Math.PI / 4 - Math.PI / 2; // w+a
			} else if (this.core.control.key_status["KeyD"]) {
				direction_offset = Math.PI / 4 + Math.PI / 2; // w+d
			} else {
				direction_offset = Math.PI;
			}
		} else if (this.core.control.key_status["KeyA"]) {
			direction_offset = -Math.PI / 2; // a
		} else if (this.core.control.key_status["KeyD"]) {
			direction_offset = Math.PI / 2; // d
		}
		this.last_direction_angle = direction_offset;

		// calculate towards camera direction
		const angle_y_camera_direction = Math.atan2((this.core.camera.position.x - this.character.position.x), (this.core.camera.position.z - this.character.position.z));

		// rotate model
		this.rotate_quarternion.setFromAxisAngle(this.rotate_angle, angle_y_camera_direction + direction_offset);
		quaternion_helper.rotateTowards(this.rotate_quarternion, 0.4);
		this.character.quaternion.slerp(quaternion_helper, 0.6);
	}

	/*
	* 控制角色动作
	* */
	private updateAction(delta_time: number) {
		this.mixer?.update(delta_time);

		let next_action: Actions;
		if (this.player_is_on_ground && (this.core.control.key_status["KeyW"] || this.core.control.key_status["KeyS"] || this.core.control.key_status["KeyA"] || this.core.control.key_status["KeyD"])) {
			next_action = "walk";
		} else if (this.player_is_on_ground) {
			next_action = "idle";
		} else {
			next_action = "jump";
		}

		if (next_action !== this.cur_action) {
			this.actions[this.cur_action]?.fadeOut(0.1);
			this.actions[next_action]?.reset().play().fadeIn(0.1);
			this.cur_action = next_action;
		}
	}

	/*
	* 计算角色与场景的碰撞
	* */
	private _checkCollision(delta_time: number, scene_collider: Mesh) {
		// 根据碰撞来调整player位置
		const capsule_info = this.capsule_info;
		this.temp_box.makeEmpty();
		this.temp_mat.copy(scene_collider.matrixWorld).invert();
		this.temp_segment.copy(capsule_info.segment);

		// 获取胶囊体在对撞机局部空间中的位置
		this.temp_segment.start.applyMatrix4(this.character.matrixWorld).applyMatrix4(this.temp_mat);
		this.temp_segment.end.applyMatrix4(this.character.matrixWorld).applyMatrix4(this.temp_mat);

		// 获取胶囊体的轴对齐边界框
		this.temp_box.expandByPoint(this.temp_segment.start);
		this.temp_box.expandByPoint(this.temp_segment.end);

		this.temp_box.min.addScalar(-capsule_info.radius);
		this.temp_box.max.addScalar(capsule_info.radius);

		if (isBVHGeometry(scene_collider.geometry)) {
			scene_collider.geometry.boundsTree.shapecast({
				intersectsBounds: box => box.intersectsBox(this.temp_box),
				intersectsTriangle: tri => {
					// 检查场景是否与胶囊相交，并调整
					const tri_point = this.temp_vector;
					const capsule_point = this.temp_vector2;

					const distance = tri.closestPointToSegment(this.temp_segment, tri_point, capsule_point);
					if (distance < capsule_info.radius) {
						const depth = capsule_info.radius - distance;
						const direction = capsule_point.sub(tri_point).normalize();

						this.temp_segment.start.addScaledVector(direction, depth);
						this.temp_segment.end.addScaledVector(direction, depth);
					}
				}
			});
		}

		// 检查后得到胶囊体对撞机的调整位置
		// 场景碰撞并移动它. capsule_info.segment.start被假定为玩家模型的原点。
		const new_position = this.temp_vector;
		new_position.copy(this.temp_segment.start).applyMatrix4(scene_collider.matrixWorld);

		// 检查对撞机移动了多少
		const delta_vector = this.temp_vector2;
		delta_vector.subVectors(new_position, this.character.position);

		// 如果player主要是垂直调整，我们认为这是在我们应该考虑的地面上
		this.player_is_on_ground = delta_vector.y > Math.abs(delta_time * this.velocity.y * 0.25);

		const offset = Math.max(0.0, delta_vector.length() - 1e-5);
		delta_vector.normalize().multiplyScalar(offset);

		// 调整player模型位置
		this.character.position.add(delta_vector);

		if (!this.player_is_on_ground) {
			delta_vector.normalize();
			this.velocity.addScaledVector(delta_vector, -delta_vector.dot(this.velocity));
		} else {
			this.velocity.set(0, 0, 0);
		}
	}

	/*
	* 相机碰撞检测优化
	* */
	private _checkCameraCollision(colliders: Object3D[]) {
		if (!this.is_first_person) {
			const ray_direction = new Vector3();
			ray_direction.subVectors(this.core.camera.position, this.character.position).normalize();
			this.camera_raycaster.set(this.character.position, ray_direction);
			const intersects = this.camera_raycaster.intersectObjects(colliders);
			if (intersects.length) {
				// 找到碰撞点后还需要往前偏移一点，不然还是可能会看到穿模
				const offset = new Vector3(); // 定义一个向前移动的偏移量
				offset.copy(ray_direction).multiplyScalar(-0.5); // 计算偏移量，这里的distance是想要向前移动的距离
				const new_position = new Vector3().addVectors(intersects[0].point, offset); // 计算新的相机位置
				this.core.camera.position.copy(new_position);

				this.core.orbit_controls.minDistance = 0;
			} else {
				this.core.orbit_controls.minDistance = 2;
			}
		}
	}

	/*
	* 掉落地图检测
	* */
	private _checkReset() {
		if (this.character.position.y < this.reset_y) {
			this.reset();
		}
	}

	reset() {
		this.velocity.set(0, 0, 0);
		this.character.position.copy(this.reset_position);
		this.core.camera.position.sub(this.core.orbit_controls.target);
		this.core.orbit_controls.target.copy(this.character.position);
		this.core.camera.position.add(this.character.position);
		this.core.orbit_controls.update();
	}

	/*
	* 切换视角
	* */
	private _switchPersonView() {
		this.is_first_person = !this.is_first_person;
		if (!this.is_first_person) {
			this.character.visible = true;
			this.core.camera.position.sub(this.core.orbit_controls.target).normalize().multiplyScalar(5).add(this.core.orbit_controls.target);
		} else {
			this.character.visible = false;
		}
	}

	/*
	* 角色跳跃
	* */
	private _characterJump() {
		if (this.player_is_on_ground) {
			this.velocity.y = this.jump_height;
			this.player_is_on_ground = false;
		}
	}
}
