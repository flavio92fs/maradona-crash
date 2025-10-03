import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import LoadingManager from "./loadingManager";
import AudioManager from "./audioManager";
import gsap from "gsap";

export function initScene(container: HTMLElement) {
const clock = new THREE.Clock();
let mixerMaradonaDiffuse: THREE.AnimationMixer;
let mixerMaradonaWireframe: THREE.AnimationMixer;

const gui = new GUI();
const loadingManager = new LoadingManager(animate);

const fbxLoader = loadingManager.fbxLoader;
const textureLoader = loadingManager.textureLoader;

//#region Maradona Textures
let divisaBaseColor: THREE.Texture;
let divisaNormalMap: THREE.Texture;

let pelleBaseColor: THREE.Texture;
let pelleNormalMap: THREE.Texture;

let capelliBaseColor: THREE.Texture;

let pallaBaseColor: THREE.Texture;

//#endregion

//#region Stadio Textures
let pratoMap: THREE.Texture;
let lineeCampoMap: THREE.Texture;
let stadioBaseColor: THREE.Texture;
//#endregion

const audioManager = new AudioManager(loadingManager.loadingManager);

loadDivisaTextures();
loadCampoTextures();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
let currentAction: THREE.AnimationAction;

const materialLibrary: Record<string, THREE.MeshStandardMaterial> = {
  divisa: new THREE.MeshStandardMaterial({
    map: divisaBaseColor,
    normalMap: divisaNormalMap,
    normalScale: new THREE.Vector2(1, 1),
    transparent: true,
    side: THREE.DoubleSide,
    opacity: 0, // parte invisibile
  }),
  pelle: new THREE.MeshStandardMaterial({
    map: pelleBaseColor,
    normalMap: pelleNormalMap,
    normalScale: new THREE.Vector2(1, 1),
    transparent: true,
    side: THREE.DoubleSide,
    opacity: 0,
  }),
  capelli: new THREE.MeshStandardMaterial({
    map: capelliBaseColor,
    metalness: 1.0,
    roughness: 1.0,
    transparent: true,
    side: THREE.DoubleSide,
    opacity: 0,
  }),
  palla: new THREE.MeshStandardMaterial({
    map: pallaBaseColor,
    transparent: true,
    side: THREE.DoubleSide,
    opacity: 0,
  }),
 wireMat: new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    wireframe: true,
    transparent: true,
    side: THREE.DoubleSide,
    opacity: 0,
  })
};

//MARADONA WIREFRAME
// fbxLoader.load('models/maradona_con_palla.fbx',
//   (model) => {
//     model.scale.set(0.01, 0.01, 0.01);

//     const materials = new Set<THREE.MeshStandardMaterial>();
//     model.traverse((child) => {
//       if ((child as THREE.Mesh).isMesh) {
//         const mesh = child as THREE.Mesh

//         const mat = mesh.material as THREE.Material;

//         mesh.material = materialLibrary['wireMat']
//         mesh.material.opacity = 1;
//         mesh.material.transparent = (mesh.material.opacity < 1);
//       }
//     });

//     scene.add(model);

//     mixerMaradonaWireframe = new THREE.AnimationMixer(model);
    
//     model.animations.forEach((clip) => {
//       const action = mixerMaradonaWireframe.clipAction(clip);
//       actions[clip.name] = action;
//     });

//     currentAction = actions['riscaldamento'];  // <-- sostituisci col nome giusto
//     currentAction.play();
//   }
// );

