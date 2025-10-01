import * as THREE from "three";

export default class AudioManager {
  private _audioLoader: THREE.AudioLoader;
  private _listener: THREE.AudioListener;
  private _backgroundSound: THREE.Audio;

  public get listener(): THREE.AudioListener {
    return this._listener;
  }

  constructor(loadingManager: THREE.LoadingManager) {
    this._audioLoader = new THREE.AudioLoader(loadingManager);
    this._listener = new THREE.AudioListener();
    this._backgroundSound = new THREE.Audio(this._listener);

    this._audioLoader.load("sound/background.mp3", (buffer) => {
      this._backgroundSound.setBuffer(buffer);
      this._backgroundSound.setLoop(true);
      this._backgroundSound.setVolume(0.1);
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
