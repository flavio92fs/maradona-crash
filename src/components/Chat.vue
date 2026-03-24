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
        class="flex flex-col flex-grow h-96 max-h-96 xs:max-h-full xs:h-0 overflow-y-auto mx-2 mt-2 px-2"
      >
        <ChatMessage
          v-for="(message, index) in chatMessages"
          :key="index"
          :message="message"
        />
      </div>

      <div class="flex p-2 relative">
        <!-- <input
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
        </button> -->

        <button
          class="bg-secondary p-2 rounded-md text-white h-full w-full"
          @click="isEmojiOpen ? (isEmojiOpen = false) : (isEmojiOpen = true)"
        >
          {{ isEmojiOpen ? "Close" : "Send Reaction" }}
        </button>

        <Picker
          v-if="isEmojiOpen"
          class="absolute left-0 right-0 bottom-16 mx-auto bg-primary border-secondary"
          :data="emojiIndex"
          :showPreview="false"
          style="width: 96% !important"
          @select="sendMessage"
          native
        >
          ></Picker
        >
      </div>
    </div>
  </div>
</template>

<script>
import ChatMessage from "./ChatMessage.vue";
import ChatWebSocket from "@/WebSockets/Chat";
import data from "emoji-mart-vue-fast/data/all.json";
import "emoji-mart-vue-fast/css/emoji-mart.css";
import { Picker, EmojiIndex } from "emoji-mart-vue-fast/src";
import { mapActions, mapState } from "vuex";

let emojiIndex = new EmojiIndex(data);

export default {
  name: "Chat",

  components: {
    ChatMessage,
    Picker,
  },

  data: () => ({
    isEmojiOpen: false,
    chat: new ChatWebSocket(),
    messages: [],
    message: "",
    emojiIndex: emojiIndex,
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
      this.chat.sendMessage(data);
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

    sendMessage(emoji) {
      console.log(emoji);
      const messages = document.getElementById("messages-container");

      if (emoji) {
        const message = {
          user: "Test",
          text: emoji.native,
        };

        this.chat.sendChatMessage(message);

        this.chatMessages.push({
          user: "Test",
          text: emoji.native,
        });
        this.message = {};
        this.isEmojiOpen = false;
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

<style>
.emoji-mart-search {
  margin-top: 10px !important;
  margin-bottom: 10px !important;
  background-color: bg-primary !important;
}

.emoji-mart-search > input {
  @apply bg-primary;
  color: white;
  padding: 8px;
  border-radius: 5px;
}

.emoji-mart-category-label {
  @apply bg-primary !important;
  font-weight: 600 !important;
  color: white !important;
  margin-bottom: 10px;
  margin-top: 10px;
}
</style>
