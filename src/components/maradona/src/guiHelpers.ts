import * as THREE from "three";
import GUI from "lil-gui";
import { loadSettings, saveSettings, resetSettings } from "./saveLoadGUI";



export function addUiGUI(gui: GUI) {
  const STORAGE_KEY = "UI";
  const gameMultiplier = document.getElementById("game-multiplier");
  const app = document.getElementById("app");
  const amountInput = document.querySelectorAll<HTMLElement>(".amount-input");
  const folder = gui.addFolder("UI").close();

  const defaultParams = {
    mainBackgroundColor: "#ffffff",
    globalTextColor: "#ffffff",
    amountInputBgColor: "#ffffff",
    showMultiplier: true,
    positionY: 74,
    scale: 0,
  };

  let params = { ...defaultParams };
  loadSettings(STORAGE_KEY, defaultParams, params);

  gameMultiplier!.style.top = params.positionY.toString() + "%";

  function showMultiplier(show: boolean) {
    gameMultiplier!.style.visibility = show ? "visible" : "hidden";
  }

  showMultiplier(params.showMultiplier);

  folder.addColor(params, "mainBackgroundColor").onChange((val: string) => {
    app!.style.backgroundColor = val;
    saveSettings(STORAGE_KEY, params);
  });

  folder.addColor(params, "globalTextColor").onChange((val: string) => {
    app!.style.color = val;
    saveSettings(STORAGE_KEY, params);
  });

  folder.addColor(params, "amountInputBgColor").onChange((val: string) => {
    amountInput.forEach((el) => (el.style.backgroundColor = val));
    saveSettings(STORAGE_KEY, params);
  });

  folder.add(params, "showMultiplier").onChange((val: boolean) => {
    showMultiplier(val);
    saveSettings(STORAGE_KEY, params);
  });

  folder.add(params, "positionY", 0, 100, 0.01).onChange((val: number) => {
    gameMultiplier!.style.top = `${val}%`;
    saveSettings(STORAGE_KEY, params);
  });

  folder.add(
    {
      reset: () => {
        resetSettings(STORAGE_KEY, defaultParams, params, folder);
        showMultiplier(params.showMultiplier);
        gameMultiplier!.style.top = params.positionY.toString() + "%";
      },
    },
    "reset"
  );
}

export function addMaterialGUI(
  gui: GUI,
  material: THREE.MeshStandardMaterial | THREE.MeshBasicMaterial,
  textureLoader: THREE.TextureLoader,
  guiName?: string
) {
  const STORAGE_KEY = `material_${material.name}`;

  const defaultParams = {
    color: "#ffffff",
    emissive: "#000000",
    metalness: 0,
    roughness: 1,
    texturePath: "",
    offsetX: 0,
    offsetY: 0,
  };

  let params = { ...defaultParams };
  loadSettings(STORAGE_KEY, defaultParams, params);

  material.color.set(params.color);
  if (material instanceof THREE.MeshStandardMaterial) {
    material.emissive.set(params.emissive);
    material.metalness = params.metalness;
    material.roughness = params.roughness;
  }

  const materialGUI = gui.addFolder(guiName ?? material.name).close();

  materialGUI
    .add(
      {
        loadTexture: () => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".png,.jpg,.jpeg,.webp";
          input.addEventListener("change", (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const url = URL.createObjectURL(file);
            textureLoader.load(url, (tex) => {
              tex.colorSpace = THREE.SRGBColorSpace;
              tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
              tex.repeat.set(1, 1);
              tex.offset.set(params.offsetX, params.offsetY);
              material.map = tex;
              material.needsUpdate = true;
              params.texturePath = file.name;
              saveSettings(STORAGE_KEY, params);
            });
          });
          input.click();
        },
      },
      "loadTexture"
    )
    .name("Carica Texture");

  materialGUI.addColor(params, "color").onChange((val: string) => {
    material.color.set(val);
    saveSettings(STORAGE_KEY, params);
  });

  if (material instanceof THREE.MeshStandardMaterial) {
    const stdMat = material;
    materialGUI
      .add(params, "metalness", 0, 1, 0.01)
      .onChange((val: number) => {
        stdMat.metalness = val;
        stdMat.needsUpdate = true;
        saveSettings(STORAGE_KEY, params);
      });

    materialGUI
      .add(params, "roughness", 0, 1, 0.01)
      .onChange((val: number) => {
        stdMat.roughness = val;
        stdMat.needsUpdate = true;
        saveSettings(STORAGE_KEY, params);
      });

    materialGUI
      .addColor(params, "emissive")
      .name("Emissive")
      .onChange((val: string) => {
        stdMat.emissive.set(val);
        saveSettings(STORAGE_KEY, params);
      });
  }

  const offsetFolder = materialGUI.addFolder("Texture Offset");
  offsetFolder
    .add(params, "offsetX", -1, 1, 0.01)
    .name("Offset X")
    .onChange((v: number) => {
      if (material.map) {
        material.map.offset.x = v;
        material.map.needsUpdate = true;
      }
      saveSettings(STORAGE_KEY, params);
    });

  offsetFolder
    .add(params, "offsetY", -1, 1, 0.01)
    .name("Offset Y")
    .onChange((v: number) => {
      if (material.map) {
        material.map.offset.y = v;
        material.map.needsUpdate = true;
      }
      saveSettings(STORAGE_KEY, params);
    });
}