//MARADONA
fbxLoader.load('models/maradona_con_palla.fbx',
  (model) => {
    model.scale.set(0.01, 0.01, 0.01);

    const materials = new Set<THREE.MeshStandardMaterial>();
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh

        const mat = mesh.material as THREE.Material;

        if(mat.name === 'divisa' || mat.name === 'colletto_ai' || mat.name === 'maglietta_ai' || mat.name === 'pantaloncini_ai' || mat.name === 'gambe_ai'){
          mesh.material = materialLibrary['divisa'];
        }
        if (mat.name === 'capelli_ai') {
          mesh.material = materialLibrary['capelli'];
        }
        if (mat.name === 'pelle_ai1' || mat.name === 'pelle_ai' || mat.name === 'occhi_ai'){
          mesh.material = materialLibrary['pelle'];
        }
        if (mat.name === 'palla'){
          mesh.material = materialLibrary['palla'];
        }

        // mesh.castShadow = true;
        // mesh.receiveShadow = true;
        mesh.material.opacity = 1;
        mesh.material.transparent = (mesh.material.opacity < 1);
      }
    });

    scene.add(model);

    mixerMaradonaDiffuse = new THREE.AnimationMixer(model);
    
    model.animations.forEach((clip) => {
      const action = mixerMaradonaDiffuse.clipAction(clip);
      actions[clip.name] = action;
    });

    currentAction = actions['riscaldamento'];  // <-- sostituisci col nome giusto
    currentAction.play();
  }
);

//STADIO
// fbxLoader.load('models/stadio.fbx',
//   (model) => {
//     model.scale.set(0.01, 0.01, 0.01);

//     console.log(model.name)

//     const materials = new Set<THREE.MeshStandardMaterial>();
//     model.traverse((child) => {
//       if ((child as THREE.Mesh).isMesh) {
//         const mesh = child as THREE.Mesh

//         const mat = mesh.material as THREE.Material;

//         console.log(mat.name)

//         const newMat = new THREE.MeshStandardMaterial({
//           name: mat.name
//         }); 

//         mesh.material = newMat;
//         materials.add(newMat);
//       }
//     });

//     materials.forEach(material => {
//       if (material.name === 'stadio_ai' || material.name === 'Fari') {
//         material.map = stadioBaseColor;
//         material.emissive = new THREE.Color(0xffffff);
//         material.emissiveMap = stadioEmissive;
//         material.emissiveIntensity = 1.5;

//         material.needsUpdate = true;
//       }

//       if (material.name === 'strisce') {
//         material.map = lineecampo;
//         material.transparent = true;
//         material.needsUpdate = true;
//       }

//       if (material.name === 'stadio') {
//         material.map = pratoMap;
//         material.metalness = 0;
//         material.roughness = 1;
//         material.needsUpdate = true;
//       }
//     });

//     scene.add(model);
//   }
// );

const pratoGeometry = new THREE.PlaneGeometry(1000, 1000);

// materiale che reagisce alla luce
const pratoMaterial = new THREE.MeshStandardMaterial({
  map: pratoMap,
});

const prato = new THREE.Mesh(pratoGeometry, pratoMaterial);
prato.rotation.x = -Math.PI / 2; // orizzontale
prato.position.y = 0; // altezza

scene.add(prato);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
scene.add(ambientLight);

const controls = new OrbitControls(camera, renderer.domElement);

controls.target.set(0, 0.25, 0);
controls.enableDamping = true;   // rende il movimento più fluido
controls.dampingFactor = 0.05;   // velocità di smorzamento

controls.minPolarAngle = 0;              // non andare più in alto di sopra
controls.maxPolarAngle = Math.PI / 2;    // non scendere sotto l’orizzonte

// opzioni utili
controls.enablePan = false;      // disabilita trascinamento piano XY (solo rotazione e zoom)
controls.minDistance = 0.215;        // distanza minima
controls.maxDistance = 5;       // distanza massima

//#region CAMERA ANIMATION

let autoOrbit = false;
let angle = 0;

const radius = 0.25;

const pointA = new THREE.Vector3(0, 0.05, 0);
const pointB = new THREE.Vector3(5, 0, 5);

function getOrbitPosition(target: THREE.Vector3, angle: number): THREE.Vector3 {
  return new THREE.Vector3(
    target.x + radius * Math.cos(angle),
    target.y + 0,
    target.z + radius * Math.sin(angle)
  );
}

function transitionToPointB() {
  // punto di arrivo per la camera nell’orbita di B
  const destPos = getOrbitPosition(pointB, angle);

  gsap.to(camera.position, {
    x: destPos.x,
    y: destPos.y,
    z: destPos.z,
    duration: 3,
    onUpdate: () => {
      camera.lookAt(pointB);
    },
    onComplete: () => {
      // alla fine del tween, imposta il nuovo target come punto B e riprendi l’orbita automatica
      autoOrbit = true;
    },
  });
}

