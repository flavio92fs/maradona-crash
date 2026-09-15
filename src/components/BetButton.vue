<template>
  <div class="flex items-center btn-container rounded-lg w-full p-2">
    <div class="relative w-full">
      <button
        class="flex md:flex-col btn rounded-xl text-xl p-2 w-full text-white text-start items-start justify-between"
        :disabled="disabled"
        :class="buttonClass"
        type="button"
        @click.stop="onMainClick"
      >
        <div class="flex flex-col">
          <p class="font-bold">{{ label }}</p>
          <p class="font-bold">{{ displayValue }}</p>
        </div>
      </button>

      <button
        v-if="id != menuOpen && !hasBet"
        class="absolute select-none right-0 top-0 me-1 mt-2 h-6 w-6 md:h-7 md:w-7 z-10"
        :disabled="!active"
        type="button"
        @click.stop="$emit('sub-click')"
      >
        <EllipsisHorizontalCircleIcon />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { EllipsisHorizontalCircleIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  id: Number,
  active: { type: Boolean, default: true },
  betValue: String, // preset amount (string, e.g. "1.00")
  menuOpen: Number,
  phase: { type: String, default: "betting" },
  hasBet: { type: Boolean, default: false },
  cashedOut: { type: Boolean, default: false },
  forNextRound: { type: Boolean, default: false },
  currentMultiplier: { type: Number, default: 1 },
  currency: { type: String, default: "€" },
});

const emit = defineEmits(["sub-click", "action"]);

function onMainClick() {
  if (disabled.value) return;
  emit("action");
}

const disabled = computed(() => {
  if (!props.active) return true;
  if (props.cashedOut) return true;
  if (props.hasBet && props.phase === "crashed" && !props.forNextRound) return true;
  return false;
});

const label = computed(() => {
  if (props.hasBet) {
    if (props.cashedOut) return "RITIRATO";
    // Bet placed during running/crashed -> it's queued for the NEXT round.
    if (props.forNextRound) return "ANNULLA (prossimo)";
    if (props.phase === "betting") return "ANNULLA";
    if (props.phase === "running") return "RITIRA";
    if (props.phase === "crashed") return "PERSO";
  }
  if (props.phase === "betting") return "BET";
  return "BET (prossimo)";
});

const displayValue = computed(() => {
  // Live payout only for a real in-round bet during running.
  if (
    props.hasBet &&
    !props.forNextRound &&
    props.phase === "running" &&
    !props.cashedOut
  ) {
    const amount = parseFloat(props.betValue) * props.currentMultiplier;
    return amount.toFixed(2) + props.currency;
  }
  return (props.betValue ?? "0.00") + props.currency;
});

const buttonClass = computed(() => {
  if (disabled.value) return "button-70-disabled";
  if (props.hasBet && props.forNextRound) return "button-70-red";
  if (props.hasBet && props.phase === "betting") return "button-70-red";
  if (props.hasBet && props.phase === "running") return "button-70-green";
  return "button-70";
});
</script>

<style scoped>
.button-70-green {
  background: linear-gradient(180deg, #16a34a 0%, #065f46 100%);
  border: 1px solid #22c55e;
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.6);
}
.button-70-red {
  background: linear-gradient(180deg, #dc2626 0%, #7f1d1d 100%);
  border: 1px solid #ef4444;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.5);
}
</style>
