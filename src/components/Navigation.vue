<template>
  <div class="flex justify-between bg-primary p-3 rounded-md">
    <div>
      <img class="ml-4 h-14 w-14" src="@/assets/eldorado-logo.png" />
    </div>
    <div class="flex items-center">
      <button
        class="cursor-pointer flex flex-row items-center bg-orange-300 rounded-full p-1 sm:rounded-xl sm:py-0 sm:px-2 text-black"
        @click="$refs.howToPlayModal.openModal()"
      >
        <InformationCircleIcon class="text-black h-5 w-5 sm:mr-1" />
        <span class="hidden sm:inline-block">{{ $t("how_to_play") }}?</span>
      </button>

      <div
        class="flex items-center border border-secondary rounded-xl px-2 mx-4 text-green-600 font-bold bg-primary"
      >
        {{ currency.symbol }}{{ balance.toFixed(2) }}
      </div>
      <div
        class="flex cursor-pointer 2xl:hidden items-center border border-secondary rounded-xl px-2 mr-2"
        @click="$refs.chatMobilePanel.openChatPanel()"
      >
        <ChatBubbleOvalLeftEllipsisIcon class="text-secondary h-5 w-5" />
      </div>
      <div
        class="cursor-pointer flex items-center border border-white rounded-xl px-2"
      >
        <div class="relative" data-te-dropdown-ref>
          <button
            class="flex text-white items-center whitespace-nowrap rounded bg-primary text-xs font-medium uppercase leading-normal transition duration-150 ease-in-out hover:bg-primary-600 motion-reduce:transition-none"
            type="button"
            id="dropdownMenuButton1"
            data-te-dropdown-toggle-ref
            data-te-auto-close="outside"
            data-te-offset="[0, 10]"
            aria-expanded="false"
          >
            <Bars3Icon class="h-5 w-5" />
          </button>

          <ul
            class="absolute cursor-default z-[1000] float-left hidden min-w-max list-none overflow-hidden rounded-lg border border-secondary bg-clip-padding text-left text-base shadow-lg bg-primary [&[data-te-dropdown-show]]:block"
            aria-labelledby="dropdownMenuButton1"
            data-te-dropdown-menu-ref
          >
            <li class="p-2">
              <div class="flex justify-between items-center">
                <div class="flex items-center">
                  <MusicalNoteIcon class="text-secondary h-5 w-5 mr-1" />
                  <span class="text-gray-300">{{ $t("music") }}</span>
                </div>
                <input
                  class="ml-3 h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-green-600 checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-neutral-500 checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:before:scale-100 focus:before:opacity-[0.12] focus:before:transition-[transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-primary checked:focus:bg-green-600 checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:transition-[transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400"
                  type="checkbox"
                  role="switch"
                  v-model="isMusicOn"
                  @change="setMusic"
                />
              </div>
            </li>
            <hr
              class="h-0 border border-t-0 border-solid border-neutral-700 opacity-25 dark:border-neutral-200"
            />

            <li class="p-2">
              <div class="flex justify-between items-center">
                <SparklesIcon class="text-secondary h-5 w-5 mr-1" />
                <div class="text-gray-300">{{ $t("sound_effects") }}</div>
                <input
                  class="ml-3 h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-green-600 checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-neutral-500 checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:before:scale-100 focus:before:opacity-[0.12] focus:before:transition-[transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-primary checked:focus:bg-green-600 checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:transition-[transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400"
                  type="checkbox"
                  role="switch"
                  v-model="isAudioOn"
                  @change="setAudio"
                />
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- How to Play Modal -->

    <HowToPlayModal ref="howToPlayModal" />

    <!-- Chat Mobile -->

    <ChatMobile ref="chatMobilePanel" />
  </div>
</template>

<script>
import VueToggle from "vue-toggle-component";
import {
  QuestionMarkCircleIcon,
  Bars3Icon,
  ChatBubbleOvalLeftEllipsisIcon,
  MusicalNoteIcon,
  SparklesIcon,
  InformationCircleIcon,
} from "@heroicons/vue/24/outline";
import { mapActions, mapState } from "vuex";
import HowToPlayModal from "./HowToPlayModal.vue";
import ChatMobile from "./ChatMobile.vue";
import { Dropdown, Ripple, initTE } from "tw-elements";

export default {
  components: {
    VueToggle,
    QuestionMarkCircleIcon,
    Bars3Icon,
    MusicalNoteIcon,
    SparklesIcon,
    InformationCircleIcon,
    HowToPlayModal,
    ChatMobile,
    ChatBubbleOvalLeftEllipsisIcon,
  },

  data: () => ({
    isAudioOn: true,
    isMusicOn: true,
  }),

  props: {
    data: Object,
  },

  computed: {
    ...mapState({
      balance: "balance",
      currency: "currency",
      coins: "coins",
      player: "player",
    }),
  },

  mounted() {
    initTE({ Dropdown, Ripple });
  },

  created() {
    this.$mitt.on("authentication", (gameData) => {
      this.setBalance(gameData.data.balance);
      this.setCurrency(gameData.data.currency);
      this.setCoins(gameData.data.currency.coins);
      this.setPlayer(gameData.data.player);
    });

    this.$mitt.on("started", () => {
      this.cancelDisabled = true;
    });

    this.$mitt.on("progress", () => {
      this.cancelDisabled = false;
      this.inGame = true;
    });

    this.$mitt.on("success", (gameData) => {
      this.setBalance(gameData.data.balance);
    });

    this.$mitt.on("cashout-success", (gameData) => {
      this.setBalance(gameData.data.balance);
    });
  },

  methods: {
    ...mapActions(["setBalance", "setCurrency", "setCoins", "setPlayer"]),

    setAudio() {
      this.$emit("setAudio", this.isAudioOn);
    },

    setMusic() {
      this.$emit("setMusic", this.isMusicOn);
    },
  },
};
</script>
