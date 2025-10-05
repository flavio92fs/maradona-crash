import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import emitter from "@/eventEmitter";

export default class LoadingManager {
  private _loadingManager: THREE.LoadingManager;
  private _fbxLoader: FBXLoader;
  private _textureLoader: THREE.TextureLoader;

  public get loadingManager() {
    return this._loadingManager;
  }

  public get fbxLoader() {
    return this._fbxLoader;
  }

  public get textureLoader() {
    return this._textureLoader;
  }

  constructor(onComplete: () => void) {
    this._loadingManager = new THREE.LoadingManager();
    this._loadingManager.onStart = (url) =>
      console.log(`Inizio caricamento: ${url}`);

    this._loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      // console.log(`Caricato ${itemsLoaded} di ${itemsTotal} file.`);
      const percent = (itemsLoaded / itemsTotal) * 100;

      //   console.log(percent);

      emitter.on("loadingProgress", () => {});
      emitter.emit("loadingProgress", { percent: percent });

      // const progressBar = document.getElementById('progress-bar');
      // if(progressBar != null){
      //     progressBar.style.width = percent + '%';
      // }
    };

    this._loadingManager.onLoad = () => {
      const loadingScreen = document.getElementById("loading-screen");
      console.log("Tutto caricato ✅");
      if (loadingScreen) {
        loadingScreen.style.display = "none";
      }

      onComplete();
    };

    this._loadingManager.onError = (url) => {
      console.error(`Errore nel caricamento: ${url}`);
    };

    this._fbxLoader = new FBXLoader(this._loadingManager);
    this._textureLoader = new THREE.TextureLoader(this._loadingManager);
  }
}
