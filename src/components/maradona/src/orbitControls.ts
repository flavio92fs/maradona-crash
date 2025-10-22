import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as THREE from "three";
import GUI from 'lil-gui';
import { loadSettings, resetSettings, saveSettings } from './saveLoadGUI';
import { gsap } from 'gsap';

export default class CameraControls{
    private _camera: THREE.PerspectiveCamera

    private _cameraMoves: {
        angleDeg: number; // in gradi per GUI
        zoom: number;
        duration: number;
        hold: number;
        }[] = [
            { angleDeg: 45, zoom: 1.5, duration: 3, hold: 1 },
            { angleDeg: -45, zoom: 2.0, duration: 3, hold: 1 },
            { angleDeg: 0, zoom: 1.2, duration: 3, hold: 2 },
        ];

    private _orbitControls: OrbitControls;

    private _minZoom: number = 1.5;
    private _maxZoom: number = 2.4;

    public get orbitControls(){
        return this._orbitControls;
    }
    
    constructor(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, gui?: GUI){
        this._camera = camera;

        this._orbitControls = new OrbitControls(camera, renderer.domElement);

        this._orbitControls.target.set(0, 0.17, 0);
        this._orbitControls.enableDamping = true;   // rende il movimento più fluido
        this._orbitControls.dampingFactor = 0.05;   // velocità di smorzamento

        this._orbitControls.minPolarAngle = 0.5;              // non andare più in alto di sopra
        this._orbitControls.maxPolarAngle = Math.PI / 2;    // non scendere sotto l’orizzonte

        this._orbitControls.minDistance = this._minZoom;
        this._orbitControls.maxDistance = this._maxZoom;

        this._orbitControls.enablePan = false;      // disabilita trascinamento piano XY (solo rotazione e zoom)

        this._orbitControls.update()

        if(gui){
            this.addGUIControls(gui);
            const initialAnimationGUI = gui?.addFolder('Initial Animation');
            this.addCameraAnimationGUI(initialAnimationGUI)
        }
    }

    private addGUIControls(gui: GUI){
        const folder = gui.addFolder('Camera Controls').close();

        const STORAGE_KEY = 'Camera Controls';

        const defaultParams = {
            minZoom: this._minZoom,
            maxZoom: this._maxZoom,
            targetX: 0,
            targetY: 0.22,
            targetZ: 0,
        }

        // valori iniziali
        let params = { ...defaultParams };

        this.orbitControls.minDistance = params.minZoom;
        this.orbitControls.maxDistance = params.maxZoom;
        this.orbitControls.target.set(params.targetX, params.targetY, params.targetZ);

        folder.add(params, 'minZoom', 0.1, 5, 0.1).onChange((v: number) => {
            this._orbitControls.minDistance = v;

            // assicura che min non superi max
            if (this._orbitControls.minDistance > this._orbitControls.maxDistance) {
                this._orbitControls.maxDistance = this._orbitControls.minDistance;
                params.maxZoom = this._orbitControls.maxDistance;
                folder.controllers.find(c => c.property === 'maxZoom')?.updateDisplay();
            }

            saveSettings(STORAGE_KEY, params);
        });

        // max zoom
        folder.add(params, 'maxZoom', 0.1, 10, 0.1).onChange((v: number) => {
            this._orbitControls.maxDistance = v;

            // assicura che max non sia sotto min
            if (this._orbitControls.maxDistance < this._orbitControls.minDistance) {
                this._orbitControls.minDistance = this._orbitControls.maxDistance;
                params.minZoom = this._orbitControls.minDistance;
                folder.controllers.find(c => c.property === 'minZoom')?.updateDisplay();
            }

            saveSettings(STORAGE_KEY, params);

        });

        // target (lookAt)
        folder.add(params, 'targetX', -5, 5, 0.01).onChange((v: number) => {
            this._orbitControls.target.x = v;
            this._orbitControls.update();
            saveSettings(STORAGE_KEY, params);
        });
        folder.add(params, 'targetY', -5, 5, 0.01).onChange((v: number) => {
            this._orbitControls.target.y = v;
            this._orbitControls.update();
            saveSettings(STORAGE_KEY, params);
        });
        folder.add(params, 'targetZ', -5, 5, 0.01).onChange((v: number) => {
            this._orbitControls.target.z = v;
            this._orbitControls.update();
            saveSettings(STORAGE_KEY, params);
        });

        const resetInput = {
            reset: () => {
            resetSettings(STORAGE_KEY, defaultParams, params, folder);
            saveSettings(STORAGE_KEY, defaultParams);
    
            this.orbitControls.minDistance = params.minZoom;
            this.orbitControls.maxDistance = params.maxZoom;
            this.orbitControls.target.set(params.targetX, params.targetY, params.targetZ);

            this._orbitControls.update()

            folder.controllers.forEach(controller => controller.updateDisplay());
            }
        }

        folder.add(resetInput, 'reset');
    }

