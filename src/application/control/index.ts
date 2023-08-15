import {ON_KEY_DOWN, ON_KEY_UP} from "../Constants";
import Emitter from "../Emitter";

type Keys = "KeyW" | "KeyS" | "KeyA" | "KeyD" | "KeyV" | "KeyF" | "Space";

type KeySets = Keys[]

type KeyStatus = {
	[key in Keys]: boolean;
};

interface ControlParams {
	emitter: Emitter;
}

export default class Control {
	private emitter: Emitter;

	key_status: KeyStatus = {
		"KeyW": false,
		"KeyS": false,
		"KeyA": false,
		"KeyD": false,
		"KeyV": false,
		"KeyF": false,
		"Space": false
	};
	private is_enabled =  false;
	private key_sets: KeySets = ["KeyW", "KeyS", "KeyA", "KeyD", "KeyV", "KeyF", "Space"];
	private readonly handleKeyDown: OmitThisParameter<(event: KeyboardEvent) => void>;
	private readonly handleKeyUp: OmitThisParameter<(event: KeyboardEvent) => void>;

	constructor({
		emitter
	}: ControlParams) {
		this.emitter = emitter;

		this.handleKeyDown = this.onKeyDown.bind(this);
		this.handleKeyUp = this.onKeyUp.bind(this);
		this._bindEvent();
	}

	private _bindEvent() {
		document.addEventListener("keydown", this.handleKeyDown);
		document.addEventListener("keyup", this.handleKeyUp);
	}

	onKeyDown(event: KeyboardEvent) {
		if (this.isAllowKey(event.code) && this.is_enabled) {
			this.key_status[event.code] = true;
			this.emitter.$emit(ON_KEY_DOWN, event.code);
		}
	}

	onKeyUp(event: KeyboardEvent) {
		if (this.isAllowKey(event.code) && this.is_enabled) {
			this.key_status[event.code] = false;
			this.emitter.$emit(ON_KEY_UP, event.code);
		}
	}

	isAllowKey(key: string): key is Keys {
		return this.key_sets.includes(key as Keys);
	}

	resetStatus() {
		for (const key of this.key_sets) {
			this.key_status[key] = false;
		}
	}

	disabled() {
		this.is_enabled = false;
	}

	enabled() {
		this.is_enabled = true;
	}
}
