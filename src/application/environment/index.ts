import Core from "../core";
import Loader from "../loader";

export default class Environment {
	core: Core;
	loader: Loader;

	constructor() {
		this.core = new Core();
		this.loader = this.core.loader;
	}
}
