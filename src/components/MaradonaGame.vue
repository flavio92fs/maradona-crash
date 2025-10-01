// ThreeScene.vue
<template>
  <div class="h-full w-full" ref="threeContainer" id="three-container">
    <canvas id="maradona-canvas" style="width: 100%; height: 100%"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { initScene } from "@/components/maradona/src/main.ts";

const threeContainer = ref("");

onMounted(() => {
  console.log(threeContainer.value);
  if (threeContainer.value) {
    initScene(threeContainer.value);
  }
});
</script>

<style scoped>
#container {
  width: 100%;
  height: 100%;
}
</style>
