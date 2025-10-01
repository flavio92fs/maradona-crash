<template>
  <TransitionRoot as="template" :show="true">
    <Dialog as="div" class="relative z-50">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div
          class="fixed inset-0 bg-primary bg-opacity-75 transition-opacity"
        />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div
          class="flex min-h-full justify-center p-4 text-center items-center sm:p-0"
        >
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="relative transform overflow-hidden rounded-lg bg-primary-dark text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
            >
              <div class="bg-primary pb-4">
                <div>
                  <div class="text-center sm:mt-0 sm:text-left">
                    <div
                      class="flex justify-between items-center w-full bg-secondary px-4 py-2"
                    >
                      <DialogTitle
                        as="h3"
                        class="text-base font-semibold leading-6 text-white"
                        >You have been disconnected</DialogTitle
                      >
                    </div>
                    <div class="text-white mt-2 px-4">
                      <p class="text-center text-md my-4">
                        Please go back to the landing page and re-launch the
                        game.
                      </p>
                      <div class="text-center">
                        <button
                          class="bg-green-600 border border-green-500 rounded-full px-3 py-1"
                          @click="goToLanding"
                        >
                          HOME
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref } from "vue";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";

const open = ref(false);

function openModal() {
  console.log("Opening Modal");
  open.value = true;
}

function goToLanding() {
  window.location.href = "https://eldorado-gaming.it/games.html";
}

defineExpose({
  openModal,
});
</script>
