/*
* Model Resources
* */
export const COLLISION_SCENE_URL = new URL("../assets/models/playground.glb", import.meta.url).href;
export const CHARACTER_URL = new URL("../assets/models/character.glb", import.meta.url).href;
export const CHARACTER_IDLE_ACTION_URL = new URL("../assets/models/character-idle.fbx", import.meta.url).href;
export const CHARACTER_WALK_ACTION_URL = new URL("../assets/models/character-walk.fbx", import.meta.url).href;
export const CHARACTER_JUMP_ACTION_URL = new URL("../assets/models/character-jump.fbx", import.meta.url).href;

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
export const ON_LOAD_SCENE_FINISH = "on-load-scene-finish";
export const ON_KEY_DOWN = "on-key-down";
export const ON_KEY_UP = "on-key-up";
export const ON_INTERSECT_TRIGGER = "on-intersect-trigger";
export const ON_INTERSECT_TRIGGER_STOP = "on-intersect-trigger-stop";

/*
* NES Game Resources
* */
export const NES_GAME_SRC1 = new URL("../assets/nes/Super Mario Bros (JU).nes", import.meta.url).href;
export const NES_GAME_SRC2 = new URL("../assets/nes/Super Mario Bros 3.nes", import.meta.url).href;
export const NES_GAME_SRC3 = new URL("../assets/nes/Mighty Final Fight (USA).nes", import.meta.url).href;
export const NES_GAME_SRC4 = new URL("../assets/nes/Mitsume ga Tooru (Japan).nes", import.meta.url).href;
