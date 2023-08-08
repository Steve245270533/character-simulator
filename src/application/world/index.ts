import Core from "../core";
import Environment from "../environment";
import Character from "../character";

export default class World {
	core: Core;
	environment: Environment;
	character: Character;

	constructor() {
		this.core = new Core();

		this.environment = new Environment();
		this.character = new Character();
	}

	update(delta: number) {
	}
}