    private startAnimation() {
        const rotation = { angle: 0 };
        const baseDistance = 5;
        const tl = gsap.timeline();

        this._cameraMoves.forEach((move) => {
            const angle = move.angleDeg * Math.PI / 180;

            tl.to(rotation, {
            angle,
            duration: move.duration,
            ease: "power2.inOut",
            onUpdate: () => this.updateCamera(rotation, baseDistance),
            });

            tl.to(this._camera, {
            zoom: move.zoom,
            duration: move.duration,
            ease: "power2.inOut",
            onUpdate: () => this._camera.updateProjectionMatrix(),
            }, "<");

            tl.to({}, { duration: move.hold });
        });
    }

    private updateCamera(rotation: {angle: number}, baseDistance: number) {
        this._camera.position.x = Math.sin(rotation.angle) * baseDistance;
        this._camera.position.z = Math.cos(rotation.angle) * baseDistance;
        this._camera.lookAt(this._orbitControls.target);
    }   

    private addCameraAnimationGUI(gui: GUI) {
        const STORAGE_KEY = "CameraAnimation";
        const folder = gui.addFolder("Camera Animation").close();

        const addMoveFolder = (move: any, index: number) => {
            const moveFolder = folder.addFolder(`Move ${index + 1}`);

            moveFolder.add(move, "angleDeg", -720, 720, 1).name("Angle (°)").onChange(() => this.saveCameraMoves(STORAGE_KEY));
            moveFolder.add(move, "zoom", 0.5, 5, 0.1).onChange(() => this.saveCameraMoves(STORAGE_KEY));
            moveFolder.add(move, "duration", 0.1, 10, 0.1).onChange(() => this.saveCameraMoves(STORAGE_KEY));
            moveFolder.add(move, "hold", 0, 5, 0.1).onChange(() => this.saveCameraMoves(STORAGE_KEY));

            const removeBtn = { remove: () => {
            this._cameraMoves.splice(index, 1);
            moveFolder.destroy();
            this.saveCameraMoves(STORAGE_KEY);
            this.rebuildCameraAnimationGUI(gui); // ricrea tutto
            }};
            moveFolder.add(removeBtn, "remove").name("🗑️ Remove");
        };

        // pulsante per aggiungere nuovi step
        const addBtn = {
            add: () => {
            this._cameraMoves.push({ angleDeg: 0, zoom: 1.5, duration: 2, hold: 1 });
            this.saveCameraMoves(STORAGE_KEY);
            this.rebuildCameraAnimationGUI(gui);
            }
        };

        folder.add(addBtn, "add").name("➕ Add Move");

        // crea le sotto-folder
        this._cameraMoves.forEach((move, i) => addMoveFolder(move, i));

        // play
        folder.add({ play: () => this.startAnimation() }, "play").name("▶️ Play Animation");
    }

    private rebuildCameraAnimationGUI(gui: GUI) {
    // rimuove la vecchia folder e la ricrea
        const oldFolder = gui.folders.find(f => f._title === "Camera Animation");
        if (oldFolder) oldFolder.destroy();
        this.addCameraAnimationGUI(gui);
    }

    private saveCameraMoves(key: string) {
        localStorage.setItem(key, JSON.stringify(this._cameraMoves));
    }

    private loadCameraMoves(key: string) {
        const saved = localStorage.getItem(key);
        if (saved) this._cameraMoves = JSON.parse(saved);
    }
}