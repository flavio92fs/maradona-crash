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

// const gui = new GUI();
const loadingManager = new LoadingManager(() => {
  animate();
  playIntroAnimation(camera, orbitControls, new THREE.Vector3(0.14, 0.06, 0.11), new THREE.Vector3(0, 0.06, 0));
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

//#endregion

//#region Stadio Textures
let pratoMap: THREE.Texture;
let lineeCampoMap: THREE.Texture;
let stadioBaseColor: THREE.Texture;
//#endregion

loadDivisaTextures();
loadCampoTextures();

const audioManager = new AudioManager(loadingManager.loadingManager);

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

const maradonaMaterialLibrary: Record<string, THREE.MeshStandardMaterial> = {
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

//region MARADONA WIREFRAME
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

//#endregion

//#region MARADONA FBX
fbxLoader.load('models/maradona_con_palla.fbx',
  (model) => {
    model.scale.set(0.01, 0.01, 0.01);

    const materials = new Set<THREE.MeshStandardMaterial>();
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

//#endregion

//#region STADIO FBX
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
//#endregion

//#region TEXTURES FUNCTIONS
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
    pratoMap.repeat.set(4000, 4000)
    pratoMap.colorSpace = THREE.SRGBColorSpace;

    lineeCampoMap = textureLoader.load('textures/stadio/lineecampo.png')
    lineeCampoMap.colorSpace = THREE.SRGBColorSpace;
    
    stadioBaseColor = textureLoader.load('textures/stadio/STADIO01_BaseColor.png')
    stadioBaseColor.colorSpace = THREE.SRGBColorSpace;
}
//#endregion

//#region LIGHTS
const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
scene.add(ambientLight);

const directionalLight: THREE.DirectionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(38, 36.7, -50);
// directionalLight.castShadow = true;
// directionalLight.shadow.mapSize.width = 2048;
// directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

//#endregion

//#region DOM
const geometry = new THREE.SphereGeometry(300, 60, 40);
geometry.scale(-1, 1, 1); // Inverti la sfera (così si vede dall’interno)

const domeTexture = textureLoader.load("stadium_01.jpg");
domeTexture.colorSpace = THREE.SRGBColorSpace

const material = new THREE.MeshBasicMaterial({ map: domeTexture });

const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);
//#endregion

camera.position.set(0.14, 0.06, 0.11);

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.target.set(0, 0.06, 0);
orbitControls.enableDamping = true;   // rende il movimento più fluido
orbitControls.dampingFactor = 0.05;   // velocità di smorzamento

orbitControls.minPolarAngle = 0.5;              // non andare più in alto di sopra
orbitControls.maxPolarAngle = Math.PI / 2;    // non scendere sotto l’orizzonte

orbitControls.enablePan = false;      // disabilita trascinamento piano XY (solo rotazione e zoom)

// orbitControls.minDistance = 0.6;        // distanza minima
// orbitControls.maxDistance = 0.75;       // distanza massima

orbitControls.update()

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  mixerMaradonaDiffuse.update(delta);
  orbitControls.update();

  renderer.render(scene, camera);
}

//#region CAMERA ANIMATION

function playIntroAnimation(camera, controls, startPos, startLookAt) {
  orbitControls.minDistance = 0;        // distanza minima
  orbitControls.maxDistance = 5;       // distanza massima
  orbitControls.enabled = false;

  // posizione iniziale e look iniziale
  camera.position.copy(startPos);
  controls.target.copy(startLookAt);
  controls.update();

  const orbit = {
    angle: Math.atan2(
      camera.position.z - startLookAt.z,
      camera.position.x - startLookAt.x
    ),
    radius: camera.position.distanceTo(startLookAt),
    targetY: startLookAt.y
  };

  const tl = gsap.timeline({
    onUpdate: () => {
      camera.position.x = Math.cos(orbit.angle) * orbit.radius + startLookAt.x;
      camera.position.z = Math.sin(orbit.angle) * orbit.radius + startLookAt.z;
      camera.position.y = startPos.y;
      controls.target.set(startLookAt.x, orbit.targetY, startLookAt.z);
      controls.update();
    },
    onComplete: () => {
      controls.enabled = true;
      orbitControls.minDistance = 0.6;        // distanza minima
      orbitControls.maxDistance = 0.75;       // distanza massima
    }
  });

  // mezzo giro a sinistra + zoom out
  tl.to(orbit, {
    angle: orbit.angle + Math.PI,
    targetY: 0.05,
    radius: orbit.radius + 0.3, // 👈 aggiungi distanza
    duration: 1.5,
    ease: "power1.inOut"
  });

  // mezzo giro a destra + altro zoom out
  tl.to(orbit, {
    angle: orbit.angle - Math.PI,
    targetY: 0.2,
    duration: 1.5,
    ease: "power1.inOut"
  });

    tl.to(orbit, {
    angle: orbit.angle - Math.PI,
    targetY: 0.2,
    radius: orbit.radius + 0.4, // 👈 ancora più indietro
    duration: 1.5,
    ease: "power1.inOut"
  });
}

// window.addEventListener("keydown", (e) => {
//   if (e.code === "Space") {
//     playIntroAnimation(
//       camera,
//       orbitControls,
//       new THREE.Vector3(0.14, 0.06, 0.11),   // startPos
//       new THREE.Vector3(0, 0.06, 0),         // startLookAt
//     );
//   }
// });

  // const g = gui.addFolder('Camera Position (readonly)');
  // g.add(camera.position, 'x').listen().disable();
  // g.add(camera.position, 'y').listen().disable();
  // g.add(camera.position, 'z').listen().disable();

  // const cameraLookAtPositionFolder = gui.addFolder('Look At Position');
  // const lookAtPosition = { x: 0, y: 0.06, z: 0 };

  // cameraLookAtPositionFolder.add(lookAtPosition, 'y', 0, 1, 0.01).onChange(() => {
  //   orbitControls.target.set(0, lookAtPosition.y, 0)
  //   orbitControls.update()
  // });
}
