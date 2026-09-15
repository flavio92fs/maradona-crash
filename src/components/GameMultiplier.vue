<template>
  <div
    class="text-white text-2xl p-1 rounded-md z-[20] text-center pointer-events-none"
    style="text-shadow: 1.8px 1.8px rgba(0, 0, 0, 0.6)"
  >
    <!-- CRASHED: final multiplier in red (no extra label, avoids overlap) -->
    <div
      v-if="phase === 'crashed'"
      class="font-bold flex flex-col items-center text-red-500"
    >
      <div>
        <span
          class="maradona-font"
          :class="isLandscape ? 'multiplier-x' : 'multiplier-x-sm'"
          >x </span
        ><span
          class="maradona-font"
          :class="isLandscape ? 'multiplier-integer' : 'multiplier-integer-sm'"
          >{{ intPart }}</span
        >
        <span
          class="maradona-font"
          :class="isLandscape ? 'multiplier-comma' : 'multiplier-comma-sm'"
          >,</span
        >
        <span
          class="maradona-font"
          :class="isLandscape ? 'multiplier-decimal' : 'multiplier-decimal-sm'"
          >{{ decPart }}</span
        >
      </div>
    </div>

    <!-- RUNNING: live multiplier -->
    <div v-else-if="phase === 'running'" class="font-bold">
      <span
        class="maradona-font"
        :class="isLandscape ? 'multiplier-x' : 'multiplier-x-sm'"
        >x </span
      ><span
        class="maradona-font"
        :class="isLandscape ? 'multiplier-integer' : 'multiplier-integer-sm'"
        >{{ intPart }}</span
      >
      <span
        class="maradona-font"
        :class="isLandscape ? 'multiplier-comma' : 'multiplier-comma-sm'"
        >,</span
      >
      <span
        class="maradona-font"
        :class="isLandscape ? 'multiplier-decimal' : 'multiplier-decimal-sm'"
        >{{ decPart }}</span
      >
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import emitter from "@/eventEmitter";

defineProps({
  isLandscape: Boolean,
});

const value = ref(1.0);
const phase = ref("betting");
const timer = ref(0);
const duration = ref(6);

const intPart = computed(() => Math.floor(value.value).toString());
const decPart = computed(() => {
  const d = Math.floor((value.value - Math.floor(value.value)) * 100);
  return d.toString().padStart(2, "0");
});

// 0 -> 1 while the betting timer counts down (bar fills up).
const progressPct = computed(() => {
  if (duration.value <= 0) return 0;
  return Math.max(0, Math.min(1, 1 - timer.value / duration.value));
});

function onMultiplier(p) {
  value.value = p.value;
}
function onPhase(p) {
  phase.value = p.phase;
  if (p.phase === "betting") {
    value.value = 1.0;
    if (typeof p.duration === "number") {
      duration.value = p.duration;
      timer.value = p.duration;
    }
  }
  if (p.phase === "crashed" && typeof p.multiplier === "number") {
    value.value = p.multiplier;
  }
}
function onTimer(p) {
  timer.value = p.remaining;
}

onMounted(() => {
  emitter.on("game:multiplier", onMultiplier);
  emitter.on("game:phase", onPhase);
  emitter.on("game:timer", onTimer);
});
onUnmounted(() => {
  emitter.off("game:multiplier", onMultiplier);
  emitter.off("game:phase", onPhase);
  emitter.off("game:timer", onTimer);
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
