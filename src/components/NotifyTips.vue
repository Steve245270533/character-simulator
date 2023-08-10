<template>
  <div
    v-show="is_show"
    class="notify-tips nes-container is-rounded is-dark"
  >
    <p>{{ msg }}</p>
    <p>
      Press the "F" key to interact
    </p>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";

const is_show = ref(false);

const msg = ref("");

/**
 * 打开通知弹窗
 * @param message 通知弹窗信息
 */
const openNotify = (message: string) => {
	msg.value = message;
	is_show.value = true;
};

/**
 * 关闭通知弹窗
 */
const closeNotify = () => {
	msg.value = "";
	is_show.value = false;
};

defineExpose({
	openNotify,
	closeNotify
});
</script>

<style scoped>
.notify-tips {
	position: absolute;
	z-index: 1;
	right: 0;
	top: 0;
	background-color: rgba(0, 0, 0, 0.8);
}
</style>
