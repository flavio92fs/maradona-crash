import * as THREE from "three";
import GUI from "lil-gui";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { gsap } from "gsap";
import { loadSettings, saveSettings, resetSettings } from "./saveLoadGUI";
import { addMaterialGUI } from "./guiHelpers";

export function addDOM(
  scene: THREE.Scene,
  gui: GUI,
  material: THREE.MeshBasicMaterial,
  textureLoader: THREE.TextureLoader
) {
  const geometry = new THREE.SphereGeometry(300, 60, 40);
  geometry.scale(-1, 1, 1);
  material.name = "sphereDomMaterial";

  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(0, -0.2, 0);
  sphere.scale.set(0.044, 0.044, 0.044);
  scene.add(sphere);

  const STORAGE_KEY = "DOM SPHERE";
  const defaultParams = { scale: 0.044, positionY: -0.2 };
  let params = { ...defaultParams };
  loadSettings(STORAGE_KEY, defaultParams, params);

  sphere.scale.set(params.scale, params.scale, params.scale);
  sphere.position.set(0, params.positionY, 0);

  gui.add(params, "scale", 0, 1, 0.00001).onChange((val: number) => {
    sphere.scale.set(val, val, val);
    saveSettings(STORAGE_KEY, params);
  });

  gui.add(params, "positionY", -5, 5, 0.01).onChange((val: number) => {
    sphere.position.set(0, val, 0);
  });

  gui.add(
    {
      reset: () => {
        resetSettings(STORAGE_KEY, defaultParams, params, gui);
        saveSettings(STORAGE_KEY, defaultParams);
        sphere.scale.set(params.scale, params.scale, params.scale);
        sphere.position.set(0, params.positionY, 0);
      },
    },
    "reset"
  );

  addMaterialGUI(gui, material, textureLoader, "Sphere Dom Material");
}

export function addGrassPlane(
  scene: THREE.Scene,
  gui: GUI,
  gltfLoader: GLTFLoader,
  textureLoader: THREE.TextureLoader
) {
  const pratoTexture = textureLoader.load("textures/grass/texture.png");
  pratoTexture.colorSpace = THREE.SRGBColorSpace;
  pratoTexture.wrapS = THREE.RepeatWrapping;
  pratoTexture.wrapT = THREE.RepeatWrapping;

  const pratoMaterial = new THREE.MeshStandardMaterial({ map: pratoTexture });
  addMaterialGUI(gui, pratoMaterial, textureLoader, "Prato Material");

  gltfLoader.load("models/GLB/prato.glb", (gltf) => {
    const model = gltf.scene;
    model.rotation.set(0, THREE.MathUtils.degToRad(-90), 0);

    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.Material;
        if (mat.name === "prato") {
          mesh.material = pratoMaterial;
        }
      }
    });

    scene.add(model);
  });
}

export function addShadowPlane(scene: THREE.Scene, gui: GUI) {
  const STORAGE_KEY = "ShadowPlane";
  const defaultParams = {
    size: 20,
    opacity: 0.5,
    color: "#000000",
    visible: true,
    positionY: 0.003,
  };

  let params = { ...defaultParams };
  loadSettings(STORAGE_KEY, defaultParams, params);

  const shadowMat = new THREE.ShadowMaterial({
    color: params.color,
    opacity: params.opacity,
  });

  const planeGeo = new THREE.PlaneGeometry(1, 1);
  const plane = new THREE.Mesh(planeGeo, shadowMat);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = params.positionY;
  plane.receiveShadow = true;
  plane.visible = params.visible;
  plane.scale.set(params.size, params.size, 1);
  scene.add(plane);

  const folder = gui.addFolder("Shadow Plane").close();
  folder
    .add(params, "size", 1, 100, 1)
    .name("Size")
    .onChange((val: number) => {
      plane.scale.set(val, val, 1);
      saveSettings(STORAGE_KEY, params);
    });
  folder
    .add(params, "positionY", 0.003, 1, 0.001)
    .name("Position Y")
    .onChange((val: number) => {
      plane.position.y = val;
      saveSettings(STORAGE_KEY, params);
    });
  folder
    .addColor(params, "color")
    .name("Color")
    .onChange((val: string) => {
      shadowMat.color.set(val);
      saveSettings(STORAGE_KEY, params);
    });
  folder
    .add(params, "opacity", 0, 1, 0.01)
    .name("Opacity")
    .onChange((val: number) => {
      shadowMat.opacity = val;
      saveSettings(STORAGE_KEY, params);
    });
  folder
    .add(params, "visible")
    .name("Visible")
    .onChange((val: boolean) => {
      plane.visible = val;
      saveSettings(STORAGE_KEY, params);
    });
}

