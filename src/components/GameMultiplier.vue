<template>
  <div
    class="text-white text-2xl p-1 rounded-md z-[20] text-center pointer-events-none"
    style="text-shadow: 1.8px 1.8px rgba(0, 0, 0, 0.6)"
  >
    <div class="font-bold">
      <span
        class="maradona-font"
        :class="isLandscape ? 'multiplier-x' : 'multiplier-x-sm'"
        >x </span
      ><span
        class="maradona-font"
        :class="isLandscape ? 'multiplier-integer' : 'multiplier-integer-sm'"
        >0</span
      >
      <span
        class="maradona-font"
        :class="isLandscape ? 'multiplier-comma' : 'multiplier-comma-sm'"
        >,</span
      >
      <span
        class="maradona-font"
        :class="isLandscape ? 'multiplier-decimal' : 'multiplier-decimal-sm'"
        >00</span
      >
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isLandscape: Boolean,
});
</script>

<style scoped>
.multiplier-x {
  font-size: 3.5rem;
}

.multiplier-integer {
  font-size: 7.5rem;
}

.multiplier-comma {
  @apply text-sm;
}

.multiplier-decimal {
  font-size: 5.5rem;
}

.multiplier-x-sm {
  font-size: 2.5rem;
}

.multiplier-integer-sm {
  font-size: 4rem;
}

.multiplier-comma-sm {
  @apply text-sm;
}

.multiplier-decimal-sm {
  font-size: 2.5rem;
}
</style>
