import type GUI from "lil-gui";
import * as THREE from "three";
import { loadSettings, saveSettings } from "./saveLoadGUI";
import emitter from "@/eventEmitter";

export default class AudioManager {
  private _audioLoader: THREE.AudioLoader;
  private _listener: THREE.AudioListener;
  private _backgroundSound: THREE.Audio;
  private _gui: GUI;
  private _userStopped: boolean;

  public get listener(): THREE.AudioListener {
    return this._listener;
  }

  constructor(loadingManager: THREE.LoadingManager, gui: GUI) {
    this._audioLoader = new THREE.AudioLoader(loadingManager);
    this._listener = new THREE.AudioListener();
    this._backgroundSound = new THREE.Audio(this._listener);
    this._userStopped = false;

    this._gui = gui;

    // carica audio
    this._audioLoader.load("sound/background.ogg", (buffer) => {
      this._backgroundSound.setBuffer(buffer);
      this._backgroundSound.setLoop(true);
    });

    const STORAGE_KEY = "VOLUME";

    const defaultParams = {
      volume: 0.1,
    };

    let params = { ...defaultParams };
    loadSettings(STORAGE_KEY, defaultParams, params);

    this._backgroundSound.setVolume(params.volume);

    const folder = gui.addFolder("Sound").close();
    folder
      .add(params, "volume", 0, 1, 0.1)
      .name("Volume")
      .onChange((val: number) => {
        this._backgroundSound.setVolume(val);
        saveSettings(STORAGE_KEY, params);
      });

    // ⏸️ Gestione focus finestra
    window.addEventListener("blur", () => {
      if (this._backgroundSound.isPlaying) {
        this._backgroundSound.pause();
      }
    });

    window.addEventListener("focus", () => {
      // riprende solo se era in riproduzione
      if (!this._backgroundSound.isPlaying && !this._userStopped) {
        this.playBackgroundMusic();
      }
    });

    emitter.on("setMusic", (val) => {
      if (val) {
        if (!this._backgroundSound.isPlaying) {
          this._userStopped = false;
          this.playBackgroundMusic();
        }
      } else {
        if (this._backgroundSound.isPlaying) {
          this._userStopped = true;
          this._backgroundSound.pause();
        }
      }
    });

    // Unlock audio on the first user gesture ANYWHERE on the page.
    // Browsers block audio playback until a user interaction: without this,
    // in portrait the canvas area doesn't count as a "button click" and the
    // music never starts.
    const unlock = () => {
      const ctx = this._listener.context;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      if (
        !this._backgroundSound.isPlaying &&
        !this._userStopped &&
        this._backgroundSound.buffer
      ) {
        this.playBackgroundMusic();
      }
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: false });
    window.addEventListener("touchstart", unlock, { once: false, passive: true });
    window.addEventListener("keydown", unlock, { once: false });
  }

  public playBackgroundMusic() {
    const context = this._listener.context;
    if (context.state === "suspended") {
      context.resume();
    }

    if (!this._backgroundSound.isPlaying) {
      this._backgroundSound.play();
    }
  }
}
