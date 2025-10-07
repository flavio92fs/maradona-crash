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
loadCampoTextures();

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
    normal: pallaNormal,
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

        mesh.castShadow = true;
        mesh.receiveShadow = true;
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

const video = document.createElement('video');
video.src = 'video/video.mp4';
video.loop = true;
video.muted = true;
video.play();

const videoTexture = new THREE.VideoTexture(video);
scene.background = videoTexture;

// fbxLoader.load('models/strisce.fbx',
//   (model) => {
//     model.scale.set(0.02, 0, 0.02);
//     model.position.set(0, 0.002, 0);
//     model.rotation.set(0, Math.PI/2, 0)

//     model.traverse((child) => {
//       if ((child as THREE.Mesh).isMesh) {
//         const mesh = child as THREE.Mesh


//         const mat = mesh.material as THREE.Material;

//         mesh.material.opacity = 1;
//       }
//     });

//     scene.add(model);

//     currentAction = actions['riscaldamento'];  // <-- sostituisci col nome giusto
//     currentAction.play();
//   }
// );

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

// const blackPlaneGeometry = new THREE.PlaneGeometry(200, 200);

// // materiale che reagisce alla luce
// const blackMat = new THREE.MeshBasicMaterial();
// blackMat.color.set(0x000000);

// const blackPlane = new THREE.Mesh(blackPlaneGeometry, blackMat);
// blackPlane.rotation.x = -Math.PI / 2; // orizzontale
// blackPlane.position.y = -0.0001; // altezza

// scene.add(blackPlane);

// const pratoGeometry = new THREE.PlaneGeometry(3, 3);

// // materiale che reagisce alla luce
// const pratoMaterial = new THREE.MeshBasicMaterial({
//   map: pratoMap,
//   transparent: true,
// });

// pratoMaterial.roughness = 1
// pratoMaterial.metalness = 0

// const prato = new THREE.Mesh(pratoGeometry, pratoMaterial);
// prato.receiveShadow = true;
// prato.rotation.x = -Math.PI / 2; // orizzontale
// prato.position.y = 0; // altezza

// scene.add(prato);

// const pratoShadowGeometry = new THREE.PlaneGeometry(5, 5);

// // materiale che reagisce alla luce
// const pratoShadowMaterial = new THREE.ShadowMaterial();
// pratoShadowMaterial.opacity = 0.5;

// const pratoShadow = new THREE.Mesh( pratoShadowGeometry, pratoShadowMaterial);
// pratoShadow.rotation.x = -Math.PI / 2; 

// pratoShadow.receiveShadow = true;
// pratoShadow.position.set(0, 0.001, 0);
// scene.add(pratoShadow);

// const pratoGUI = gui.addFolder('Prato');
// pratoGUI.add(prato.scale, 'x', 0, 100, 0.1).onChange(() => prato.scale.y = prato.scale.x).name('scale');

//#endregion

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

function loadCampoTextures(){
    pratoMap = textureLoader.load('textures/stadio/prato.jpeg')
    pratoMap.wrapS = THREE.RepeatWrapping;
    pratoMap.wrapT = THREE.RepeatWrapping;
    pratoMap.repeat.set(1000, 1000)
    pratoMap.colorSpace = THREE.SRGBColorSpace;

    lineeCampoMap = textureLoader.load('textures/stadio/lineecampo.png')
    lineeCampoMap.colorSpace = THREE.SRGBColorSpace;
    
    stadioBaseColor = textureLoader.load('textures/stadio/STADIO01_BaseColor.png')
    stadioBaseColor.colorSpace = THREE.SRGBColorSpace;
}
//#endregion

//#region LIGHTS
const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
ambientLightGUI.add(ambientLight, 'intensity');

scene.add(ambientLight);

// Luce originale (sopra/diagonale)
createDirectionalLight(38, 36.7, -50);

// Luce opposta
createDirectionalLight(-38, 36.7, 50);

// Luce laterale destra
createDirectionalLight(50, 36.7, 38);

// Luce laterale sinistra
createDirectionalLight(-50, 36.7, -38);

// gui.add(directionalLight, 'intensity')
// gui.add(ambientLight, 'intensity')

//#endregion

//#region DOM
// const geometry = new THREE.SphereGeometry(300, 60, 40);
// geometry.scale(-1, 1, 1); // Inverti la sfera (così si vede dall’interno)

// const domeTexture = textureLoader.load("stadium_01.jpg");
// domeTexture.colorSpace = THREE.SRGBColorSpace

// const material = new THREE.MeshBasicMaterial({ map: domeTexture });

// const sphere = new THREE.Mesh(geometry, material);
// sphere.position.set(0, 4, 0);
// scene.add(sphere);

// const sphereDom = gui.addFolder('Sphere DOM');
// sphereDom.add(sphere.scale, 'x', 0, 1, 0.00001).name('Scale').onChange(() => sphere.scale.set(sphere.scale.x, sphere.scale.x, sphere.scale.x))

//#endregion

// camera.position.set(0.14, 0.06, 0.11);

// const orbitControls = new OrbitControls(camera, renderer.domElement);
// orbitControls.target.set(0, 0.06, 0);
// orbitControls.enableDamping = true;   // rende il movimento più fluido
// orbitControls.dampingFactor = 0.05;   // velocità di smorzamento

