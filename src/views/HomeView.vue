<template>
  <div class="flex flex-col h-full">
    <!-- <Navigation class="hidden lg:flex z-[9998]" :data="gameData" /> -->

    <!-- <div class="hidden lg:flex flex-row" style="height: 92px">
      <MultiplierHistory class="mt-5 mb-5" />
    </div> -->

    <div
      class="flex mt-0 flex-grow justify-around height-display"
      :class="isLandscape ? 'flex-row' : 'flex-col'"
    >
      <div
        class="justify-center sm:w-4/12 md:w-3/12 2xl:w-3/12 3xl:w-2/12 order-1 md:order-none my-1 mr-1 md:my-0"
        :class="isLandscape ? 'flex flex-col' : 'hidden'"
      >
        <UserBox class="mb-2" />
        <BetHistory class="flex-grow mb-2" @getLeaderboard="getLeaderBoard" />
        <Chat class="flex-grow" />
      </div>

      <div
        class="flex flex-col sm:w-4/12 lg:w-5/12 3xl:w-8/12 flex-grow order-2 lg:order-none xl:mx-5 overflow-hidden"
      >
        <div :class="isLandscape ? 'block' : 'hidden'">
          <MultiplierHistory class="mb-2" />
        </div>
        <div id="game-container" class="flex-grow">
          <MaradonaGame :isLandscape="isLandscape" />
        </div>
        <div
          class="md:flex-row justify-center items-center mt-3 3xl:mt-4"
          :class="isLandscape ? 'flex flex-col' : 'hidden'"
        >
          <div class="w-full order-1 3xl:order-0 mr-2">
            <BetBox
              :id="0"
              @sendBet="setBet"
              @cancelBet="cancelBet(0)"
              @drawCash="drawCash(0)"
            />
          </div>

          <div class="hidden md:block w-full order-2 3xl:order-2 mt-5 md:mt-0">
            <BetBox
              :id="1"
              @sendBet="setBet"
              @cancelBet="cancelBet(1)"
              @drawCash="drawCash(1)"
            />
          </div>
        </div>
      </div>

      <!-- <div
        class="hidden 2xl:block xl:w-2/12 3xl:w-2/12 h-full order-2 xl:order-none my-8 xl:my-0"
      >
        <Chat class="h-full" />
      </div> -->
    </div>
  </div>
</template>

<script lang="ts">
import MaradonaGame from "../components/MaradonaGame.vue";
import Navigation from "../components/Navigation.vue";
import MultiplierHistory from "../components/MultiplierHistory.vue";
import BetHistory from "../components/BetHistory.vue";
import BetBox from "../components/BetBox.vue";
import Chat from "../components/Chat.vue";
import BetAudio from "../components/game/assets/Sounds/bet.mp3";
import WinAudio from "../components/game/assets/Sounds/win.mp3";
import UserBox from "@/components/UserBox.vue";
import { game } from "../components/game/config.js";
import { mapState, mapActions } from "vuex";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

export default {
  name: "HomeView",

  components: {
    MaradonaGame,
    Navigation,
    MultiplierHistory,
    BetHistory,
    BetBox,
    Chat,
    UserBox,
  },

  data: () => ({
    initialize: false,
    game: game,
    gameInstance: {},
    gameData: {},
    startedGame: false,
    turnDevice: false,
    height: window.innerHeight,
    width: window.innerWidth,
  }),

  mounted() {
    window.addEventListener("resize", this.updateSize);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.updateSize);
  },

  created() {
    this.$mitt.on("cashout-success", (gameData) => {
      this.notify(gameData.data.amount.toFixed(2));
    });
  },

  computed: {
    ...mapState({ gameData: "gameData" }),

    isLandscape() {
      return this.width > this.height;
    },
  },

  methods: {
    ...mapActions(["setGameData"]),

    updateSize() {
      this.height = window.innerHeight;
      this.width = window.innerWidth;
    },

    initConnection() {
      this.websocket.connect();
      setInterval(this.websocket.pingPong, 15000);
    },

    changeScene(current_scene: string, new_scene: string) {
      this.gameInstance.scene.keys[current_scene].loadScene(new_scene);
    },

    setMultiplier(value: number) {
      this.gameInstance.scene.scenes[1].setMultiplier(value);
    },

    setBet(value: any) {
      let betAudio = new Audio(BetAudio);
      betAudio.play();

      this.gameInstance.scene.scenes[2].sendBet(
        value.value,
        value.id,
        value.cashout_at
      );
    },

    setAudio(value: any) {
      this.gameInstance.scene.scenes[1].setAudio(value);
      console.log("Audio is set");
    },

    setMusic(value: any) {
      this.gameInstance.scene.scenes[1].setMusic(value);
      this.gameInstance.scene.scenes[2].setMusic(value);
      console.log("Music is set");
    },

    cancelBet(buttonId: number) {
      this.gameInstance.scene.scenes[2].cancelBet(buttonId);
    },

    drawCash(buttonId: number) {
      this.gameInstance.scene.scenes[1].drawCash(buttonId);
    },

    getLeaderBoard(value: any) {
      this.gameInstance.scene.scenes[1].getLeaderboard(
        value.subtype,
        value.period
      );
    },

    handleOrientation(e) {
      this.turnDevice = e.target.angle === 90 || e.target.angle === -90;
    },

    notify(value) {
      let winAudio = new Audio(WinAudio);
      winAudio.play();

      toast("Hai Vinto: " + value + "€!", {
        position: toast.POSITION.TOP_CENTER,
        toastStyle: {
          backgroundColor: "green",
          color: "white",
        },
        hideProgressBar: true,
        delay: 0,
      });
    },
  },
};
</script>

<style>
.height-display {
  height: calc(100vh - 1rem - 240px);
}

#game-container {
  min-height: 200px;
  max-height: 100%;
  max-width: 100%;
  border-radius: 10px;
}

canvas {
  position: static;
  margin: 0 auto;
  border-radius: 10px;
}

@media screen and (width < 1024px) {
  #game-container {
    min-height: 200px;
  }
}

@media screen and (width < 1024px) {
  canvas {
    position: absolute;
  }
}

#game-container > canvas {
  display: none;
}
</style>
