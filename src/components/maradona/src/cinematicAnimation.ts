import * as THREE from "three";
import GUI from "lil-gui";
import CameraControls from "./orbitControls";
import { gsap } from "gsap";

/** Flag checked in the animate loop to skip orbit controls update during cinematic. */
export const cinematicState = { active: false };

const CINEMATIC_TARGET = {
  camera: {
    x: 0,
    y: 12,
    z: -16,
  },
  ambientIntensity: 0.1,
  spotlight: {
    positionX: 0,
    positionY: 3.46,
    positionZ: -0.33,
    targetPositionY: 0,
    cone: 1.08,
    borderHardness: 0.15,
    intensity: 42.96,
  },
};

interface SavedState {
  cameraPos: THREE.Vector3;
  ambientIntensity: number;
  spotlightPos: THREE.Vector3;
  spotlightTargetY: number;
  spotlightAngle: number;
  spotlightPenumbra: number;
  spotlightIntensity: number;
  orbitMaxDistance: number;
  orbitMinDistance: number;
}

export function setupCinematicAnimation(
  gui: GUI,
  camera: THREE.PerspectiveCamera,
  cameraControls: CameraControls,
  ambientLight: THREE.AmbientLight,
  spotLight: THREE.SpotLight,
  videoGrassPlane: THREE.Group
) {
  const folder = gui.addFolder("Cinematic");
  let savedState: SavedState | null = null;
  let activeTimeline: gsap.core.Timeline | null = null;

  // Video grass plane starts invisible
  setGroupOpacity(videoGrassPlane, 0);

  function captureState(): SavedState {
    return {
      cameraPos: camera.position.clone(),
      ambientIntensity: ambientLight.intensity,
      spotlightPos: spotLight.position.clone(),
      spotlightTargetY: spotLight.target.position.y,
      spotlightAngle: spotLight.angle,
      spotlightPenumbra: spotLight.penumbra,
      spotlightIntensity: spotLight.intensity,
      orbitMaxDistance: cameraControls.orbitControls.maxDistance,
      orbitMinDistance: cameraControls.orbitControls.minDistance,
    };
  }

  function playCinematic() {
    if (cinematicState.active) return;

    savedState = captureState();
    cinematicState.active = true;
    cameraControls.orbitControls.enabled = false;
    cameraControls.orbitControls.maxDistance = 20;

    if (activeTimeline) activeTimeline.kill();
    const tl = gsap.timeline();
    activeTimeline = tl;

    const lookAt = cameraControls.orbitControls.target.clone();

    // Camera dezoom
    tl.to(camera.position, {
      x: CINEMATIC_TARGET.camera.x,
      y: CINEMATIC_TARGET.camera.y,
      z: CINEMATIC_TARGET.camera.z,
      duration: 3,
      ease: "power2.inOut",
      onUpdate: () => camera.lookAt(lookAt),
    });

    // Ambient light dim
    tl.to(ambientLight, {
      intensity: CINEMATIC_TARGET.ambientIntensity,
      duration: 2,
      ease: "power2.inOut",
    }, "<");

    // Spotlight position
    tl.to(spotLight.position, {
      x: CINEMATIC_TARGET.spotlight.positionX,
      y: CINEMATIC_TARGET.spotlight.positionY,
      z: CINEMATIC_TARGET.spotlight.positionZ,
      duration: 2,
      ease: "power2.inOut",
      onUpdate: () => spotLight.target.updateMatrixWorld(),
    }, "<");

    // Spotlight params
    tl.to(spotLight, {
      angle: CINEMATIC_TARGET.spotlight.cone,
      penumbra: CINEMATIC_TARGET.spotlight.borderHardness,
      intensity: CINEMATIC_TARGET.spotlight.intensity,
      duration: 2,
      ease: "power2.inOut",
    }, "<");

    // Spotlight target
    tl.to(spotLight.target.position, {
      y: CINEMATIC_TARGET.spotlight.targetPositionY,
      duration: 2,
      ease: "power2.inOut",
      onUpdate: () => spotLight.target.updateMatrixWorld(),
    }, "<");

    // Video grass plane fade in
    const opacityProxy = { value: 0 };
    tl.to(opacityProxy, {
      value: 1,
      duration: 2,
      ease: "power2.inOut",
      onUpdate: () => setGroupOpacity(videoGrassPlane, opacityProxy.value),
    }, "<");
  }

  function resetCinematic() {
    if (!cinematicState.active || !savedState) return;

    if (activeTimeline) activeTimeline.kill();
    const tl = gsap.timeline();
    activeTimeline = tl;
    const state = savedState;
    const lookAt = cameraControls.orbitControls.target.clone();

    // Camera
    tl.to(camera.position, {
      x: state.cameraPos.x,
      y: state.cameraPos.y,
      z: state.cameraPos.z,
      duration: 2,
      ease: "power2.inOut",
      onUpdate: () => camera.lookAt(lookAt),
    });

    // Ambient light
    tl.to(ambientLight, {
      intensity: state.ambientIntensity,
      duration: 2,
      ease: "power2.inOut",
    }, "<");

    // Spotlight position
    tl.to(spotLight.position, {
      x: state.spotlightPos.x,
      y: state.spotlightPos.y,
      z: state.spotlightPos.z,
      duration: 2,
      ease: "power2.inOut",
      onUpdate: () => spotLight.target.updateMatrixWorld(),
    }, "<");

    // Spotlight params
    tl.to(spotLight, {
      angle: state.spotlightAngle,
      penumbra: state.spotlightPenumbra,
      intensity: state.spotlightIntensity,
      duration: 2,
      ease: "power2.inOut",
    }, "<");

    // Spotlight target
    tl.to(spotLight.target.position, {
      y: state.spotlightTargetY,
      duration: 2,
      ease: "power2.inOut",
      onUpdate: () => spotLight.target.updateMatrixWorld(),
    }, "<");

    // Video grass plane fade out
    const currentOpacity = getGroupOpacity(videoGrassPlane);
    const opacityProxy = { value: currentOpacity };
    tl.to(opacityProxy, {
      value: 0,
      duration: 2,
      ease: "power2.inOut",
      onUpdate: () => setGroupOpacity(videoGrassPlane, opacityProxy.value),
    }, "<");

    tl.eventCallback("onComplete", () => {
      cameraControls.orbitControls.maxDistance = state.orbitMaxDistance;
      cameraControls.orbitControls.minDistance = state.orbitMinDistance;
      cameraControls.orbitControls.enabled = true;
      cinematicState.active = false;
      savedState = null;
    });
  }

  folder.add({ play: playCinematic }, "play").name("Play Cinematic");
  folder.add({ reset: resetCinematic }, "reset").name("Reset");
}

function setGroupOpacity(group: THREE.Group, opacity: number) {
  group.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mat = (child as THREE.Mesh).material as THREE.Material;
      mat.transparent = true;
      mat.opacity = opacity;
    }
  });
}

function getGroupOpacity(group: THREE.Group): number {
  let opacity = 0;
  group.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      opacity = ((child as THREE.Mesh).material as THREE.Material).opacity;
    }
  });
  return opacity;
}
