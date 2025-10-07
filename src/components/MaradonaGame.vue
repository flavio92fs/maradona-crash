// ThreeScene.vue
<template>
  <div
    class="relative h-full w-full"
    ref="threeContainer"
    id="three-container"
    style="
      display: flex;
      justify-content: center;
      background-color: black;
      align-items: center;
    "
  >
    <div
      id="multipliers-overlay"
      class="game-overlay flex flex-col lg:hidden flex-row absolute top-0 w-full z-10 p-2"
      @click.stop="closeHistory()"
    >
      <div class="flex flex-row overflow-auto pb-5">
        <MultiplierLabel
          class="rounded-xl py-0.5 px-2 mx-1 text-sm font-bold"
          v-for="i in 5"
          :key="i"
          :value="10.0"
        />
      </div>
      <!-- <div class="w-full text-right">
        <button
          class="btn fullscreen-button p-2 rounded-full mt-3 me-1"
          v-if="isFullscreen == true"
          @click.stop="exitFullscreen"
        >
          <ArrowsPointingInIcon class="text-white h-8 w-8" />
        </button>

        <button
          class="btn fullscreen-button p-2 rounded-full mt-3 me-1"
          v-if="isFullscreen == false"
          @click.stop="enterFullscreen"
        >
          <ArrowsPointingOutIcon class="text-white h-8 w-8" />
        </button>
      </div> -->
    </div>

    <div
      id="bet-overlay"
      class="game-overlay block lg:hidden absolute bottom-0 w-full z-10 p-3 pb-0"
    >
      <div class="flex justify-center w-100">
        <div class="btn-container rounded-lg w-full mx-2 p-2">
          <button
            class="btn bet-button rounded-xl text-xl p-2 w-full text-white"
          >
            <p class="font-bold">BET</p>
            <p class="font-bold">1.00€</p>
          </button>
        </div>
        <div class="btn-container rounded-lg w-full mx-2 p-2">
          <button
            class="btn bet-button rounded-xl bg-green-600 text-xl p-2 w-full text-white"
          >
            <p class="font-bold">BET</p>
            <p class="font-bold">1.00€</p>
          </button>
        </div>
      </div>

      <div id="history-overlay" class="flex flex-col mt-4 p-2 rounded-t-lg">
        <div class="flex flex-row">
          <button
            class="btn history-button rounded-xl text-xl px-2 w-full text-white"
            :style="
              selected_category == 1
                ? 'background-color: rgba(150, 150, 150, 0.7) !important'
                : ''
            "
            @click="openHistory(1)"
          >
            <p class="font-bold">All Bets</p>
          </button>

          <button
            class="btn history-button rounded-xl bg-green-600 text-xl px-2 mx-2 w-full text-white"
            :style="
              selected_category == 2
                ? 'background-color: rgba(150, 150, 150, 0.7) !important'
                : ''
            "
            @click="openHistory(2)"
          >
            <p class="font-bold">My Bets</p>
          </button>

          <button
            class="btn history-button rounded-xl bg-green-600 text-xl px-2 w-full text-white"
            :style="
              selected_category == 3
                ? 'background-color: rgba(150, 150, 150, 0.7) !important'
                : ''
            "
            @click="openHistory(3)"
          >
            <p class="font-bold">Top</p>
          </button>
        </div>

        <div
          id="history-container"
          :class="isOpen ? 'h-56 p-2' : 'h-0 p-0'"
          class="flex rounded-xl mt-2"
        >
          <div
            id="history-content"
            :class="isOpen ? 'flex flex-col' : 'hidden'"
            class="text-white w-full overflow-auto"
            @mousedown="stopCloseTimer()"
            @mouseup="startCloseTimer()"
            @mouseleave="startCloseTimer()"
            @scroll="stopCloseTimer()"
            @scrollend="startCloseTimer()"
          >
            <p v-for="i in 100">Bet {{ i }}</p>
          </div>
        </div>

        <div class="rounded-xl mt-3" :class="isOpen ? 'block' : 'hidden'">
          <button
            class="btn history-button border border-white rounded-xl bg-green-600 text-xl w-full text-white py-2"
            @click="closeHistory()"
          >
            <p class="font-bold">Close</p>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, useTemplateRef } from "vue";
import { computed } from "@vue/reactivity";
import { vOnClickOutside } from "@vueuse/components";
import store from "@/store";
import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from "@heroicons/vue/24/outline";
import { initScene } from "@/components/maradona/src/main.ts";
import MultiplierLabel from "./MultiplierLabel.vue";

//Data

const threeContainer = ref(null);
const isFullscreen = computed(() => store.state.isFullscreen);
let isOpen = ref(false);
let selected_category = ref(0);
let close_timer = ref(() => {});

//Methods

function openHistory(category) {
  if (close_timer) {
    clearTimeout(close_timer.value);
  }

  startCloseTimer();

  isOpen.value = true;
  selected_category.value = category;
}

function closeHistory() {
  // console.log("Closing history");
  isOpen.value = false;
  selected_category.value = 0;
}

function stopCloseTimer() {
  // console.log("Stopping Timer");
  if (close_timer) {
    clearTimeout(close_timer.value);
  }
}

function startCloseTimer() {
  // console.log("Resuming Timer");
  close_timer.value = setTimeout(() => {
    closeHistory();
  }, 10000);
}

function enterFullscreen() {
  store.dispatch("setFullscreen", true);
  document.body.requestFullscreen();
}

function exitFullscreen() {
  store.dispatch("setFullscreen", false);
  document.exitFullscreen();
}

onMounted(() => {
  console.log(threeContainer.value);
  if (threeContainer.value) {
    initScene(threeContainer.value);
  }

  document
    .getElementsByTagName("canvas")[0]
    .addEventListener("click", closeHistory);
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

#history-container {
  background-color: rgba(0, 0, 0, 0.7);
  transition: all ease-in-out 0.3s;
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

.fullscreen-button {
  background: rgba(0, 0, 0, 0.7);
}
</style>
