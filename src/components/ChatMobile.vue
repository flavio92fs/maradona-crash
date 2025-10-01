<template>
  <TransitionRoot as="template" :show="open" :appear="true">
    <Dialog as="div" class="relative z-10" @close="open = false">
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
                      <input
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
                      </button>
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

const open = ref(false);

const chatMessages = computed(() => store.state.chatMessages);
const player = computed(() => store.state.player);
const message = ref("");
const messages = document.getElementById("mobile-messages-container");

emitter.on("chat-messages", () => {
  nextTick(() => {
    console.log(messages);
    messages.scrollTop = messages.scrollHeight - messages.clientHeight;
  });
});

emitter.on("chat-message", (data) => {
  addChatMessage({
    username: data.username,
    message: data.message,
    timestamp: data.timestamp,
  });
  nextTick(() => {
    messages.scrollTop = messages.scrollHeight - messages.clientHeight;
  });
});

function openChatPanel() {
  open.value = true;
}

function sendMessage(message) {
  if (message.length > 0) {
    emitter.emit("mobile-message", message);

    addChatMessage({
      message: message,
      username: player.value.name,
      timestamp: new Date(),
    });
    message = "";
    nextTick(() => {
      messages.scrollTop = messages.scrollHeight - messages.clientHeight;
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
