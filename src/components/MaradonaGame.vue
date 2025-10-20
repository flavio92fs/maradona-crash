// ThreeScene.vue
<template>
  <div
    class="flex flex-col h-full w-full"
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
      ref="threeGameContainer"
      class="relative flex flex-grow justify-center items-center aspect-[9/16] lg:aspect-[16/9]"
      style="max-width: 100%"
      @click="closeHistory()"
    >
      <div class="container-top absolute top-0 w-full">
        <Navigation class="rounded-none z-[12] lg:hidden" />

        <div
          id="multipliers-overlay"
          class="game-overlay flex flex-col lg:hidden flex-row top-0 w-full z-[11] py-2"
          @click.stop="closeHistory()"
        >
          <div class="flex flex-row overflow-auto">
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
      </div>

      <GameMultiplier class="absolute w-full select-none"/>

      <div class="absolute w-full h-full z-[9]" style="pointer-events: none;">
        <img class="h-full" :src="'/vignette.png'" style="pointer-events: none;"></img>
      </div>

      <div
        id="bet-overlay"
        class="game-overlay absolute block lg:hidden bottom-0 w-full z-[200] p-3 pb-0"
      >
        <BetBoxMobile
          v-if="showBetBox"
          class="mb-4"
          @confirm="setButton"
          @close="closeBox"
        ></BetBoxMobile>

        <div class="flex justify-center w-100">
          <BetButton :id="1" :bet-value="button1amount" :active="!showBetBox" :menu-open="selectedBetBox" @sub-click="toggleBetBox(1)"/>
         
          <BetButton :id="2" :bet-value="button2amount" :active="!showBetBox" :menu-open="selectedBetBox" @sub-click="toggleBetBox(2)"/>
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
              @click.stop="openHistory(1)"
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
              @click.stop="openHistory(2)"
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
              @click.stop="openHistory(3)"
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
              @click="(e) => {e.stopPropagation()}"
              @scroll.stop="stopCloseTimer()"
              @scrollend.stop="startCloseTimer()"
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
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import store from "@/store";
import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from "@heroicons/vue/24/outline";
import { initScene } from "@/components/maradona/src/main.ts";
import MultiplierLabel from "./MultiplierLabel.vue";
import BetButton from "./BetButton.vue";
import BetBoxMobile from "./BetBoxMobile.vue";
import Navigation from "./Navigation.vue";
import GameMultiplier from "./GameMultiplier.vue";

//Data

let button1amount = ref((1.0).toFixed(2));
let button2amount = ref((1.0).toFixed(2));
let multiplier = ref((0.0).toFixed(2));

//Helpers

const threeGameContainer = ref(null);
let showBetBox = ref(false);
let selectedBetBox = ref(0);
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

function closeBox() {
  selectedBetBox.value = 0;
  showBetBox.value = false;
}

function toggleBetBox(id) {
  if (showBetBox.value == true) {
    selectedBetBox.value = 0;
  } else {
    selectedBetBox.value = id;
  }

  showBetBox.value = !showBetBox.value;
}

function setButton(value) {
  switch (selectedBetBox.value) {
    case 1: {
      button1amount.value = value;
      break;
    }

    case 2: {
      button2amount.value = value;
      break;
    }
  }

  closeBox();
}

onMounted(() => {
  // console.log(threeGameContainer.value);
  if (threeGameContainer.value) {
    initScene(threeGameContainer.value);
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

.bg-overlay {
  background-color: rgba(0, 0, 0, 0.7);
}

.game-overlay {
  background-color: rgba(0, 0, 0, 0.4);
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
  user-select: none;
}

.fullscreen-button {
  background: rgba(0, 0, 0, 0.7);
}

.vignette {
  z-index: 9;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(255, 255, 255, 0) 2%,
    rgba(255, 255, 255, 0) 98%,
    rgba(0, 0, 0, 1) 100%
  );
  pointer-events: none;
}
</style>
