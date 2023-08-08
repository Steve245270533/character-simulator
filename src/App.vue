<template>
  <div id="webgl" />
</template>

<script setup lang="ts">
import Core from "@/application/core";
import {onMounted} from "vue";

onMounted(() => {
	const core = new Core();
	core.render();
});
</script>

<style scoped>
#webgl {
	width: 100%;
	height: 100%;

}
</style>
