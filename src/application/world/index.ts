import Core from "../core";
import Environment from "../environment";
import Character from "../character";
import InteractionDetection from "../InteractionDetection";

export default class World {
	core: Core;
	environment: Environment;
	character: Character;
	interaction_detection: InteractionDetection;

	constructor() {
		this.core = new Core();

		this.environment = new Environment();
		this.character = new Character();
		this.interaction_detection = new InteractionDetection();
	}

	update(delta: number) {
		if (this.environment.is_load_finished && this.environment.collider) {
			this.character.update(delta, this.environment.collider);
		}

		if (this.environment.is_load_finished && this.character.character_shape) {
			this.interaction_detection.update(this.character.character_shape);
		}
	}
}
