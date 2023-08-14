import Core from "../core";
import Environment from "../environment";
import Character from "../character";
import InteractionDetection from "../InteractionDetection";
import Audio from "../audio";

export default class World {
	private core: Core;
	environment: Environment;
	character: Character;
	interaction_detection: InteractionDetection;
	audio: Audio;

	constructor() {
		this.core = new Core();

		this.environment = new Environment();
		this.character = new Character();
		this.interaction_detection = new InteractionDetection();
		this.audio = new Audio();
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
