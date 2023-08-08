/*
* Model Resources
* */
export const COLLISION_SCENE_URL = new URL("../assets/models/playground.glb", import.meta.url).href;

/*
* Texture Resources
* */
export const SCENE_BACKGROUND_TEXTURE = new URL("../assets/img/env-bg.jpeg", import.meta.url).href;
export const WATER_NORMAL1_TEXTURE = new URL("../assets/img/Water_1_M_Normal.jpg", import.meta.url).href;
export const WATER_NORMAL2_TEXTURE = new URL("../assets/img/Water_2_M_Normal.jpg", import.meta.url).href;

/*
* Events
* */
export const ON_LOAD_PROGRESS = "on-load-progress";
export const ON_CHARACTER_JUMP = "on-character-jump";
export const ON_LOAD_SCENE_FINISH = "on-load-scene-finish";
