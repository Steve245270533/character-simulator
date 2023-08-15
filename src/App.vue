<template>
  <div id="webgl" />

  <nes-game-dialog
    ref="game_dialog_ref"
    @on-close-dialog="onCloseNesGameDialog"
  />

  <notify-tips ref="notify_ref" />

  <load-progress
    v-model="percentage"
    :text="loading_text"
    @on-enter="onEnterApp"
  />
</template>

<script setup lang="ts">
import LoadProgress from "@/components/LoadProgress.vue";
import NesGameDialog from "@/components/NesGameDialog.vue";
import NotifyTips from "@/components/NotifyTips.vue";
import Core from "@/application/core";
import {onMounted, ref} from "vue";
import {ON_INTERSECT_TRIGGER, ON_INTERSECT_TRIGGER_STOP, ON_KEY_DOWN, ON_LOAD_PROGRESS} from "@/application/Constants";
import type {InteractionMesh} from "@/application/interactionDetection/types";

const notify_ref = ref<InstanceType<typeof NotifyTips>>();
const game_dialog_ref = ref<InstanceType<typeof NesGameDialog>>();

// 加载相关
const percentage = ref(0);
const loading_text = ref("加载中...");

let core: Core | undefined = undefined;

/*
* 触发场景交互提示
* */
const onIntersectTrigger = ([user_data]: [user_date: InteractionMesh["userData"]]) => {
	notify_ref.value!.openNotify(user_data.title!);
};

/*
* 结束场景交互提示时
* */
const onIntersectTriggerStop = () => {
	notify_ref.value!.closeNotify();
};

const onKeyDown = ([key]: [key: string]) => {
	if (key === "KeyF" && core) {
		const intersect = core.world.interaction_detection.getIntersectObj();
		if (intersect) {
			handleInteraction(intersect);
		}
	}
};

/*
* 处理不同交互盒子的交互事件
* */
const handleInteraction = (intersect: InteractionMesh) => {
	if (!core) return;

	switch (intersect.userData.type) {
	case "game":
		// 处于nes游戏交互中，需禁用core.control中的按键触发，避免持续驱动character更新
		core.control.disabled();
		// 重置按键状态，防止键盘某个键锁死，持续驱动character更新
		core.control.resetStatus();
		// 进入游戏交互中后，关闭交互检测，优化性能
		core.world.interaction_detection.disableDetection();
		game_dialog_ref.value!.openDialog(intersect.userData.title!, intersect.userData.url!);
		break;
	case "music":
		core.world.audio.togglePlayAudio();
		break;
	}
};

const onCloseNesGameDialog = () => {
	if (core) {
		core.control.enabled();
		core.world.interaction_detection.enableDetection();
	}
};

const onLoadProgress = ([{url, loaded, total}]: [{url: string, loaded: number, total: number}]) => {
	percentage.value = +(loaded / total * 100).toFixed(2);
	if (/.*\.(blob|glb|fbx)$/i.test(url)) {
		loading_text.value = "加载模型中...";
	}
	if (url.includes("wasm")) {
		loading_text.value = "加载wasm中...";
	}
	if (/.*\.(jpg|png|jpeg)$/i.test(url)) {
		loading_text.value = "加载图片素材中...";
	}
	if (/.*\.(m4a|mp3)$/i.test(url)) {
		loading_text.value = "加载声音资源中...";
	}
};

const onEnterApp = () => {
	if (core) {
		// 进入时才允许控制角色
		core.control.enabled();
		// 音频自动播放受限于网页的初始化交互，因此进入后播放即可
		core.world.audio.playAudio();
		// 注销应用加载监听事件
		core.emitter.$off(ON_LOAD_PROGRESS);
	}
};

onMounted(() => {
	core = new Core();
	core.render();

	core.emitter.$on(ON_INTERSECT_TRIGGER, onIntersectTrigger);
	core.emitter.$on(ON_INTERSECT_TRIGGER_STOP, onIntersectTriggerStop);
	core.emitter.$on(ON_KEY_DOWN, onKeyDown);
	core.emitter.$on(ON_LOAD_PROGRESS, onLoadProgress);
});
</script>

<style scoped>
#webgl {
	width: 100%;
	height: 100%;

}
</style>
