<template>
  <div class="rounded-xl">
    <div class="flex justify-center">
      <!-- <button
        class="rounded-md border border-secondary px-5"
        :class="[
          betMode == 1 ? 'bg-primary' : '',
          isAutoPlay ? 'text-secondary border-secondary' : '',
        ]"
        @click="betMode = 1"
        :disabled="autoCash || isAutoPlay"
      >
        Auto
      </button> -->
    </div>
    <div class="flex flex-row justify-between p-2">
      <div class="w-full mr-5 flex flex-col w-1/2">
        <div class="flex justify-between mb-2">
          <span class="font-bold text-white">Bet</span>
          <div class="flex items-center">
            <span class="mr-2 text-xs" :class="autoBet ? 'text-white' : ''"
              >Auto</span
            >
            <input
              class="mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-green-600 checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-neutral-500 checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer checked:focus:bg-green-600 checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 dark:bg-neutral-600 dark:after:bg-neutral-400"
              type="checkbox"
              role="switch"
              v-model="autoBet"
            />
          </div>
        </div>
        <div class="mb-3">
          <AmountSetter
            v-model="betAmount"
            :currency="currency.symbol"
            :disabled="isAutoPlay || betInProgress || amountClaimed"
            :minimumValue="currency.default_bet"
            :maximumValue="currency.max_bet"
            @increase="increaseBetAmount('manual')"
            @decrease="decreaseBetAmount()"
          >
          </AmountSetter>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button
            class="border border-1 border-secondary rounded-md h-8"
            :class="[
              isAutoPlay || betInProgress || amountClaimed
                ? 'disabled text-secondary'
                : '',
            ]"
            :disabled="isAutoPlay || betInProgress || amountClaimed"
            @click="increaseBetAmount('auto', coins[0])"
          >
            {{ coins[0] }}{{ currency.symbol }}
          </button>
          <button
            class="border border-1 border-secondary rounded-md h-8"
            :class="[
              isAutoPlay || betInProgress || amountClaimed
                ? 'disabled text-secondary'
                : '',
            ]"
            :disabled="isAutoPlay || betInProgress || amountClaimed"
            @click="increaseBetAmount('auto', coins[1])"
          >
            {{ coins[1] }}{{ currency.symbol }}
          </button>
          <button
            class="border border-1 border-secondary rounded-md h-8"
            :class="[
              isAutoPlay || betInProgress || amountClaimed
                ? 'disabled text-secondary'
                : '',
            ]"
            :disabled="isAutoPlay || betInProgress || amountClaimed"
            @click="increaseBetAmount('auto', coins[2])"
          >
            {{ coins[2] }}{{ currency.symbol }}
          </button>
          <button
            class="border border-1 border-secondary rounded-md h-8"
            :class="[
              isAutoPlay || betInProgress || amountClaimed
                ? 'disabled text-secondary'
                : '',
            ]"
            :disabled="isAutoPlay || betInProgress || amountClaimed"
            @click="increaseBetAmount('auto', coins[3])"
          >
            {{ coins[3] }}{{ currency.symbol }}
          </button>
        </div>
      </div>

      <div class="w-full flex flex-col">
        <div class="flex justify-between mb-2">
          <span class="font-bold text-white">Cashout</span>
          <div class="flex items-center">
            <span class="mr-2 text-xs" :class="autoCash ? 'text-white' : ''"
              >Auto</span
            >
            <input
              class="mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-green-600 checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-neutral-500 checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer checked:focus:bg-green-600 checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 dark:bg-neutral-600 dark:after:bg-neutral-400"
              type="checkbox"
              role="switch"
              v-model="autoCash"
            />
          </div>
        </div>
        <div class="mb-3">
          <AmountSetter
            v-model="autoCashAmount"
            :currency="currency.symbol"
            :disabled="isAutoPlay || betInProgress || amountClaimed"
            :minimumValue="currency.default_bet"
            :maximumValue="currency.max_bet"
            @increase="increaseBetAmount('manual')"
            @decrease="decreaseBetAmount()"
          >
          </AmountSetter>
        </div>
        <button
          v-if="!inGame && !isStarted"
          @click="betInProgress ? cancelBet() : sendBet()"
          class="w-full text-white rounded-md font-bold text-xl h-full"
          :class="betInProgress ? 'bg-red-700' : 'green-gradient'"
        >
          {{ betInProgress ? "CANCEL" : "PLACE BET" }}
        </button>

        <button
          v-else-if="!inGame && isStarted && betInProgress"
          @click="cancelBet()"
          class="w-20 h-20 text-white rounded-full font-medium text-xl bg-red-700 shadow-[0px_0px_3px_3px_rgba(185,28,28,1)]"
        >
          CANCEL
        </button>

        <button
          v-else
          @click="drawCash()"
          class="w-20 h-20 text-white rounded-full font-medium text-xl"
          :class="
            betInProgress
              ? 'bg-green-600 shadow-[0px_0px_3px_3px_rgba(22,173,62,1)]'
              : 'bg-gray-500'
          "
          :disabled="!betInProgress"
        >
          {{ betInProgress ? "DRAW" : "WAIT" }}
        </button>

        <!-- <div class="flex flex-col mt-5">
          <div>
            <button
              class="rounded-full px-5"
              :class="
                betAmount == currency.default_bet ||
                betInProgress ||
                amountClaimed
                  ? 'bg-primary text-secondary'
                  : 'bg-red-700 outline outline-1 outline-red-500'
              "
              @click="
                valueSkip = true;
                initialState = true;
                betAmount = parseFloat(currency.default_bet).toFixed(2);
              "
              :disabled="
                betAmount == currency.default_bet ||
                betInProgress ||
                amountClaimed
              "
            >
              {{ $t("clear") }}
            </button>
          </div>
        </div> -->
      </div>
    </div>

    <!-- <div
      class="flex flex-row justify-between items-center border-t border-secondary px-5 py-1 gap-x-5"
      :class="betMode == 0 ? 'invisible h-0' : ''"
    >
      <div>
        <button
          v-if="!isAutoPlay"
          class="pill p-1 px-3 text-xs"
          @click="$refs.autoPlayModal.openModal()"
        >
          Autoplay
        </button>

        <button
          v-if="isAutoPlay && betInProgress"
          class="pill p-1 px-3 text-xs bg-red-700 border border-red-500"
          @click="cancelBet()"
        >
          Ferma ({{ this.autoPlayData.number_of_rounds }})
        </button>

        <button
          v-if="isAutoPlay && !betInProgress"
          class="pill p-1 px-3 text-xs bg-red-700 border border-red-500"
          @click="isAutoPlay = false"
        >
          Ferma ({{ this.autoPlayData.number_of_rounds }})
        </button>
      </div>

      <div class="flex flex-row items-center">
        <div class="text-xs">Auto Cash Out</div>

        <div class="flex flex-row items-center">
          <div class="mx-3">
            <input
              class="mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-green-600 checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-neutral-500 checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-primary checked:focus:bg-green-600 checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400"
              type="checkbox"
              role="switch"
              v-model="autoCash"
            />
          </div>
          <div>
            <input
              :min="1.01"
              type="number"
              class="bg-primary-dark border border-secondary rounded-xl px-2 py-0.5 w-20 text-center"
              :class="autoCash ? 'text-white' : 'text-neutral-500'"
              v-model="autoCashAmount"
              :disabled="!autoCash"
            />
          </div>
        </div>
      </div>
    </div> -->
    <AutoplayModal
      @startAutoplay="startAutoplay"
      ref="autoPlayModal"
      class="z-[9999]"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import AutoplayModal from "./AutoplayModal.vue";
