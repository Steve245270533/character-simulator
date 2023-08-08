import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {AudioLoader, DefaultLoadingManager, TextureLoader} from "three";
import Core from "../core";
import {ON_LOAD_PROGRESS} from "../Constants";

export default class Loader {
	gltf_loader: GLTFLoader;
	draco_loader: DRACOLoader;
	texture_loader: TextureLoader;
	audio_loader: AudioLoader;
	core: Core;

	constructor() {
		this.core = new Core();
		this.gltf_loader = new GLTFLoader();
		this.texture_loader = new TextureLoader();
		this.audio_loader = new AudioLoader();
		this.draco_loader = new DRACOLoader();
		this.draco_loader.setDecoderPath("/draco/gltf/");
		this.gltf_loader.setDRACOLoader(this.draco_loader);

		DefaultLoadingManager.onProgress = (url, loaded, total) => {
			this.core.$emit(ON_LOAD_PROGRESS, {url, loaded, total});
		};
	}
}
