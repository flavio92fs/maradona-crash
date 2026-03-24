<template>
  <div>
    <div class="h-full flex flex-col border border-secondary rounded-xl">
      <div
        class="flex justify-between text-white border-b border-secondary rounded-t-xl p-2"
      >
        <div>CHAT</div>
        <div class="flex flex-row items-center">
          <div class="bg-green-500 h-3 w-3 rounded-full mr-1.5"></div>
          <div>Online: <b>138</b></div>
        </div>
      </div>
      <div
        id="messages-container"
        class="flex flex-col flex-grow h-96 max-h-96 xl:max-h-full xl:h-0 overflow-y-auto mx-2 mt-2 px-2"
      >
        <ChatMessage
          v-for="(message, index) in chatMessages"
          :key="index"
          :message="message"
        />
      </div>

      <div class="flex gap-3 p-3">
        <input
          type="text"
          class="focus:outline-none flex-grow bg-transparent text-white border border-white rounded-md px-2 py-1 min-w-0"
          :placeholder="$t('chat_prompt')"
          v-model="message"
          @keydown.enter="sendMessage(message)"
        />
        <button
          type="button"
          class="bg-secondary px-2 rounded-md text-white h-full"
          @click="sendMessage(message)"
          :disabled="message.length <= 0"
        >
          {{ $t("send") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import ChatMessage from "./ChatMessage.vue";
import ChatWebSocket from "@/WebSockets/Chat";
import { mapActions, mapState } from "vuex";

export default {
  name: "Chat",

  components: {
    ChatMessage,
  },

  data: () => ({
    chat: new ChatWebSocket(),
    messages: [],
    message: "",
  }),

  computed: {
    ...mapState({ player: "player", chatMessages: "chatMessages" }),
  },

  created() {
    this.chat.connect();

    this.$mitt.on("chat-messages", (data) => {
      const messages = document.getElementById("messages-container");
      this.messages = data.data;
      this.setChatMessages(data.data);
      this.$nextTick(() => {
        messages.scrollTo(0, 9999);
      });
    });

    this.$mitt.on("chat-message", (data) => {
      const messages = document.getElementById("messages-container");
      this.$nextTick(() => {
        messages.scrollTo(0, 9999);
      });
    });

    this.$mitt.on("mobile-message", (data) => {
      this.chat.sendChatMessage(data);
    });
  },

  methods: {
    ...mapActions(["setChatMessages"]),

    sendMessage(message) {
      const messages = document.getElementById("messages-container");

      if (message.length > 0) {
        this.chat.sendChatMessage(message);

        this.chatMessages.push({
          message: message,
          username: this.player.name,
          timestamp: new Date(),
        });
        this.message = "";
        this.$nextTick(() => {
          messages.scrollTo(0, 9999);
        });
      }
    },
  },
};
</script>

<style scoped>
::-webkit-scrollbar {
  width: 3px;
  border-radius: 25px;
}

/* Track */
::-webkit-scrollbar-track {
  @apply bg-primary;
  border-radius: 25px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 25px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
