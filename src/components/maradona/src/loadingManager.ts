import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import emitter from "@/eventEmitter";

export default class LoadingManager {
  private _loadingManager: THREE.LoadingManager;
  private _fbxLoader: FBXLoader;
  private _gltfLoader: GLTFLoader;
  private _textureLoader: THREE.TextureLoader;

  public get loadingManager() {
    return this._loadingManager;
  }

  public get fbxLoader() {
    return this._fbxLoader;
  }

  public get gltfLoader(){
    return this._gltfLoader;
  }


  public get textureLoader() {
    return this._textureLoader;
  }

  constructor(onComplete: () => void) {
    this._loadingManager = new THREE.LoadingManager();
    this._loadingManager.onStart = (url) =>
      console.log(`Inizio caricamento`);

    this._loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const percent = (itemsLoaded / itemsTotal) * 100;
      emitter.emit("loadingProgress", { percent: percent });
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
    this._gltfLoader = new GLTFLoader(this._loadingManager);
  }
}
