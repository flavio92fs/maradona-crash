// ThreeScene.vue
<template>
  <div
    class="flex flex-col h-full w-full"
    ref="threeContainer"
    id="three-container"
  >
    <div
      ref="threeGameContainer"
      id="threeGameContainer"
      class="@container/threegamecontainer relative flex flex-grow justify-center items-center h-full w-full"
      style="max-width: 100%"
      @click.stop="
        closeHistory();
        closeBox();
      "
    >
      <div class="container-top absolute top-0 w-full">
        <!-- <Navigation
          class="rounded-none z-[15]"
          :class="isLandscape ? 'hidden' : 'block'"
        /> -->

        <div
          id="multipliers-overlay"
          class="game-overlay flex-row top-0 w-full z-[11] py-2"
          :class="isLandscape ? 'hidden' : 'flex'"
          @click.stop="
            closeHistory();
            closeBox();
          "
        >
          <div
            class="flex flex-row flex-wrap overflow-hidden transition-[height]"
            style="row-gap: 10px"
            :style="isHistoryExtended ? 'height: 100px' : 'height: 30px'"
          >
            <MultiplierLabel
              class="rounded-md py-0.5 px-2 mx-1 text-sm font-bold"
              v-for="i in 100"
              :key="i"
              :value="Math.floor(Math.random() * (10 - 1) + 1)"
            />
          </div>
          <div class="flex-grow mr-4">
            <button class="text-center" @click="toggleMultiplierExtension">
              <ChevronDownIcon
                v-if="!isHistoryExtended"
                class="text-white h-6 w-6"
              />
              <ChevronUpIcon v-else class="text-white h-6 w-6" />
            </button>
          </div>
        </div>

        <div class="w-full text-right z-[12]">
          <button
            class="btn fullscreen-button p-2 rounded-full me-2 mt-2"
            v-if="!isMorning"
            @click="
              () => {
                isMorning = !isMorning;
                toggleDayTime(isMorning);
              }
            "
          >
            <SunIcon class="text-white h-6 w-6" />
          </button>

          <button
            v-else
            class="btn fullscreen-button p-2 rounded-full me-2 mt-2"
            @click="
              () => {
                isMorning = !isMorning;
                toggleDayTime(isMorning);
              }
            "
          >
            <MoonIcon class="text-white h-6 w-6" />
          </button>

          <button
            class="btn fullscreen-button p-2 rounded-full me-2 mt-2"
            @click="
              () => {
                isMusicOn = !isMusicOn;
                setMusic();
              }
            "
          >
            <SpeakerWaveIcon v-if="isMusicOn" class="text-white h-6 w-6" />
            <SpeakerXMarkIcon v-else class="text-white h-6 w-6" />
          </button>

          <button
            v-if="!isLandscape"
            class="btn fullscreen-button p-2 rounded-full me-2 mt-2"
            @click="$root.$refs.chatMobilePanel.openChatPanel()"
          >
            <ChatBubbleOvalLeftEllipsisIcon class="text-white h-6 w-6" />
          </button>
        </div>
      </div>

      <div
        class="absolute w-full h-full z-[9] pointer-events-none rounded-b-xl"
        :style="
          isLandscape
            ? 'background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 86%, rgb(0, 0, 0) 102%);'
            : ''
        "
      >
        <img
          class="h-full w-full pointer-events-none"
          :src="'vignette.png'"
          style="border-radius: 10px"
        />
      </div>

      <GameMultiplier
        id="game-multiplier-horizontal"
        class="absolute w-full"
        :class="isLandscape ? 'block' : 'hidden'"
        :isLandscape="isLandscape"
      />

      <div
        class="absolute bottom-0 w-full z-[150] pb-0"
        :class="isLandscape ? 'hidden' : 'block'"
      >
        <GameMultiplier
          id="game-multiplier"
          class="flex items-end justify-center"
          :isLandscape="isLandscape"
          style="
            height: 120px;
            border-radius: 0;
            background: linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0) 0%,
              rgba(0, 0, 0, 0) 0%,
              rgb(0, 0, 0) 110%
            );
          "
        />
        <div id="bet-overlay" class="game-overlay pt-3">
          <BetBoxMobile
            v-if="showBetBox"
            class="mb-4"
            @confirm="setButton"
            @close="closeBox"
            @click.stop="(e) => e.stopPropagation()"
            @mousedown="stopCloseTimer()"
            @mouseup="startCloseTimer(closeBox, bet_box_close_time)"
          ></BetBoxMobile>

          <div class="flex justify-center w-100">
            <BetButton
              :id="1"
              :bet-value="button1amount"
              :active="!showBetBox"
              :menu-open="selectedBetBox"
              @sub-click="toggleBetBox(1)"
            />

            <BetButton
              :id="2"
              :bet-value="button2amount"
              :active="!showBetBox"
              :menu-open="selectedBetBox"
              @sub-click="toggleBetBox(2)"
            />
          </div>

          <div id="history-overlay" class="flex flex-col mt-4 p-2 rounded-t-lg">
            <div class="flex flex-row">
              <button
                class="btn history-button rounded-xl px-2 py-1 w-full text-white"
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
                class="btn history-button rounded-xl px-2 py-1 mx-2 w-full text-white"
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
                class="btn history-button rounded-xl px-2 py-1 w-full text-white"
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
              :class="isOpen ? 'h-56 p-2 mt-2' : 'h-0 p-0 mt-0'"
              class="flex rounded-xl"
            >
              <div
                id="history-content"
                :class="isOpen ? 'flex flex-col' : 'hidden'"
                class="text-white w-full overflow-auto"
                @mousedown="stopCloseTimer()"
                @mouseup="startCloseTimer(closeHistory, history_close_time)"
                @mouseleave="startCloseTimer(closeHistory, history_close_time)"
                @click="
                  (e) => {
                    e.stopPropagation();
                  }
                "
                @scroll.stop="stopCloseTimer()"
                @scrollend.stop="
                  startCloseTimer(closeHistory, history_close_time)
                "
              >
                <p v-for="i in 100">Bet {{ i }}</p>
              </div>
            </div>

            <div class="rounded-xl mt-3" :class="isOpen ? 'block' : 'hidden'">
              <button
                class="btn history-button border border-white rounded-xl text-base sm:text-xl w-full text-white py-2"
                @click="closeHistory()"
              >
                <p class="font-bold">Close</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import store from "@/store";
