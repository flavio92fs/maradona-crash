import * as THREE from "three";
import GUI from "lil-gui";
import LoadingManager from "./loadingManager";
import AudioManager from "./audioManager";
import { AnimationUtils } from 'three';

export function initScene(container: HTMLElement) {
const clock = new THREE.Clock();

let mixerMaradonaDiffuse: THREE.AnimationMixer;

const gui = new GUI();
const dirLightGUI = gui.addFolder('Directional Light');
const ambientLightGUI = gui.addFolder('Ambient Light');

const minZoom: number = 1.5;
const maxZoom: number = 2.05;
  
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

//#region Stadio Textures
let pratoMap: THREE.Texture;
let lineeCampoMap: THREE.Texture;
let stadioBaseColor: THREE.Texture;
//#endregion

loadDivisaTextures();
// loadCampoTextures();

const audioManager = new AudioManager(loadingManager.loadingManager);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 1000);

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

window.addEventListener('resize', resizeRenderer);
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
fbxLoader.load('models/maradona_con_palla.fbx',
  (model) => {
    model.scale.set(0.01, 0.01, 0.01);
    
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh

        const mat = mesh.material as THREE.Material;

        if(mat.name === 'divisa' || mat.name === 'colletto_ai' || mat.name === 'maglietta_ai' || mat.name === 'pantaloncini_ai' || mat.name === 'gambe_ai'){
          mesh.material = maradonaMaterialLibrary['divisa'];
        }
        if (mat.name === 'capelli_ai') {
          mesh.material = maradonaMaterialLibrary['capelli'];
        }
        if (mat.name === 'pelle_ai1' || mat.name === 'pelle_ai' || mat.name === 'occhi_ai'){
          mesh.material = maradonaMaterialLibrary['pelle'];
        }
        if (mat.name === 'palla'){
          mesh.material = maradonaMaterialLibrary['palla'];
        }
      }
    });

    scene.add(model);

    mixerMaradonaDiffuse = new THREE.AnimationMixer(model);
    
    model.animations.forEach((clip) => {
      const action = mixerMaradonaDiffuse.clipAction(clip);
      actions[clip.name] = action;
    });

    addSubAction(actions['palleggio_loop1'], 'palleggio1', 386, 685, 30);
    addSubAction(actions['palleggio_loop2'], 'palleggio2', 686, 987, 30);
    addSubAction(actions['riscaldamento'], 'riscaldamento', 0, 297, 30);

    currentAction =  subActions['palleggio2']
    currentAction.play();

    const keyToSubAction: Record<string, string> = {
      Digit1: 'riscaldamento',
      Digit2: 'palleggio1',
      Digit3: 'palleggio2',
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

  const video = document.createElement('video');
  video.src = 'video/video.mp4';
  video.loop = true;
  video.muted = true; // ⚠️ se non è muted, serve un’interazione utente per farlo partire
  video.preload = 'auto';

  video.addEventListener('canplaythrough', () => {
    console.log("Video pronto!");
    video.play();

    const videoTexture = new THREE.VideoTexture(video);
    scene.background = videoTexture;
  });

//#region TEXTURES FUNCTIONS
function loadDivisaTextures(){
    divisaBaseColor = textureLoader.load('textures/maradona/DivisaMaradonaBarcellona_BaseColor.png');
    divisaBaseColor.colorSpace = THREE.SRGBColorSpace;

    divisaNormalMap = textureLoader.load('textures/maradona/DivisaMaradona_Normal.png');
    
    pelleBaseColor = textureLoader.load('textures/maradona/PelleMaradona_BaseColor.png');
    pelleBaseColor.colorSpace = THREE.SRGBColorSpace;
    pelleNormalMap = textureLoader.load('textures/maradona/PelleMaradona_Normal.png');
    
    capelliBaseColor = textureLoader.load('textures/maradona/Capelli_Diffuse.png');
    capelliBaseColor.colorSpace = THREE.SRGBColorSpace;
    
    pallaBaseColor = textureLoader.load('textures/palla/palla_BaseColor.png');
    pallaBaseColor.colorSpace = THREE.SRGBColorSpace;
    pallaBaseColor.minFilter = THREE.LinearMipmapLinearFilter; // qualità alta su distanza
    pallaBaseColor.magFilter = THREE.LinearFilter;             // qualità alta da vicino
    // pallaBaseColor.anisotropy = renderer.capabilities.getMaxAnisotropy(); // massimo dettaglio angoli

    pallaNormal = textureLoader.load('textures/palla/palla_Normal.png');
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


camera.position.set(-0, 0.30, -1.20);
camera.lookAt(0, 0.12, 0)

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  mixerMaradonaDiffuse.update(delta);
  // orbitControls.update();

  renderer.render(scene, camera);
}

  const g = gui.addFolder('Camera');
  g.add(camera.position, 'x').listen().disable();
  g.add(camera.position, 'y').listen().disable();
  g.add(camera.position, 'z').listen().disable();

  g.add(camera, 'fov', 0, 120, 0.1).onChange(() =>  camera.updateProjectionMatrix());

  const lookAtPosition = { x: 0, y: 0.06, z: 0 };

  function createDirectionalLight(x: number, y: number, z: number): THREE.DirectionalLight {
      const light = new THREE.DirectionalLight(0xffffff, 1.5); // intensità più bassa per bilanciare
      light.position.set(x, y, z);

      scene.add(light);

      dirLightGUI.add(light, 'intensity')

      return light;
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "h") { // premi "h" per hide
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
