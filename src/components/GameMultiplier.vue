<template>
  <div
    class="text-white text-2xl p-1 rounded-md z-[20] text-center pointer-events-none"
    style="text-shadow: 1.8px 1.8px rgba(0, 0, 0, 0.6)"
  >
    <div class="font-bold">
      <span class="maradona-font multiplier-x">x </span
      ><span class="multiplier-integer maradona-font">0</span>
      <span class="maradona-font multiplier-comma">,</span>
      <span class="maradona-font multiplier-decimal">00</span>
    </div>
  </div>
</template>

<style scoped>
.multiplier-x {
  font-size: 2.5rem;
}

.multiplier-integer {
  font-size: 5rem;
}

.multiplier-comma {
  @apply text-sm;
}

.multiplier-decimal {
  font-size: 2.8rem;
}

@container threegamecontainer (width < 25rem) {
  .multiplier-x {
    font-size: 2.5rem;
  }

  .multiplier-integer {
    font-size: 4rem;
  }

  .multiplier-comma {
    @apply text-sm;
  }

  .multiplier-decimal {
    font-size: 2.5rem;
  }
}
</style>
