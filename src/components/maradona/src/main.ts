import * as THREE from "three";
import GUI from "lil-gui";
import LoadingManager from "./loadingManager";
import CameraControls from "./orbitControls";
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";


export function initScene(container: HTMLElement) {
  const gui = new GUI().close();
  addFPSCounter(gui);
  
  const clock = new THREE.Clock();

  let mixerMaradona: THREE.AnimationMixer;
  let mixerLuci: THREE.AnimationMixer;

  const rendererGUI = gui.addFolder('Renderer').close();
  const dirLightGUI = gui.addFolder("Directional Light").close();
  const spotLightGUI = gui.addFolder("Spot Light Centrale").close();
  const spotLightLaterale1 = gui.addFolder("Spot Light Laterale 1").close();
  const spotLightLaterale2 = gui.addFolder("Spot Light Laterale 2").close();
  const spotLightLaterale3 = gui.addFolder("Spot Light Laterale 3").close();
  const spotLightLaterale4 = gui.addFolder("Spot Light Laterale 4").close();
  const ambientLightGUI = gui.addFolder("Ambient Light").close();
  const maradonaMaterialsGUI = gui.addFolder('Maradona Materials').close();
  const sphereDomGUI = gui.addFolder('Sphere DOM').close();
  const grassPlaneGUI = gui.addFolder('Grass Plane').close();

  const loadingManager = new LoadingManager(() => {
    requestAnimationFrame(animate);
    // playIntroAnimation(camera, orbitControls, new THREE.Vector3(0.14, 0.06, 0.11), new THREE.Vector3(0, 0.06, 0));
  });

  const gltfLoader = loadingManager.gltfLoader;
  const fbxLoader = loadingManager.fbxLoader;
  const textureLoader = loadingManager.textureLoader;

    //#region Maradona Textures
  let divisaBaseColor: THREE.Texture;
  let pelleBaseColor: THREE.Texture;
  let capelliBaseColor: THREE.Texture;
  let pallaBaseColor: THREE.Texture;

    //#endregion

  loadDivisaTextures();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 1000);
  
  //#region Renderer
  const renderer = new THREE.WebGLRenderer({antialias: true});

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  rendererGUI.add(renderer, 'toneMappingExposure')
  rendererGUI.add(renderer.shadowMap, 'enabled').name('Shadows Enabled');

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);

  container.appendChild(renderer.domElement);

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;


  function resizeRenderer() {
    const windowWidth = container.clientWidth;
    const windowHeight = container.clientHeight;

    camera.aspect = windowWidth / windowHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(windowWidth, windowHeight);
  }

  window.addEventListener("resize", resizeRenderer);
  resizeRenderer();
  //#endregion

  let actions: { [key: string]: THREE.AnimationAction } = {};
  let subActions: { [key: string]: THREE.AnimationAction } = {};
  let currentAction: THREE.AnimationAction;

  const maradonaMaterialLibrary: Record<string, THREE.MeshStandardMaterial> = {
    divisa: new THREE.MeshStandardMaterial({
      map: divisaBaseColor,
      name: 'divisa'
    }),
    pelle: new THREE.MeshStandardMaterial({
      map: pelleBaseColor,
      opacity: 0,
      name: 'pelle'
    }),
    capelli: new THREE.MeshStandardMaterial({
      map: capelliBaseColor,
      name: 'capelli'
      // opacity: 0,
    }),
    palla: new THREE.MeshStandardMaterial({
      map: pallaBaseColor,
      opacity: 0,
      name: 'palla'
    }),
  };

  //#region LIGHTS
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
  ambientLightGUI.add(ambientLight, 'intensity');

  scene.add(ambientLight);

  // Luce originale (sopra/diagonale)
  // createDirectionalLight(38, 36.7, -50);

  // // // Luce opposta
  // createDirectionalLight(-38, 36.7, 50);

  // // Luce laterale destra
  // createDirectionalLight(50, 36.7, 38);

  // // Luce laterale sinistra
  // createDirectionalLight(-50, 36.7, -38);

  //#endregion


  camera.position.set(0, 0.51, -1.2);
  // camera.lookAt(0, 0.12, 0)

  const cameraControls = new CameraControls(camera, renderer, gui);

  let lastFrameTime = 0;
  const fpsLimit = 30;
  const fpsInterval = 1000 / fpsLimit;

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    mixerMaradona.update(delta);
    mixerLuci.update(delta);
    cameraControls.orbitControls.update();

    renderer.render(scene, camera);
  }

  const cameraGUI = gui.addFolder('Camera').close();
  cameraGUI.add(camera.position, 'x').listen().onChange(() =>  updateCamera()).disable();
  cameraGUI.add(camera.position, 'y').listen().onChange(() =>  updateCamera()).disable();
  cameraGUI.add(camera.position, 'z').listen().onChange(() =>  updateCamera()).disable();

  cameraGUI.add(camera, 'fov', 0, 120, 0.1).onChange(() =>  camera.updateProjectionMatrix());

  function updateCamera() {
    camera.updateProjectionMatrix();
  }


  window.addEventListener("keydown", (e) => {
    if (e.key === "h") {
      // premi "h" per hide
      if (gui.domElement.style.display === "none") {
        gui.domElement.style.display = "";
      } else {
        gui.domElement.style.display = "none";
      }
    }
  });

  //#region ANIMATIONS
  function addSubAction(baseAction: THREE.AnimationAction, subName: string, start: number, end: number, fps: number) {
    const clip = baseAction.getClip();
    const subClip = THREE.AnimationUtils.subclip(clip, subName, start, end, fps);
    const subAction = mixerMaradona.clipAction(subClip);
    subActions[subName] = subAction;
    return subAction;
  }

  function fadeToAction(nextAction: THREE.AnimationAction, duration: number = 0.1) {
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

  //DOM
  
  // addVideoPlane(gui, scene);
  createSpotLight(spotLightGUI, 0, 1, 0, 4)
  // createSpotLight(spotLightLaterale1, 0, 1, 0, 0)
  // createSpotLight(spotLightLaterale2, 0, 1, 0, 0)
  // createSpotLight(spotLightLaterale3, 0, 1, 0, 0)
  // createSpotLight(spotLightLaterale4, 0, 1, 0, 0)

  addDOM();
  
  addGrassPlane(gui, scene, textureLoader)
  addCartelloni(gui, scene);
  addLuciFari(scene)
  addStadio(gltfLoader, textureLoader, scene, gui)
  addMaradona(fbxLoader, textureLoader, scene, gui)

  addMaterialGUI(maradonaMaterialsGUI, maradonaMaterialLibrary['divisa'])
  addMaterialGUI(maradonaMaterialsGUI, maradonaMaterialLibrary['pelle'])
  addMaterialGUI(maradonaMaterialsGUI, maradonaMaterialLibrary['capelli'])
  addMaterialGUI(maradonaMaterialsGUI, maradonaMaterialLibrary['palla'])

  function createDirectionalLight(x: number, y: number, z: number): THREE.DirectionalLight {
    const light = new THREE.DirectionalLight(0xffffff, 1.5); // intensità più bassa per bilanciare
    light.position.set(x, y, z);

    light.castShadow = true;

    scene.add(light);

    dirLightGUI.add(light, "intensity");

    return light;
  }

  function createSpotLight(gui: GUI, x: number, y: number, z: number, intensity: number): THREE.SpotLight {
  const light = new THREE.SpotLight(0xffffff, intensity);
  light.position.set(x, y, z);

  light.castShadow = true;
  light.penumbra = 1;

  scene.add(light);
  scene.add(light.target);

  // helper
  const helper = new THREE.SpotLightHelper(light);
  helper.visible = false;
  scene.add(helper);

  // funzione di update
  function updateLightTarget() {
    light.target.position.x = 0;
    light.target.position.z = 0;
    light.target.updateMatrixWorld();
    helper.update();
  }

  // GUI
  const folder = gui.addFolder("SpotLight");

  folder.add(light.position, "x", -10, 10, 0.1).name("Position X").onChange(updateLightTarget);
  folder.add(light.position, "y", 0, 10, 0.1).name("Position Y").onChange(updateLightTarget);
  folder.add(light.position, "z", -10, 10, 0.1).name("Position Z").onChange(updateLightTarget);

  folder.add(light.target.position, "y", -10, 10, 0.1).name("Altezza Target").onChange(updateLightTarget);

  folder.add(light, "angle", 0, Math.PI / 2, 0.01).onChange(() => helper.update());
  folder.add(light, "penumbra", 0, 1, 0.01).onChange(() => helper.update());
  folder.add(light, "intensity", 0, 100, 0.01);
  folder.add(light, 'castShadow');
  folder.addColor(light, 'color');

  // toggle per abilitare/disabilitare l'helper
  const params = { showHelper: false };
  folder.add(params, "showHelper").name("Mostra Helper").onChange((v: boolean) => { helper.visible = v;});

  return light;
}

  function addDOM(){
    const geometry = new THREE.SphereGeometry(300, 60, 40);
    geometry.scale(-1, 1, 1); // Inverti la sfera (così si vede dall’interno)

    const domeTexture = textureLoader.load("DOM.png");
    domeTexture.colorSpace = THREE.SRGBColorSpace

    const material = new THREE.MeshBasicMaterial({ map: domeTexture });

    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(0, -0.2, 0);
    sphere.scale.set(0.0403, 0.0403, 0.0403);
    scene.add(sphere);

    sphereDomGUI.add(sphere.scale, 'x', 0, 1, 0.00001).name('Scale').onChange(() => sphere.scale.set(sphere.scale.x, sphere.scale.x, sphere.scale.x))
    sphereDomGUI.add(sphere.position, 'y', -5, 5, 0.01);
    addMaterialGUI(sphereDomGUI, material)
  }

  function loadDivisaTextures(){
      divisaBaseColor = textureLoader.load('textures/maradona/DivisaMaradona_BaseColor.png');
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
      pallaBaseColor.minFilter = THREE.LinearMipmapLinearFilter; // qualità alta su distanza
      pallaBaseColor.magFilter = THREE.LinearFilter; // qualità alta da vicino
  }

  function addGrassPlane(gui: GUI, scene: THREE.Scene, textureLoader: THREE.TextureLoader) {
    const grassDiffuse = textureLoader.load("textures/grass/texture.png");
    grassDiffuse.colorSpace = THREE.SRGBColorSpace;

    grassDiffuse.wrapS = THREE.RepeatWrapping;
    grassDiffuse.wrapT = THREE.RepeatWrapping;

    const grassMaterial = new THREE.MeshStandardMaterial()
    grassMaterial.name = 'Grass Material'
    grassMaterial.map = grassDiffuse;

    const params = {
      repeatX: 1,
      repeatY: 1
    }

    grassPlaneGUI.add(params, "repeatX", 1, 20, 1).onChange((v: number) => {
      grassDiffuse.repeat.set(v, v);
    });
    grassPlaneGUI.add(params, "repeatY", 1, 20, 1).onChange((v: number) => {
      grassDiffuse.repeat.set(v, v);
    });

    addMaterialGUI(grassPlaneGUI, grassMaterial)
    
    grassDiffuse.repeat.set(1, 1);

    fbxLoader.load("models/campo.fbx", (model) => {
      model.rotation.set(0, THREE.MathUtils.degToRad(-90), 0);
      model.scale.set(0.01, 0.01, 0.01);
      model.position.set(0, 0, 0);

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;

          mesh.material = grassMaterial;

          mesh.castShadow = true; // il modello proietta ombra
          mesh.receiveShadow = true;
        }
      });

      scene.add(model);
    });
  }

  function addCartelloni(gui: GUI, scene: THREE.Scene) {
    const video = document.createElement('video');
    video.src = 'video/VideoMaradonaCartelloni.mp4';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = 'auto';

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.center.set(0.5, 0.5); // importante per ruotare dal centro
    videoTexture.rotation = THREE.MathUtils.degToRad(180);
    videoTexture.offset.y = 0.61;

    video.addEventListener('canplaythrough', () => {
      console.log(`Video pronto!`);
      video.play();
    });

    fbxLoader.load("models/cartelloni.fbx", (model) => {
      model.rotation.set(0, THREE.MathUtils.degToRad(-90), 0);
      model.scale.set(0.01, 0.01, 0.01);
      model.position.set(0, 0, 0);

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;

          const videoMat = new THREE.MeshBasicMaterial({ map: videoTexture });
          mesh.material = videoMat;

          // mesh.castShadow = true;
        }
      });

      scene.add(model);

      // GUI controls per texture manipolazione
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
            video.src = url;
            video.play();
            console.log("Video caricato:", file.name);
          });

          input.click(); // apri il file picker
        },
      };

      const folder = gui.addFolder("Cartelloni Bordo Campo Video").close();

      // rotazione in gradi
      folder.add(params, "rotation", -180, 180, 1).name("Rotazione").onChange((deg: number) => {
        videoTexture.rotation = THREE.MathUtils.degToRad(deg);
      });

      // scala uniforme
      folder.add(params, "scale", 0.1, 5, 0.1).name("Scala").onChange((s: number) => {
        videoTexture.repeat.set(s, s);
      });

      // offset
      folder.add(params, "offsetX", -1, 1, 0.01).name("Offset X").onChange((v: number) => {
        videoTexture.offset.x = v;
      });
      folder.add(params, "offsetY", -1, 1, 0.01).name("Offset Y").onChange((v: number) => {
        videoTexture.offset.y = v;
      });

      folder.add(params, "loadVideo").name("Carica Video");
    });
  }
  
  function addLuciFari(scene: THREE.Scene){
    const lightTexture = textureLoader.load("textures/luce.png");
    lightTexture.colorSpace = THREE.SRGBColorSpace;

    const lightMat = new THREE.MeshBasicMaterial();
    lightMat.map = lightTexture;
    lightMat.transparent = true;

    fbxLoader.load("models/luci_animate.fbx", (model) => {
      model.rotation.set(0, THREE.MathUtils.degToRad(-90), 0);
      model.scale.set(0.01, 0.01, 0.01);
      model.position.set(0, 0, 0);

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;

          mesh.material = lightMat;

        }
      });

      mixerLuci = new THREE.AnimationMixer(model);

      if (model.animations.length > 0) {
        const action = mixerLuci.clipAction(model.animations[0]); // crea action dal clip
        action.setLoop(THREE.LoopRepeat, Infinity); // ripete per sempre
        action.play();
      }

      scene.add(model);
    });
  }

  function addStadio(gltfLoader: GLTFLoader, textureLoader: THREE.TextureLoader, scene: THREE.Scene, gui: GUI){
  gltfLoader.load('models/GLB/stadio.glb', (gltf) => {
    const video = document.createElement('video');
    video.src = 'video/VideoMonitor.mp4';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = 'auto';

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.flipY = false;
    videoTexture.center.set(0.5, 0.5); // importante per ruotare dal centro
    videoTexture.rotation = THREE.MathUtils.degToRad(90);
    videoTexture.offset.x = 0;
    videoTexture.offset.y = 0.02;

    video.addEventListener('canplaythrough', () => {
      console.log(`Video pronto!`);
      video.play();
    });


    const stadioTexture = textureLoader.load('textures/stadio/stadio.png')
    stadioTexture.flipY = false;

    const model = gltf.scene;
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          if(child.material.name === 'video'){
            child.material.map = videoTexture;
          }
          if(child.material.name === 'stadio'){
            child.material.map = stadioTexture;
          }
        }
      })
    model.position.set(0, 0.002, 0)
    model.rotation.set(0, THREE.MathUtils.degToRad(90), 0);
    scene.add(model)
  });
  }

  function addMaradona(fbxLoader: FBXLoader, textureLoader: THREE.TextureLoader, scene: THREE.Scene, gui: GUI){
    fbxLoader.load('models/maradona_single_file.fbx',
        (model) => {
          model.scale.set(0.01, 0.01, 0.01);

          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;

              const mat = mesh.material as THREE.Material;

              mesh.castShadow = true;     // il modello proietta ombra
              mesh.receiveShadow = true;

              if (
                mat.name === "divisa" ||
                mat.name === "colletto_ai" ||
                mat.name === "maglietta_ai" ||
                mat.name === "pantaloncini_ai" ||
                mat.name === "gambe_ai"
              ) {
                mesh.material = maradonaMaterialLibrary["divisa"];
              }
              if (mat.name === 'capelli') {
                mesh.material = maradonaMaterialLibrary['capelli'];
              }
              if (mat.name === 'pelle' || mat.name === 'pelle_ai' || mat.name === 'occhi_ai'){
                mesh.material = maradonaMaterialLibrary['pelle'];
              }
              if (mat.name === "palla") {
                mesh.material = maradonaMaterialLibrary["palla"];
              }
            }
          });

          scene.add(model);

          mixerMaradona = new THREE.AnimationMixer(model);

          model.animations.forEach((clip) => {
            const action = mixerMaradona.clipAction(clip);
            actions[clip.name] = action;
          });

          addSubAction(actions['start'], 'start', 297, 384, 30);
          addSubAction(actions['palleggio_loop1'], 'palleggio1', 385, 684, 30);
          addSubAction(actions['palleggio_loop2'], 'palleggio2', 685, 986, 30);
          addSubAction(actions['riscaldamento'], 'riscaldamento', 1, 296, 30);

          currentAction =  subActions['riscaldamento']
          currentAction.play();

          const keyToSubAction: Record<string, string> = {
            Digit1: 'riscaldamento',
            Digit2: 'palleggio1',
            Digit3: 'palleggio2',
            Digit4: 'start',
          };

          window.addEventListener("keydown", (e) => {
            const subName = keyToSubAction[e.code];
            if (subName && subActions[subName]) {
              fadeToAction(subActions[subName], 0.5); // fade 0.5s
            }
          });
        }
      );
  }

  function addMaterialGUI(gui: GUI, material: THREE.MeshStandardMaterial | THREE.MeshBasicMaterial) {
  const params = {
      loadTexture: () => {
        // crea input file "nascosto"
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".png,.jpg,.jpeg"; // formati ammessi

        input.addEventListener("change", (e: any) => {
          const file = e.target.files[0];
          if (!file) return;

          const url = URL.createObjectURL(file);

          const loader = new THREE.TextureLoader();
          loader.load(url, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(1, 1);

            material.map = tex;
            material.needsUpdate = true;

            console.log("Texture caricata:", file.name);
          });
        });

        input.click(); // apre il file picker
      },
    };

    const materialGUI = gui.addFolder(material.name)
    materialGUI.add(params, "loadTexture").name("Carica Texture");
    materialGUI.addColor(material, 'color');
    if ((material as THREE.MeshStandardMaterial).emissive !== undefined) {
      // materialGUI.addColor(material as THREE.MeshStandardMaterial, "emissive");
    }
  }

  function addFPSCounter(gui: GUI) {
    const fpsParams = { fps: 0 };
    const folder = gui.addFolder("Performance");
    const fpsController = folder.add(fpsParams, "fps").listen();

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

  // salva oggetto in localStorage
  function saveSettings(key: string, params: any) {
    localStorage.setItem(key, JSON.stringify(params));
  }

  // carica, se non c'è restituisce defaults
  function loadSettings<T>(key: string, defaults: T): T {
    const saved = localStorage.getItem(key);
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  }
}
