import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import {
  EffectComposer,
  OutputPass,
  RenderPass,
  UnrealBloomPass,
} from "three/examples/jsm/Addons.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import LoadingManager from "./loadingManager";
import AudioManager from "./audioManager";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { finalShader } from "./shader";

export function initScene(container: HTMLElement) {
  const clock = new THREE.Clock();
  let mixer: THREE.AnimationMixer;

  // const gui = new GUI();
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
  let pallaHeight: THREE.Texture;
  let pallaMetalness: THREE.Texture;
  let pallaNormal: THREE.Texture;
  let pallaRough: THREE.Texture;
  //#endregion

  //#region Stadio Textures
  let pratoMap: THREE.Texture;
  let lineecampo: THREE.Texture;
  let stadioBaseColor: THREE.Texture;
  let stadioNormal: THREE.Texture;
  let stadioEmissive: THREE.Texture;
  let stadioHeight: THREE.Texture;
  let stadioMetallic: THREE.Texture;
  let stadioRough: THREE.Texture;
  //#endregion

  const audioManager = new AudioManager(loadingManager.loadingManager);

  loadDivisaTextures();
  loadCampoTextures();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);

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

  window.addEventListener("resize", resizeRenderer);
  resizeRenderer();

  let actions: { [key: string]: THREE.AnimationAction } = {};
  let currentAction: THREE.AnimationAction;

  //STADIO
  fbxLoader.load("models/stadio.fbx", (model) => {
    model.scale.set(0.01, 0.01, 0.01);

    console.log(model.name);

    const materials = new Set<THREE.MeshStandardMaterial>();
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;

        const mat = mesh.material as THREE.Material;

        console.log(mat.name);

        const newMat = new THREE.MeshStandardMaterial({
          name: mat.name,
        });

        mesh.material = newMat;
        // mesh.receiveShadow = true;
        // mesh.castShadow = true;
        materials.add(newMat);
      }
    });

    materials.forEach((material) => {
      if (material.name === "stadio_ai" || material.name === "Fari") {
        material.map = stadioBaseColor;
        material.emissive = new THREE.Color(0xffffff);
        material.emissiveMap = stadioEmissive;
        material.emissiveIntensity = 1.5;

        material.needsUpdate = true;
      }

      if (material.name === "strisce") {
        material.map = lineecampo;
        material.transparent = true;
        material.needsUpdate = true;
      }

      if (material.name === "stadio") {
        material.map = pratoMap;
        material.metalness = 0;
        material.roughness = 1;
        material.needsUpdate = true;
      }
    });

    scene.add(model);
  });

  //MARADONA
  fbxLoader.load("models/maradona_con_palla.fbx", (model) => {
    model.scale.set(0.01, 0.01, 0.01);

    const materials = new Set<THREE.MeshStandardMaterial>();
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;

        const mat = mesh.material as THREE.Material;

        const newMat = new THREE.MeshStandardMaterial({
          name: mat.name,
        });

        mesh.material = newMat;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        materials.add(newMat);
      }
    });

    materials.forEach((material) => {
      if (
        material.name === "divisa" ||
        material.name === "colletto_ai" ||
        material.name === "maglietta_ai" ||
        material.name === "pantaloncini_ai" ||
        material.name === "gambe_ai"
      ) {
        material.map = divisaBaseColor;
        material.normalMap = divisaNormalMap;
        material.normalScale.set(1, 1);

        material.needsUpdate = true;
      }

      if (
        material.name === "pelle_ai1" ||
        material.name === "pelle_ai" ||
        material.name === "occhi_ai"
      ) {
        material.map = pelleBaseColor;
        material.normalMap = pelleNormalMap;
        material.normalScale.set(1, 1);

        material.needsUpdate = true;
      }

      if (material.name === "capelli_ai") {
        material.map = capelliBaseColor;

        material.metalness = 1.0;
        material.roughness = 1.0;
        material.needsUpdate = true;
      }

      if (material.name === "palla") {
        material.map = pallaBaseColor;
        material.normalMap = pallaNormal;

        material.needsUpdate = true;
      }
    });

    scene.add(model);

    mixer = new THREE.AnimationMixer(model);

    model.animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      actions[clip.name] = action;
    });

    currentAction = actions["riscaldamento"]; // <-- sostituisci col nome giusto
    currentAction.play();
  });

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
  scene.add(ambientLight);

  const controls = new OrbitControls(camera, renderer.domElement);

  controls.target.set(0, 0.25, 0);
  controls.enableDamping = true; // rende il movimento più fluido
  controls.dampingFactor = 0.05; // velocità di smorzamento

  controls.minPolarAngle = 0; // non andare più in alto di sopra
  controls.maxPolarAngle = Math.PI / 2; // non scendere sotto l’orizzonte

  // opzioni utili
  controls.enablePan = false; // disabilita trascinamento piano XY (solo rotazione e zoom)
  controls.minDistance = 0.215; // distanza minima
  controls.maxDistance = 5; // distanza massima

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    controls.update();

    renderer.render(scene, camera);
  }

  function loadDivisaTextures() {
    divisaBaseColor = textureLoader.load(
      "textures/maradona/DivisaMaradonaNapoli_BaseColor.png"
    );
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

    pallaHeight = textureLoader.load("textures/palla/palla_Height.png");
    pallaMetalness = textureLoader.load("textures/palla/palla_Metalness.png");
    pallaNormal = textureLoader.load("textures/palla/palla_Normal.png");
    pallaRough = textureLoader.load("textures/palla/palla_Roughness.png");
  }

  function loadCampoTextures() {
    pratoMap = textureLoader.load("textures/stadio/prato.jpeg");
    pratoMap.wrapS = THREE.RepeatWrapping;
    pratoMap.wrapT = THREE.RepeatWrapping;
    pratoMap.repeat.set(590, 500);
    pratoMap.colorSpace = THREE.SRGBColorSpace;

    lineecampo = textureLoader.load("textures/stadio/lineecampo.png");
    lineecampo.colorSpace = THREE.SRGBColorSpace;

    stadioBaseColor = textureLoader.load(
      "textures/stadio/STADIO01_BaseColor.png"
    );
    stadioBaseColor.colorSpace = THREE.SRGBColorSpace;

    stadioEmissive = textureLoader.load(
      "textures/stadio/STADIO01_Emissive.png"
    );
    stadioHeight = textureLoader.load("textures/stadio/STADIO01_Height.png");
    stadioMetallic = textureLoader.load(
      "textures/stadio/STADIO01_Metallic.png"
    );
    stadioNormal = textureLoader.load("textures/stadio/STADIO01_Normal.png");
    stadioRough = textureLoader.load("textures/stadio/STADIO01_Roughness.png");
  }

  // const geometry = new THREE.SphereGeometry(300, 60, 40);
  // geometry.scale(-1, 1, 1); // Inverti la sfera (così si vede dall’interno)

  // const domeTexture = textureLoader.load("stadium_01.jpg");
  // const material = new THREE.MeshBasicMaterial({ map: domeTexture });
  // const dome = new THREE.Mesh(geometry, material);
  // scene.add(dome);

  const directionalLight: THREE.DirectionalLight = new THREE.DirectionalLight(
    0xffffff,
    3
  );
  directionalLight.position.set(38, 36.7, -50);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  // helper per visualizzare la direzione
  const lightHelper = new THREE.DirectionalLightHelper(
    directionalLight,
    5,
    0xff0000
  );
  scene.add(lightHelper);

  function updateHelper() {
    lightHelper.update();
  }

  // const directionalLightFolder = gui.addFolder('Directional Light');

  // intensità
  // directionalLightFolder.add(directionalLight, 'intensity', 0, 5, 0.1);

  // posizione
  // directionalLightFolder.add(directionalLight.position, 'x', -200, 200, 0.01).onChange(updateHelper);
  // directionalLightFolder.add(directionalLight.position, 'y', -200, 200, 0.01).onChange(updateHelper);
  // directionalLightFolder.add(directionalLight.position, 'z', -200, 200, 0.01).onChange(updateHelper);

  // colore
  // directionalLightFolder.addColor({ color: directionalLight.color.getHex() }, 'color').onChange((val: number) => {
  //   directionalLight.color.setHex(val);
  // });

  // const folder = gui.addFolder('Ambient Light');

  // intensità
  // folder.add(ambientLight, 'intensity', 0, 5, 0.1);

  // colore
  // folder.addColor({ color: ambientLight.color.getHex() }, 'color').onChange((val: number) => {
  //   ambientLight.color.setHex(val);
  // });
}
