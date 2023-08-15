import {Scene, BoxGeometry, BufferGeometry, Matrix4, Mesh, MeshBasicMaterial, Vector3} from "three";
import {acceleratedRaycast, computeBoundsTree, disposeBoundsTree} from "three-mesh-bvh";
import {isBVHGeometry} from "../utils/typeAssert";
import {NES_GAME_SRC1, NES_GAME_SRC2, NES_GAME_SRC3, NES_GAME_SRC4, ON_INTERSECT_TRIGGER, ON_INTERSECT_TRIGGER_STOP} from "../Constants";
import type {InteractionMesh} from "./types";
import Emitter from "../emitter";

Mesh.prototype.raycast = acceleratedRaycast;
// @ts-ignore
BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
// @ts-ignore
BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;

interface InteractionDetectionParams {
	scene: Scene;
	emitter: Emitter;
}

export default class InteractionDetection {
	private scene: Scene;
	private emitter: Emitter;

	private enabled =  true;
	private intersect_boxes: InteractionMesh[] = [];
	private intersect: InteractionMesh | undefined = undefined;

	private interaction_boxes: InteractionMesh["userData"][] = [
		{
			type: "game",
			title: "Super Mario Bros",
			position: new Vector3(-4, 1, 0.9),
			size: new Vector3(1.5, 2, 1.2),
			url: NES_GAME_SRC1
		},
		{
			type: "game",
			title: "Super Mario Bros 3",
			position: new Vector3(-4, 1, -0.87),
			size: new Vector3(1.5, 2, 1.2),
			url: NES_GAME_SRC2
		},
		{
			type: "game",
			title: "Mighty Final Fight",
			position: new Vector3(-4, 1, -2.67),
			size: new Vector3(1.5, 2, 1.2),
			url: NES_GAME_SRC3
		},
		{
			type: "game",
			title: "Mitsume ga Tooru",
			position: new Vector3(-4, 1, -4.52),
			size: new Vector3(1.5, 2, 1.2),
			url: NES_GAME_SRC4
		},
		{
			type: "music",
			title: "当前播放：Midnight City🎵",
			position: new Vector3(0.5, 1.5, 9),
			size: new Vector3(4, 2, 4),
		}
	];

	constructor({
		scene,
		emitter
	}: InteractionDetectionParams) {
		this.scene = scene;
		this.emitter = emitter;

		this._createGameDetectBox();
	}

	getIntersectObj() {
		return this.intersect;
	}

	disableDetection() {
		this.enabled = false;
		this.intersect = undefined;
		this.emitter.$emit(ON_INTERSECT_TRIGGER_STOP);
	}

	enableDetection() {
		this.enabled = true;
		this.intersect = undefined;
	}

	update(character_mesh: Mesh) {
		if (!this.enabled) return;

		const intersect = this.intersect_boxes.find(box => {
			if (isBVHGeometry(box.geometry)) {
				// @ts-ignore
				character_mesh.geometry.computeBoundsTree();
				const transform_matrix = new Matrix4().copy(box.matrixWorld).invert().multiply(character_mesh.matrixWorld);
				const box3 = character_mesh.geometry.boundingBox!;
				return box.geometry.boundsTree.intersectsBox(box3, transform_matrix);
			}
			return false;
		});

		if (intersect && intersect.userData.title !== this.intersect?.userData?.title) {
			this.emitter.$emit(ON_INTERSECT_TRIGGER, intersect.userData);
		}

		if (!intersect && this.intersect) {
			this.emitter.$emit(ON_INTERSECT_TRIGGER_STOP);
		}

		this.intersect = intersect;
	}

	/*
	* 创建交互盒子
	* */
	private _createGameDetectBox() {
		const material = new MeshBasicMaterial({color: 0xff0000, wireframe: true});

		for (const i_box of this.interaction_boxes) {
			const geometry = new BoxGeometry(i_box.size!.x, i_box.size!.y, i_box.size!.z);
			const box = new Mesh(
				geometry,
				material
			) as InteractionMesh;
			box.visible = false;
			box.position.copy(i_box.position!);
			// @ts-ignore
			box.geometry.computeBoundsTree();
			this.scene.add(box);
			box.userData = {
				type: i_box.type,
				title: i_box.title,
				url: i_box.url
			};
			this.intersect_boxes.push(box);
		}
	}
}
