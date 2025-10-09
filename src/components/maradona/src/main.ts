import * as THREE from "three";
import GUI from "lil-gui";
import LoadingManager from "./loadingManager";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import CameraControls from "./orbitControls";

export function initScene(container: HTMLElement) {
  const gui = new GUI();
  
  const clock = new THREE.Clock();

  let mixerMaradona: THREE.AnimationMixer;

  const dirLightGUI = gui.addFolder("Directional Light");
  const spotLightGUI = gui.addFolder("Spot Light");
  const ambientLightGUI = gui.addFolder("Ambient Light");

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

    const shadowsEnabledGUI = gui.addFolder('Shadows');
    shadowsEnabledGUI.add(renderer.shadowMap, 'enabled');

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);

  container.appendChild(renderer.domElement);

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  gui.add(renderer, 'toneMappingExposure')

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
    }),
    pelle: new THREE.MeshBasicMaterial({
      map: pelleBaseColor,
      side: THREE.DoubleSide,
      opacity: 0,
    }),
    capelli: new THREE.MeshBasicMaterial({
      // color: 0x000000,
      map: capelliBaseColor,
      side: THREE.DoubleSide,
      
      // opacity: 0,
    }),
    palla: new THREE.MeshBasicMaterial({
      map: pallaBaseColor,
      normal: pallaNormal,
      side: THREE.DoubleSide,
      opacity: 0,
    }),
  wireMat: new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      wireframe: true,
      side: THREE.DoubleSide,
      opacity: 0,
    })
  };

  const capelliGUI = gui.addFolder('Capelli');
  capelliGUI.addColor(maradonaMaterialLibrary['capelli'], 'color')
  capelliGUI.add(maradonaMaterialLibrary['capelli'], 'metalness', 0, 1)
  capelliGUI.add(maradonaMaterialLibrary['capelli'], 'roughness', 0, 1)


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
            console.log(mat.name)
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
  addCampoPlane(gui, scene, textureLoader)

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

  addDOMImage();
  const cameraControls = new CameraControls(camera, renderer, gui);

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    mixerMaradona.update(delta);
    cameraControls.orbitControls.update();

    renderer.render(scene, camera);
  }

  const g = gui.addFolder('Camera');
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

    function createSpotLight(x: number, y: number, z: number, intensity: number): THREE.DirectionalLight {
    const light = new THREE.SpotLight(0xffffff, intensity); // intensità più bassa per bilanciare
    light.position.set(x, y, z);

    light.castShadow = false;
    light.penumbra = 1;

    scene.add(light);

    spotLightGUI.add(light, "angle", 0, Math.PI / 2, 0.01);
    spotLightGUI.add(light, 'penumbra', 0, 1, 0.01);
    spotLightGUI.add(light, "intensity", 0, 100, 0.01);
    spotLightGUI.add(light.position, "y", 0, 5, 0.01);

    return light;
  }

  createSpotLight(0, 1, 0, 25)

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
  function addDOMImage(){
    const geometry = new THREE.SphereGeometry(300, 60, 40);
    geometry.scale(-1, 1, 1); // Inverti la sfera (così si vede dall’interno)

    const domeTexture = textureLoader.load("DOM.png");
    domeTexture.colorSpace = THREE.SRGBColorSpace

    const material = new THREE.MeshBasicMaterial({ map: domeTexture });

    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(0, -0.2, 0);
    sphere.scale.set(0.0403, 0.0403, 0.0403);
    scene.add(sphere);

    const sphereDom = gui.addFolder('Sphere DOM');
    sphereDom.add(sphere.scale, 'x', 0, 1, 0.00001).name('Scale').onChange(() => sphere.scale.set(sphere.scale.x, sphere.scale.x, sphere.scale.x))
    sphereDom.add(sphere.position, 'y', -5, 5, 0.01);
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
      model.rotation.set(0, THREE.MathUtils.degToRad(-90), 0);
      model.scale.set(0.01, 0.01, 0.01);
      model.position.set(0, 0.001, 0);

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;

          const mat = mesh.material as THREE.Material;

          mesh.castShadow = true; // il modello proietta ombra
          mesh.receiveShadow = true;
        }
      });

      scene.add(model);
    });
  }

  function addCampoPlane(gui: GUI, scene: THREE.Scene, textureLoader: THREE.TextureLoader) {
    const grassDiffuse = textureLoader.load("textures/grass/texture.png");
    grassDiffuse.colorSpace = THREE.SRGBColorSpace;

    grassDiffuse.wrapS = THREE.RepeatWrapping;
    grassDiffuse.wrapT = THREE.RepeatWrapping;

    const grassPlane = gui.addFolder('Grass Plane');
    
    const params = {
      repeatX: 1,
      repeatY: 1
    }

    grassPlane.add(params, "repeatX", 1, 20, 1).onChange((v: number) => {
      grassDiffuse.repeat.set(v, v);
    });
    grassPlane.add(params, "repeatY", 1, 20, 1).onChange((v: number) => {
      grassDiffuse.repeat.set(v, v);
    });
    
    grassDiffuse.repeat.set(1, 1);

    fbxLoader.load("models/campo.fbx", (model) => {
      model.rotation.set(0, THREE.MathUtils.degToRad(-90), 0);
      model.scale.set(0.01, 0.01, 0.01);
      model.position.set(0, 0, 0);

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;

          const mat = mesh.material as THREE.Material;
          mat.map = grassDiffuse;

          mesh.castShadow = true; // il modello proietta ombra
          mesh.receiveShadow = true;
        }
      });

      scene.add(model);
    });
  }

  // addVideoPlane(gui, scene);
  addCartelloniPlane(gui, scene);
  addBandierine(scene);
  addMonitors(scene);
  addLuciFari(scene)
  addPorte(scene)

  function addVideoPlane(gui: GUI, scene: THREE.Scene) {
    const video = document.createElement('video');
      video.src = 'video/VideoMaradona.mp4'
      video.loop = true;
      video.muted = true;        // autoplay solo se muted
      video.playsInline = true;
      video.preload = 'auto';

      const videoTexture = new THREE.VideoTexture(video);

    video.addEventListener('canplaythrough', () => {
        console.log(`Video pronto!`);
        video.play();
    });

    // geometria con più segmenti per displacement
    const geometry = new THREE.PlaneGeometry(1, 1, 100, 100);
    geometry.setAttribute('uv2', new THREE.BufferAttribute(geometry.attributes.uv.array, 2));

    const material = new THREE.MeshBasicMaterial({
      map: videoTexture
    });

    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.set(
      THREE.MathUtils.degToRad(-180), 
      THREE.MathUtils.degToRad(-65), 
      THREE.MathUtils.degToRad(180)
    );

    plane.scale.set(
      0.65,
      0.33,
      0
    )

    plane.position.set(
      2.1, 
      0.4, 
      1.5
    )

    scene.add(plane);

    // parametri GUI
    const params = {
      scaleX: 1,
      scaleY: 1,
      rotX: THREE.MathUtils.radToDeg(plane.rotation.x),
      rotY: THREE.MathUtils.radToDeg(plane.rotation.y),
      rotZ: THREE.MathUtils.radToDeg(plane.rotation.z),
    };

    const folder = gui.addFolder("Video Plane");

    // posizione
    folder.add(plane.position, "x", -10, 10, 0.1);
    folder.add(plane.position, "y", -10, 10, 0.1);
    folder.add(plane.position, "z", -10, 10, 0.1);

    // scala uniforme
    folder.add(params, "scaleX", 0.1, 1, 0.01).onChange((s: number) => {
      plane.scale.set(s, plane.scale.y, plane.scale.z);
    });

    folder.add(params, "scaleY", 0.1, 1, 0.01).onChange((s: number) => {
      plane.scale.set(plane.scale.x, s, plane.scale.z);
    });

      // rotazioni in gradi
    folder.add(params, "rotX", -180, 180, 1).onChange((deg: number) => {
      plane.rotation.x = THREE.MathUtils.degToRad(deg);
    });
    folder.add(params, "rotY", -180, 180, 1).onChange((deg: number) => {
      plane.rotation.y = THREE.MathUtils.degToRad(deg);
    });
    folder.add(params, "rotZ", -180, 180, 1).onChange((deg: number) => {
      plane.rotation.z = THREE.MathUtils.degToRad(deg);
    });

    return plane;
  }

  function addCartelloniPlane(gui: GUI, scene: THREE.Scene) {
    const video = document.createElement('video');
      video.src = 'video/VideoMaradona.mp4'
      video.loop = true;
      video.muted = true;        // autoplay solo se muted
      video.playsInline = true;
      video.preload = 'auto';

      const videoTexture = new THREE.VideoTexture(video);

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

          const mat = mesh.material as THREE.Material;
          const videoMat = mesh.material = new THREE.MeshBasicMaterial()
          videoMat.map = videoTexture;

          // mesh.castShadow = true; // il modello proietta ombra
          // mesh.receiveShadow = true;
        }
      });

      scene.add(model);
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

    fbxLoader.load("models/monitor.fbx", (model) => {
      model.rotation.set(0, THREE.MathUtils.degToRad(-90), 0);
      model.scale.set(0.01, 0.01, 0.01);
      model.position.set(0, 0, 0);

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;

          mesh.material = new THREE.MeshStandardMaterial();
          const mat = mesh.material as THREE.Material;

          console.log(mat)

          mat.map = monitorTexture

          // mesh.castShadow = true; // il modello proietta ombra
          // mesh.receiveShadow = true;
        }
      });

      scene.add(model);
    });
  }
  
  function addLuciFari(scene: THREE.Scene){
    const lightTexture = textureLoader.load("textures/luce.png");
    lightTexture.colorSpace = THREE.SRGBColorSpace;

    const lightMat = new THREE.MeshBasicMaterial();
    lightMat.map = lightTexture;
    lightMat.side = THREE.DoubleSide;
    lightMat.transparent = true;

    fbxLoader.load("models/lucifari.fbx", (model) => {
      model.rotation.set(0, THREE.MathUtils.degToRad(-90), 0);
      model.scale.set(0.01, 0.01, 0.01);
      model.position.set(0, 0, 0);

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;

          const mat = mesh.material as THREE.Material;

          mesh.material = lightMat;

        }
      });

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
  
}
