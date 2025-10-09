import * as THREE from "three";
import GUI from "lil-gui";
import LoadingManager from "./loadingManager";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import CameraControls from "./orbitControls";

export function initScene(container: HTMLElement) {
  const gui = new GUI().close();
  
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
    animate();
    // playIntroAnimation(camera, orbitControls, new THREE.Vector3(0.14, 0.06, 0.11), new THREE.Vector3(0, 0.06, 0));
  });

  const fbxLoader = loadingManager.fbxLoader;
  const textureLoader = loadingManager.textureLoader;

    //#region Maradona Textures
    let divisaBaseColor: THREE.Texture;
    let divisaNormalMap: THREE.Texture;

    let pelleBaseColor: THREE.Texture;
    let pelleNormalMap: THREE.Texture;

    let capelliBaseColor: THREE.Texture;

    let pallaBaseColor: THREE.Texture;
    let pallaNormal: THREE.Texture;

    //#endregion

  loadDivisaTextures();
  // loadCampoTextures();

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
    divisa: new THREE.MeshBasicMaterial({
      map: divisaBaseColor,
      side: THREE.DoubleSide,
      opacity: 0, // parte invisibile
      name: 'divisa'
    }),
    pelle: new THREE.MeshBasicMaterial({
      map: pelleBaseColor,
      side: THREE.DoubleSide,
      opacity: 0,
      name: 'pelle'
    }),
    capelli: new THREE.MeshBasicMaterial({
      // color: 0x000000,
      map: capelliBaseColor,
      side: THREE.DoubleSide,
      name: 'capelli'
      // opacity: 0,
    }),
    palla: new THREE.MeshBasicMaterial({
      map: pallaBaseColor,
      normal: pallaNormal,
      side: THREE.DoubleSide,
      opacity: 0,
      name: 'palla'
    }),
  wireMat: new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      wireframe: true,
      side: THREE.DoubleSide,
      opacity: 0,
      name: 'wireMat'
    })
  };

