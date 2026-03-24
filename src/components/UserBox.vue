<script setup>
import { ref } from "vue";
import { UserCircleIcon } from "@heroicons/vue/24/outline";

const username = ref("Test");
</script>

<template>
  <div class="border border-secondary p-2 rounded-xl">
    <div class="flex items-center">
      <div class="mr-2">
        <UserCircleIcon class="h-10 w-10" />
      </div>
      <div>
        <div class="text-xs font-bold text-white">User</div>
        <div>{{ username }}</div>
      </div>
    </div>
  </div>
</template>
