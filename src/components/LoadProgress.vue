<template>
  <transition name="fade">
    <div
      v-if="is_show"
      class="progress-container"
    >
      <div class="progress-info">
        <progress
          class="nes-progress is-primary"
          :value="props.modelValue"
          max="100"
        />
        <p
          v-if="props.modelValue < 100"
          class="text"
        >
          {{ props.text }}
        </p>
        <p v-else>
          <button
            type="button"
            class="nes-btn is-success"
            @click="close"
          >
            Enter
          </button>
        </p>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import {ref} from "vue";

const props = withDefaults(
	defineProps<{
		modelValue: number,
		text: string
	}>(),
	{
		modelValue: 0,
		text: "加载中..."
	}
);

const emits = defineEmits(["on-enter"]);

const is_show = ref(true);

const close = () => {
	is_show.value = false;
	emits("on-enter");
};
</script>

<style scoped>
.progress-container {
	position: absolute;
	padding: 40px;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	z-index: 999;
	display: flex;
	justify-content: center;
	align-items: center;
	background: #000;
}

.progress-info {
	width: 100%;
	height: 158px;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
}

.progress-info .text {
	color: #fff;
	margin-top: 20px;
	font-size: 18px;
}

.progress-info .nes-btn {
	margin-top: 20px;
}

.fade-leave-active {
	transition: opacity 0.3s ease;
}

.fade-leave-to {
	opacity: 0;
}
</style>
