<template>
  <div class="relative flex items-center">
    <div
      class="flex flex-wrap max-h-[40px] items-center rounded-md overflow-hidden"
    >
      <MultiplierLabel
        class="flex-1 w-20 rounded-md px-5 py-1 m-1 text-sm font-medium box-border whitespace-nowrap"
        v-for="i in 100"
        :key="i"
        :value="Math.floor(Math.random() * (10 - 1) + 1)"
      />
    </div>
    <div class="h-full ml-2">
      <button
        class="rounded-md border border-secondary p-1 px-2 max-h-[38px]"
        @click="isExtended = true"
      >
        <div class="flex items-center justify-center h-full">
          <ChevronDownIcon class="text-white h-6 w-6" />
        </div>
      </button>
    </div>

    <div v-if="isExtended" class="absolute top-0 bg-secondary rounded-md">
      <div class="w-full text-right">
        <button class="mr-3 mt-3" @click="isExtended = false">
          <ChevronUpIcon class="text-white h-6 w-6" />
        </button>
      </div>
      <div
        class="flex flex-wrap gap-y-2 items-center bg-secondary w-100 px-1 py-3 rounded-md z-[99999]"
      >
        <MultiplierLabel
          class="rounded-md w-20 py-1 px-2 mx-1 text-sm font-medium"
          v-for="i in 100"
          :key="i"
          :value="Math.floor(Math.random() * (10 - 1) + 1)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import MultiplierLabel from "../components/MultiplierLabel.vue";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/24/outline";

export default {
  name: "MultiplierHistory",

  components: {
    MultiplierLabel,
    ChevronUpIcon,
    ChevronDownIcon,
  },

  data: () => ({
    multipliersHistory: [],
    isExtended: false,
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