export function addSuitsGUI(
  gui: GUI,
  material: THREE.MeshStandardMaterial | THREE.MeshBasicMaterial,
  textureLoader: THREE.TextureLoader,
  suitsTextures: Record<string, THREE.Texture>,
  guiName?: string
) {
  const STORAGE_KEY = `material_${material.name}`;
  const selectedSuit = { selected: "Napoli Ufficiale" };

  const suitMap: Record<string, string> = {
    Argentina: "argentina",
    Barcellona: "barcellona",
    Boca: "boca",
    "Napoli Ufficiale": "napoliUfficiale",
    Napoli: "napoli",
    Sevilla: "sevilla",
  };

  const defaultParams = {
    color: "#ffffff",
    emissive: "#000000",
    metalness: 0,
    roughness: 1,
    texturePath: "",
    offsetX: 0,
    offsetY: 0,
    suit: "Napoli Ufficiale",
  };

  let params = { ...defaultParams };
  loadSettings(STORAGE_KEY, defaultParams, params);

  material.color.set(params.color);
  if (material instanceof THREE.MeshStandardMaterial) {
    material.emissive.set(params.emissive);
    material.metalness = params.metalness;
    material.roughness = params.roughness;
  }

  const materialGUI = gui.addFolder(guiName ?? material.name).close();

  materialGUI
    .add(
      {
        loadTexture: () => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".png,.jpg,.jpeg,.webp";
          input.addEventListener("change", (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const url = URL.createObjectURL(file);
            textureLoader.load(url, (tex) => {
              tex.colorSpace = THREE.SRGBColorSpace;
              tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
              tex.repeat.set(1, 1);
              tex.offset.set(params.offsetX, params.offsetY);
              material.map = tex;
              material.needsUpdate = true;
              params.texturePath = file.name;
              saveSettings(STORAGE_KEY, params);
            });
          });
          input.click();
        },
      },
      "loadTexture"
    )
    .name("Carica Texture");

  materialGUI
    .add(
      selectedSuit,
      "selected",
      Object.keys(suitMap)
    )
    .name("Seleziona Divisa")
    .onChange((val: string) => {
      const key = suitMap[val];
      if (key && suitsTextures[key]) {
        material.map = suitsTextures[key]!;
      }
    });

  materialGUI.addColor(params, "color").onChange((val: string) => {
    material.color.set(val);
    saveSettings(STORAGE_KEY, params);
  });

  if (material instanceof THREE.MeshStandardMaterial) {
    const stdMat = material;
    materialGUI
      .add(params, "metalness", 0, 1, 0.01)
      .onChange((val: number) => {
        stdMat.metalness = val;
        stdMat.needsUpdate = true;
        saveSettings(STORAGE_KEY, params);
      });

    materialGUI
      .add(params, "roughness", 0, 1, 0.01)
      .onChange((val: number) => {
        stdMat.roughness = val;
        stdMat.needsUpdate = true;
        saveSettings(STORAGE_KEY, params);
      });

    materialGUI
      .addColor(params, "emissive")
      .name("Emissive")
      .onChange((val: string) => {
        stdMat.emissive.set(val);
        saveSettings(STORAGE_KEY, params);
      });
  }

  const offsetFolder = materialGUI.addFolder("Texture Offset");
  offsetFolder
    .add(params, "offsetX", -1, 1, 0.01)
    .name("Offset X")
    .onChange((v: number) => {
      if (material.map) {
        material.map.offset.x = v;
        material.map.needsUpdate = true;
      }
      saveSettings(STORAGE_KEY, params);
    });

  offsetFolder
    .add(params, "offsetY", -1, 1, 0.01)
    .name("Offset Y")
    .onChange((v: number) => {
      if (material.map) {
        material.map.offset.y = v;
        material.map.needsUpdate = true;
      }
      saveSettings(STORAGE_KEY, params);
    });
}
