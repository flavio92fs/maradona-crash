<template>
  <div class="flex items-center btn-container rounded-lg w-full mx-2 p-2">
    <button
      class="relative flex md:flex-col btn rounded-xl text-xl p-2 w-full text-white text-start items-center justify-between md:items-start"
      :disabled="!active"
      :class="!active ? 'button-70-disabled' : 'button-70'"
      @click.stop="console.log('bet')"
    >
      <div class="flex md:flex-col">
        <p class="font-bold">BET</p>
        <p class="font-bold ms-1.5 md:ms-0">{{ betValue }}€</p>
      </div>

      <button
        class="md:absolute select-none right-0 top-0 md:me-1 md:mt-1 h-6 w-6 md:h-7 md:w-7 z-10"
        v-if="id != menuOpen"
        :disabled="!active"
        @click.stop="$emit('sub-click')"
      >
        <EllipsisHorizontalCircleIcon />
      </button>
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
