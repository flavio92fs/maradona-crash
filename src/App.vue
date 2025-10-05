<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <div class="h-full">
    <Transition>
      <div
        v-if="loading && !disconnected"
        class="absolute h-full w-full bg-black z-50 text-white"
      >
        <div class="relative h-full w-full">
          <div class="absolute top-1/2 left-1/2">
            <div
              class="flex flex-col justify-center items-center gap-y-5 transform -translate-x-1/2 -translate-y-1/2"
            >
              <h2 class="text-xl font-bold">Loading. Please wait.</h2>
              <h3 class="text-2xl font-bold">
                {{ parseInt(loading_progress) }} %
              </h3>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition>
      <div v-if="disconnected" class="absolute h-full w-full bg-black z-50">
        <DisconnectionModal />
      </div>
    </Transition>

    <RouterView class="p-0 lg:p-5" :class="loading ? 'overflow-hidden' : ''" />
  </div>
</template>

<script lang="ts">
import DisconnectionModal from "@/components/DisconnectionModal.vue";

export default {
  name: "App",

  components: {
    DisconnectionModal,
  },

  data: () => ({
    loading: true,
    loading_progress: 0,
    disconnected: false,
  }),

  created() {
    this.$mitt.on("loadingProgress", (value) => {
      this.loading = true;
      this.loading_progress = value.percent;
      if (value.percent >= 100) {
        this.loading = false;
        this.loading_progress = 0;
      }
    });
    this.$mitt.on("GameScene", () => {
      console.log("loaded");
      this.loading_progress = 100;
      this.loading = false;
    });
    this.$mitt.on("LoadingScene", () => {
      console.log("loaded");
      this.loading_progress = 100;
      this.loading = false;
    });
    this.$mitt.on("disconnection", () => {
      this.loading_progress = 100;
      this.disconnected = true;
    });
  },

  mounted() {
    const importTE = async () => {
      await import("tw-elements"!);
    };
    importTE();
  },
};
</script>

<style scoped>
progress[value] {
  width: 100%;
  height: 20px;
  background-color: transparent;
  color: white;
  border: 2px solid white;
  border-radius: 25px;
  padding: 2px;
}

progress[value]::-webkit-progress-value {
  background: white;
  border-radius: 25px;
}

progress[value]::-moz-progress-bar {
  background: white;
  border-radius: 25px;
}

@-webkit-keyframes animate-stripes {
  100% {
    background-position: -100px 0px;
  }
}

@keyframes animate-stripes {
  100% {
    background-position: -100px 0px;
  }
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
.loader {
  border: 16px solid #f3f3f3; /* Light grey */
  border-top: 16px solid #db8d34; /* Blue */
  border-radius: 50%;
  width: 120px;
  height: 120px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
