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
      <!-- Black overlay shown during the betting/loading phase.
           Sits above the canvas but below all UI overlays (multiplier, bet buttons). -->
      <Transition name="splash">
        <div
          v-if="phase === 'betting' && showNextRoundCounter"
          class="absolute inset-0 z-[5] bg-black pointer-events-none"
        ></div>
      </Transition>

      <!-- Centered MARADONA + loading bar during betting phase.
           Absolutely positioned on the three.js canvas, re-centers automatically
           when the orientation (and therefore the canvas size) changes. -->
      <Transition name="splash">
        <div
          v-if="phase === 'betting' && showNextRoundCounter"
          class="absolute inset-0 z-[10] flex flex-col items-center justify-center pointer-events-none text-white text-center"
          style="text-shadow: 1.8px 1.8px rgba(0, 0, 0, 0.6)"
        >
          <div
            class="maradona-font tracking-widest mb-4"
            :style="{
              fontSize: isLandscape ? '72px' : '44px',
              lineHeight: 1,
            }"
          >
            MARADONA
          </div>
          <span class="text-sm tracking-wider opacity-90 mb-2">PROSSIMO ROUND</span>
          <div
            class="relative rounded-full bg-black/60 overflow-hidden border border-white/20"
            :style="{
              width: isLandscape ? '320px' : '220px',
              height: isLandscape ? '20px' : '14px',
            }"
          >
            <div
              class="h-full transition-[width] duration-75 ease-linear"
              :style="{
                width: (bettingProgress * 100).toFixed(1) + '%',
                background:
                  'linear-gradient(90deg, rgba(73,179,70,1) 0%, rgba(172,219,101,1) 100%)',
              }"
            ></div>
          </div>
        </div>
      </Transition>
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
              v-for="(mul, i) in history"
              :key="i"
              :value="mul"
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
          :src="'vignette.webp'"
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
              :id="0"
              :bet-value="button1amount"
              :active="!showBetBox"
              :menu-open="selectedBetBox"
              :phase="phase"
              :has-bet="!!bet1"
              :cashed-out="bet1?.cashedOut ?? false"
              :for-next-round="bet1?.forNextRound ?? false"
              :current-multiplier="currentMultiplier"
              :currency="currency.symbol"
              @sub-click="toggleBetBox(0)"
              @action="buttonAction(0)"
            />

            <BetButton
              :id="1"
              :bet-value="button2amount"
              :active="!showBetBox"
              :menu-open="selectedBetBox"
              :phase="phase"
              :has-bet="!!bet2"
              :cashed-out="bet2?.cashedOut ?? false"
              :for-next-round="bet2?.forNextRound ?? false"
              :current-multiplier="currentMultiplier"
              :currency="currency.symbol"
              @sub-click="toggleBetBox(1)"
              @action="buttonAction(1)"
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
import { ref, computed, onMounted, onUnmounted } from "vue";
import store from "@/store";
import { toast } from "vue3-toastify";
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
import simulatedBackend from "@/simulatedBackend";

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
let selectedBetBox = ref(-1);
let isOpen = ref(false);
let selected_category = ref(0);
let close_timer = ref(() => {});
let history_close_time = 10000;
let bet_box_close_time = 5000;
let isMorning = ref(true);
let isMusicOn = ref(true);
let chatIsOpen = ref(false);
let isHistoryExtended = ref(false);

// Crash-game state driven by the simulated backend
const phase = ref("betting"); // "betting" | "running" | "crashed"
const currentMultiplier = ref(1);
const bettingTimer = ref(0);
const bettingDuration = ref(10);
const bettingProgress = computed(() => {
  if (bettingDuration.value <= 0) return 0;
  return Math.max(0, Math.min(1, 1 - bettingTimer.value / bettingDuration.value));
});
const showNextRoundCounter = ref(true);
const bet1 = ref(null); // { amount, autoCashoutAt, cashedOut }
const bet2 = ref(null);
const history = ref([]);
const currency = computed(() => store.state.currency);

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
    selectedBetBox.value = -1;
    showBetBox.value = false;
  }
}

function toggleBetBox(id) {
  stopCloseTimer();
  closeHistory();

  // startCloseTimer(closeBox, bet_box_close_time);

  if (showBetBox.value == true) {
    selectedBetBox.value = -1;
  } else {
    selectedBetBox.value = id;
  }

  showBetBox.value = !showBetBox.value;
}

function setButton(value) {
  switch (selectedBetBox.value) {
    case 0: {
      button1amount.value = value;
      break;
    }

    case 1: {
      button2amount.value = value;
      break;
    }
  }

  closeBox();
}

let disposeScene = null;

// --- Crash-game handlers ---

function buttonAction(buttonId) {
  const bet = buttonId === 0 ? bet1.value : bet2.value;
  const amount = parseFloat(
    buttonId === 0 ? button1amount.value : button2amount.value
  );

  // Has a bet -> cancel (betting / pending) or cashout (running)
  if (bet) {
    if (bet.forNextRound || phase.value === "betting") {
      emitter.emit("game:cancelBet", { id: buttonId });
    } else if (phase.value === "running" && !bet.cashedOut) {
      emitter.emit("game:cashout", { id: buttonId });
    }
    return;
  }

  // No bet -> place one. Backend validates balance + phase placement.
  if (!Number.isFinite(amount) || amount <= 0) return;
  emitter.emit("game:placeBet", {
    id: buttonId,
    amount,
    autoCashoutAt: null,
  });
}

