<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-[9999]" @close="closeModal()">
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
              <div class="bg-primary">
                <div>
                  <div class="text-center sm:mt-0 sm:text-left">
                    <div
                      class="flex justify-between items-center w-full bg-secondary px-4 py-2"
                    >
                      <DialogTitle
                        as="h3"
                        class="text-base font-semibold leading-6 text-white"
                        >{{ $t("autoplay_modal_title") }}</DialogTitle
                      >
                      <XMarkIcon
                        class="cursor-pointer h-5 w-5"
                        @click="closeModal()"
                      />
                    </div>
                    <div class="text-white my-2 px-4">
                      <div
                        v-if="show_round_error"
                        class="flex justify-between items-center bg-red-700 rounded-md mb-2 border border-red-500 p-2"
                      >
                        <div>Per favore, seleziona un numero di round.</div>
                        <div>
                          <XMarkIcon
                            class="cursor-pointer h-5 w-5"
                            @click="show_round_error = false"
                          />
                        </div>
                      </div>

                      <div
                        v-if="show_stop_error"
                        class="flex justify-between items-center bg-red-700 rounded-md mb-2 border border-red-500 p-2"
                      >
                        <div>
                          Per favore, specifica la diminuzione o il superamento
                          del punto di arresto.
                        </div>
                        <div>
                          <XMarkIcon
                            class="cursor-pointer h-5 w-5"
                            @click="show_stop_error = false"
                          />
                        </div>
                      </div>

                      <div
                        v-if="show_amount_error"
                        class="flex justify-between items-center bg-red-700 rounded-md mb-2 border border-red-500 p-2"
                      >
                        <div>
                          Impossibile impostare 0.00 come punto di arresto
                        </div>
                        <div>
                          <XMarkIcon
                            class="cursor-pointer h-5 w-5"
                            @click="show_amount_error = false"
                          />
                        </div>
                      </div>

                      <div
                        class="bg-primary-dark text-center pb-4 pt-2 rounded-md"
                      >
                        <p class="font-light text-sm">Numero di round:</p>
                        <div class="mt-5">
                          <button
                            class="rounded-2xl px-4 py-0.5 border text-sm font-light mx-2"
                            :class="
                              number_of_rounds == 10
                                ? 'border-green-500 bg-green-700'
                                : 'border-gray-400 bg-secondary'
                            "
                            @click="number_of_rounds = 10"
                          >
                            10
                          </button>
                          <button
                            class="rounded-2xl px-4 py-0.5 border text-sm font-light mx-2"
                            :class="
                              number_of_rounds == 20
                                ? 'border-green-500 bg-green-700'
                                : 'border-gray-400 bg-secondary'
                            "
                            @click="number_of_rounds = 20"
                          >
                            20
                          </button>
                          <button
                            class="rounded-2xl px-4 py-0.5 border text-sm font-light mx-2"
                            :class="
                              number_of_rounds == 50
                                ? 'border-green-500 bg-green-700'
                                : 'border-gray-400 bg-secondary'
                            "
                            @click="number_of_rounds = 50"
                          >
                            50
                          </button>
                          <button
                            class="rounded-2xl px-4 py-0.5 border text-sm font-light mx-2"
                            :class="
                              number_of_rounds == 100
                                ? 'border-green-500 bg-green-700'
                                : 'border-gray-400 bg-secondary'
                            "
                            @click="number_of_rounds = 100"
                          >
                            100
                          </button>
                        </div>
                      </div>
                      <div
                        class="flex bg-primary-dark mt-2 rounded-md py-5 px-3 text-sm items-center justify-between"
                      >
                        <input
                          class="mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-green-600 checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-neutral-500 checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer checked:focus:bg-green-600 checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 dark:bg-neutral-600 dark:after:bg-neutral-400"
                          type="checkbox"
                          role="switch"
                          v-model="stopAtLoss"
                          @change="loss_amount = '0.0'"
                        />
                        <div
                          :class="stopAtLoss ? 'text-white' : 'text-secondary'"
                        >
                          Interrompi se il denaro diminuisce di
                        </div>
                        <AmountSetter
                          v-model="loss_amount"
                          :currency="currency.symbol"
                          :disabled="!stopAtLoss"
                          @increase="increaseValue('loss_amount')"
                          @decrease="decreaseValue('loss_amount')"
                        />
                      </div>
                      <div
                        class="flex bg-primary-dark mt-2 rounded-md py-5 px-3 text-sm items-center justify-between"
                      >
                        <input
                          class="mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-green-600 checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-neutral-500 checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer checked:focus:bg-green-600 checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 dark:bg-neutral-600 dark:after:bg-neutral-400"
                          type="checkbox"
                          role="switch"
                          v-model="stopAtGain"
                          @change="gain_amount = '0.0'"
                        />
                        <div
                          :class="stopAtGain ? 'text-white' : 'text-secondary'"
                        >
                          Interrompi se il denaro aumenta di
                        </div>
                        <AmountSetter
                          v-model="gain_amount"
                          :currency="currency.symbol"
                          :disabled="!stopAtGain"
                          @increase="increaseValue('gain_amount')"
                          @decrease="decreaseValue('gain_amount')"
                        />
                      </div>
                      <div
                        class="flex bg-primary-dark mt-2 rounded-md py-5 px-3 text-sm items-center justify-between"
                      >
                        <input
                          class="mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-green-600 checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-neutral-500 checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer checked:focus:bg-green-600 checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 dark:bg-neutral-600 dark:after:bg-neutral-400"
                          type="checkbox"
                          role="switch"
                          v-model="stopAtSingleWin"
                          @change="single_win_amount = '0.0'"
                        />
                        <div
                          :class="
                            stopAtSingleWin ? 'text-white' : 'text-secondary'
                          "
                        >
                          Interrompi se la singola vittoria supera
                        </div>
                        <AmountSetter
                          v-model="single_win_amount"
                          :currency="currency.symbol"
                          :disabled="!stopAtSingleWin"
                          @increase="increaseValue('single_win_amount')"
                          @decrease="decreaseValue('single_win_amount')"
                        />
                      </div>
                    </div>
                    <div
                      class="flex justify-center items-center w-full bg-secondary px-4 py-3"
                    >
                      <button
                        class="mr-4 bg-red-700 text-white rounded-full px-3 py-1 text-sm font-light border border-red-500"
                        @click="resetValues()"
                      >
                        Azzera
                      </button>
                      <button
                        class="mr-4 bg-green-700 text-white rounded-full px-3 py-1 text-sm font-light border border-green-500"
                        @click="startAutoPlay()"
                      >
                        Avvia Gioco Automatico
                      </button>
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
import { reactive, ref, toRefs } from "vue";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import AmountSetter from "./AmountSetter.vue";
import store from "@/store";
import { computed } from "@vue/reactivity";

