import type GUI from "lil-gui";
import * as THREE from "three";
import { loadSettings, saveSettings } from "./saveLoadGUI";

export default class AudioManager {
  private _audioLoader: THREE.AudioLoader;
  private _listener: THREE.AudioListener;
  private _backgroundSound: THREE.Audio;
  private _gui: GUI

  public get listener(): THREE.AudioListener {
    return this._listener;
  }

  constructor(loadingManager: THREE.LoadingManager, gui) {
    this._audioLoader = new THREE.AudioLoader(loadingManager);
    this._listener = new THREE.AudioListener();
    this._backgroundSound = new THREE.Audio(this._listener);

    this._gui = gui;

    this._audioLoader.load("sound/background.mp3", (buffer) => {
      this._backgroundSound.setBuffer(buffer);
      this._backgroundSound.setLoop(true);
    });

    const STORAGE_KEY = 'VOLUME'

    const defaultParams = {
      volume: 0.1
    }

    const params = loadSettings(STORAGE_KEY, defaultParams);

    this._backgroundSound.setVolume(params.volume);

    const folder = gui.addFolder('Sound').close();
    folder.add(params, 'volume', 0, 1, 0.1).onChange((val: number) =>{
      this._backgroundSound.setVolume(val);
      saveSettings(STORAGE_KEY, params);
    });
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
