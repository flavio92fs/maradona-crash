<template>
  <div class="flex items-center btn-container rounded-lg w-full mx-2 p-2">
    <button
      class="relative flex flex-col btn rounded-xl text-xl p-2 w-full text-white text-start"
      :disabled="!active"
      :class="!active ? 'button-70-disabled' : 'button-70'"
      @click.stop="console.log('bet')"
    >
      <button
        class="absolute select-none right-0 top-0 me-1 mt-1 h-7 w-7 z-10"
        v-if="id != menuOpen"
        :disabled="!active"
        @click.stop="$emit('sub-click')"
      >
        <EllipsisHorizontalCircleIcon />
      </button>
      <p class="font-bold">BET</p>
      <p class="font-bold">{{ betValue }}€</p>
    </button>
  </div>
</template>

<script setup>
import { EllipsisHorizontalCircleIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  id: Number,
  active: Boolean,
  betValue: String,
  menuOpen: Number,
});

const emit = defineEmits(["sub-click"]);
</script>