// #region MARADONA FBX
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

      // subAction.reset().play();

      // currentAction = actions['riscaldamento'];
      // currentAction.play();
    }
  );
  //#endregion

  // const grassPlane = addGrassPlane(gui, scene, textureLoader)
  addStriscePlane(gui, scene, textureLoader)
  addGrassPlane(gui, scene, textureLoader)

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
  
  //#region TEXTURES FUNCTIONS
  function loadDivisaTextures(){
      // divisaBaseColor = textureLoader.load('textures/maradona/DivisaMaradonaBarcellona_BaseColor.png');
      divisaBaseColor = textureLoader.load('textures/maradona/DivisaMaradona_BaseColor.png');
      divisaBaseColor.colorSpace = THREE.SRGBColorSpace;

      divisaNormalMap = textureLoader.load(
        "textures/maradona/DivisaMaradona_Normal.png"
      );

      pelleBaseColor = textureLoader.load(
        "textures/maradona/PelleMaradonaNuova.png"
        // "textures/maradona/PelleMaradona_BaseColor.png"
      );
      pelleBaseColor.colorSpace = THREE.SRGBColorSpace;
      pelleNormalMap = textureLoader.load(
        "textures/maradona/PelleMaradona_Normal.png"
      );

      capelliBaseColor = textureLoader.load(
        "textures/maradona/Capelli_Diffuse.png"
      );
      capelliBaseColor.colorSpace = THREE.SRGBColorSpace;

      pallaBaseColor = textureLoader.load("textures/palla/palla_BaseColor.png");
      pallaBaseColor.colorSpace = THREE.SRGBColorSpace;
      pallaBaseColor.minFilter = THREE.LinearMipmapLinearFilter; // qualità alta su distanza
      pallaBaseColor.magFilter = THREE.LinearFilter; // qualità alta da vicino
      // pallaBaseColor.anisotropy = renderer.capabilities.getMaxAnisotropy(); // massimo dettaglio angoli

      pallaNormal = textureLoader.load("textures/palla/palla_Normal.png");
  }

  // function loadCampoTextures(){
  //     pratoMap = textureLoader.load('textures/stadio/prato.jpeg')
  //     pratoMap.wrapS = THREE.RepeatWrapping;
  //     pratoMap.wrapT = THREE.RepeatWrapping;
  //     pratoMap.repeat.set(1000, 1000)
  //     pratoMap.colorSpace = THREE.SRGBColorSpace;

  //     lineeCampoMap = textureLoader.load('textures/stadio/lineecampo.png')
  //     lineeCampoMap.colorSpace = THREE.SRGBColorSpace;
      
  //     stadioBaseColor = textureLoader.load('textures/stadio/STADIO01_BaseColor.png')
  //     stadioBaseColor.colorSpace = THREE.SRGBColorSpace;
  // }
  //#endregion

  addDOM();
  const cameraControls = new CameraControls(camera, renderer, gui);

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    mixerMaradona.update(delta);
    mixerLuci.update(delta);
    cameraControls.orbitControls.update();

    renderer.render(scene, camera);
  }

  const g = gui.addFolder('Camera').close();
  g.add(camera.position, 'x').listen().onChange(() =>  updateCamera()).disable();
  g.add(camera.position, 'y').listen().onChange(() =>  updateCamera()).disable();
  g.add(camera.position, 'z').listen().onChange(() =>  updateCamera()).disable();

  g.add(camera, 'fov', 0, 120, 0.1).onChange(() =>  camera.updateProjectionMatrix());


  function updateCamera() {
    camera.updateProjectionMatrix();
  }

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

  // toggle per abilitare/disabilitare l'helper
  const params = { showHelper: false };
  folder.add(params, "showHelper").name("Mostra Helper").onChange((v: boolean) => { helper.visible = v;});

  return light;
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

  // function addGrassPlane(gui: GUI, scene: THREE.Scene, textureLoader: THREE.TextureLoader) {
  //   const grassAlbedo = textureLoader.load("textures/grass/grass1-albedo.png");
  //   grassAlbedo.colorSpace = THREE.SRGBColorSpace;

  //   const grassNormalMap = textureLoader.load("textures/grass/grass1-normal.png");
  //   const grassHeight = textureLoader.load("textures/grass/grass1-height.png");
  //   const grassAo = textureLoader.load("textures/grass/grass1-ao.png");
  //   const grassRoughness = textureLoader.load("textures/grass/grass1-rough.png");

  //   // ripetizione texture
  //   [grassAlbedo, grassNormalMap, grassHeight, grassAo, grassRoughness].forEach(tex => {
  //     tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  //     tex.repeat.set(15, 15); // default 15x15
  //   });

  //   // geometria con più segmenti per displacement
  //   const geometry = new THREE.PlaneGeometry(1, 1, 100, 100);
  //   geometry.setAttribute('uv2', new THREE.BufferAttribute(geometry.attributes.uv.array, 2));

  //   const material = new THREE.MeshStandardMaterial({
  //     map: grassAlbedo,
  //     normalMap: grassNormalMap,
  //     displacementMap: grassHeight,
  //     displacementScale: 0.0, // default
  //     aoMap: grassAo,
  //     aoMapIntensity: 1,
  //     roughnessMap: grassRoughness,
  //     roughness: 1,
  //   });

  //   const plane = new THREE.Mesh(geometry, material);
  //   plane.receiveShadow = true;
  //   plane.rotation.set(THREE.MathUtils.degToRad(-90), 0, 0);
  //   plane.scale.set(10, 10, 10)

  //   scene.add(plane);

  //   // parametri GUI
  //   const params = {
  //     scale: 1,
  //     normalIntensity: 1,
  //     displacement: 0,
  //     repeat: 1,
  //   };

  //   const folder = gui.addFolder("Grass Plane");

  //   // posizione
  //   folder.add(plane.position, "x", -10, 10, 0.1);
  //   folder.add(plane.position, "y", -10, 10, 0.1);
  //   folder.add(plane.position, "z", -10, 10, 0.1);

  //   // scala uniforme
  //   folder.add(params, "scale", 0.1, 10, 0.1).onChange((s: number) => {
  //     plane.scale.set(s, s, s);
  //   });

  //   // normal map intensity
  //   folder.add(params, "normalIntensity", 0, 5, 0.1).onChange((v: number) => {
  //     (plane.material as THREE.MeshStandardMaterial).normalScale.set(v, v);
  //   });

  //   // height / displacement
  //   folder.add(params, "displacement", 0, 0.2, 0.01).onChange((v: number) => {
  //     (plane.material as THREE.MeshStandardMaterial).displacementScale = v;
  //   });

  //   // texture repeat (wrap X=Y)
  //   folder.add(params, "repeat", 1, 20, 1).onChange((v: number) => {
  //     grassAlbedo.repeat.set(v, v);
  //     grassNormalMap.repeat.set(v, v);
  //     grassHeight.repeat.set(v, v);
  //     grassAo.repeat.set(v, v);
  //     grassRoughness.repeat.set(v, v);
  //   });

  //   return plane;
  // }
  
  function addStriscePlane(gui: GUI, scene: THREE.Scene, textureLoader: THREE.TextureLoader) {
    fbxLoader.load("models/linee.fbx", (model) => {
      const material = new THREE.MeshStandardMaterial();
      
      model.rotation.set(0, THREE.MathUtils.degToRad(-90), 0);
      model.scale.set(0.01, 0.01, 0.01);
      model.position.set(0, 0.001, 0);

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.material = material;
          mesh.receiveShadow = true;
        }
      });

      scene.add(model);
    });
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

  // addVideoPlane(gui, scene);
  createSpotLight(spotLightGUI, 0, 1, 0, 0)

  createSpotLight(spotLightLaterale1, 0, 1, 0, 0)
  createSpotLight(spotLightLaterale2, 0, 1, 0, 0)
  createSpotLight(spotLightLaterale3, 0, 1, 0, 0)
  createSpotLight(spotLightLaterale4, 0, 1, 0, 0)
  addCartelloniPlane(gui, scene);
  addBandierine(scene);
  addMonitors(scene);
  addLuciFari(scene)
  addPorte(scene)

  function addCartelloniPlane(gui: GUI, scene: THREE.Scene) {
    const video = document.createElement('video');
    video.src = 'video/VideoMaradona.mp4';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.center.set(0.5, 0.5); // importante per ruotare dal centro
    videoTexture.rotation = THREE.MathUtils.degToRad(180);

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

  function addBandierine(scene: THREE.Scene){
    fbxLoader.load("models/bandierine.fbx", (model) => {
      model.rotation.set(0, THREE.MathUtils.degToRad(-90), 0);
      model.scale.set(0.01, 0.01, 0.01);
      model.position.set(0, 0, 0);

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;

          const mat = mesh.material as THREE.Material;

          // mesh.castShadow = true; // il modello proietta ombra
          // mesh.receiveShadow = true;
        }
      });

      scene.add(model);
    });
  }

  function addMonitors(scene: THREE.Scene){
    const monitorTexture = textureLoader.load("textures/stadio/STADIO01_BaseColor.png");
    monitorTexture.colorSpace = THREE.SRGBColorSpace;

    const video = document.createElement('video');
    video.src = 'video/VideoMaradona.mp4';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.center.set(0.5, 0.5); // importante per ruotare dal centro
    videoTexture.rotation = THREE.MathUtils.degToRad(90);
    videoTexture.offset.x = 0;
    videoTexture.offset.y = -0.2;

    video.addEventListener('canplaythrough', () => {
      console.log(`Video pronto!`);
      video.play();
    });

    // const monitorTexture = textureLoader.load("textures/stadio/STADIO01_BaseColor.png");
    // monitorTexture.colorSpace = THREE.SRGBColorSpace;

    fbxLoader.load("models/monitor.fbx", (model) => {
      model.rotation.set(0, THREE.MathUtils.degToRad(-90), 0);
      model.scale.set(0.01, 0.01, 0.01);
      model.position.set(0, 0, 0);

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;

          // se la mesh ha più materiali
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((mat) => {
              if (mat.name === "video") {
                return new THREE.MeshBasicMaterial({ map: videoTexture });
              }
              if (mat.name === "stadio") {
                return new THREE.MeshStandardMaterial({ map: monitorTexture});
              }
              return mat; // mantieni gli altri invariati
            });
          }
        }
      });

      scene.add(model);

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

      const folder = gui.addFolder("Monitor Video").close();

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
    lightMat.side = THREE.DoubleSide;
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

  function addPorte(scene: THREE.Scene){
    fbxLoader.load("models/porte.fbx", (model) => {
      model.rotation.set(0, THREE.MathUtils.degToRad(-90), 0);
      model.scale.set(0.01, 0.01, 0.01);
      model.position.set(0, 0, 0);

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
        }
      });

      scene.add(model);
    });
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

    const materialName = gui.addFolder(material.name)
    materialName.add(params, "loadTexture").name("Carica Texture");
    materialName.addColor(material, 'color');
  }

  addMaterialGUI(maradonaMaterialsGUI, maradonaMaterialLibrary['divisa'])
  addMaterialGUI(maradonaMaterialsGUI, maradonaMaterialLibrary['pelle'])
  addMaterialGUI(maradonaMaterialsGUI, maradonaMaterialLibrary['capelli'])
  addMaterialGUI(maradonaMaterialsGUI, maradonaMaterialLibrary['palla'])
}
