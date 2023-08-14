import Core from "../core";
import Loader from "../loader";
import {COLLISION_SCENE_URL, ON_LOAD_SCENE_FINISH, SCENE_BACKGROUND_TEXTURE, WATER_NORMAL1_TEXTURE, WATER_NORMAL2_TEXTURE} from "../Constants";
import {AmbientLight, DirectionalLight, EquirectangularReflectionMapping, Fog, Group, HemisphereLight, Mesh, PlaneGeometry, Vector2} from "three";
import {Water} from "three/examples/jsm/objects/Water2";
import type {BVHGeometry} from "../utils/typeAssert";
import {MeshBVH, StaticGeometryGenerator, type MeshBVHOptions} from "three-mesh-bvh";

export default class Environment {
	private core: Core;
	private loader: Loader;
	private collision_scene: Group | undefined;
	collider: Mesh | undefined;
	is_load_finished = false;

	constructor() {
		this.core = new Core();
		this.loader = this.core.loader;
		this._loadEnvironment();
	}

	/*
	* 加载场景全部物体
	* */
	private async _loadEnvironment() {
		try {
			await this._loadCollisionScene();
			this._initSceneOtherEffects();
			this._createWater();
			this.is_load_finished = true;
			this.core.$emit(ON_LOAD_SCENE_FINISH);
		} catch (e) {
			console.log(e);
		}
	}

	/*
	* 加载地图并绑定碰撞
	* */
	private _loadCollisionScene(): Promise<void> {
		return new Promise(resolve => {
			this.loader.gltf_loader.load(COLLISION_SCENE_URL, (gltf) => {
				this.collision_scene = gltf.scene;

				this.collision_scene.updateMatrixWorld(true);

				this.collision_scene.traverse(item => {
					item.castShadow = true;
					item.receiveShadow = true;
				});

				const static_generator = new StaticGeometryGenerator(this.collision_scene);
				static_generator.attributes = ["position"];

				const generate_geometry = static_generator.generate() as BVHGeometry;
				generate_geometry.boundsTree = new MeshBVH(generate_geometry, {lazyGeneration: false} as MeshBVHOptions);

				this.collider = new Mesh(generate_geometry);
				this.core.scene.add(this.collision_scene);

				resolve();
			});
		});
	}

	/*
	* 创建环境灯光、场景贴图、场景雾
	* */
	private _initSceneOtherEffects() {
		const direction_light = new DirectionalLight(0xffffff, 1);
		direction_light.position.set(-5, 25, -1);
		direction_light.castShadow = true;
		direction_light.shadow.camera.near = 0.01;
		direction_light.shadow.camera.far = 500;
		direction_light.shadow.camera.right = 30;
		direction_light.shadow.camera.left = -30;
		direction_light.shadow.camera.top	= 30;
		direction_light.shadow.camera.bottom = -30;
		direction_light.shadow.mapSize.width = 1024;
		direction_light.shadow.mapSize.height = 1024;
		direction_light.shadow.radius = 2;
		direction_light.shadow.bias = -0.00006;
		this.core.scene.add(direction_light);

		const fill_light = new HemisphereLight(0xffffff, 0xe49959, 1);
		fill_light.position.set(2, 1, 1);
		this.core.scene.add(fill_light);

		this.core.scene.add(new AmbientLight(0xffffff, 1));

		this.core.scene.fog = new Fog(0xcccccc, 10, 900);

		const texture = this.core.loader.texture_loader.load(SCENE_BACKGROUND_TEXTURE);
		texture.mapping = EquirectangularReflectionMapping;
		this.core.scene.background = texture;
	}

	/*
	* 创建户外水池
	* */
	private _createWater() {
		const water = new Water(new PlaneGeometry(8.5, 38, 1024, 1024), {
			color: 0xffffff,
			scale: 0.3,
			flowDirection: new Vector2(3, 1),
			textureHeight: 1024,
			textureWidth: 1024,
			flowSpeed: 0.001,
			reflectivity: 0.05,
			normalMap0: this.core.loader.texture_loader.load(WATER_NORMAL1_TEXTURE),
			normalMap1: this.core.loader.texture_loader.load(WATER_NORMAL2_TEXTURE)
		});
		water.position.set(-1, 0, -30.5);
		water.rotation.x = -(Math.PI / 2);
		this.core.scene.add(water);
	}
}