export function addCartelloni(
  scene: THREE.Scene,
  gui: GUI,
  gltfLoader: GLTFLoader,
  textureLoader: THREE.TextureLoader
) {
  const texture = textureLoader.load(
    "textures/stadio/BannerTestCartelloniAnimated2.png"
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1;
  texture.offset.y = 0.62;

  gsap
    .timeline({ repeat: -1, repeatDelay: 10 })
    .to(texture.offset, { y: 0.42, duration: 1, ease: "none" })
    .to(texture.offset, { y: 0.42, duration: 10, ease: "none" })
    .to(texture.offset, { y: 0.62, duration: 1, ease: "none" });

  const cartelloniMaterial = new THREE.MeshBasicMaterial({ map: texture });
  cartelloniMaterial.name = "Cartelloni Material";
  addMaterialGUI(gui, cartelloniMaterial, textureLoader);

  gltfLoader.load("models/GLB/cartelloni.glb", (gltf) => {
    const model = gltf.scene;
    model.rotation.set(0, THREE.MathUtils.degToRad(-90), 0);

    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = cartelloniMaterial;
      }
    });

    scene.add(model);
  });
}

export function addAnimatedLights(
  scene: THREE.Scene,
  gui: GUI,
  gltfLoader: GLTFLoader,
  textureLoader: THREE.TextureLoader,
  glbName: string
): Promise<THREE.AnimationMixer> {
  return new Promise((resolve) => {
    const lightTexture = textureLoader.load("textures/luce.png");
    lightTexture.colorSpace = THREE.SRGBColorSpace;
    lightTexture.flipY = false;

    const lightMaterial = new THREE.MeshBasicMaterial({
      map: lightTexture,
      transparent: true,
      depthWrite: false,
    });

    gltfLoader.load(`models/GLB/${glbName}.glb`, (gltf) => {
      const model = gltf.scene;
      model.rotation.set(0, THREE.MathUtils.degToRad(-90), 0);

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = lightMaterial;
        }
      });

      gui.add(model, "visible");

      const mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.play();
      });

      scene.add(model);
      resolve(mixer);
    });
  });
}

export interface FireworksState {
  mixer: THREE.AnimationMixer | null;
  isPlaying: boolean;
}

export function addAnimatedFireworks(
  scene: THREE.Scene,
  gltfLoader: GLTFLoader,
  fireworksMaterial: THREE.MeshBasicMaterial,
  animationsGUI: GUI,
  state: FireworksState
) {
  gltfLoader.load("models/GLB/fuochi.glb", (gltf) => {
    const model = gltf.scene;
    model.rotation.set(0, THREE.MathUtils.degToRad(-90), 0);

    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = fireworksMaterial;
      }
    });

    const mixer = new THREE.AnimationMixer(model);
    state.mixer = mixer;

    const clip = gltf.animations[0];
    if (!clip) return;

    const action = mixer.clipAction(clip);
    action.play();
    action.paused = true;
    action.time = 0;
    action.setLoop(THREE.LoopOnce, 0);
    mixer.setTime(0);

    animationsGUI
      .add(
        {
          playFireworks: () => {
            action.enabled = true;
            action.reset();
            action.paused = false;
            mixer.update(0);
            state.isPlaying = true;
          },
        },
        "playFireworks"
      )
      .name("🎆 Play Fireworks");

    mixer.addEventListener("finished", () => {
      action.enabled = true;
      action.reset();
      action.paused = true;
      mixer.update(0);
      state.isPlaying = false;
    });

    scene.add(model);
  });
}