import AmountSetter from "./AmountSetter.vue";
import { toast } from "vue3-toastify";

export default {
  name: "BetBox",

  components: {
    AutoplayModal,
    AmountSetter,
  },

  props: {
    id: Number,
  },

  data: () => ({
    //Data
    betAmount: "0.10",
    autoCashAmount: "2.00",
    autoPlayData: {},
    startingBalance: 0,
    win: 0,

    //Helpers
    betMode: 0,
    autoCash: false,
    autoBet: false,
    cancelDisabled: false,
    inGame: false,
    betInProgress: false,
    isStarted: false,
    isAutoPlay: false,
    amountClaimed: false,
    initialState: true,
    valueSkip: true,
  }),

  created() {
    this.$mitt.on("sceneComplete", () => {
      this.betInProgress = false;
      this.inGame = false;
      this.amountClaimed = false;
      this.manageAutoPlay();
    }),
      this.$mitt.on("started", () => {
        this.isStarted = true;
      }),
      this.$mitt.on("progress", () => {
        this.cancelDisabled = false;
        this.inGame = true;
        this.isStarted = false;
      });
    this.$mitt.on("crash", () => {
      this.betInProgress = false;
      this.cancelDisabled = true;
      this.checkBalance();
    });
    this.$mitt.on("cashout-success", (gameData) => {
      if (
        this.autoCash &&
        gameData.data.multiplier.toFixed(2) >= this.autoCashAmount.toFixed(2)
      ) {
        this.betInProgress = false;
        this.amountClaimed = true;
      }
      this.win = 0;
      this.win = gameData.data.amount;
      this.checkBalance();
    });
  },

  computed: {
    ...mapState({ balance: "balance", currency: "currency", coins: "coins" }),
  },

  watch: {
    currency: {
      handler(newValue, oldValue) {
        this.betAmount = this.currency.default_bet.toFixed(2);
      },
      deep: true,
    },

    betAmount(newValue, oldValue) {
      if (newValue > 100) {
        this.betAmount = "100.00";
      }

      if (newValue <= 0.1) {
        this.initialState = true;
      }
    },
  },

  methods: {
    ...mapActions(["setBalance", "increaseBalance", "decreaseBalance"]),

    decreaseBetAmount() {
      this.betAmount = parseFloat(this.betAmount);
      const roundedAmount = this.betAmount.toFixed(2);

      if (this.valueSkip) {
        if (roundedAmount > 0.1 && roundedAmount <= 1) {
          this.betAmount -= 0.1;
        }

        if (roundedAmount > 1) {
          this.betAmount -= 1;
        }
      } else if (roundedAmount > 0.1) {
        this.betAmount -= 0.1;
      }

      // if (roundedAmount > 10 && roundedAmount <= 50) {
      //   this.betAmount -= 5;
      // }

      // if (roundedAmount > 50) {
      //   this.betAmount -= 10;
      // }

      this.betAmount = this.betAmount.toFixed(2);
    },

    increaseBetAmount(type, amount = 0) {
      this.betAmount = parseFloat(this.betAmount);
      const roundedAmount = this.betAmount.toFixed(2);

      if (type == "auto") {
        this.valueSkip = false;

        if (this.initialState) {
          this.betAmount = amount;
        } else {
          this.betAmount += amount;
        }
      }

      if (type == "manual") {
        this.initialState = false;

        if (this.valueSkip) {
          if (roundedAmount >= 0 && roundedAmount < 1) {
            this.betAmount += 0.1;
          }

          if (roundedAmount >= 1 && roundedAmount < 10) {
            this.betAmount += 1;
          }

          if (roundedAmount >= 10 && roundedAmount < 50) {
            this.betAmount += 5;
          }

          if (roundedAmount >= 50) {
            this.betAmount += 10;
          }
        } else {
          this.betAmount += 0.1;
        }
      }

      this.betAmount = this.betAmount.toFixed(2);
    },

    sendBet() {
      if (this.balance - this.betAmount < 0) {
        toast("Credito insufficiente", {
          position: toast.POSITION.TOP_CENTER,
          toastStyle: {
            backgroundColor: "red",
            color: "white",
          },
          hideProgressBar: true,
          delay: 0,
        });

        return;
      }

      const roundedAutoCash = this.autoCashAmount.toFixed(2);
      console.log("Rounded AutoCash: " + roundedAutoCash);

      this.decreaseBalance(this.betAmount);
      this.betInProgress = true;
      if (!this.autoCash) {
        this.$emit("sendBet", {
          value: this.betAmount,
          id: this.id,
          cashout_at: -1,
        });
      } else {
        this.$emit("sendBet", {
          value: this.betAmount,
          id: this.id,
          cashout_at: roundedAutoCash,
        });
      }
    },

    cancelBet() {
      if (this.isAutoPlay) {
        this.isAutoPlay = false;
        this.autoPlayData.number_of_rounds == 0;
      }
      this.increaseBalance(parseFloat(this.betAmount));
      this.betInProgress = false;
      this.$emit("cancelBet");
    },

    drawCash() {
      this.betInProgress = false;
      this.amountClaimed = true;
      this.$emit("drawCash");
    },

    startAutoplay(value) {
      this.isAutoPlay = true;
      this.autoPlayData = value;
      this.startingBalance = this.balance;
      if (!this.betInProgress && !this.inGame && !this.isStarted) {
        this.betInProgress = true;
        this.sendBet();
        this.autoPlayData.number_of_rounds--;
      }
    },

    manageAutoPlay() {
      if (this.isAutoPlay) {
        if (this.autoPlayData)
          if (this.autoPlayData.number_of_rounds > 0) {
            this.autoPlayData.number_of_rounds--;
            this.sendBet();
          } else {
            this.isAutoPlay = false;
          }
      }
    },

    checkBalance() {
      if (this.isAutoPlay) {
        if (
          this.autoPlayData.stop_at_loss &&
          this.balance <= this.startingBalance - this.autoPlayData.loss_amount
        ) {
          this.isAutoPlay = false;
        }

        if (
          this.autoPlayData.stop_at_gain &&
          this.balance >= this.startingBalance + this.autoPlayData.gain_amount
        ) {
          this.isAutoPlay = false;
        }

        if (
          this.autoPlayData.stop_at_single_win &&
          this.win - this.betAmount >= this.autoPlayData.single_win_amount
        ) {
          this.isAutoPlay = false;
        }
      }
    },
  },
};
</script>

<style scoped>
.pill {
  @apply bg-primary border border-secondary rounded-full text-center font-medium;
}

.pill.disabled {
  @apply text-secondary;
}

button {
  user-select: none;
}

.green-gradient {
  background: #acdb65;
  background: -webkit-linear-gradient(
    135deg,
    rgba(172, 219, 101, 1) 1%,
    rgba(73, 179, 70, 1) 100%
  );
  background: -moz-linear-gradient(
    135deg,
    rgba(172, 219, 101, 1) 1%,
    rgba(73, 179, 70, 1) 100%
  );
  background: linear-gradient(
    135deg,
    rgba(172, 219, 101, 1) 1%,
    rgba(73, 179, 70, 1) 100%
  );
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#ACDB65", endColorstr="#49B346", GradientType=0);
}
</style>