//#endregion

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  if (mixerMaradonaDiffuse) mixerMaradonaDiffuse.update(delta);
  if (mixerMaradonaWireframe) mixerMaradonaWireframe.update(delta);

  if(autoOrbit){
    angle -= 0.001;
    const currentTarget = (camera.position.distanceTo(pointB) < 0.1) ? pointB : pointA;

    const pos = getOrbitPosition(currentTarget, angle);
    camera.position.copy(pos);
    camera.lookAt(currentTarget);
  }else{
    controls.update();
  }

  renderer.render(scene, camera);
}

function loadDivisaTextures(){
    divisaBaseColor = textureLoader.load('textures/maradona/DivisaMaradonaNapoli_BaseColor.png');
    divisaBaseColor.colorSpace = THREE.SRGBColorSpace;

    divisaNormalMap = textureLoader.load('textures/maradona/DivisaMaradona_Normal.png');
    
    pelleBaseColor = textureLoader.load('textures/maradona/PelleMaradona_BaseColor.png');
    pelleBaseColor.colorSpace = THREE.SRGBColorSpace;
    pelleNormalMap = textureLoader.load('textures/maradona/PelleMaradona_Normal.png');
    
    capelliBaseColor = textureLoader.load('textures/maradona/Capelli_Diffuse.png');
    capelliBaseColor.colorSpace = THREE.SRGBColorSpace;
    
    pallaBaseColor = textureLoader.load('textures/palla/palla_BaseColor.png');
    pallaBaseColor.colorSpace = THREE.SRGBColorSpace;
}

function loadCampoTextures(){
    pratoMap = textureLoader.load('textures/stadio/prato.jpeg')
    pratoMap.wrapS = THREE.RepeatWrapping;
    pratoMap.wrapT = THREE.RepeatWrapping;
    pratoMap.repeat.set(590,500)
    pratoMap.colorSpace = THREE.SRGBColorSpace;

    lineeCampoMap = textureLoader.load('textures/stadio/lineecampo.png')
    lineeCampoMap.colorSpace = THREE.SRGBColorSpace;
    
    stadioBaseColor = textureLoader.load('textures/stadio/STADIO01_BaseColor.png')
    stadioBaseColor.colorSpace = THREE.SRGBColorSpace;
}

const geometry = new THREE.SphereGeometry(300, 60, 40);
geometry.scale(-1, 1, 1); // Inverti la sfera (così si vede dall’interno)

const domeTexture = textureLoader.load("stadium_01.jpg");
domeTexture.colorSpace = THREE.SRGBColorSpace

const material = new THREE.MeshBasicMaterial({ map: domeTexture });

const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// const imageDomeFolder = gui.addFolder('StadiumImage');

const directionalLight: THREE.DirectionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(38, 36.7, -50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// helper per visualizzare la direzione
const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 5, 0xff0000);
scene.add(lightHelper);

function updateHelper() {
  lightHelper.update();
}

const directionalLightFolder = gui.addFolder('Directional Light');

// intensità
directionalLightFolder.add(directionalLight, 'intensity', 0, 5, 0.1);

// posizione
directionalLightFolder.add(directionalLight.position, 'x', -200, 200, 0.01).onChange(updateHelper);
directionalLightFolder.add(directionalLight.position, 'y', -200, 200, 0.01).onChange(updateHelper);
directionalLightFolder.add(directionalLight.position, 'z', -200, 200, 0.01).onChange(updateHelper);

// colore
directionalLightFolder.addColor({ color: directionalLight.color.getHex() }, 'color').onChange((val: number) => {
  directionalLight.color.setHex(val);
});


const ambientLightFolder = gui.addFolder('Ambient Light');

// intensità
ambientLightFolder.add(ambientLight, 'intensity', 0, 5, 0.1);

// colore
ambientLightFolder.addColor({ color: ambientLight.color.getHex() }, 'color').onChange((val: number) => {
  ambientLight.color.setHex(val);
});

const wireframeMatFolder = gui.addFolder('WireframeMat');
wireframeMatFolder.add(materialLibrary['wireMat'], 'opacity', 0, 1, 0.1);
wireframeMatFolder.addColor(materialLibrary['wireMat'], 'color');
}