export function addStadio(
  scene: THREE.Scene,
  gui: GUI,
  gltfLoader: GLTFLoader,
  textureLoader: THREE.TextureLoader
) {
  const stadioTexture = textureLoader.load("textures/stadio/textureProps.png");
  const stadioMaterial = new THREE.MeshStandardMaterial({
    map: stadioTexture,
    name: "stadio_material",
  });
  addMaterialGUI(gui, stadioMaterial, textureLoader, "Stadio Material");

  gltfLoader.load("models/GLB/stadio2.glb", (gltf) => {
    const video = document.createElement("video");
    video.src = "video/VideoMonitor.mp4";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = "auto";

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.flipY = false;
    videoTexture.center.set(0.5, 0.5);
    videoTexture.rotation = THREE.MathUtils.degToRad(-180);
    videoTexture.offset.x = 0;
    videoTexture.offset.y = -0.3;

    video.addEventListener("canplaythrough", () => video.play());

    stadioTexture.flipY = false;

    const model = gltf.scene;
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.Material;
        if (mat.name === "video") {
          (mesh.material as THREE.MeshBasicMaterial).map = videoTexture;
        }
        if (mat.name === "stadio") {
          mesh.material = stadioMaterial;
        }
      }
    });

    const params = { rotation: 0, scale: 1, offsetX: 0, offsetY: 0 };
    const folder = gui.addFolder("Monitor Video").close();

    folder
      .add(params, "rotation", -180, 180, 1)
      .name("Rotazione")
      .onChange((deg: number) => {
        videoTexture.rotation = THREE.MathUtils.degToRad(deg);
      });
    folder
      .add(params, "scale", 0.1, 5, 0.1)
      .name("Scala")
      .onChange((s: number) => {
        videoTexture.repeat.set(s, s);
      });
    folder
      .add(params, "offsetX", -1, 1, 0.01)
      .name("Offset X")
      .onChange((v: number) => {
        videoTexture.offset.x = v;
      });
    folder
      .add(params, "offsetY", -1, 1, 0.01)
      .name("Offset Y")
      .onChange((v: number) => {
        videoTexture.offset.y = v;
      });

    model.position.set(0, 0.002, 0);
    model.rotation.set(0, THREE.MathUtils.degToRad(90), 0);
    scene.add(model);
  });
}

export function addVideoGrassPlane(
  scene: THREE.Scene,
  gui: GUI,
  gltfLoader: GLTFLoader,
  textureLoader: THREE.TextureLoader
) {

  const videoMaterial = new THREE.MeshStandardMaterial();
  addMaterialGUI(gui, videoMaterial, textureLoader, "Video Material");

  gltfLoader.load("models/GLB/prato.glb", (gltf) => {
    const video = document.createElement("video");
    video.src = "video/best-moments-video.mp4";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = "auto";

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.flipY = false;
    videoTexture.center.set(0.5, 0.5);
    videoTexture.rotation = THREE.MathUtils.degToRad(-180);

    videoTexture.offset.x = -0.07;
    videoTexture.offset.y = -0.02;
    videoTexture.repeat.set(0.1, 0.1);

    video.addEventListener("canplaythrough", () => video.play());
    videoTexture.flipY = false;
    
    const model = gltf.scene;
    model.traverse((child) => {
    model.rotation.set(0, THREE.MathUtils.degToRad(90), 0);
    model.position.y = 0.01
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.Material;
        if (mat.name === "prato") {
          (mesh.material as THREE.MeshBasicMaterial).map = videoTexture;
        }
      }
    });


    const params = { rotation: 0, scale: 1, offsetX: 0, offsetY: 0, positionY: 0, };
    const folder = gui.addFolder("Grass Video Plane").close();

    folder
      .add(params, "rotation", -180, 180, 1)
      .name("Rotazione")
      .onChange((deg: number) => {
        videoTexture.rotation = THREE.MathUtils.degToRad(deg);
      });
    folder
      .add(params, "scale", 0.1, 5, 0.1)
      .name("Scala")
      .onChange((s: number) => {
        videoTexture.repeat.set(s, s);
      });
    folder
      .add(params, "offsetX", -1, 1, 0.01)
      .name("Offset X")
      .onChange((v: number) => {
        videoTexture.offset.x = v;
      });
    folder
      .add(params, "offsetY", -1, 1, 0.01)
      .name("Offset Y")
      .onChange((v: number) => {
        videoTexture.offset.y = v;
      });
    folder
      .add(params, "positionY", -1, 1, 0.001)
      .name("Plane Position Y")
      .onChange((v: number) => {
        model.position.y = v
      });

    scene.add(model);
  });
}