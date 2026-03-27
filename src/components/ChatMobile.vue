<template>
  <TransitionRoot as="template" :show="open" :appear="true">
    <Dialog as="div" class="relative z-[9999]" @close="open = false">
      <TransitionChild
        as="template"
        enter="ease-in-out duration-500"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in-out duration-500"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div
          class="fixed inset-0 bg-primary bg-opacity-40 transition-opacity"
        />
      </TransitionChild>

      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <div
            class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10"
          >
            <TransitionChild
              as="template"
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enter-from="translate-x-full"
              enter-to="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leave-from="translate-x-0"
              leave-to="translate-x-full"
            >
              <DialogPanel
                class="pointer-events-auto relative w-screen max-w-md"
              >
                <div class="h-full flex flex-col bg-transparent shadow-xl">
                  <div class="flex justify-between bg-secondary px-4 py-5">
                    <DialogTitle
                      class="bg-secondary text-base font-semibold leading-6 text-white h-full"
                      >Chat</DialogTitle
                    >
                    <button
                      type="button"
                      class="rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                      @click="open = false"
                    >
                      <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>

                  <div
                    ref="mobile-messages-container"
                    id="mobile-messages-container"
                    class="flex flex-col flex-grow bg-primary bg-opacity-90 px-4 sm:px-6 overflow-y-scroll max-h-full h-0"
                  >
                    <ChatMessage
                      v-for="(message, index) in chatMessages"
                      :key="index"
                      :message="message"
                    />
                  </div>

                  <div class="bg-secondary">
                    <div class="flex gap-3 p-3 items-center">
                      <!-- <input
                        type="text"
                        class="flex-grow bg-transparent text-white border border-white rounded-md px-2 py-1 min-w-0"
                        placeholder="Invia un messaggio..."
                        v-model="message"
                        @keydown.enter="sendMessage(message)"
                      />
                      <button
                        type="button"
                        class="bg-primary px-2 rounded-md text-white h-full"
                        @click="sendMessage(message)"
                      >
                        Invia
                      </button> -->

                      <button
                        class="border border-1 bg-secondary p-2 rounded-md text-white h-full w-full"
                        @click="
                          isEmojiOpen
                            ? (isEmojiOpen = false)
                            : (isEmojiOpen = true)
                        "
                      >
                        {{ isEmojiOpen ? "Close" : "Send Reaction" }}
                      </button>

                      <Picker
                        v-if="isEmojiOpen"
                        class="absolute left-0 right-0 bottom-16 mx-auto bg-primary border-secondary z-[999999] mb-2"
                        :data="emojiIndex"
                        :showPreview="false"
                        style="width: 96% !important"
                        @select="sendMessage"
                        native
                      >
                      </Picker>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, nextTick } from "vue";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import ChatMessage from "./ChatMessage.vue";
import { computed } from "@vue/reactivity";
import store from "@/store";
import emitter from "@/eventEmitter";
import data from "emoji-mart-vue-fast/data/all.json";
import "emoji-mart-vue-fast/css/emoji-mart.css";
import { Picker, EmojiIndex } from "emoji-mart-vue-fast/src";

const open = ref(false);

const chatMessages = computed(() => store.state.chatMessages);
const player = computed(() => store.state.player);
const message = ref("");
const isEmojiOpen = ref(false);
const emojiIndex = new EmojiIndex(data);

emitter.on("chat-messages", () => {
  const messages = document.getElementById("mobile-messages-container");
  nextTick(() => {
    if (messages != null)
      messages.scrollTop = messages.scrollHeight - messages.clientHeight;
  });
});

emitter.on("chat-message", (data) => {
  const messages = document.getElementById("mobile-messages-container");
  console.log("message received");
  addChatMessage(data.data);
  nextTick(() => {
    if (messages != null)
      messages.scrollTop = messages.scrollHeight - messages.clientHeight;
  });
});

function openChatPanel() {
  open.value = true;
}

function sendMessage(emoji) {
  const messages = document.getElementById("mobile-messages-container");
  console.log(messages);
  if (emoji) {
    emitter.emit("mobile-message", emoji);

    // addChatMessage({
    //   user: "Test",
    //   text: emoji.native,
    // });

    isEmojiOpen.value = false;

    nextTick(() => {
      if (messages != null) {
        messages.scrollTop = messages.scrollHeight - messages.clientHeight;
      }
    });
  }
}

function addChatMessage(message) {
  store.dispatch("addChatMessage", message);
}

defineExpose({
  openChatPanel,
});
</script>
