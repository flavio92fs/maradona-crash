import * as THREE from "three";
import GUI from "lil-gui";
import { loadSettings, saveSettings, resetSettings } from "./saveLoadGUI";

export function addAmbientLight(scene: THREE.Scene, gui: GUI): THREE.AmbientLight {
  const folder = gui.addFolder("Ambient Light").close();
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);

  const STORAGE_KEY = "Ambient Light";
  const defaultParams = { color: 0xffffff, intensity: 0.6 };
  let params = { ...defaultParams };
  loadSettings(STORAGE_KEY, defaultParams, params);

  ambientLight.intensity = params.intensity;
  ambientLight.color.set(params.color);

  folder.add(params, "intensity").onChange((val: number) => {
    ambientLight.intensity = val;
    saveSettings(STORAGE_KEY, params);
  });
  folder.addColor(params, "color").onChange((val: number) => {
    ambientLight.color.set(val);
    saveSettings(STORAGE_KEY, params);
  });

  folder.add(
    {
      reset: () => {
        resetSettings(STORAGE_KEY, defaultParams, params, folder);
        saveSettings(STORAGE_KEY, defaultParams);
        ambientLight.intensity = params.intensity;
        ambientLight.color.set(params.color);
      },
    },
    "reset"
  );

  scene.add(ambientLight);
  return ambientLight;
}

export function createSpotLight(
  scene: THREE.Scene,
  gui: GUI,
  guiName: string,
  x: number,
  y: number,
  z: number,
  intensity: number
): THREE.SpotLight {
  const folder = gui.addFolder(guiName).close();
  const light = new THREE.SpotLight(0xffffff, intensity);
  light.position.set(x, y, z);

  scene.add(light);
  scene.add(light.target);

  const helper = new THREE.SpotLightHelper(light);
  helper.visible = false;
  scene.add(helper);

  function updateLightTarget() {
    light.target.position.set(0, 0, 0);
    light.target.updateMatrixWorld();
    helper.update();
  }

  const STORAGE_KEY = guiName;
  const defaultParams = {
    positionX: 0.04999,
    positionY: 0.8,
    positionZ: -0.6,
    targetPositionY: 0,
    cone: 1,
    borderHardness: 1,
    intensity,
    castShadow: true,
    color: 0xffffff,
    bias: 0,
    normalBias: 0.01,
    showHelper: false,
  };

  let params = { ...defaultParams };
  loadSettings(STORAGE_KEY, defaultParams, params);

  light.position.set(params.positionX, params.positionY, params.positionZ);
  light.target.position.y = params.targetPositionY;
  light.angle = params.cone;
  light.penumbra = params.borderHardness;
  light.intensity = params.intensity;
  light.castShadow = params.castShadow;
  light.color.set(params.color);
  light.shadow.bias = params.bias;
  light.shadow.normalBias = params.normalBias;
  helper.visible = params.showHelper;
  updateLightTarget();

  folder.add(params, "positionX", -10, 10, 0.01).onChange((val: number) => {
    light.position.x = val;
    updateLightTarget();
    saveSettings(STORAGE_KEY, params);
  });
  folder.add(params, "positionY", -10, 10, 0.01).onChange((val: number) => {
    light.position.y = val;
    updateLightTarget();
    saveSettings(STORAGE_KEY, params);
  });
  folder.add(params, "positionZ", -10, 10, 0.01).onChange((val: number) => {
    light.position.z = val;
    updateLightTarget();
    saveSettings(STORAGE_KEY, params);
  });
  folder
    .add(params, "targetPositionY", -5, 5, 0.001)
    .onChange((val: number) => {
      light.target.position.y = val;
      updateLightTarget();
      saveSettings(STORAGE_KEY, params);
    });
  folder.add(params, "cone", 0, Math.PI / 2, 0.01).onChange((val: number) => {
    light.angle = val;
    helper.update();
    saveSettings(STORAGE_KEY, params);
  });
  folder
    .add(params, "borderHardness", 0, 1, 0.01)
    .onChange((val: number) => {
      light.penumbra = val;
      helper.update();
      saveSettings(STORAGE_KEY, params);
    });
  folder.add(params, "intensity", 0, 100, 0.01).onChange((val: number) => {
    light.intensity = val;
    saveSettings(STORAGE_KEY, params);
  });
  folder.add(params, "castShadow").onChange((val: boolean) => {
    light.castShadow = val;
    saveSettings(STORAGE_KEY, params);
  });
  folder.addColor(params, "color").onChange((val: number) => {
    light.color.set(val);
    saveSettings(STORAGE_KEY, params);
  });
  folder.add(params, "bias", -1, 1, 0.0001).onChange((val: number) => {
    light.shadow.bias = val;
    saveSettings(STORAGE_KEY, params);
  });
  folder.add(params, "normalBias", -1, 1, 0.0001).onChange((val: number) => {
    light.shadow.normalBias = val;
    saveSettings(STORAGE_KEY, params);
  });
  folder.add(params, "showHelper").onChange((val: boolean) => {
    helper.visible = val;
    saveSettings(STORAGE_KEY, params);
  });
  folder.add(light, "visible");

  folder.add(
    {
      reset: () => {
        resetSettings(STORAGE_KEY, defaultParams, params, folder);
        saveSettings(STORAGE_KEY, defaultParams);
        light.position.set(
          params.positionX,
          params.positionY,
          params.positionZ
        );
        light.target.position.y = params.targetPositionY;
        light.angle = params.cone;
        light.penumbra = params.borderHardness;
        light.intensity = params.intensity;
        light.castShadow = params.castShadow;
        light.color.set(params.color);
        helper.visible = params.showHelper;
        updateLightTarget();
      },
    },
    "reset"
  );

  return light;
}

