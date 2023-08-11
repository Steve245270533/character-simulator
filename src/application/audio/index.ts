import {Mesh, MeshBasicMaterial, PlaneGeometry, PositionalAudio, AudioListener} from "three";
import Core from "../core";
import {PositionalAudioHelper} from "three/examples/jsm/helpers/PositionalAudioHelper";
import {AUDIO_URL, ON_PLAY_AUDIO} from "../Constants";

export default class Audio {
	core: Core;
	positional_audio: PositionalAudio | undefined;
	private audio_mesh: Mesh | undefined;
	private is_playing = false;

	constructor() {
		this.core = new Core();

		this.core.$on(ON_PLAY_AUDIO, () => {
			this.playAudio();
		});
	}

	async createAudio() {
		this.audio_mesh = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({color: 0xff0000}));
		this.audio_mesh.position.set(0, 1, 10);
		this.audio_mesh.rotation.y = Math.PI;
		this.audio_mesh.visible = false;
		this.core.scene.add(this.audio_mesh);

		const listener = new AudioListener();

		this.core.camera.add(listener);
		this.positional_audio = new PositionalAudio(listener);
		this.audio_mesh.add(this.positional_audio);

		const buffer = await this.core.loader.audio_loader.loadAsync(AUDIO_URL);
		this.positional_audio.setBuffer(buffer);
		this.positional_audio.setVolume(0.5);
		this.positional_audio.setRefDistance(2);
		this.positional_audio.setDirectionalCone(180, 230, 0.5);
		this.positional_audio.setLoop(true);

		const helper = new PositionalAudioHelper(this.positional_audio);
		this.positional_audio.add(helper);

		return Promise.resolve();
	}

	playAudio() {
		this.is_playing = true;
		this.positional_audio?.play();
	}

	togglePlayAudio() {
		if (this.is_playing) {
			this.is_playing = false;
			this.positional_audio?.pause();
		} else {
			this.is_playing = true;
			this.positional_audio?.play();
		}
	}
}