// orbitControls.minPolarAngle = 0.5;              // non andare più in alto di sopra
// orbitControls.maxPolarAngle = Math.PI / 2;    // non scendere sotto l’orizzonte

// orbitControls.enablePan = false;      // disabilita trascinamento piano XY (solo rotazione e zoom)

// orbitControls.update()

camera.position.set(-0.030, 0.30, -1.20);
camera.lookAt(0, 0.12, 0)

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  mixerMaradonaDiffuse.update(delta);
  // orbitControls.update();

  renderer.render(scene, camera);
}

//#region CAMERA ANIMATION

// function playIntroAnimation(camera, controls, startPos, startLookAt) {
//   orbitControls.minDistance = 0;        // distanza minima
//   orbitControls.maxDistance = 5;       // distanza massima
//   orbitControls.enabled = false;

//   // posizione iniziale e look iniziale
//   camera.position.copy(startPos);
//   controls.target.copy(startLookAt);
//   controls.update();

//   const orbit = {
//     angle: Math.atan2(
//       camera.position.z - startLookAt.z,
//       camera.position.x - startLookAt.x
//     ),
//     radius: camera.position.distanceTo(startLookAt),
//     targetY: startLookAt.y
//   };

//   const tl = gsap.timeline({
//     onUpdate: () => {
//       camera.position.x = Math.cos(orbit.angle) * orbit.radius + startLookAt.x;
//       camera.position.z = Math.sin(orbit.angle) * orbit.radius + startLookAt.z;
//       camera.position.y = startPos.y;
//       controls.target.set(startLookAt.x, orbit.targetY, startLookAt.z);
//       controls.update();
//     },
//     onComplete: () => {
//       controls.enabled = true;
//       orbitControls.minDistance = minZoom;        // distanza minima
//       orbitControls.maxDistance = maxZoom;      // distanza massima
//     }
//   });

//   // mezzo giro a sinistra + zoom out
//   tl.to(orbit, {
//     angle: orbit.angle + Math.PI,
//     targetY: 0.05,
//     radius: orbit.radius + 0.3, // 👈 aggiungi distanza
//     duration: 1.5,
//     ease: "power1.inOut"
//   });

//   // mezzo giro a destra + altro zoom out
//   tl.to(orbit, {
//     angle: orbit.angle - Math.PI,
//     targetY: 0.2,
//     duration: 1.5,
//     ease: "power1.inOut"
//   });

//     tl.to(orbit, {
//     angle: orbit.angle - Math.PI,
//     targetY: 0.14,
//     radius: orbit.radius + 1.7, // 👈 ancora più indietro
//     duration: 1.5,
//     ease: "power1.inOut"
//   });
// }

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    // playIntroAnimation(
    //   camera,
    //   orbitControls,
    //   new THREE.Vector3(0.14, 0.06, 0.11),   // startPos
    //   new THREE.Vector3(0, 0.06, 0),         // startLookAt
    // );
  }
});

  const g = gui.addFolder('Camera');
  g.add(camera.position, 'x').listen().disable();
  g.add(camera.position, 'y').listen().disable();
  g.add(camera.position, 'z').listen().disable();

  g.add(camera, 'fov', 0, 120, 0.1).onChange(() =>  camera.updateProjectionMatrix());

  // const cameraLookAtPositionFolder = gui.addFolder('Look At Position');
  const lookAtPosition = { x: 0, y: 0.06, z: 0 };

//   g.add(lookAtPosition, 'y', 0, 1, 0.01)
//   .onChange(() => {
//     orbitControls.target.set(0, lookAtPosition.y, 0)
//     orbitControls.update()
//   })
//   .name('Camera Target Y');

// const minCtrl = g.add(orbitControls, 'minDistance', 0.01, 5, 0.01).name('Min Zoom').listen();
// const maxCtrl = g.add(orbitControls, 'maxDistance', 0.01, 10, 0.01).name('Max Zoom').listen();

// // quando cambia minDistance
// minCtrl.onChange((v: number) => {
//   if (v > orbitControls.maxDistance) {
//     orbitControls.maxDistance = v;
//     maxCtrl.updateDisplay(); // aggiorna GUI
//   }
// });

// // quando cambia maxDistance
// maxCtrl.onChange((v: number) => {
//   if (v < orbitControls.minDistance) {
//     orbitControls.minDistance = v;
//     minCtrl.updateDisplay(); // aggiorna GUI
//   }
// });

  function createDirectionalLight(x: number, y: number, z: number): THREE.DirectionalLight {
      const light = new THREE.DirectionalLight(0xffffff, 1.5); // intensità più bassa per bilanciare
      light.position.set(x, y, z);
      light.castShadow = true;

      // dimensioni shadow map
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;
      light.shadow.bias = -0.00001;

      // frustum della camera delle ombre
      // const d = 50;
      // light.shadow.camera.left = -d;
      // light.shadow.camera.right = d;
      // light.shadow.camera.top = d;
      // light.shadow.camera.bottom = -d;
      // light.shadow.camera.near = 1;
      // light.shadow.camera.far = 200;

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
}