function onPhase(p) {
  phase.value = p.phase;
  if (p.phase === "betting") {
    currentMultiplier.value = 1;
    if (typeof p.duration === "number") {
      bettingDuration.value = p.duration;
      bettingTimer.value = p.duration;
    }
    // Pending bets from the previous round are now active -> clear the flag.
    if (bet1.value?.forNextRound) bet1.value = { ...bet1.value, forNextRound: false };
    if (bet2.value?.forNextRound) bet2.value = { ...bet2.value, forNextRound: false };
  }
}
function onMul(p) { currentMultiplier.value = p.value; }
function onTimer(p) { bettingTimer.value = p.remaining; }
function onHistory(list) {
  // Backend sends newest-first; render as-is.
  history.value = Array.isArray(list) ? [...list] : [];
}
function onConfirmed(p) {
  const entry = {
    amount: p.amount,
    autoCashoutAt: p.autoCashoutAt,
    cashedOut: false,
    forNextRound: !!p.forNextRound,
  };
  if (p.id === 0) bet1.value = entry;
  else if (p.id === 1) bet2.value = entry;
  // Play the bet SFX for every confirmed bet, regardless of which UI
  // (portrait BetButton or landscape BetBox) placed it.
  try {
    const a = new Audio("sound/bet.mp3");
    a.volume = 0.8;
    a.play().catch(() => {});
  } catch {}
}
function onCancelled(p) {
  if (p.id === 0) bet1.value = null;
  else if (p.id === 1) bet2.value = null;
}
function onWon(p) {
  const target = p.id === 0 ? bet1 : p.id === 1 ? bet2 : null;
  if (target && target.value) {
    target.value = { ...target.value, cashedOut: true, cashOutMultiplier: p.multiplier };
  }
  toast(`Hai ritirato ${p.amount.toFixed(2)}${currency.value.symbol} @ x${p.multiplier.toFixed(2)}`, {
    autoClose: 2500,
    position: toast.POSITION.TOP_CENTER,
    toastStyle: { backgroundColor: "green", color: "white" },
    hideProgressBar: true,
  });
}
function onLost(p) {
  if (p.id === 0) bet1.value = null;
  else if (p.id === 1) bet2.value = null;
}
function onRejected(p) {
  toast(
    p?.reason === "nextRoundDisabled"
      ? "Puntate per il prossimo round disabilitate"
      : "Credito insufficiente",
    {
      autoClose: 2500,
      position: toast.POSITION.TOP_CENTER,
      toastStyle: { backgroundColor: "red", color: "white" },
      hideProgressBar: true,
    }
  );
}
function onToggleNextRoundCounter(show) {
  showNextRoundCounter.value = !!show;
}
function onSceneComplete() {
  // Fresh round -> clear any still-flagged cashed-out bets
  if (bet1.value?.cashedOut) bet1.value = null;
  if (bet2.value?.cashedOut) bet2.value = null;
}

onMounted(() => {
  emitter.on("game:phase", onPhase);
  emitter.on("game:multiplier", onMul);
  emitter.on("game:timer", onTimer);
  emitter.on("game:history", onHistory);
  emitter.on("game:bet:confirmed", onConfirmed);
  emitter.on("game:bet:cancelled", onCancelled);
  emitter.on("game:bet:won", onWon);
  emitter.on("game:bet:lost", onLost);
  emitter.on("game:bet:rejected", onRejected);
  emitter.on("sceneComplete", onSceneComplete);
  emitter.on("ui:showNextRoundCounter", onToggleNextRoundCounter);

  // initScene builds the lil-gui panel, which emits the persisted UI flags
  // and starts/stops the simulated backend according to the "Game" folder.
  if (threeGameContainer.value) {
    disposeScene = initScene(threeGameContainer.value);
  }

  document
    .getElementsByTagName("canvas")[0]
    .addEventListener("click", closeHistory);
});

onUnmounted(() => {
  simulatedBackend.stopGame();
  if (disposeScene) {
    disposeScene();
    disposeScene = null;
  }
  emitter.off("game:phase", onPhase);
  emitter.off("game:multiplier", onMul);
  emitter.off("game:timer", onTimer);
  emitter.off("game:history", onHistory);
  emitter.off("game:bet:confirmed", onConfirmed);
  emitter.off("game:bet:cancelled", onCancelled);
  emitter.off("game:bet:won", onWon);
  emitter.off("game:bet:lost", onLost);
  emitter.off("game:bet:rejected", onRejected);
  emitter.off("sceneComplete", onSceneComplete);
  emitter.off("ui:showNextRoundCounter", onToggleNextRoundCounter);
});
</script>

<style scoped>
.splash-enter-active,
.splash-leave-active {
  transition: opacity 0.6s ease;
}
.splash-enter-from,
.splash-leave-to {
  opacity: 0;
}
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
