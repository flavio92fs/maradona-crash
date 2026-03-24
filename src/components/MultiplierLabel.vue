<template>
  <div class="select-none" :class="color" style="border: solid 1px">
    {{ value.toFixed(2) }}x
  </div>
</template>

<script>
export default {
  name: " MultiplierLabel",
  props: {
    value: Number,
  },

  data: () => ({}),

  computed: {
    color() {
      switch (true) {
        case this.value > 0 && this.value < 2:
          return "low-multiplier";
        case this.value >= 2 && this.value < 6:
          return "medium-multiplier";
        case this.value >= 6:
          return "high-multiplier";
      }
    },
  },
};
</script>

<style scoped>
.low-multiplier {
  border-color: red !important;
  color: red;
}

.medium-multiplier {
  border-color: gold !important;
  color: gold;
}

.high-multiplier {
  border-color: green !important;
  color: green;
}
</style>
