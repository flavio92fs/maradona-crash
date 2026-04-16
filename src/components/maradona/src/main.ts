import * as THREE from "three";
import GUI from "lil-gui";
import Stats from "stats.js";
import LoadingManager from "./loadingManager";
import CameraControls from "./orbitControls";
import AudioManager from "./audioManager";
import { loadSettings, saveSettings, resetSettings } from "./saveLoadGUI";
import { addUiGUI } from "./guiHelpers";
import {
  addAmbientLight,
  createSpotLight,
  createDirectionalLight,
} from "./lights";
import {
  addDOM,
  addGrassPlane,
  addCartelloni,
  addAnimatedLights,
  addAnimatedFireworks,
  addStadio,
  addShadowPlane,
  type FireworksState,
  addVideoGrassPlane,
} from "./environment";
import { addMaradona } from "./character";
import { setupCinematicAnimation, cinematicState } from "./cinematicAnimation";
import emitter from "@/eventEmitter";

function makeDraggable(el: HTMLElement) {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  const titleBar = el.querySelector(".title") as HTMLElement | null;
  const handle = titleBar ?? el;

  function onStart(clientX: number, clientY: number) {
    const rect = el.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;
    isDragging = true;
  }

  function onMove(clientX: number, clientY: number) {
    if (!isDragging) return;
    const x = Math.max(0, Math.min(clientX - offsetX, window.innerWidth - el.offsetWidth));
    const y = Math.max(0, Math.min(clientY - offsetY, window.innerHeight - 40));
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.right = "auto";
  }

  function onEnd() {
    isDragging = false;
  }

  handle.addEventListener("mousedown", (e) => { onStart(e.clientX, e.clientY); });
  window.addEventListener("mousemove", (e) => { onMove(e.clientX, e.clientY); });
  window.addEventListener("mouseup", onEnd);

  handle.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    if (t) onStart(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    if (t) onMove(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener("touchend", onEnd);

  handle.style.cursor = "grab";
}

export function initScene(container: HTMLElement): () => void {
  const gui = new GUI().close();
  addUiGUI(gui);
  makeDraggable(gui.domElement);

  // Stats.js (FPS / MS / MB)
  const stats = new Stats();
  stats.showPanel(0);
  const isMobile = window.innerWidth < 768;
  const statsScale = isMobile ? 1 : 1.5;
  stats.dom.style.cssText =
    `position:fixed;top:0;left:0;z-index:10000;cursor:pointer;` +
    `transform:scale(${statsScale});transform-origin:top left;`;
  makeDraggable(stats.dom);
  container.appendChild(stats.dom);

  const clock = new THREE.Clock();
  let animationFrameId: number;
  let mixerMaradona: THREE.AnimationMixer;
  let mixerLuci: THREE.AnimationMixer;
  let mixerLuci2: THREE.AnimationMixer;
  let cameraControls: CameraControls;
  let resizeObserver: ResizeObserver;
  const fireworksState: FireworksState = { mixer: null, isPlaying: false };

  const allLights: THREE.Light[] = [];

  const rendererGUI = gui.addFolder("Renderer").close();
  const lightsFolderGUI = gui.addFolder("Lights").close();
  const maradonaMaterialsGUI = gui.addFolder("Maradona Materials").close();
  const sphereDomGUI = gui.addFolder("Sphere DOM").close();
  const animationsGUI = gui.addFolder("Animations");
  const animatedLightsGUI = gui.addFolder("Luci Animate").close();

  // Loading
  const loadingManager = new LoadingManager(() => {
    requestAnimationFrame(animate);
    window.addEventListener(
      "click",
      () => audioManager.playBackgroundMusic(),
      { once: true }
    );
  });

  const audioManager = new AudioManager(loadingManager.loadingManager, gui);
  const gltfLoader = loadingManager.gltfLoader;
  const fbxLoader = loadingManager.fbxLoader;
  const textureLoader = loadingManager.textureLoader;

  // Dome textures
  const domeTextureNight = textureLoader.load("DOM.webp", (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    scene.environment = texture;
  });
  const domeTextureDay = textureLoader.load("DOM2.webp", (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    scene.environment = texture;
  });
  const domMaterial = new THREE.MeshBasicMaterial({ map: domeTextureNight });

  // Maradona textures
  const pelleBaseColor = textureLoader.load(
    "textures/maradona/Maradona_pelle.webp"
  );
  pelleBaseColor.colorSpace = THREE.SRGBColorSpace;

  const capelliBaseColor = textureLoader.load(
    "textures/maradona/Capelli_Diffuse.webp"
  );
  capelliBaseColor.colorSpace = THREE.SRGBColorSpace;

  const pallaBaseColor = textureLoader.load(
    "textures/palla/palla_BaseColor.webp"
  );
  pallaBaseColor.colorSpace = THREE.SRGBColorSpace;

  // Firework textures
  const textureAnimator = { elapsed: 0, currentFrame: 0, fps: 30 };
  const fireWorkTextures: THREE.Texture[] = [];
  for (let i = 1; i <= 20; i++) {
    const tex = textureLoader.load(`textures/fontana/${i}.webp`);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.y = -1;
    fireWorkTextures.push(tex);
  }

  const fireworksMaterial = new THREE.MeshBasicMaterial({
    map: fireWorkTextures[0],
    transparent: true,
    depthWrite: false,
  });

  // Suits textures
  const maradonaSuitsTexture: Record<string, THREE.Texture> = {
    argentina: textureLoader.load(
      "textures/maradona/Maradona_divisa_argentina.webp",
      (t) => (t.colorSpace = THREE.SRGBColorSpace)
    ),
    barcellona: textureLoader.load(
      "textures/maradona/Maradona_divisa_barcellona.webp",
      (t) => (t.colorSpace = THREE.SRGBColorSpace)
    ),
    boca: textureLoader.load(
      "textures/maradona/Maradona_divisa_boca.webp",
      (t) => (t.colorSpace = THREE.SRGBColorSpace)
    ),
    napoliUfficiale: textureLoader.load(
      "textures/maradona/Maradona_divisa_napoli_ufficiale.webp",
      (t) => (t.colorSpace = THREE.SRGBColorSpace)
    ),
    napoli: textureLoader.load(
      "textures/maradona/Maradona_divisa_napoli.webp",
      (t) => (t.colorSpace = THREE.SRGBColorSpace)
    ),
    sevilla: textureLoader.load(
      "textures/maradona/Maradona_divisa_sevilla.webp",
      (t) => (t.colorSpace = THREE.SRGBColorSpace)
    ),
  };

  // Material library
  const materialLibrary: Record<string, THREE.Material> = {
    divisa: new THREE.MeshStandardMaterial({
      map: maradonaSuitsTexture["napoliUfficiale"],
      side: THREE.DoubleSide,
      name: "divisa",
    }),
    pelle: new THREE.MeshStandardMaterial({
      map: pelleBaseColor,
      opacity: 0,
      name: "pelle",
    }),
    capelli: new THREE.MeshStandardMaterial({
      map: capelliBaseColor,
      name: "capelli",
    }),
    palla: new THREE.MeshBasicMaterial({
      map: pallaBaseColor,
      opacity: 0,
      name: "palla",
    }),
  };

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 1000);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  setupRendererGUI();
  setupResize();
  setupCameraGUI();

  cameraControls = new CameraControls(camera, renderer, container, gui);
  cameraControls.startAnimation();

  // Lights
  const ambientLight = addAmbientLight(scene, lightsFolderGUI);
  const spotLight = createSpotLight(
    scene,
    lightsFolderGUI,
    "Spotlight Centrale",
    0,
    1,
    0,
    5
  );
  allLights.push(spotLight);
  const directionalLight = createDirectionalLight(
    scene,
    lightsFolderGUI,
    "Directional Light",
    0,
    1,
    0,
    10
  );
  allLights.push(directionalLight);
  setNight();

  // Environment
  addDOM(scene, sphereDomGUI, domMaterial, textureLoader);
  addGrassPlane(scene, gui, gltfLoader, textureLoader);
  addCartelloni(scene, gui, gltfLoader, textureLoader);
  addAnimatedLights(
    scene,
    animatedLightsGUI,
    gltfLoader,
    textureLoader,
    "animatedLights"
  ).then((m) => (mixerLuci = m));
  addAnimatedLights(
    scene,
    animatedLightsGUI,
    gltfLoader,
    textureLoader,
    "animatedLights2"
  ).then((m) => (mixerLuci2 = m));
  addAnimatedFireworks(
    scene,
    gltfLoader,
    fireworksMaterial,
    animationsGUI,
    fireworksState
  );
  addStadio(scene, gui, gltfLoader, textureLoader);
  addShadowPlane(scene, gui);
  addVideoGrassPlane(scene, gui, gltfLoader, textureLoader).then((videoGrassPlane) => {
    setupCinematicAnimation(gui, camera, cameraControls, ambientLight, spotLight, videoGrassPlane);
  });

  // Character
  addMaradona(
    scene,
    fbxLoader,
    maradonaMaterialsGUI,
    animationsGUI,
    textureLoader,
    materialLibrary,
    maradonaSuitsTexture,
    (mixer) => (mixerMaradona = mixer)
  );

  // Day/Night
  function setDay() {
    allLights.forEach((l) => (l.visible = false));
    directionalLight.visible = true;
    domMaterial.map = domeTextureDay;
  }

  function setNight() {
    allLights.forEach((l) => (l.visible = true));
    directionalLight.visible = false;
    domMaterial.map = domeTextureNight;
  }

  emitter.on("toggleDayTime", (daytime) => {
    if (daytime) setNight();
    else setDay();
  });

  // Toggle GUI visibility (H = gui, S = stats)
  window.addEventListener("keydown", (e) => {
    if (e.key === "h") {
      gui.domElement.style.display =
        gui.domElement.style.display === "none" ? "" : "none";
    }
    if (e.key === "s") {
      stats.dom.style.display =
        stats.dom.style.display === "none" ? "" : "none";
    }
  });

  // lil-gui: GUI Options subfolder (always last)
  const guiOptionsFolder = gui.addFolder("GUI Options").close();

  guiOptionsFolder.add({ toggleStats() {
    stats.dom.style.display =
      stats.dom.style.display === "none" ? "" : "none";
  }}, "toggleStats").name("Show/Hide FPS");

  guiOptionsFolder.add({ hideGUI() {
    gui.domElement.style.display = "none";
  }}, "hideGUI").name("Hide GUI (reload to show)");

  // Keep GUI Options at the bottom even after async folders are added
  const observer = new MutationObserver(() => {
    const container = gui.domElement.querySelector(".children");
    const folder = guiOptionsFolder.domElement;
    if (container && folder.parentElement === container && folder !== container.lastElementChild) {
      container.appendChild(folder);
    }
  });
  observer.observe(gui.domElement, { childList: true, subtree: true });

  // Animation loop
  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    stats.begin();
    const delta = clock.getDelta();
    mixerMaradona?.update(delta);
    mixerLuci?.update(delta);
    mixerLuci2?.update(delta);

    if (fireworksState.isPlaying) {
      fireworksState.mixer?.update(delta);
      updateFireworkTexture(delta);
    }

    if (!cinematicState.active) {
      cameraControls?.orbitControls.update();
    }
    renderer.render(scene, camera);
    stats.end();
  }

  function updateFireworkTexture(delta: number) {
    textureAnimator.elapsed += delta;
    if (textureAnimator.elapsed > 1 / textureAnimator.fps) {
      textureAnimator.elapsed = 0;
      textureAnimator.currentFrame =
        (textureAnimator.currentFrame + 1) % fireWorkTextures.length;
      fireworksMaterial.map = fireWorkTextures[textureAnimator.currentFrame]!;
    }
  }

  // --- Renderer GUI ---
  function setupRendererGUI() {
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
    renderer.shadowMap.enabled = params.shadowsEnabled;

    rendererGUI
      .add(params, "toneMapping", {
        None: THREE.NoToneMapping,
        Linear: THREE.LinearToneMapping,
        Reinhard: THREE.ReinhardToneMapping,
        Cineon: THREE.CineonToneMapping,
        ACESFilmic: THREE.ACESFilmicToneMapping,
      })
      .onChange((val: THREE.ToneMapping) => {
        renderer.toneMapping = val;
        saveSettings(STORAGE_KEY, params);
      });

    rendererGUI
      .add(params, "exposure", 0, 10, 0.01)
      .onChange((val: number) => {
        renderer.toneMappingExposure = val;
        saveSettings(STORAGE_KEY, params);
      });

    rendererGUI.add(params, "shadowsEnabled").onChange((val: boolean) => {
      renderer.shadowMap.enabled = val;
      saveSettings(STORAGE_KEY, params);
    });

    rendererGUI.add(
      {
        reset: () => {
          resetSettings(STORAGE_KEY, defaultParams, params, rendererGUI);
          saveSettings(STORAGE_KEY, defaultParams);
          renderer.toneMapping = params.toneMapping;
          renderer.toneMappingExposure = params.exposure;
          renderer.shadowMap.enabled = params.shadowsEnabled;
        },
      },
      "reset"
    );
  }

  // --- Resize ---
  function setupResize() {
    resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth - 1;
      const height = container.clientHeight - 1;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(container);
  }

  // --- Camera GUI ---
  function setupCameraGUI() {
    const cameraGUI = gui.addFolder("Camera").close();
    cameraGUI.add(camera.position, "x").listen().disable();
    cameraGUI.add(camera.position, "y").listen().disable();
    cameraGUI.add(camera.position, "z").listen().disable();

    const STORAGE_KEY = "Camera";
    const defaultParams = { fov: 30 };
    let params = { ...defaultParams };
    loadSettings(STORAGE_KEY, defaultParams, params);

    camera.fov = params.fov;
    camera.updateProjectionMatrix();

    cameraGUI.add(params, "fov", 0, 120, 0.1).onChange((val: number) => {
      camera.fov = val;
      camera.updateProjectionMatrix();
      saveSettings(STORAGE_KEY, params);
    });

    cameraGUI.add(
      {
        reset: () => {
          resetSettings(STORAGE_KEY, defaultParams, params, cameraGUI);
          saveSettings(STORAGE_KEY, defaultParams);
          camera.fov = params.fov;
          camera.updateProjectionMatrix();
        },
      },
      "reset"
    );
  }

  // --- Dispose / Cleanup ---
  function dispose() {
    cancelAnimationFrame(animationFrameId);
    resizeObserver?.disconnect();

    emitter.off("toggleDayTime");
    emitter.off("setMusic");

    // Dispose all scene objects (geometries, materials, textures)
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((mat) => {
          if (mat) {
            Object.values(mat).forEach((val) => {
              if (val instanceof THREE.Texture) {
                val.dispose();
              }
            });
            mat.dispose();
          }
        });
      }
    });

    // Stop and remove video elements
    container.querySelectorAll("video").forEach((v) => {
      v.pause();
      v.removeAttribute("src");
      v.load();
    });

    renderer.dispose();
    renderer.forceContextLoss();
    container.removeChild(renderer.domElement);
    gui.destroy();
  }

  return dispose;
}
