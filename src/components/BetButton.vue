<template>
  <div class="flex items-center btn-container rounded-lg w-full p-2">
    <button
      class="relative flex md:flex-col btn rounded-xl text-xl p-2 w-full text-white text-start items-start justify-between"
      :disabled="!active"
      :class="!active ? 'button-70-disabled' : 'button-70'"
      @click.stop="console.log('bet')"
    >
      <div class="flex flex-col">
        <p class="font-bold">BET</p>
        <p class="font-bold">{{ betValue }}€</p>
      </div>

      <button
        class="absolute select-none right-0 top-0 me-1 mt-2 h-6 w-6 md:h-7 md:w-7 z-10"
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
