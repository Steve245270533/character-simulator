import Core from "../core";
import {BoxGeometry, BufferGeometry, Matrix4, Mesh, MeshBasicMaterial, Vector3} from "three";
import {acceleratedRaycast, computeBoundsTree, disposeBoundsTree} from "three-mesh-bvh";
import {isBVHGeometry} from "@/application/utils/typeAssert";
import {NES_GAME_SRC1, NES_GAME_SRC2, NES_GAME_SRC3, NES_GAME_SRC4, ON_INTERSECT_TRIGGER, ON_INTERSECT_TRIGGER_STOP} from "@/application/Constants";
import type {Game_Mesh} from "./types";

Mesh.prototype.raycast = acceleratedRaycast;
// @ts-ignore
BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
// @ts-ignore
BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;

export default class InteractionDetection {
	core: Core;
	private enabled =  true;
	private game_boxes: Game_Mesh[] = [];
	private intersect: Game_Mesh | undefined = undefined;

	private interaction_boxes: Game_Mesh["userData"][] = [
		{
			type: "game",
			title: "Super Mario Bros",
			position: new Vector3(-4, 1, 0.9),
			url: NES_GAME_SRC1
		},
		{
			type: "game",
			title: "Super Mario Bros 3",
			position: new Vector3(-4, 1, -0.87),
			url: NES_GAME_SRC2
		},
		{
			type: "game",
			title: "Mighty Final Fight",
			position: new Vector3(-4, 1, -2.67),
			url: NES_GAME_SRC3
		},
		{
			type: "game",
			title: "Mitsume ga Tooru",
			position: new Vector3(-4, 1, -4.52),
			url: NES_GAME_SRC4
		}
	];

	constructor() {
		this.core = new Core();
		this._createGameDetectBox();
	}

	getIntersectObj() {
		return this.intersect;
	}

	disableDetection() {
		this.enabled = false;
		this.intersect = undefined;
		this.core.$emit(ON_INTERSECT_TRIGGER_STOP);
	}

	enableDetection() {
		this.enabled = true;
		this.intersect = undefined;
	}

	update(character_mesh: Mesh) {
		if (!this.enabled) return;

		const intersect = this.game_boxes.find(box => {
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
			this.core.$emit(ON_INTERSECT_TRIGGER, intersect.userData);
		}

		if (!intersect && this.intersect) {
			this.core.$emit(ON_INTERSECT_TRIGGER_STOP);
		}

		this.intersect = intersect;
	}

	private _createGameDetectBox() {
		const geometry = new BoxGeometry(1.5, 2, 1.2);
		const material = new MeshBasicMaterial({color: 0xff0000, wireframe: true});

		for (const i_box of this.interaction_boxes) {
			const box = new Mesh(
				geometry,
				material
			) as Game_Mesh;
			box.visible = false;
			box.position.copy(i_box.position!);
			// @ts-ignore
			box.geometry.computeBoundsTree();
			this.core.scene.add(box);
			box.userData = {
				type: i_box.type,
				title: i_box.title,
				url: i_box.url
			};
			this.game_boxes.push(box);
		}
	}
}
