<template>
  <div>
    <div class="flex flex-col h-full text-white">
      <div class="flex flex-row justify-center">
        <button
          class="py-1 rounded-t-xl px-2 border border-secondary border-b-0 font-medium text-sm"
          @click="type = 0"
          :disabled="type == 0"
          :class="
            type == 0
              ? 'bg-secondary text-white'
              : 'bg-primary text-neutral-400'
          "
        >
          {{ $t("all_bets") }}
        </button>

        <button
          class="mx-5 py-1 rounded-t-xl px-2 border border-secondary border-b-0 text-sm font-medium"
          @click="goToUserBet()"
          :disabled="type == 1"
          :class="
            type == 1
              ? 'bg-secondary text-white'
              : 'bg-primary text-neutral-400'
          "
        >
          {{ $t("my_bets") }}
        </button>

        <button
          class="py-1 rounded-t-xl px-2 border border-secondary border-b-0 text-sm font-medium"
          @click="goToLeaderboard()"
          :disabled="type == 2"
          :class="
            type == 2
              ? 'bg-secondary text-white'
              : 'bg-primary text-neutral-400'
          "
        >
          {{ $t("top_bets") }}
        </button>
      </div>

      <div
        class="flex flex-col bg-primary border border-secondary p-3 flex-grow rounded-t-none sm:rounded-t-xl rounded-xl"
      >
        <div
          class="flex flex-col flex-grow h-96 max-h-96 xl:max-h-full xl:h-0 overflow-y-auto"
        >
          <!-- Tutte le scommesse -->

          <div v-if="type == 0">
            <div class="flex justify-between space-x-20">
              <div>
                <div class="font-medium">
                  {{ $t("total_bets") }}:
                  <span class="text-green-700 font-bold">{{
                    totalBets.length
                  }}</span>
                </div>
              </div>
              <div>Mano Precedente</div>
            </div>

            <div class="table w-full">
              <div class="table-row">
                <div
                  class="table-cell text-center text-xs font-light text-gray-400"
                >
                  {{ $t("user") }}
                </div>
                <div
                  class="table-cell text-center text-xs font-light text-gray-400"
                >
                  {{ $t("bet") }}
                </div>
                <div
                  class="table-cell text-center text-xs font-light text-gray-400"
                >
                  {{ $t("multiplier") }}
                </div>
                <div
                  class="table-cell text-center text-xs font-light text-gray-400"
                >
                  {{ $t("wins") }}
                </div>
              </div>

              <div
                class="table-row"
                v-for="(bet, index) in totalBets"
                :key="index"
              >
                <div
                  :class="
                    bet.multiplier > 1 && bet.cashout_amount > 0 ? 'win' : ''
                  "
                  class="table-cell custom text-center"
                >
                  {{ bet.username }}
                </div>
                <div
                  :class="
                    bet.multiplier > 1 && bet.cashout_amount > 0 ? 'win' : ''
                  "
                  class="table-cell custom text-center"
                >
                  {{ bet.amount.toFixed(2) }}{{ currency.symbol }}
                </div>
                <div
                  :class="
                    bet.multiplier > 1 && bet.cashout_amount > 0 ? 'win' : ''
                  "
                  class="table-cell custom text-center"
                >
                  <MultiplierLabel
                    v-if="bet.multiplier != -1"
                    :value="bet.multiplier"
                    class="mx-auto max-w-max px-2 rounded-full font-medium text-sm"
                  />
                </div>
                <div
                  :class="
                    bet.multiplier > 1 && bet.cashout_amount > 0 ? 'win' : ''
                  "
                  class="table-cell custom text-center"
                >
                  {{
                    bet.cashout_amount > 0
                      ? bet.cashout_amount.toFixed(2) + currency.symbol
                      : ""
                  }}
                </div>
              </div>
            </div>
          </div>

          <!-- Le mie Scommesse -->

          <div v-if="type == 1" class="table max-h-full px-2">
            <div class="table-header-group">
              <div class="table-row">
                <div class="table-cell text-center text-xs text-gray-400">
                  Data
                </div>
                <div class="table-cell text-center text-xs text-gray-400">
                  Scommessa
                </div>
                <div class="table-cell text-center text-xs text-gray-400">
                  Moltiplicatore
                </div>
                <div class="table-cell text-center text-xs text-gray-400">
                  Vittoria
                </div>
              </div>
            </div>

            <div class="table-row-group">
              <div class="table-row" v-for="bet in betHistory" :key="bet">
                <div
                  :class="bet.win > 0 ? 'win' : ''"
                  class="table-cell custom text-center"
                >
                  {{ moment(bet.timestamp).format("HH:mm") }}
                </div>
                <div
                  :class="bet.win > 0 ? 'win' : ''"
                  class="table-cell custom text-center"
                >
                  <div>{{ bet.bet.toFixed(2) }}{{ currency.symbol }}</div>
                </div>
                <div
                  :class="bet.win > 0 ? 'win' : ''"
                  class="table-cell custom text-center"
                >
                  <MultiplierLabel
                    :value="bet.result"
                    class="mx-auto max-w-max px-2 rounded-full font-medium text-sm"
                  />
                </div>
                <div
                  :class="bet.win > 0 ? 'win' : ''"
                  class="table-cell custom text-center"
                >
                  {{ bet.win > 0 ? bet.win.toFixed(2) + currency.symbol : "-" }}
                </div>
              </div>
            </div>
          </div>

          <!-- Top Scommesse -->

          <div v-if="type == 2">
            <div class="flex flex-col items-center justify-center">
              <div class="inline-flex mb-3" role="group">
                <button
                  @click="
                    topCategory = 'huge_wins';
                    getLeaderboard();
                  "
                  type="button"
                  class="inline-block uppercase rounded-xl border border-secondary bg-primary px-4 pt-1.5 pb-1 text-xs font-medium leading-normal text-white focus:outline-none active:bg-secondary"
                  :class="
                    topCategory == 'huge_wins' ? 'bg-secondary' : 'bg-primary'
                  "
                >
                  {{ $t("huge_wins") }}
                </button>
                <button
                  @click="
                    topCategory = 'biggest_wins';
                    getLeaderboard();
                  "
                  type="button"
                  class="mx-2 inline-block rounded-xl uppercase border border-secondary bg-primary px-4 pt-1.5 pb-1 text-xs font-medium leading-normal text-white focus:outline-none active:bg-secondary"
                  :class="
                    topCategory == 'biggest_wins'
                      ? 'bg-secondary'
                      : 'bg-primary'
                  "
                >
                  {{ $t("nice_wins") }}
                </button>
                <button
                  @click="
                    topCategory = 'multipliers';
                    getLeaderboard();
                  "
                  type="button"
                  class="inline-block uppercase rounded-xl border border-secondary bg-primary px-4 pt-1.5 pb-1 text-xs font-medium leading-normal text-white focus:outline-none active:bg-secondary"
                  :class="
                    topCategory == 'multipliers' ? 'bg-secondary' : 'bg-primary'
                  "
                >
                  {{ $t("multipliers") }}
                </button>
              </div>

              <div class="inline-flex" role="group">
                <button
                  @click="
                    time = 'day';
                    getLeaderboard();
                  "
                  type="button"
                  class="inline-block rounded-l-xl border border-secondary bg-primary px-6 pt-1.5 pb-1 text-xs font-medium leading-normal text-white focus:outline-none active:bg-secondary"
                  :class="time == 'day' ? 'bg-secondary' : 'bg-primary'"
                >
                  {{ $t("day") }}
                </button>
                <button
                  @click="
                    time = 'month';
                    getLeaderboard();
                  "
                  type="button"
                  class="inline-block border border-secondary bg-primary px-6 pt-1.5 pb-1 text-xs font-medium leading-normal text-white focus:outline-none active:bg-secondary"
                  :class="time == 'month' ? 'bg-secondary' : 'bg-primary'"
                >
                  {{ $t("month") }}
                </button>
                <button
                  @click="
                    time = 'year';
                    getLeaderboard();
                  "
                  type="button"
                  class="inline-block rounded-r-xl border border-secondary bg-primary px-6 pt-1.5 pb-1 text-xs font-medium leading-normal text-white focus:outline-none active:bg-secondary"
                  :class="time == 'year' ? 'bg-secondary' : 'bg-primary'"
                >
                  {{ $t("year") }}
                </button>
              </div>
            </div>

            <!-- Leaderboard Vincite Enormi -->

            <div v-if="leaderboard_loading" class="text-center mt-5">
              {{ $t("retrieving_data") }}...
            </div>

            <div
              v-if="topCategory == 'huge_wins'"
              class="w-full max-h-full overflow-y-auto px-2 my-2"
            >
              <div
                v-for="(hugeWin, index) in leaderboardData"
                :key="index"
                class="flex flex-col justify-center bg-primary-dark rounded-lg my-3 text-right"
              >
                <div class="py-3">
                  <div class="grid grid-cols-2 gap-x-2 items-center">
                    <div class="text-xs font-light text-gray-400">
                      {{ $t("bet") }}:
                    </div>
                    <div class="text-left text-sm">
                      {{ hugeWin.bet.toFixed(2) }}{{ currency.symbol }}
                    </div>

                    <div class="text-xs font-light text-gray-400">
                      {{ $t("win") }}:
                    </div>
                    <div
                      class="text-left text-sm bg-green-900 border border-1 border-green-700 rounded-xl max-w-min px-2 py-0.5"
                    >
                      {{ hugeWin.win.toFixed(2) }}{{ currency.symbol }}
                    </div>

                    <div class="text-xs font-light text-gray-400">
                      {{ $t("multiplier") }}:
                    </div>
                    <MultiplierLabel
                      class="mt-1 text-left rounded-full max-w-max p-1 px-2 text-xs font-bold"
                      :value="hugeWin.multiplier"
                    />
                  </div>
                </div>

                <hr class="border border-primary" />

                <div
                  class="flex items-center bg-black rounded-b-xl text-left py-1 px-2"
                >
                  <div class="flex flex-row items-center">
                    <div class="text-gray-400 font-light text-xs">
                      {{ moment(hugeWin.timestamp * 1000).format("D MMMM") }}
                    </div>
                  </div>
                  <div>
                    <div class="flex flex-row items-center ml-5">
                      <div class="text-gray-400 font-light text-xs">
                        {{ $t("round") }}:
                      </div>
                      <div class="ml-1 font-light text-xs">
                        {{ hugeWin.round_id }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Leaderboard Belle Vittorie -->

            <div
              v-if="topCategory == 'biggest_wins'"
              class="w-full max-h-full overflow-y-auto px-2 my-2"
            >
              <div
                v-for="(biggestWin, index) in leaderboardData"
                :key="index"
                class="flex flex-col justify-center bg-primary-dark rounded-lg my-3 text-right"
              >
                <div class="py-3">
                  <div class="grid grid-cols-2 gap-x-2 items-center">
                    <div class="text-xs font-light text-gray-400">
                      Scommessa:
                    </div>
                    <div class="text-left text-sm">
                      {{ biggestWin.bet.toFixed(2) }}{{ currency.symbol }}
                    </div>

                    <div class="text-xs font-light text-gray-400">Vincita:</div>
                    <div
                      class="text-left text-sm bg-green-900 border border-1 border-green-700 rounded-xl max-w-min px-2 py-0.5"
                    >
                      {{ biggestWin.win.toFixed(2) }}{{ currency.symbol }}
                    </div>

                    <div class="mt-1 text-xs font-light text-gray-400">
                      Moltiplicatore:
                    </div>
                    <MultiplierLabel
                      class="mt-1 text-left rounded-full max-w-max p-1 px-2 text-xs font-bold"
                      :value="biggestWin.multiplier"
                    />
                  </div>
                </div>

                <hr class="border border-primary" />

                <div
                  class="flex items-center bg-black rounded-b-xl text-left py-1 px-2"
                >
                  <div class="flex flex-row items-center">
                    <div class="text-gray-400 font-light text-xs">
                      {{ moment(biggestWin.timestamp * 1000).format("D MMMM") }}
                    </div>
                  </div>
                  <div>
                    <div class="flex flex-row items-center ml-5">
                      <div class="text-gray-400 font-light text-xs">Turno:</div>
                      <div class="ml-1 font-light text-xs">
                        {{ biggestWin.round_id }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Leaderboard Moltiplicatori -->

            <div
              v-if="
                topCategory == 'multipliers' && this.leaderboardData.length > 0
              "
              class="w-full max-h-full overflow-y-auto px-2"
            >
              <div class="flex justify-between w-full mt-4 mb-2">
                <div class="text-xs font-light text-gray-400">Data</div>
                <div class="text-center text-xs font-light text-gray-400">
                  Moltiplicatore
                </div>
              </div>

              <div
                class="flex flex-col bg-primary-dark mb-2 items-center py-4 rounded-xl text-xs text-gray-400"
              >
                {{
                  moment(leaderboardData[0].timestamp * 1000).format(
                    "D MMMM YYYY, HH:mm:ss"
                  )
                }}

                <MultiplierLabel
                  class="border border-secondary rounded-full font-bold mt-3 py-3 px-5 text-lg"
                  :value="leaderboardData[0].multiplier"
                />
              </div>

              <div
                class="flex justify-between bg-primary-dark rounded-xl my-2 py-2 px-3 items-center"
                v-for="(topMultiplier, index) in leaderboardData.slice(1)"
                :key="index"
              >
                <div class="text-xs text-gray-400">
                  {{
                    moment(topMultiplier.timestamp * 1000).format(
                      "D MMMM YYYY, HH:mm:ss"
                    )
                  }}
                </div>

                <div>
                  <MultiplierLabel
                    class="rounded-full px-2 py-1 text-xs font-medium border border-secondary"
                    :value="topMultiplier.multiplier"
                  ></MultiplierLabel>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import { mapState } from "vuex";
import BetLabel from "../components/BetLabel.vue";
import MultiplierLabel from "./MultiplierLabel.vue";

export default {
  name: "BetHistory",
  components: {
    BetLabel,
    MultiplierLabel,
  },

  data: () => ({
    //Data
    totalBets: [],
    betHistory: [],
    leaderboardData: [],
    leaderboard_loading: true,

    //Helpers
    type: 0,
    time: "day",
    topCategory: "huge_wins",
  }),

  computed: {
    ...mapState({ balance: "balance", currency: "currency" }),
  },

  created() {
    this.moment = moment;
    moment.locale(navigator.language);
    //Total Bets

    this.$mitt.on("bets", (betData) => {
      this.totalBets = betData.bets;
    });

    //User Transaction History
    this.$mitt.on("transactions-history", (historyData) => {
      this.betHistory = historyData.data;
    });

    //Leaderboard
    this.$mitt.on("leaderboard", (leaderboardData) => {
      this.leaderboardData = leaderboardData.data;
      this.leaderboard_loading = false;
    });
  },

  methods: {
    goToUserBet() {
      this.type = 1;
    },

    goToLeaderboard() {
      this.type = 2;
      this.getLeaderboard();
    },

    getLeaderboard() {
      this.leaderboard_loading = true;
      this.leaderboardData = [];
      this.$emit("getLeaderboard", {
        subtype: this.topCategory,
        period: this.time,
      });
    },
  },
};
</script>

<style scoped>
.table {
  border-spacing: 0 10px;
}
.table-cell.custom {
  border: gray 1px;
  border-style: solid none;
  padding: 5px 0;
  @apply bg-gradient-to-b from-black to-zinc-800 text-sm font-medium text-neutral-500;
}

.table-cell.custom.win {
  border: green 1px;
  border-style: solid none;
  padding: 5px 0;
  @apply from-green-900 to-green-900 text-white;
}

.table-cell:first-child.custom {
  border-style: solid none solid solid;
  border-radius: 25px 0 0 25px;
}

.table-cell:last-child.custom {
  border-style: solid solid solid none;
  border-radius: 0 25px 25px 0;
}

::-webkit-scrollbar {
  width: 3px;
  border-radius: 25px;
}

/* Track */
::-webkit-scrollbar-track {
  @apply bg-primary;
  border-radius: 25px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 25px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
