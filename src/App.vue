<template>
  <div id="webgl" />

  <nes-game-dialog
    ref="game_dialog_ref"
    @on-close-dialog="onCloseNesGameDialog"
  />

  <notify-tips ref="notify_ref" />
</template>

<script setup lang="ts">
import NesGameDialog from "@/components/NesGameDialog.vue";
import NotifyTips from "@/components/NotifyTips.vue";
import Core from "@/application/core";
import {onMounted, ref} from "vue";
import {ON_INTERSECT_TRIGGER, ON_INTERSECT_TRIGGER_STOP, ON_KEY_DOWN} from "@/application/Constants";
import type {Game_Mesh} from "@/application/InteractionDetection/types";

const notify_ref = ref<InstanceType<typeof NotifyTips>>();
const game_dialog_ref = ref<InstanceType<typeof NesGameDialog>>();

let core: Core | undefined = undefined;

/*
* 触发场景交互
* */
const onIntersectTrigger = ([user_data]: [user_date: Game_Mesh["userData"]]) => {
	notify_ref.value!.openNotify(user_data.title!);
};

/*
* 结束场景交互时
* */
const onIntersectTriggerStop = () => {
	notify_ref.value!.closeNotify();
};

const onKeyDown = ([key]: [key: string]) => {
	if (key === "KeyF" && core) {
		const intersect = core.world.interaction_detection.getIntersectObj();
		if (intersect && intersect.userData.type === "game") {
			// 处于nes游戏交互中，需禁用core.control中的按键触发，避免持续驱动character更新
			core.control.enabled = false;
			// 重置按键状态，防止键盘某个键锁死，持续驱动character更新
			core.control.resetStatus();
			game_dialog_ref.value!.openDialog(intersect.userData.title!, intersect.userData.url!);
		}
	}
};

const onCloseNesGameDialog = () => {
	if (core) {
		core.control.enabled = true;
	}
};

onMounted(() => {
	core = new Core();
	core.render();

	core.$on(ON_INTERSECT_TRIGGER, onIntersectTrigger);
	core.$on(ON_INTERSECT_TRIGGER_STOP, onIntersectTriggerStop);
	core.$on(ON_KEY_DOWN, onKeyDown);
});
</script>

<style scoped>
#webgl {
	width: 100%;
	height: 100%;

}
</style>
