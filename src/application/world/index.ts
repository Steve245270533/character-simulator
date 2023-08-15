import Environment from "../environment";
import Character from "../character";
import InteractionDetection from "../InteractionDetection";
import Audio from "../audio";
import {PerspectiveCamera, Scene} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import Control from "../control";
import Loader from "../loader";
import Emitter from "../Emitter";

interface WorldParams {
	scene: Scene;
	camera: PerspectiveCamera;
	orbit_controls: OrbitControls;
	control: Control;
	loader: Loader;
	emitter: Emitter;
}

export default class World {
	private readonly scene: Scene;
	private readonly camera: PerspectiveCamera;
	private readonly orbit_controls: OrbitControls;
	private readonly control: Control;
	private readonly loader: Loader;
	private readonly emitter: Emitter;

	environment: Environment;
	character: Character;
	interaction_detection: InteractionDetection;
	audio: Audio;

	constructor({
		scene,
		camera,
		orbit_controls,
		control,
		loader,
		emitter
	}: WorldParams) {
		this.scene = scene;
		this.camera = camera;
		this.orbit_controls = orbit_controls;
		this.control = control;
		this.loader = loader;
		this.emitter = emitter;

		this.environment = new Environment({
			scene: this.scene,
			loader: this.loader,
			emitter: this.emitter
		});

		this.character = new Character({
			scene: this.scene,
			camera: this.camera,
			orbit_controls: this.orbit_controls,
			control: this.control,
			loader: this.loader,
			emitter: this.emitter
		});

		this.interaction_detection = new InteractionDetection({
			scene: this.scene,
			emitter: this.emitter
		});

		this.audio = new Audio({
			scene: this.scene,
			camera: this.camera,
			loader: this.loader
		});
	}

	update(delta: number) {
		// 需等待场景加载完毕后更新character，避免初始加载时多余的性能消耗和人物碰撞错误处理
		if (this.environment.is_load_finished && this.environment.collider) {
			this.character.update(delta, this.environment.collider);
		}

		// 需等待场景及人物加载完毕后更新交互探测，避免初始加载时多余的性能消耗
		if (this.environment.is_load_finished && this.character.character_shape) {
			this.interaction_detection.update(this.character.character_shape);
		}
	}
}
