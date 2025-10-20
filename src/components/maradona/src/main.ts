import * as THREE from "three";
import GUI from "lil-gui";
import LoadingManager from "./loadingManager";
import CameraControls from "./orbitControls";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { resetSettings, saveSettings } from "./saveLoadGUI";
import { loadSettings } from "./saveLoadGUI";
import AudioManager from "./audioManager";
import emitter from "@/eventEmitter";

import { onMounted, ref } from "vue";

export function initScene(container: HTMLElement) {
  const gui: GUI = new GUI().close();
  addFPSCounter(gui);
  addUiGUI(gui);

  const clock = new THREE.Clock();

  let mixerMaradona: THREE.AnimationMixer;
  let mixerLuci: THREE.AnimationMixer;
  let mixerFireworks: THREE.AnimationMixer;
  let isFireworkAnimationPlaying = false;

  const rendererGUI = gui.addFolder("Renderer").close();
  const lightsFolderGUI = gui.addFolder("Lights").close();
  const maradonaMaterialsGUI = gui.addFolder("Maradona Materials").close();
  const sphereDomGUI = gui.addFolder("Sphere DOM").close();
  const animationsGUI = gui.addFolder("Animations");

  const loadingManager = new LoadingManager(() => {
    requestAnimationFrame(animate);
    window.addEventListener("click", () => {
      audioManager.playBackgroundMusic();
    });

    // window.addEventListener("resize", resizeRenderer);

    // resizeRenderer();
    // playIntroAnimation(camera, orbitControls, new THREE.Vector3(0.14, 0.06, 0.11), new THREE.Vector3(0, 0.06, 0));
  });

  // emitter.on('LOADED', () => resizeRenderer());

  const audioManager = new AudioManager(loadingManager.loadingManager, gui);
  const gltfLoader = loadingManager.gltfLoader;
  const fbxLoader = loadingManager.fbxLoader;
  const textureLoader = loadingManager.textureLoader;

  //#region Maradona Textures
  let divisaBaseColor: THREE.Texture;
  let pelleBaseColor: THREE.Texture;
  let capelliBaseColor: THREE.Texture;
  let pallaBaseColor: THREE.Texture;

  //#endregion

  const textureAnimator = {
    elapsed: 0,
    currentFrame: 0,
    fps: 30,
  };

  const fireWorkAnimatedTextures = [
    textureLoader.load("textures/fontana/0.png"),
    textureLoader.load("textures/fontana/1.png"),
    textureLoader.load("textures/fontana/2.png"),
    textureLoader.load("textures/fontana/3.png"),
  ];

  fireWorkAnimatedTextures.forEach((texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.y = -1;
  });

  const fireworksMaterial: THREE.MeshStandardMaterial =
    new THREE.MeshBasicMaterial({
      map: fireWorkAnimatedTextures[0],
      transparent: true,
      depthWrite: false,
    });

  loadDivisaTextures();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 1000);

  //#region Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);

  container.appendChild(renderer.domElement);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  addRendererGUI();

  function addRendererGUI() {
    const STORAGE_KEY = "RENDERER";

    const defaultParams = {
      toneMapping: THREE.LinearToneMapping,
      exposure: 1,
      shadowsEnabled: true,
    };

    let params = { ...defaultParams };

    loadSettings(STORAGE_KEY, defaultParams, params);

    renderer.toneMapping = params.toneMapping;
    renderer.toneMappingExposure = params.exposure;
    renderer.shadowsEnabled = params.shadowsEnabled;

    rendererGUI
      .add(params, "toneMapping", {
        None: THREE.NoToneMapping,
        Linear: THREE.LinearToneMapping,
        Reinhard: THREE.ReinhardToneMapping,
        Cineon: THREE.CineonToneMapping,
        ACESFilmic: THREE.ACESFilmicToneMapping,
      })
      .onChange((val) => {
        renderer.toneMapping = val;
        saveSettings(STORAGE_KEY, params);
      });

    rendererGUI.add(params, "exposure", 0, 10, 0.01).onChange((val) => {
      renderer.toneMappingExposure = val;
      saveSettings(STORAGE_KEY, params);
    });

    rendererGUI.add(renderer.shadowMap, "enabled").onChange((val) => {
      renderer.shadowsEnabled = val;
      saveSettings(STORAGE_KEY, params);
    });

    const resetInput = {
      reset: () => {
        resetSettings(STORAGE_KEY, defaultParams, params, rendererGUI);
        saveSettings(STORAGE_KEY, defaultParams);

        renderer.toneMapping = params.toneMapping;
        renderer.toneMappingExposure = params.exposure;
        renderer.shadowsEnabled = params.shadowsEnabled;
      },
    };

    rendererGUI.add(resetInput, "reset");
  }

  function resizeRenderer() {
    console.log(container)

    const windowWidth = container.clientWidth;
    const windowHeight = container.clientHeight;

    camera.aspect = windowWidth / windowHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(windowWidth, windowHeight);
  }

  const resizeObserver = new ResizeObserver(() => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });

  resizeObserver.observe(container);

  //#endregion

  let actions: { [key: string]: THREE.AnimationAction } = {};
  let subActions: { [key: string]: THREE.AnimationAction } = {};
  let currentAction: THREE.AnimationAction;

  const maradonaMaterialLibrary: Record<string, THREE.MeshStandardMaterial> = {
    divisa: new THREE.MeshStandardMaterial({
      map: divisaBaseColor,
      side: THREE.DoubleSide,
      name: "divisa",
    }),
    pelle: new THREE.MeshStandardMaterial({
      map: pelleBaseColor,
      // side: THREE.DoubleSide,
      opacity: 0,
      name: "pelle",
    }),
    capelli: new THREE.MeshStandardMaterial({
      map: capelliBaseColor,
      name: "capelli",
      // opacity: 0,
    }),
    palla: new THREE.MeshBasicMaterial({
      map: pallaBaseColor,
      opacity: 0,
      name: "palla",
      lightMapIntensity: 0,
      emissiveIntensity: 0,
    }),
  };

  function addAmbientLight() {
    const ambientLightGUI = lightsFolderGUI.addFolder("Ambient Light").close();
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);

    const STORAGE_KEY = "Ambient Light";

    const defaultParams = {
      color: 0xffffff,
      intensity: 1.4,
    };

    let params = { ...defaultParams };
    loadSettings(STORAGE_KEY, defaultParams, params);

    ambientLight.intensity = params.intensity;
    ambientLight.color.set(params.color);

    ambientLightGUI.add(params, "intensity").onChange((val) => {
      ambientLight.intensity = val;
      saveSettings(STORAGE_KEY, params);
    });
    ambientLightGUI.addColor(params, "color").onChange((val) => {
      ambientLight.color.set(val);
      saveSettings(STORAGE_KEY, params);
    });

    const resetInput = {
      reset: () => {
        resetSettings(STORAGE_KEY, defaultParams, params, ambientLightGUI);
        saveSettings(STORAGE_KEY, defaultParams);

        ambientLight.intensity = params.intensity;
        ambientLight.color.set(params.color);
      },
    };

    ambientLightGUI.add(resetInput, "reset");

    scene.add(ambientLight);
  }

  camera.position.set(0, 0.51, -1.2);

  addCameraGUI();
  const cameraControls = new CameraControls(camera, renderer, gui);

  //#region ANIMATE
  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    mixerMaradona?.update(delta);
    mixerLuci?.update(delta);

    if (isFireworkAnimationPlaying) {
      mixerFireworks?.update(delta);
      updateTextureAnimationMaterial(delta, fireworksMaterial, fireWorkAnimatedTextures);
    }

    cameraControls.orbitControls.update();
    renderer.render(scene, camera);
  }

  function addCameraGUI() {
    const cameraGUI = gui.addFolder("Camera").close();
    cameraGUI
      .add(camera.position, "x")
      .listen()
      .onChange(() => updateCamera())
      .disable();
    cameraGUI
      .add(camera.position, "y")
      .listen()
      .onChange(() => updateCamera())
      .disable();
    cameraGUI
      .add(camera.position, "z")
      .listen()
      .onChange(() => updateCamera())
      .disable();

    const STORAGE_KEY = "Camera";

    const defaultParams = {
      fov: 30,
    };

    let params = { ...defaultParams };
    loadSettings(STORAGE_KEY, defaultParams, params);

    camera.fov = params.fov;
    camera.updateProjectionMatrix();

    const fovControl = cameraGUI
      .add(params, "fov", 0, 120, 0.1)
      .onChange((val) => {
        camera.fov = val;
        camera.updateProjectionMatrix();
        saveSettings(STORAGE_KEY, params);
      });

    const resetInput = {
      reset: () => {
        resetSettings(STORAGE_KEY, defaultParams, params, cameraGUI);
        saveSettings(STORAGE_KEY, defaultParams);

        camera.fov = params.fov;

        camera.updateProjectionMatrix();
      },
    };

    cameraGUI.add(resetInput, "reset");
  }

  function updateCamera() {
    camera.updateProjectionMatrix();
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "h") {
      if (gui.domElement.style.display === "none") {
        gui.domElement.style.display = "";
      } else {
        gui.domElement.style.display = "none";
      }
    }
  });

  //#region ANIMATIONS
  function addSubAction(
    baseAction: THREE.AnimationAction,
    subName: string,
    start: number,
    end: number,
    fps: number
  ) {
    const clip = baseAction.getClip();
    const subClip = THREE.AnimationUtils.subclip(
      clip,
      subName,
      start,
      end,
      fps
    );
    const subAction = mixerMaradona.clipAction(subClip);
    subActions[subName] = subAction;
    return subAction;
  }

  function fadeToAction(
    nextAction: THREE.AnimationAction,
    duration: number = 0.1
  ) {
    if (currentAction !== nextAction) {
      // prepara la nuova action
      nextAction.reset().play();
      nextAction.enabled = true;

      // blend dalla corrente alla nuova
      if (currentAction) {
        currentAction.crossFadeTo(nextAction, duration, false);
      }

      currentAction = nextAction;
    }
  }
  //#endregion

  addAmbientLight();
  createSpotLight(lightsFolderGUI, "Spotlight Centrale", 0, 1, 0, 4);

  addDOM();

  addGrassPlane(gui, scene, textureLoader);
  addCartelloni(gui, scene);
  addAnimatedLights(scene);
  addAnimatedFireworks(scene);
  addStadio(gltfLoader, textureLoader, scene, gui);
  addMaradona(fbxLoader, scene, gui);
  addShadowPlane(gui, scene);

  function createDirectionalLight(
    gui: GUI,
    guiName: string,
    x: number,
    y: number,
    z: number
  ): THREE.DirectionalLight {
    const dirLightGUI = gui.addFolder("Directional Light").close();

    const light = new THREE.DirectionalLight(0xffffff, 1.5); // intensità più bassa per bilanciare
    light.position.set(x, y, z);

    light.castShadow = true;

    scene.add(light);

    dirLightGUI.add(light, "intensity");

    return light;
  }

  function createSpotLight(
    gui: GUI,
    guiName: string,
    x: number,
    y: number,
    z: number,
    intensity: number
  ): THREE.SpotLight {
    const folder = gui.addFolder(guiName).close();

    const light = new THREE.SpotLight(0xffffff, intensity);
    light.position.set(x, y, z);

    scene.add(light);
    scene.add(light.target);

    // helper
    const helper = new THREE.SpotLightHelper(light);
    helper.visible = false;
    scene.add(helper);

    // funzione di update
    function updateLightTarget() {
      light.target.position.x = 0;
      light.target.position.y = 0;
      light.target.position.z = 0;
      light.target.updateMatrixWorld();
      helper.update();
    }

    const STORAGE_KEY = guiName;

    const defaultParams = {
      positionX: 0,
      positionY: 1,
      positionZ: 0,

      targetPositionY: 0,
      cone: 1,
      borderHardness: 1,
      intensity: intensity,
      castShadow: true,
      color: 0xffffff,

      showHelper: false,
    };

    let params = { ...defaultParams };
    loadSettings(STORAGE_KEY, defaultParams, params);

    light.position.set(params.positionX, params.positionY, params.positionZ);
    light.target.position.y = params.targetPositionY;
    light.angle = params.cone;
    light.penumbra = params.borderHardness;
    light.intensity = params.intensity;
    light.castShadow = params.castShadow;
    light.color.set(params.color);

    helper.visible = params.showHelper;

    updateLightTarget();

    folder.add(params, "positionX", -10, 10, 0.01).onChange((val) => {
      light.position.x = val;
      updateLightTarget();
      saveSettings(STORAGE_KEY, params);
    });
    folder.add(params, "positionY", -10, 10, 0.01).onChange((val) => {
      light.position.y = val;
      updateLightTarget();
      saveSettings(STORAGE_KEY, params);
    });
    folder.add(params, "positionZ", -10, 10, 0.01).onChange((val) => {
      light.position.z = val;
      updateLightTarget();
      saveSettings(STORAGE_KEY, params);
    });

    folder.add(params, "targetPositionY", -5, 5, 0.001).onChange((val) => {
      light.target.position.y = val;
      updateLightTarget();
      saveSettings(STORAGE_KEY, params);
    });

    folder.add(params, "cone", 0, Math.PI / 2, 0.01).onChange((val) => {
      light.angle = val;
      helper.update();
      saveSettings(STORAGE_KEY, params);
    });

    folder.add(params, "borderHardness", 0, 1, 0.01).onChange((val) => {
      light.penumbra = val;
      helper.update();
      saveSettings(STORAGE_KEY, params);
    });

    folder.add(params, "intensity", 0, 100, 0.01).onChange((val) => {
      light.intensity = val;
      saveSettings(STORAGE_KEY, params);
    });

    folder.add(params, "castShadow").onChange((val) => {
      light.castShadow = val;
      saveSettings(STORAGE_KEY, params);
    });

    folder.addColor(params, "color").onChange((val) => {
      light.color.set(val);
      saveSettings(STORAGE_KEY, params);
    });

    folder.add(params, "showHelper").onChange((val) => {
      helper.visible = val;
      saveSettings(STORAGE_KEY, params);
    });

    const resetInput = {
      reset: () => {
        resetSettings(STORAGE_KEY, defaultParams, params, folder);
        saveSettings(STORAGE_KEY, defaultParams);

        light.position.set(
          params.positionX,
          params.positionY,
          params.positionZ
        );
        light.target.position.y = params.targetPositionY;
        light.angle = params.cone;
        light.penumbra = params.borderHardness;
        light.intensity = params.intensity;
        light.castShadow = params.castShadow;
        light.color.set(params.color);
        helper.visible = params.showHelper;

        updateLightTarget();
      },
    };

    folder.add(resetInput, "reset");

    return light;
  }

  function addDOM() {
    const geometry = new THREE.SphereGeometry(300, 60, 40);
    geometry.scale(-1, 1, 1); // Inverti la sfera (così si vede dall’interno)

    const domeTexture = textureLoader.load("DOM.png", (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;

      scene.environment = texture; // ✅ riflessi e illuminazione globale
    });

    const material = new THREE.MeshBasicMaterial({ map: domeTexture });
    material.name = "sphereDomMaterial";

    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(0, -0.2, 0);
    sphere.scale.set(0.044, 0.044, 0.044);
    scene.add(sphere);

    const STORAGE_KEY = "DOM SPHERE";

    const defaultParams = {
      scale: 0.044,
      positionY: -0.2,
    };

    let params = { ...defaultParams };
    loadSettings(STORAGE_KEY, defaultParams, params);

    sphere.scale.set(params.scale, params.scale, params.scale);
    sphere.position.set(0, params.positionY, 0);

    sphereDomGUI.add(params, "scale", 0, 1, 0.00001).onChange((val) => {
      sphere.scale.set(val, val, val);
      saveSettings(STORAGE_KEY, params);
    });

    sphereDomGUI.add(params, "positionY", -5, 5, 0.01).onChange((val) => {
      sphere.position.set(0, val, 0);
    });

    const resetInput = {
      reset: () => {
        resetSettings(STORAGE_KEY, defaultParams, params, sphereDomGUI);
        saveSettings(STORAGE_KEY, defaultParams);

        sphere.scale.set(params.scale, params.scale, params.scale);
        sphere.position.set(0, params.positionY, 0);
      },
    };

    sphereDomGUI.add(resetInput, "reset");

    addMaterialGUI(sphereDomGUI, material, "Sphere Dom Material");
  }

  function loadDivisaTextures() {
    divisaBaseColor = textureLoader.load(
      "textures/maradona/DivisaMaradona_BaseColor.png"
    );
    divisaBaseColor.colorSpace = THREE.SRGBColorSpace;

    pelleBaseColor = textureLoader.load(
      "textures/maradona/PelleMaradonaNuova.png"
    );
    pelleBaseColor.colorSpace = THREE.SRGBColorSpace;

    capelliBaseColor = textureLoader.load(
      "textures/maradona/Capelli_Diffuse.png"
    );
    capelliBaseColor.colorSpace = THREE.SRGBColorSpace;

    pallaBaseColor = textureLoader.load("textures/palla/palla_BaseColor.png");
    pallaBaseColor.colorSpace = THREE.SRGBColorSpace;
  }

  function addGrassPlane(
    gui: GUI,
    scene: THREE.Scene,
    textureLoader: THREE.TextureLoader
  ) {
    const pratoTexture = textureLoader.load("textures/grass/texture.png");
    pratoTexture.colorSpace = THREE.SRGBColorSpace;

    pratoTexture.wrapS = THREE.RepeatWrapping;
    pratoTexture.wrapT = THREE.RepeatWrapping;

    const pratoMaterial = new THREE.MeshStandardMaterial();
    pratoMaterial.map = pratoTexture;

    addMaterialGUI(gui, pratoMaterial, "Prato Material");

    gltfLoader.load("models/GLB/prato.glb", (gltf) => {
      const model = gltf.scene;
      model.rotation.set(0, THREE.MathUtils.degToRad(-90), 0);

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          if (child.material.name === "prato") {
            child.material = pratoMaterial;
          }
        }
      });

      scene.add(model);
    });
  }

  function addShadowPlane(gui: GUI, scene: THREE.Scene) {
    const STORAGE_KEY = "ShadowPlane";

    // valori di default
    const defaultParams = {
      size: 20,
      opacity: 0.5,
      color: "#000000",
      visible: true,
      positionY: 0.003, // ✅ nuova proprietà
    };

    // carica da localStorage
    let params = { ...defaultParams };
    loadSettings(STORAGE_KEY, defaultParams, params);

    // crea materiale d’ombra
    const shadowMat = new THREE.ShadowMaterial({
      color: params.color,
      opacity: params.opacity,
    });

    // crea piano (geometria unica, scalabile)
    const planeGeo = new THREE.PlaneGeometry(1, 1);
    const plane = new THREE.Mesh(planeGeo, shadowMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0.003;
    plane.receiveShadow = true;
    plane.visible = params.visible;
    plane.scale.set(params.size, params.size, 1);

    scene.add(plane);

    // --- GUI ---
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

    return plane;
  }

  function addCartelloni(gui: GUI, scene: THREE.Scene) {
    const texture = textureLoader.load(
      "textures/stadio/BannerTestCartelloni02.png"
    );
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = -1;
    texture.offset.y = 0.2;

    const STORAGE_KEY = "CARTELLONI";
    const cartelloniMaterial = new THREE.MeshStandardMaterial({ map: texture });

    cartelloniMaterial.name = "Cartelloni Material";

    addMaterialGUI(gui, cartelloniMaterial);

    const defaultParams = {
      color: 0x004a82,
    };

    let params = { ...defaultParams };
    loadSettings(STORAGE_KEY, defaultParams, params);

    gltfLoader.load("models/GLB/cartelloni.glb", (gltf) => {
      const model = gltf.scene;
      model.rotation.set(0, THREE.MathUtils.degToRad(-90), 0);
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.material = cartelloniMaterial;

          // mat.color.set(params.color);
          // mat.needsUpdate = true;
        }
      });

      scene.add(model);
    });
  }

  function addAnimatedLights(scene: THREE.Scene) {
    const lightTexture = textureLoader.load("textures/luce.png");
    lightTexture.colorSpace = THREE.SRGBColorSpace;
    lightTexture.flipY = false;

    const lightMaterial = new THREE.MeshBasicMaterial({
      map: lightTexture,
      transparent: true,
      depthWrite: false,
    });

    gltfLoader.load("models/GLB/animatedLights.glb", (gltf) => {
      const model = gltf.scene;
      model.rotation.set(0, THREE.MathUtils.degToRad(-90), 0);

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;

          mesh.material = lightMaterial;
        }
      });

      mixerLuci = new THREE.AnimationMixer(model);

      // Qui è la differenza → usa gltf.animations, non model.animations
      if (gltf.animations && gltf.animations.length > 0) {
        gltf.animations.forEach((clip) => {
          const action = mixerLuci.clipAction(clip);
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.play();
        });
      }

      scene.add(model);
    });
  }

  function addAnimatedFireworks(scene: THREE.Scene) {
    gltfLoader.load("models/GLB/fuochi.glb", (gltf) => {
      const model = gltf.scene;
      model.rotation.set(0, THREE.MathUtils.degToRad(-90), 0);

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.material = fireworksMaterial;
        }
      });

      mixerFireworks = new THREE.AnimationMixer(model);

      // Qui è la differenza → usa gltf.animations, non model.animations
      const clip = gltf.animations[0];
      const action = mixerFireworks.clipAction(clip);
      action.play();
      action.paused = true;
      action.time = 0;
      action.setLoop(THREE.LoopOnce, 0);
      mixerFireworks.setTime(0);

      const animationPlay = {
        playFireworks: () => {
          action.enabled = true; // riattiva l’azione
          action.reset(); // rimette time = 0 internamente
          action.paused = false; // ferma al frame 0
          mixerFireworks.update(0); // forza aggiornamento pose
          isFireworkAnimationPlaying = true;
        },
      };

      mixerFireworks.addEventListener("finished", () => {
        action.enabled = true; // riattiva l’azione
        action.reset(); // rimette time = 0 internamente
        action.paused = true; // ferma al frame 0
        mixerFireworks.update(0); // forza aggiornamento pose
        isFireworkAnimationPlaying = false;
      });

      animationsGUI
        .add(animationPlay, "playFireworks")
        .name("🎆 Play Fireworks");

      scene.add(model);
    });
  }

  function updateTextureAnimationMaterial(
    deltaTime: number,
    material: THREE.MeshStandardMaterial | THREE.MeshBasicMaterial,
    textures: THREE.Texture[]
  ) {
    textureAnimator.elapsed += deltaTime;

    if (textureAnimator.elapsed > 1 / textureAnimator.fps) {
      textureAnimator.elapsed = 0;
      textureAnimator.currentFrame =
        (textureAnimator.currentFrame + 1) % textures.length;
      material.map = textures[textureAnimator.currentFrame];
      material.needsUpdate = true;
    }
  }

  function addStadio(
    gltfLoader: GLTFLoader,
    textureLoader: THREE.TextureLoader,
    scene: THREE.Scene,
    gui: GUI
  ) {
    const stadioTexture = textureLoader.load(
      "textures/stadio/textureProps.png"
    );
    const stadioMaterial = new THREE.MeshStandardMaterial({
      map: stadioTexture,
      name: "stadio_material",
    });

    addMaterialGUI(gui, stadioMaterial, "Stadio Material");

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
      videoTexture.center.set(0.5, 0.5); // importante per ruotare dal centro
      videoTexture.rotation = THREE.MathUtils.degToRad(-180);
      videoTexture.offset.x = 0;
      videoTexture.offset.y = -0.3;

      video.addEventListener("canplaythrough", () => {
        console.log(`Video pronto!`);
        video.play();
      });

      stadioTexture.flipY = false;

      const model = gltf.scene;
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          if (child.material.name === "video") {
            child.material.map = videoTexture;
          }
          if (child.material.name === "stadio") {
            child.material = stadioMaterial;
          }
        }
      });

      const params = {
        rotation: 0,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        loadVideo: () => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "video/mp4,video/webm,video/ogg";

          input.addEventListener("change", (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            const url = URL.createObjectURL(file);
            // video.src = url;
            // video.play();
            console.log("Video caricato:", file.name);
          });

          input.click(); // apri il file picker
        },
      };

      const folder = gui.addFolder("Monitor Video").close();

      //rotazione in gradi
      folder
        .add(params, "rotation", -180, 180, 1)
        .name("Rotazione")
        .onChange((deg: number) => {
          videoTexture.rotation = THREE.MathUtils.degToRad(deg);
        });

      // scala uniforme
      folder
        .add(params, "scale", 0.1, 5, 0.1)
        .name("Scala")
        .onChange((s: number) => {
          videoTexture.repeat.set(s, s);
        });

      // offset
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

  function addMaradona(fbxLoader: FBXLoader, scene: THREE.Scene, gui: GUI) {
    type MaradonaParts = "divisa" | "capelli" | "pelle" | "palla";
    let meshesLibrary: Record<MaradonaParts, THREE.Mesh[]> = {
      divisa: [],
      capelli: [],
      pelle: [],
      palla: [],
    };

    fbxLoader.load("models/maradona_single_file.fbx", (model) => {
      model.scale.set(0.01, 0.01, 0.01);

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;

          const mat = mesh.material as THREE.Material;

          mesh.castShadow = true; // il modello proietta ombra
          mesh.receiveShadow = true;

          if (
            mat.name === "divisa" ||
            mat.name === "colletto_ai" ||
            mat.name === "maglietta_ai" ||
            mat.name === "pantaloncini_ai" ||
            mat.name === "gambe_ai"
          ) {
            meshesLibrary["divisa"].push(mesh);
            mesh.material = maradonaMaterialLibrary["divisa"];
          }
          if (mat.name === "capelli") {
            meshesLibrary["capelli"].push(mesh);
            mesh.material = maradonaMaterialLibrary["capelli"];
          }
          if (
            mat.name === "pelle" ||
            mat.name === "pelle_ai" ||
            mat.name === "occhi_ai"
          ) {
            meshesLibrary["pelle"].push(mesh);
            mesh.material = maradonaMaterialLibrary["pelle"];
          }
          if (mat.name === "palla") {
            meshesLibrary["palla"].push(mesh);
            mesh.material = maradonaMaterialLibrary["palla"];
          }
        }
      });

      scene.add(model);

      addMaterialGUI(
        maradonaMaterialsGUI,
        // meshesLibrary["divisa"],
        maradonaMaterialLibrary["divisa"]
      );
      addMaterialGUI(
        maradonaMaterialsGUI,
        // meshesLibrary["capelli"],
        maradonaMaterialLibrary["capelli"]
      );
      addMaterialGUI(
        maradonaMaterialsGUI,
        // meshesLibrary["pelle"],
        maradonaMaterialLibrary["pelle"]
      );
      addMaterialGUI(
        maradonaMaterialsGUI,
        // meshesLibrary["palla"],
        maradonaMaterialLibrary["palla"]
      );

      mixerMaradona = new THREE.AnimationMixer(model);

      model.animations.forEach((clip) => {
        const action = mixerMaradona.clipAction(clip);
        actions[clip.name] = action;
      });

      const startAction = addSubAction(
        actions["start"],
        "start",
        297,
        384,
        30
      ).setLoop(THREE.LoopOnce, 0);
      addSubAction(actions["palleggio_loop1"], "palleggio1", 385, 684, 30);
      addSubAction(actions["palleggio_loop2"], "palleggio2", 685, 986, 30);
      addSubAction(actions["riscaldamento"], "riscaldamento", 1, 296, 30);

      currentAction = subActions["riscaldamento"];
      currentAction.play();

      const keyToSubAction: Record<string, string> = {
        Digit1: "riscaldamento",
        Digit2: "palleggio1",
        Digit3: "palleggio2",
        Digit4: "start",
      };

      window.addEventListener("keydown", (e) => {
        const subName = keyToSubAction[e.code];
        if (subName && subActions[subName]) {
          fadeToAction(subActions[subName], 0.5); // fade 0.5s
        }
      });

      const animControls = {
        riscaldamento: () => fadeToAction(subActions["riscaldamento"], 0.5),

        palleggio1: () => {
          const startAction = subActions["start"];

          startAction.setLoop(THREE.LoopOnce, 0);
          startAction.clampWhenFinished = true;
          startAction.reset();

          fadeToAction(startAction, 0);

          // definisci la callback separata
          const onFinished = (e: any) => {
            if (e.action === startAction) {
              console.log("✅ 'start' terminata, avvio palleggio1!");
              fadeToAction(subActions["palleggio1"], 0.5);

              // 🔹 rimuovi subito il listener (importante)
              mixerMaradona.removeEventListener("finished", onFinished);
            }
          };

          // aggiungi il listener
          mixerMaradona.addEventListener("finished", onFinished);
        },

        palleggio2: () => {
          const startAction = subActions["start"];

          startAction.setLoop(THREE.LoopOnce, 0);
          startAction.clampWhenFinished = true;
          startAction.reset();

          fadeToAction(startAction, 0.5);

          // definisci la callback separata
          const onFinished = (e: any) => {
            if (e.action === startAction) {
              console.log("✅ 'start' terminata, avvio palleggio1!");
              fadeToAction(subActions["palleggio2"], 0);

              // 🔹 rimuovi subito il listener (importante)
              mixerMaradona.removeEventListener("finished", onFinished);
            }
          };

          // aggiungi il listener
          mixerMaradona.addEventListener("finished", onFinished);
        },
      };

      animationsGUI.add(animControls, "riscaldamento").name("🏃 Riscaldamento");
      animationsGUI.add(animControls, "palleggio1").name("⚽ Palleggio 1");
      animationsGUI.add(animControls, "palleggio2").name("⚽ Palleggio 2");

      animationsGUI.close();
    });
  }

  function addMaterialGUI(
    gui: GUI,
    material: THREE.MeshStandardMaterial | THREE.MeshBasicMaterial,
    guiName?: string
  ) {
    const STORAGE_KEY = `material_${material.name}`;

    // valori di default
    const defaultParams = {
      color: "#ffffff",
      emissive: "#000000",
      metalness: 0,
      roughness: 1,
      texturePath: "",
      offsetX: 0,
      offsetY: 0,
    };

    // carico eventuali valori salvati
    let params = { ...defaultParams };
    loadSettings(STORAGE_KEY, defaultParams, params);

    // applico subito i valori al materiale
    material.color.set(params.color);
    if ((material as THREE.MeshStandardMaterial).emissive !== undefined) {
      (material as THREE.MeshStandardMaterial).emissive.set(params.emissive);
    }
    if ((material as THREE.MeshStandardMaterial).metalness !== undefined) {
      (material as THREE.MeshStandardMaterial).metalness = params.metalness;
    }
    if ((material as THREE.MeshStandardMaterial).roughness !== undefined) {
      (material as THREE.MeshStandardMaterial).roughness = params.roughness;
    }

    // funzione per caricare texture manualmente
    const controls = {
      loadTexture: () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".png,.jpg,.jpeg";

        input.addEventListener("change", (e: any) => {
          const file = e.target.files[0];
          if (!file) return;

          const url = URL.createObjectURL(file);

          const loader = new THREE.TextureLoader();
          loader.load(url, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(1, 1);

            tex.offset.set(params.offsetX, params.offsetY);

            material.map = tex;
            material.needsUpdate = true;

            params.texturePath = file.name;
            saveSettings(STORAGE_KEY, params);

            console.log("Texture caricata:", file.name);
          });
        });

        input.click();
      },
    };

    // GUI
    const materialGUI = guiName
      ? gui.addFolder(guiName)
      : gui.addFolder(material.name);
    materialGUI.close();

    materialGUI.add(controls, "loadTexture").name("Carica Texture");

    // colore base
    materialGUI.addColor(params, "color").onChange((val: string) => {
      material.color.set(val);
      saveSettings(STORAGE_KEY, params);
    });

    // metalness / roughness solo per StandardMaterial
    if (material instanceof THREE.MeshStandardMaterial) {
      materialGUI
        .add(params, "metalness", 0, 1, 0.01)
        .onChange((val: number) => {
          material.metalness = val;
          material.needsUpdate = true;
          saveSettings(STORAGE_KEY, params);
        });

      materialGUI
        .add(params, "roughness", 0, 1, 0.01)
        .onChange((val: number) => {
          material.roughness = val;
          material.needsUpdate = true;
          saveSettings(STORAGE_KEY, params);
        });

      materialGUI
        .addColor(params, "emissive")
        .name("Emissive")
        .onChange((val: string) => {
          material.emissive.set(val);
          saveSettings(STORAGE_KEY, params);
        });
    }

    // ✅ Offset texture X/Y
    const offsetFolder = materialGUI.addFolder("Texture Offset");
    offsetFolder
      .add(params, "offsetX", -1, 1, 0.01)
      .name("Offset X")
      .onChange((v: number) => {
        if (material.map) {
          material.map.offset.x = v;
          material.map.needsUpdate = true;
        }
        saveSettings(STORAGE_KEY, params);
      });

    offsetFolder
      .add(params, "offsetY", -1, 1, 0.01)
      .name("Offset Y")
      .onChange((v: number) => {
        if (material.map) {
          material.map.offset.y = v;
          material.map.needsUpdate = true;
        }
        saveSettings(STORAGE_KEY, params);
      });
  }

  // function addMaterialMeshGUI(
  //   gui: GUI,
  //   meshes: THREE.Mesh[], // ✅ accetta array di mesh
  //   material: THREE.MeshStandardMaterial | THREE.MeshBasicMaterial
  // ) {
  //   const STORAGE_KEY = `material_${material.name}`;

  //   // valori di default
  //   const defaultParams = {
  //     color: "#ffffff",
  //     emissive: "#000000",
  //     metalness: 0,
  //     roughness: 1,
  //     texturePath: "",
  //     materialType:
  //       material instanceof THREE.MeshStandardMaterial ? "standard" : "basic",
  //   };

  //   // carico eventuali valori salvati
  //   const params = loadSettings(STORAGE_KEY, defaultParams);

  //   // funzione per applicare il materiale aggiornato a tutte le mesh
  //   function applyMaterialToMeshes(newMaterial: THREE.Material) {
  //     meshes.forEach((m) => (m.material = newMaterial));
  //   }

  //   // funzione per creare un materiale nuovo in base al tipo
  //   function createMaterial(type: "standard" | "basic") {
  //     const newMat =
  //       type === "standard"
  //         ? new THREE.MeshStandardMaterial({
  //             color: params.color,
  //             emissive: params.emissive,
  //             metalness: params.metalness,
  //             roughness: params.roughness,
  //             map: material.map || null,
  //           })
  //         : new THREE.MeshBasicMaterial({
  //             color: params.color,
  //             map: material.map || null,
  //           });

  //     newMat.name = material.name;
  //     applyMaterialToMeshes(newMat);

  //     material = newMat; // aggiorno riferimento
  //     saveSettings(STORAGE_KEY, params);
  //   }

  //   // GUI setup
  //   const folder = gui.addFolder(material.name);

  //   // ✅ Selettore tipo materiale (mostrato solo se entrambe supportate)
  //   folder
  //     .add(params, "materialType", ["standard", "basic"])
  //     .name("Tipo Materiale")
  //     .onChange((val: "standard" | "basic") => {
  //       createMaterial(val);
  //     });

  //   // ✅ Carica texture
  //   folder
  //     .add({ loadTexture: () => loadTexture(material) }, "loadTexture")
  //     .name("Carica Texture");

  //   // ✅ Colore
  //   folder.addColor(params, "color").onChange((val: string) => {
  //     material.color.set(val);
  //     saveSettings(STORAGE_KEY, params);
  //   });

  //   // ✅ Emissive solo se è uno StandardMaterial
  //   if (material instanceof THREE.MeshStandardMaterial) {
  //     folder.addColor(params, "emissive").onChange((val: string) => {
  //       material.emissive.set(val);
  //       saveSettings(STORAGE_KEY, params);
  //     });

  //     folder.add(params, "metalness", 0, 1, 0.01).onChange((v) => {
  //       material.metalness = v;
  //       saveSettings(STORAGE_KEY, params);
  //     });

  //     folder.add(params, "roughness", 0, 1, 0.01).onChange((v) => {
  //       material.roughness = v;
  //       saveSettings(STORAGE_KEY, params);
  //     });
  //   }

  //   // funzione per caricare texture manualmente
  //   function loadTexture(mat: THREE.Material) {
  //     const input = document.createElement("input");
  //     input.type = "file";
  //     input.accept = ".png,.jpg,.jpeg";

  //     input.addEventListener("change", (e: any) => {
  //       const file = e.target.files[0];
  //       if (!file) return;

  //       const url = URL.createObjectURL(file);
  //       const loader = new THREE.TextureLoader();
  //       loader.load(url, (tex) => {
  //         tex.colorSpace = THREE.SRGBColorSpace;
  //         tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  //         tex.repeat.set(1, 1);

  //         (mat as THREE.MeshStandardMaterial).map = tex;
  //         mat.needsUpdate = true;

  //         applyMaterialToMeshes(mat);
  //         saveSettings(STORAGE_KEY, { ...params, texturePath: file.name });
  //       });
  //     });

  //     input.click();
  //   }
  // }

  function addFPSCounter(gui: GUI) {
    const fpsParams = { fps: 0 };
    const folder = gui.addFolder("Performance");
    const fpsController = folder.add(fpsParams, "fps").listen().disable(true);

    let lastTime = performance.now();
    let frames = 0;

    function updateFPS() {
      const now = performance.now();
      frames++;

      if (now - lastTime >= 1000) {
        fpsParams.fps = frames;
        fpsController.updateDisplay();

        frames = 0;
        lastTime = now;
      }

      requestAnimationFrame(updateFPS);
    }

    updateFPS();
  }

  function addUiGUI(gui: GUI) {
    const STORAGE_KEY = "UI";

    const gameMultiplier = document.getElementById("game-multiplier");

    const folder = gui.addFolder("UI").close();

    const defaultParams = {
      showMultiplier: true,
      positionY: 70,
      scale: 0,
    };

    let params = { ...defaultParams };
    loadSettings(STORAGE_KEY, defaultParams, params);

    gameMultiplier!.style.top = params.positionY.toString() + "%";

    function showMultiplier(show: boolean) {
      if (show) {
        gameMultiplier!.style.visibility = "visible";
      } else {
        gameMultiplier!.style.visibility = "hidden";
      }
    }

    showMultiplier(params.showMultiplier);

    folder.add(params, "showMultiplier").onChange((val) => {
      showMultiplier(params.showMultiplier);
      saveSettings(STORAGE_KEY, params);
    });

    folder.add(params, "positionY", 0, 100, 0.01).onChange((val) => {
      gameMultiplier!.style.top = `${val}%`;
      saveSettings(STORAGE_KEY, params);
    });

    const resetInput = {
      reset: () => {
        resetSettings(STORAGE_KEY, defaultParams, params, folder);

        showMultiplier(params.showMultiplier);
        gameMultiplier!.style.top = params.positionY.toString() + "%";
      },
    };

    folder.add(resetInput, "reset");
  }
}
