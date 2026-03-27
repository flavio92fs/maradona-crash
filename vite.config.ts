import { fileURLToPath, URL } from "node:url";
import obfuscator from "vite-plugin-javascript-obfuscator";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  build: {
    assetsInlineLimit: 0,
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag: any) => ["ion-phaser"].includes(tag),
        },
      },
    }),
    vueJsx(),
    //   obfuscator({
    //     include: [/\.ts$/, /\.js$/],
    //     exclude: [/node_modules/], // Escludiamo phaser per sicurezza extra
    //     apply: 'build',
    //     options: {
    //         compact: true,
    //         unicodeEscapeSequence: false,

    //         controlFlowFlattening: true,
    //         controlFlowFlatteningThreshold: 0.5,
    //         deadCodeInjection: false,
    //         stringArray: true,
    //         stringArrayRotate: true,
    //         stringArrayShuffle: true,
    //         stringArrayThreshold: 0.75,

    //         domainLock: ['client.caseragames.com'],
    //         domainLockRedirectUrl: 'about:blank',

    //         // 4. ANTI-HACKING
    //         debugProtection: false,
    //         debugProtectionInterval: 4000,
    //         disableConsoleOutput: true,
    //         selfDefending: false,
    //         splitStrings: true
    //     }
    // })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
