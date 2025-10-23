<template>
  <div
    id="game-multiplier"
    class="text-white text-2xl p-1 rounded-md z-[20] text-center pointer-events-none"
    style="font-size: 5rem; text-shadow: 1.8px 1.8px rgba(0, 0, 0, 0.6)"
  >
    <div class="font-bold">
      <span class="maradona-font" style="font-size: 2.5rem">x </span
      ><span class="maradona-font">0</span>
      <span class="maradona-font text-sm">,</span>
      <span class="maradona-font" style="font-size: 2.8rem">00</span>
    </div>
  </div>
</template>

<style scoped>
.multiplier-x {
  font-size: 2.5rem;
}

.multiplier-integer {
  font-size: 1rem;
}

.multiplier-comma {
  @apply text-sm;
}

.multiplier-decimal {
  font-size: 2.8rem;
}
</style>
