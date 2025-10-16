<template>
  <div
    class="select-none"
    :style="'background-color: ' + color + ' ; color: white'"
  >
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
        // case this.value > 0 && this.value < 3:
        //   return "green";
        // case this.value >= 2 && this.value < 10:
        //   return "yellow";
        case this.value >= 10:
          return "#8203D0";
        default:
          return "#57aadc";
      }
    },
  },
};
</script>