export function createDirectionalLight(
  scene: THREE.Scene,
  gui: GUI,
  guiName: string,
  x: number,
  y: number,
  z: number,
  intensity: number
): THREE.DirectionalLight {
  const folder = gui.addFolder(guiName).close();
  const light = new THREE.DirectionalLight(0xffffff, intensity);
  light.position.set(x, y, z);
  light.castShadow = true;

  scene.add(light);
  scene.add(light.target);

  const helper = new THREE.DirectionalLightHelper(light, 1);
  helper.visible = false;
  scene.add(helper);

  const STORAGE_KEY = guiName;
  const defaultParams = {
    positionX: 0.04999,
    positionY: 0.8,
    positionZ: -0.6,
    intensity,
    castShadow: true,
    color: 0xffffff,
    bias: 0,
    normalBias: 0.1,
    showHelper: false,
  };

  let params = { ...defaultParams };
  loadSettings(STORAGE_KEY, defaultParams, params);

  light.position.set(params.positionX, params.positionY, params.positionZ);
  light.intensity = params.intensity;
  light.castShadow = params.castShadow;
  light.color.set(params.color);
  light.shadow.bias = params.bias;
  light.shadow.normalBias = params.normalBias;
  helper.visible = params.showHelper;

  folder.add(params, "positionX", -10, 10, 0.01).onChange((val: number) => {
    light.position.x = val;
    saveSettings(STORAGE_KEY, params);
  });
  folder.add(params, "positionY", -10, 10, 0.01).onChange((val: number) => {
    light.position.y = val;
    saveSettings(STORAGE_KEY, params);
  });
  folder.add(params, "positionZ", -10, 10, 0.01).onChange((val: number) => {
    light.position.z = val;
    saveSettings(STORAGE_KEY, params);
  });
  folder.add(params, "intensity", 0, 100, 0.01).onChange((val: number) => {
    light.intensity = val;
    saveSettings(STORAGE_KEY, params);
  });
  folder.add(params, "castShadow").onChange((val: boolean) => {
    light.castShadow = val;
    saveSettings(STORAGE_KEY, params);
  });
  folder.addColor(params, "color").onChange((val: number) => {
    light.color.set(val);
    saveSettings(STORAGE_KEY, params);
  });
  folder.add(params, "bias", -1, 1, 0.0001).onChange((val: number) => {
    light.shadow.bias = val;
    saveSettings(STORAGE_KEY, params);
  });
  folder.add(params, "normalBias", -1, 1, 0.0001).onChange((val: number) => {
    light.shadow.normalBias = val;
    saveSettings(STORAGE_KEY, params);
  });
  folder.add(params, "showHelper").onChange((val: boolean) => {
    helper.visible = val;
    saveSettings(STORAGE_KEY, params);
  });
  folder.add(light, "visible");

  folder.add(
    {
      reset: () => {
        resetSettings(STORAGE_KEY, defaultParams, params, folder);
        saveSettings(STORAGE_KEY, defaultParams);
        light.position.set(
          params.positionX,
          params.positionY,
          params.positionZ
        );
        light.intensity = params.intensity;
        light.castShadow = params.castShadow;
        light.color.set(params.color);
        helper.visible = params.showHelper;
      },
    },
    "reset"
  );

  return light;
}
