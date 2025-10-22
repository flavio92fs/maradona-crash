<template>
  <div
    class="flex flex-wrap justify-center p-3 rounded-md border-2 border-primary overflow-hidden"
    style="row-gap: 20px"
  >
    <MultiplierLabel
      class="rounded-xl py-0.5 px-2 mx-1 text-sm font-bold"
      v-for="i in 100"
      :key="i"
      :value="10.0"
    />
  </div>
</template>

<script>
import MultiplierLabel from "../components/MultiplierLabel.vue";

export default {
  name: "MultiplierHistory",

  components: {
    MultiplierLabel,
  },

  data: () => ({
    multipliersHistory: [],
  }),

  created() {
    this.$mitt.on("history", (historyData) => {
      this.multipliersHistory = historyData.data.reverse();
    });
    this.$mitt.on("crash", (historyData) => {
      this.multipliersHistory.splice(-1, 1);
      this.multipliersHistory.unshift(historyData.multiplier);
      console.log(this.multipliersHistory);
    });
  },
};
</script>
