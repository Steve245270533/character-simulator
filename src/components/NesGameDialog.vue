<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="is_show"
        class="nes-game-container"
      >
        <dialog class="nes-dialog is-dark is-rounded">
          <nes-vue
            :url="game_data.url"
            width="512"
            height="480"
          />
          <a class="nes-badge">
            <span class="is-primary">{{ game_data.title }}</span>
          </a>
          <button
            type="button"
            class="nes-btn is-error btn-close"
            @click="closeDialog"
          >
            X
          </button>
        </dialog>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {NesVue} from "nes-vue";

const emits = defineEmits(["on-close-dialog"]);

const is_show = ref(false);

const game_data = ref({
	title: "",
	url: ""
});

/**
 * 打开游戏弹窗（注意：会避免持续触发打开弹窗，必须将弹窗关闭后重新打开）
 * @param title 游戏标题
 * @param url 游戏url地址
 */
const openDialog = (title: string, url: string) => {
	if (is_show.value && game_data.value.title && game_data.value.url) return;

	is_show.value = true;
	game_data.value.title = title;
	game_data.value.url = url;
};

const closeDialog = () => {
	is_show.value = false;
	game_data.value.title = "";
	game_data.value.url = "";
	emits("on-close-dialog");
};

defineExpose({
	openDialog
});
</script>

<style scoped>
.nes-game-container {
	position: absolute;
	z-index: 9999;
	width: 100%;
	height: 100%;
	left: 0;
	top: 0;
	background: rgba(0,0,0, 0.5);
	opacity: 1;
}

.nes-game-container .nes-dialog {
	padding: 62px 100px 42px;
	display: block;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}

.nes-dialog .btn-close {
	position: absolute;
	top: 10px;
	right: 10px;
	padding: 6px 16px;
}

.nes-dialog .nes-badge {
	position: absolute;
	left: 50%;
	top: 14px;
	transform: translateX(-50%);
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
