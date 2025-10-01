// ThreeScene.vue
<template>
  <div class="relative h-full w-full" ref="threeContainer" id="three-container">
    <div
      id="multipliers-overlay"
      class="game-overlay flex flex-row absolute top-0 w-full z-10 p-2"
    >
      <MultiplierLabel
        class="rounded-xl py-0.5 px-2 mx-1 text-sm font-bold"
        v-for="i in 5"
        :key="i"
        :value="10.0"
      />
    </div>
    <div
      id="bet-overlay"
      class="game-overlay absolute bottom-0 w-full z-10 p-3 pb-0"
    >
      <div class="flex justify-center w-100">
        <div class="btn-container rounded-lg w-full mx-2 p-2">
          <button
            class="btn bet-button rounded-xl text-xl p-5 w-full text-white"
          >
            <p class="font-bold">BET</p>
            <p class="font-bold">1.00€</p>
          </button>
        </div>
        <div class="btn-container rounded-lg w-full mx-2 p-2">
          <button
            class="btn bet-button rounded-xl bg-green-600 text-xl p-5 w-full text-white"
          >
            <p class="font-bold">BET</p>
            <p class="font-bold">1.00€</p>
          </button>
        </div>
      </div>

      <div id="history-overlay" class="flex mt-4 p-2 rounded-t-lg">
        <button
          class="btn history-button rounded-xl text-xl px-2 w-full text-white"
        >
          <p class="font-bold">All Bets</p>
        </button>

        <button
          class="btn history-button rounded-xl bg-green-600 text-xl px-2 mx-2 w-full text-white"
        >
          <p class="font-bold">My Bets</p>
        </button>

        <button
          class="btn history-button rounded-xl bg-green-600 text-xl px-2 w-full text-white"
        >
          <p class="font-bold">Top</p>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { initScene } from "@/components/maradona/src/main.ts";
import MultiplierLabel from "./MultiplierLabel.vue";

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

.game-overlay {
  background-color: rgba(0, 0, 0, 0);
}

#history-overlay {
  background-color: rgba(0, 0, 0, 0.4);
}

.btn-container {
  background-color: rgba(0, 0, 0, 0.6);
}

.bet-button {
  background-color: #57aadc;
}

.history-button {
  background-color: rgba(0, 0, 0, 0.7);
}
</style>
