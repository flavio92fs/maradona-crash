import { createApp } from "vue";
import emitter from "./eventEmitter";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { createI18n } from "vue-i18n";
import { defineCustomElements as defineIonPhaser } from "@ion-phaser/core";
import { useToast } from "vue-toast-notification";
import ToastPlugin from "vue-toast-notification";
import "vue-toast-notification/dist/theme-default.css";
import it from "@/assets/locale/it.json";
import en from "@/assets/locale/en.json";

import "./assets/main.css";

const i18n = createI18n({
  locale: navigator.language.slice(0, 2),
  fallbackLocale: "en",
  globalInjection: true,
  messages: { it, en },
});

const app = createApp(App);
const $toast = useToast();

app.config.globalProperties.$mitt = emitter;

defineIonPhaser(window);

app.use(router);
app.use(store);
app.use(i18n);
app.use(ToastPlugin);

app.mount("#app");