const state = reactive({
  loss_amount: "0.00",
  gain_amount: "0.00",
  single_win_amount: "0.00",
});

const { loss_amount, gain_amount, single_win_amount } = toRefs(state);

const open = ref(false);
const number_of_rounds = ref(0);
const stopAtLoss = ref(false);
const stopAtGain = ref(false);
const stopAtSingleWin = ref(false);
const show_round_error = ref(false);
const show_stop_error = ref(false);
const show_amount_error = ref(false);
const currency = computed(() => store.state.currency);
const emit = defineEmits(["startAutoplay"]);

function openModal() {
  open.value = true;
}

function closeModal() {
  resetValues();
  open.value = false;
}

function increaseValue(value) {
  console.log("Original Value: " + state[value]);
  let newValue = parseFloat(state[value]);
  const roundedValue = newValue.toFixed(2);

  if (roundedValue >= 0 && roundedValue < 1) {
    newValue += 0.1;
  }

  if (roundedValue >= 1 && roundedValue < 10) {
    newValue += 1;
  }

  if (roundedValue >= 10 && roundedValue < 50) {
    newValue += 5;
  }

  if (roundedValue >= 50) {
    newValue += 10;
  }

  state[value] = parseFloat(newValue).toFixed(2);

  console.log("Value: " + state[value]);
}

function decreaseValue(value) {
  let newValue = parseFloat(state[value]);
  const roundedValue = newValue.toFixed(2);

  if (roundedValue > 0.1 && roundedValue <= 1) {
    newValue -= 0.1;
  }

  if (roundedValue > 1 && roundedValue <= 10) {
    newValue -= 1;
  }

  if (roundedValue > 10 && roundedValue <= 50) {
    newValue -= 5;
  }

  if (roundedValue > 50) {
    newValue -= 10;
  }

  state[value] = parseFloat(newValue).toFixed(2);

  console.log("Value: " + state[value]);
}

function resetValues() {
  number_of_rounds.value = 0;
  stopAtLoss.value = false;
  stopAtGain.value = false;
  stopAtSingleWin.value = false;
  loss_amount.value = "0.00";
  gain_amount.value = "0.00";
  single_win_amount.value = "0.00";
  show_round_error.value = false;
  show_stop_error.value = false;
  show_amount_error.value = false;
}

function startAutoPlay() {
  if (number_of_rounds.value == 0) {
    console.log("there error");
    show_round_error.value = true;
    return;
  }

  if (!stopAtLoss.value && !stopAtSingleWin.value && !stopAtGain.value) {
    show_round_error.value = false;
    show_amount_error.value = false;

    show_stop_error.value = true;
    return;
  }

  if (
    (stopAtLoss.value && loss_amount.value <= 0.0) ||
    (stopAtGain.value && gain_amount.value <= 0.0) ||
    (stopAtSingleWin.value && single_win_amount.value <= 0.0)
  ) {
    show_round_error.value = false;
    show_stop_error.value = false;
    show_amount_error.value = true;

    return;
  }

  emit("startAutoplay", {
    number_of_rounds: number_of_rounds.value,
    stop_at_loss: stopAtLoss.value,
    stop_at_gain: stopAtGain.value,
    stop_at_single_win: stopAtSingleWin.value,
    loss_amount: loss_amount.value,
    gain_amount: gain_amount.value,
    single_win_amount: single_win_amount.value,
  });
  open.value = false;
  resetValues();
}

defineExpose({
  openModal,
});
</script>
