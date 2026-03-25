<template>
  <div class="flex justify-center px-1 py-3 rounded-md overflow-auto">
    <MultiplierLabel
      class="rounded-md py-1 px-2 mx-1 text-sm font-medium"
      v-for="i in 100"
      :key="i"
      :value="Math.floor(Math.random() * (10 - 1) + 1)"
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

<style scoped>
::-webkit-scrollbar {
  width: 3px;
  height: 3px;
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
