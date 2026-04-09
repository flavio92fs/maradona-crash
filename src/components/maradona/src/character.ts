import * as THREE from "three";
import GUI from "lil-gui";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { addMaterialGUI, addSuitsGUI } from "./guiHelpers";

export function addMaradona(
  scene: THREE.Scene,
  fbxLoader: FBXLoader,
  materialsGUI: GUI,
  animationsGUI: GUI,
  textureLoader: THREE.TextureLoader,
  materialLibrary: Record<string, THREE.Material>,
  suitsTextures: Record<string, THREE.Texture>,
  onLoaded: (mixer: THREE.AnimationMixer) => void
) {
  fbxLoader.load("models/maradona_single_file.fbx", (model) => {
    model.scale.set(0.01, 0.01, 0.01);

    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.Material;

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (
          ["divisa", "colletto_ai", "maglietta_ai", "pantaloncini_ai", "gambe_ai"].includes(mat.name)
        ) {
          mesh.material = materialLibrary["divisa"]!;
        }
        if (mat.name === "capelli") {
          mesh.material = materialLibrary["capelli"]!;
        }
        if (["pelle", "pelle_ai", "occhi_ai"].includes(mat.name)) {
          mesh.material = materialLibrary["pelle"]!;
        }
        if (mat.name === "palla") {
          mesh.material = materialLibrary["palla"]!;
        }
      }
    });

    scene.add(model);

    addSuitsGUI(
      materialsGUI,
      materialLibrary["divisa"] as THREE.MeshStandardMaterial,
      textureLoader,
      suitsTextures
    );
    addMaterialGUI(
      materialsGUI,
      materialLibrary["capelli"] as THREE.MeshStandardMaterial,
      textureLoader
    );
    addMaterialGUI(
      materialsGUI,
      materialLibrary["pelle"] as THREE.MeshStandardMaterial,
      textureLoader
    );
    addMaterialGUI(
      materialsGUI,
      materialLibrary["palla"] as THREE.MeshBasicMaterial,
      textureLoader
    );

    const mixer = new THREE.AnimationMixer(model);
    const actions: Record<string, THREE.AnimationAction> = {};
    const subActions: Record<string, THREE.AnimationAction> = {};

    model.animations.forEach((clip) => { actions[clip.name] = mixer.clipAction(clip);});

    function addSubAction(
      baseAction: THREE.AnimationAction,
      subName: string,
      start: number,
      end: number,
      fps: number
    ) {
      const subClip = THREE.AnimationUtils.subclip(
        baseAction.getClip(),
        subName,
        start,
        end,
        fps
      );
      const subAction = mixer.clipAction(subClip);
      subActions[subName] = subAction;
      return subAction;
    }

    addSubAction(actions["start"]!, "start", 297, 384, 30).setLoop(
      THREE.LoopOnce,
      0
    );
    addSubAction(
      actions["palleggio_loop1"]!,
      "palleggio1",
      385,
      684,
      30
    );
    addSubAction(
      actions["palleggio_loop2"]!,
      "palleggio2",
      685,
      986,
      30
    );
    addSubAction(actions["riscaldamento"]!, "riscaldamento", 1, 296, 30);

    let currentAction = subActions["riscaldamento"]!;
    currentAction.play();

    function fadeToAction(
      nextAction: THREE.AnimationAction,
      duration = 0.1
    ) {
      if (currentAction !== nextAction) {
        nextAction.reset().play();
        nextAction.enabled = true;
        if (currentAction) {
          currentAction.crossFadeTo(nextAction, duration, false);
        }
        currentAction = nextAction;
      }
    }

    const animControls = {
      riscaldamento: () => fadeToAction(subActions["riscaldamento"]!, 0.5),

      palleggio1: () => {
        const startAct = subActions["start"]!;
        startAct.setLoop(THREE.LoopOnce, 0);
        startAct.clampWhenFinished = true;
        startAct.reset();
        fadeToAction(startAct, 0);

        const onFinished = (e: any) => {
          if (e.action === startAct) {
            fadeToAction(subActions["palleggio1"]!, 0.5);
            mixer.removeEventListener("finished", onFinished);
          }
        };
        mixer.addEventListener("finished", onFinished);
      },

      palleggio2: () => {
        const startAct = subActions["start"]!;
        startAct.setLoop(THREE.LoopOnce, 0);
        startAct.clampWhenFinished = true;
        startAct.reset();
        fadeToAction(startAct, 0.5);

        const onFinished = (e: any) => {
          if (e.action === startAct) {
            fadeToAction(subActions["palleggio2"]!, 0);
            mixer.removeEventListener("finished", onFinished);
          }
        };
        mixer.addEventListener("finished", onFinished);
      },
    };

    animationsGUI
      .add(animControls, "riscaldamento")
      .name("🏃 Riscaldamento");
    animationsGUI.add(animControls, "palleggio1").name("⚽ Palleggio 1");
    animationsGUI.add(animControls, "palleggio2").name("⚽ Palleggio 2");
    animationsGUI.close();

    onLoaded(mixer);
  });
}