import {
  MoonIcon,
  SunIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/vue/24/outline";
import { initScene } from "@/components/maradona/src/main.ts";
import MultiplierLabel from "./MultiplierLabel.vue";
import BetButton from "./BetButton.vue";
import BetBoxMobile from "./BetBoxMobile.vue";
import Navigation from "./Navigation.vue";
import GameMultiplier from "./GameMultiplier.vue";
import emitter from "@/eventEmitter";

//Data

let button1amount = ref((1.0).toFixed(2));
let button2amount = ref((1.0).toFixed(2));
let multiplier = ref((0.0).toFixed(2));

//Props

const props = defineProps({
  isLandscape: Boolean,
});

//Helpers

const threeGameContainer = ref(null);
let showBetBox = ref(false);
let selectedBetBox = ref(0);
let isOpen = ref(false);
let selected_category = ref(0);
let close_timer = ref(() => {});
let history_close_time = 10000;
let bet_box_close_time = 5000;
let isMorning = ref(true);
let isMusicOn = ref(true);
let chatIsOpen = ref(false);
let isHistoryExtended = ref(false);

//Methods

function toggleDayTime(daytime) {
  emitter.emit("toggleDayTime", daytime);
}

function setMusic() {
  emitter.emit("setMusic", isMusicOn.value);
}

function toggleMultiplierExtension() {
  isHistoryExtended.value = !isHistoryExtended.value;
}

function openHistory(category) {
  if (showBetBox.value) {
    closeBox();
  }

  if (close_timer) {
    clearTimeout(close_timer.value);
  }

  startCloseTimer(closeHistory, history_close_time);

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

function startCloseTimer(callback, time) {
  // console.log("Resuming Timer");
  close_timer.value = setTimeout(callback, time);
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
  if (showBetBox.value == true) {
    selectedBetBox.value = 0;
    showBetBox.value = false;
  }
}

function toggleBetBox(id) {
  stopCloseTimer();
  closeHistory();

  // startCloseTimer(closeBox, bet_box_close_time);

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

let disposeScene = null;

onMounted(() => {
  // console.log(threeGameContainer.value);
  if (threeGameContainer.value) {
    disposeScene = initScene(threeGameContainer.value);
  }

  document
    .getElementsByTagName("canvas")[0]
    .addEventListener("click", closeHistory);
});

onUnmounted(() => {
  if (disposeScene) {
    disposeScene();
    disposeScene = null;
  }
});
</script>

<style scoped>
#container {
  width: 100%;
  height: 100%;
}

#three-container {
  display: flex;
  justify-content: center;
  /* background-color: black; */
  align-items: center;
}

#game-multiplier-horizontal {
  bottom: 2%;
}

.bg-overlay {
  background-color: rgba(0, 0, 0, 0.7);
}

.game-overlay {
  background-color: rgba(0, 0, 0, 0.9);
}

/* #history-overlay {
  background-color: rgba(0, 0, 0, 0.4);
} */

#history-container {
  background-color: rgba(0, 0, 0, 0.7);
  transition: all ease-in-out 0.3s;
}
/* 
.btn-container {
  background-color: rgba(0, 0, 0, 0.6);
} */

.bet-button {
  background-color: #57aadc;
}

.history-button {
  background-color: rgba(0, 0, 0, 0.7);
  user-select: none;
  border: solid 1px;
  @apply border-secondary;
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

@media screen and (width < 1024px) {
  #three-container {
    min-width: 280px;
    min-height: 200px;
  }
}
</style>
