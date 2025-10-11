<template>
  <div>
    <div class="bg-primary text-white p-5 rounded-xl">
      <div class="relative bg-primary-dark rounded-xl border border-secondary">
        <button
          class="absolute cursor-pointer right-5 top-5 z-10"
          @click="closeBox()"
        >
          <XCircleIcon class="h-7 w-7"></XCircleIcon>
        </button>
        <div
          class="flex flex-row items-end p-5 gap-x-8"
          :class="betMode ? 'justify-between' : ''"
        >
          <div class="flex flex-col flex-grow">
            <div class="flex justify-center">
              <button
                class="rounded-full border border-secondary px-5 mr-2"
                :class="[
                  betMode == 0 ? 'bg-primary' : '',
                  isAutoPlay ? 'text-secondary border-secondary' : '',
                ]"
                @click="betMode = 0"
                :disabled="autoCash || isAutoPlay"
              >
                Bet
              </button>
              <button
                class="rounded-full border border-secondary px-5"
                :class="[
                  betMode == 1 ? 'bg-primary' : '',
                  isAutoPlay ? 'text-secondary border-secondary' : '',
                ]"
                @click="betMode = 1"
                :disabled="autoCash || isAutoPlay"
              >
                Auto
              </button>
            </div>

            <div class="my-3">
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
                v-for="coin in coins"
                class="pill h-8"
                :class="[
                  isAutoPlay || betInProgress || amountClaimed
                    ? 'disabled text-secondary'
                    : '',
                ]"
                :disabled="isAutoPlay || betInProgress || amountClaimed"
                @click="increaseBetAmount('auto', coin)"
              >
                {{ coin }}{{ currency.symbol }}
              </button>
            </div>
          </div>

          <div class="flex flex-col flex-grow justify-end">
            <div class="flex flex-col mt-5 flex-grow">
              <div>
                <button
                  class="px-5 w-full"
                  :class="
                    betAmount == currency.default_bet ||
                    betInProgress ||
                    amountClaimed
                      ? 'button-70-disabled'
                      : 'button-70-red'
                  "
                  @click="
                    valueSkip = true;
                    initialState = true;
                    initialAutoAmount = 0;
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

              <div class="mt-3">
                <button
                  class="px-5 w-full"
                  :class="
                    betAmount == currency.default_bet ||
                    betInProgress ||
                    amountClaimed
                      ? 'button-70-disabled text-secondary'
                      : 'button-70'
                  "
                  :disabled="
                    betAmount == currency.default_bet ||
                    betInProgress ||
                    amountClaimed
                  "
                  @click="confirmOptions()"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="betMode == 1"
          class="flex flex-row justify-between items-center border-t border-secondary px-5 py-3 gap-x-5"
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
        </div>
      </div>
    </div>

    <AutoplayModal @startAutoplay="startAutoplay" ref="autoPlayModal" />
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { XCircleIcon } from "@heroicons/vue/24/outline";
import AutoplayModal from "./AutoplayModal.vue";
import AmountSetter from "./AmountSetter.vue";
import { toast } from "vue3-toastify";

export default {
  name: "BetBox",

  components: {
    AutoplayModal,
    AmountSetter,
    XCircleIcon,
  },

  props: {
    id: Number,
  },

  data: () => ({
    //Data
    betAmount: "0.10",
    autoCashAmount: 1.01,
    autoPlayData: {},
    startingBalance: 0,
    initialAutoAmount: 0,
    win: 0,

    //Helpers
    betMode: 0,
    autoCash: false,
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

    confirmOptions() {
      this.$emit("confirm", this.betAmount);
    },

    closeBox() {
      this.$emit("close");
    },

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

        if (this.initialState && this.initialAutoAmount != amount) {
          this.initialAutoAmount = amount;
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
      // console.log("Rounded AutoCash: " + roundedAutoCash);

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

<style>
.pill {
  @apply bg-primary border border-secondary rounded-full text-center font-medium;
}

.pill.disabled {
  @apply text-secondary;
}
</style>
