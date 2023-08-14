import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {AudioLoader, DefaultLoadingManager, TextureLoader} from "three";
import Core from "../core";
import {ON_LOAD_PROGRESS} from "../Constants";

export default class Loader {
	private core: Core;
	gltf_loader: GLTFLoader;
	fbx_loader: FBXLoader;
	draco_loader: DRACOLoader;
	texture_loader: TextureLoader;
	audio_loader: AudioLoader;

	constructor() {
		this.core = new Core();
		this.gltf_loader = new GLTFLoader();
		this.fbx_loader = new FBXLoader();
		this.texture_loader = new TextureLoader();
		this.audio_loader = new AudioLoader();
		this.draco_loader = new DRACOLoader();
		this.draco_loader.setDecoderPath("./draco/gltf/");
		this.gltf_loader.setDRACOLoader(this.draco_loader);

		DefaultLoadingManager.onProgress = (url, loaded, total) => {
			this.core.$emit(ON_LOAD_PROGRESS, {url, loaded, total});
		};
	}
}
