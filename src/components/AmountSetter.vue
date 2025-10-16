<template>
  <div>
    <div
      class="border border-secondary flex flex-row justify-between items-center rounded-full p-1"
    >
      <button
        class="flex items-center justify-center bg-primary h-8 w-8 rounded-full text-2xl font-medium leading-8"
        :class="disabled ? 'text-secondary' : 'text-white'"
        @click="decreaseValue()"
        :disabled="disabled"
      >
        -
      </button>
      <input
        type="number"
        :step="0.01"
        :min="minimumValue"
        :max="maximumValue"
        :value="modelValue"
        class="bg-primary-dark flex-grow mx-1 focus:outline-none text-lg font-normal w-10 text-center"
        :class="disabled ? 'text-secondary' : 'text-white'"
        :disabled="disabled"
        @focusout="checkValue"
        @keypress="preventKeys"
      />

      <button
        class="flex items-center justify-center bg-primary h-8 w-8 rounded-full text-2xl font-medium leading-8"
        :class="disabled ? 'text-secondary' : 'text-white'"
        @click="increaseValue()"
        :disabled="disabled"
      >
        +
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "AmountSetter",

  props: {
    modelValue: String,
    currency: "",
    disabled: false,
    minimumValue: Number,
    maximumValue: Number,
  },

  methods: {
    increaseValue() {
      if (this.modelValue >= this.maximumValue) {
        return;
      }
      this.$emit("increase", null);
    },

    decreaseValue() {
      if (this.modelValue >= 0.1) {
        this.$emit("decrease", null);
      }
    },

    checkValue(e) {
      this.$emit("update:modelValue", parseFloat(e.target.value).toFixed(2));
    },

    preventKeys($event) {
      var keyCode = $event.keyCode;
      if ([101, 43, 45].includes(keyCode)) {
        $event.preventDefault();
      }
    },
  },
};
</script>

<style scoped>
button {
  user-select: none;
}
</style>
