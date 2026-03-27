<template>
  <div class="flex flex-col">
    <div class="flex flex-row gap-x-2 items-end my-3">
      <!-- <div class="flex-shrink-0 w-6 h-6 bg-gray-50 rounded-full"></div> -->
      <div class="flex flex-row items-center">
        <p class="font-bold text-xs mr-2">{{ message.user }}:</p>
        <p>{{ message.text }}</p>
        <!-- <p class="text-xs text-right mt-2">
          {{ moment(message.timestamp).format("HH:mm") }}
        </p> -->
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import { mapState } from "vuex";

export default {
  name: "ChatMessage",
  props: {
    message: Object,
  },

  data: () => ({
    moment: null,
  }),

  created() {
    this.moment = moment;
  },

  computed: {
    ...mapState({ player: "player" }),
  },
};
</script>

<style scoped>
.my-message {
  @apply bg-primary-dark rounded-xl p-2 text-white text-right px-3;
  max-width: 75%;
  word-wrap: break-word;
}

.other-message {
  @apply bg-primary-dark rounded-xl p-2 self-end text-white px-3;
  max-width: 75%;
  word-wrap: break-word;
}
</style>
