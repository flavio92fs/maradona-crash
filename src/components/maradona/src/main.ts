import * as THREE from "three";
import GUI from "lil-gui";
import LoadingManager from "./loadingManager";
import AudioManager from "./audioManager";
import { AnimationUtils } from 'three';

export function initScene(container: HTMLElement) {
const clock = new THREE.Clock();

let mixerMaradonaDiffuse: THREE.AnimationMixer;

  const gui = new GUI();
  const dirLightGUI = gui.addFolder("Directional Light");
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
const camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
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

let actions: { [key: string]: THREE.AnimationAction } = {};
let subActions: { [key: string]: THREE.AnimationAction } = {};
let currentAction: THREE.AnimationAction;

const maradonaMaterialLibrary: Record<string, THREE.MeshStandardMaterial> = {
  divisa: new THREE.MeshStandardMaterial({
    map: divisaBaseColor,
    normalMap: divisaNormalMap,
    normalScale: new THREE.Vector2(1, 1),
    // transparent: true,
    side: THREE.DoubleSide,
    opacity: 0, // parte invisibile
  }),
  pelle: new THREE.MeshStandardMaterial({
    map: pelleBaseColor,
    normalMap: pelleNormalMap,
    normalScale: new THREE.Vector2(1, 1),
    // transparent: true,
    side: THREE.DoubleSide,
    opacity: 0,
  }),
  capelli: new THREE.MeshStandardMaterial({
    map: capelliBaseColor,
    metalness: 1.0,
    roughness: 1.0,
    // transparent: true,
    side: THREE.DoubleSide,
    opacity: 0,
  }),
  palla: new THREE.MeshStandardMaterial({
    map: pallaBaseColor,
    normal: pallaNormal,
    // transparent: true,
    side: THREE.DoubleSide,
    opacity: 0,
  }),
 wireMat: new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    wireframe: true,
    // transparent: true,
    side: THREE.DoubleSide,
    opacity: 0,
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

    mixerMaradonaDiffuse = new THREE.AnimationMixer(model);

    model.animations.forEach((clip) => {
      const action = mixerMaradonaDiffuse.clipAction(clip);
      actions[clip.name] = action;
    });

    addSubAction(actions['start'], 'start', 297, 384, 30);
    addSubAction(actions['palleggio_loop1'], 'palleggio1', 385, 684, 30);
    addSubAction(actions['palleggio_loop2'], 'palleggio2', 685, 986, 30);
    addSubAction(actions['riscaldamento'], 'riscaldamento', 1, 296, 30);

    currentAction =  subActions['palleggio1']
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


function createVideoPlane(path: string, size = { w: 16, h: 9 }): THREE.Mesh {
  const video = document.createElement('video');
  video.src = path;
  video.loop = true;
  video.muted = true;        // autoplay solo se muted
  video.playsInline = true;
  video.preload = 'auto';

  // puoi decidere quando farlo partire (es. con click utente)
  // video.play();

  const videoTexture = new THREE.VideoTexture(video);
  const geometry = new THREE.PlaneGeometry(size.w, size.h);
  const material = new THREE.MeshBasicMaterial({ map: videoTexture });
  const plane = new THREE.Mesh(geometry, material);

  // opzionale: avvia il video appena è pronto
  video.addEventListener('canplaythrough', () => {
    console.log(`Video "${path}" pronto!`);
    video.play();
  });

  return plane;
}

function addPlaneGui(gui: GUI, plane: THREE.Mesh, name: string) {
  // posizione
  const posFolder = gui.addFolder(`${name} Position`);
  posFolder.add(plane.position, 'x', -50, 50, 0.1);
  posFolder.add(plane.position, 'y', -50, 50, 0.1);
  posFolder.add(plane.position, 'z', -50, 50, 0.1);

  // rotazioni in gradi (proxy)
  const rotProxy = {
    x: THREE.MathUtils.radToDeg(plane.rotation.x),
    y: THREE.MathUtils.radToDeg(plane.rotation.y),
    z: THREE.MathUtils.radToDeg(plane.rotation.z),
  };

  const rotFolder = gui.addFolder(`${name} Rotation`);
  rotFolder.add(rotProxy, 'x', 0, 360, 1).onChange((deg: number) => {
    plane.rotation.x = THREE.MathUtils.degToRad(deg);
  });
  rotFolder.add(rotProxy, 'y', 0, 360, 1).onChange((deg: number) => {
    plane.rotation.y = THREE.MathUtils.degToRad(deg);
  });
  rotFolder.add(rotProxy, 'z', 0, 360, 1).onChange((deg: number) => {
    plane.rotation.z = THREE.MathUtils.degToRad(deg);
  });
}

const plane1 = createVideoPlane('video/video.mp4');
const plane2 = createVideoPlane('video/video.mp4');

addPlaneGui(gui, plane1, 'Plane 1')
addPlaneGui(gui, plane2, 'Plane 2')

// li aggiungo alla scena
scene.add(plane1);
scene.add(plane2);

// setto posizione/rotazione a piacere
plane1.position.set(0, 0, 17.5);
plane1.rotation.y = THREE.MathUtils.degToRad(180)

plane2.position.set(0, -4.5, 13);
plane2.rotation.y = THREE.MathUtils.degToRad(180)
plane2.rotation.x = THREE.MathUtils.degToRad(90)


//#region TEXTURES FUNCTIONS
function loadDivisaTextures(){
    divisaBaseColor = textureLoader.load('textures/maradona/DivisaMaradonaBarcellona_BaseColor.png');
    divisaBaseColor.colorSpace = THREE.SRGBColorSpace;

    divisaNormalMap = textureLoader.load(
      "textures/maradona/DivisaMaradona_Normal.png"
    );

    pelleBaseColor = textureLoader.load(
      "textures/maradona/PelleMaradona_BaseColor.png"
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

//#region LIGHTS
const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
ambientLightGUI.add(ambientLight, 'intensity');

scene.add(ambientLight);

// Luce originale (sopra/diagonale)
createDirectionalLight(38, 36.7, -50);

// // Luce opposta
// createDirectionalLight(-38, 36.7, 50);

// // Luce laterale destra
// createDirectionalLight(50, 36.7, 38);

// // Luce laterale sinistra
// createDirectionalLight(-50, 36.7, -38);

// gui.add(directionalLight, 'intensity')
// gui.add(ambientLight, 'intensity')

//#endregion


camera.position.set(0, 0.51, -1.2);
camera.lookAt(0, 0.12, 0)

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  mixerMaradonaDiffuse.update(delta);
  // orbitControls.update();

  renderer.render(scene, camera);
}

  const g = gui.addFolder('Camera');
  g.add(camera.position, 'x').listen().onChange(() =>  updateCamera());
  g.add(camera.position, 'y').listen().onChange(() =>  updateCamera());
  g.add(camera.position, 'z').listen().onChange(() =>  updateCamera());

  g.add(camera, 'fov', 0, 120, 0.1).onChange(() =>  camera.updateProjectionMatrix());
  
  const lookAtPosition = { x: 0, y: 0.06, z: 0 };

  const targetFolder = gui.addFolder('LookAt');
  targetFolder.add(lookAtPosition, 'x', -1, 1, 0.01).onChange(updateCamera);
  targetFolder.add(lookAtPosition, 'y', -1, 1, 0.01).onChange(updateCamera);
  targetFolder.add(lookAtPosition, 'z', -1, 1, 0.01).onChange(updateCamera);


  function updateCamera() {
    camera.updateProjectionMatrix();
    camera.lookAt(lookAtPosition.x, lookAtPosition.y, lookAtPosition.z);
  }

  function createDirectionalLight(x: number, y: number, z: number): THREE.DirectionalLight {
      const light = new THREE.DirectionalLight(0xffffff, 1.5); // intensità più bassa per bilanciare
      light.position.set(x, y, z);

    scene.add(light);

    dirLightGUI.add(light, "intensity");

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

  function addSubAction(baseAction: THREE.AnimationAction, subName: string, start: number, end: number, fps: number) {
    const clip = baseAction.getClip();
    const subClip = THREE.AnimationUtils.subclip(clip, subName, start, end, fps);
    const subAction = mixerMaradonaDiffuse.clipAction(subClip);
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
}
