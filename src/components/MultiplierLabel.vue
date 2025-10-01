<template>
  <div class="bg-black" :style="'color: ' + color">{{ value.toFixed(2) }}x</div>
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
        case this.value > 0 && this.value < 3:
          return "green";
        case this.value >= 2 && this.value < 10:
          return "yellow";
        case this.value >= 10:
          return "red";
        default:
          return "white";
      }
    },
  },
};
</script>
