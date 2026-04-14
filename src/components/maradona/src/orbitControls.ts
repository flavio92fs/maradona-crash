import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as THREE from "three";
import GUI from 'lil-gui';
import { loadSettings, resetSettings, saveSettings } from './saveLoadGUI';
import { gsap } from 'gsap';


export default class CameraControls{
    private _camera: THREE.PerspectiveCamera
    private folder: GUI | undefined;

    private _cameraMoves: {
        angleDeg: number; // in gradi per GUI
        distance: number;
        duration: number;
        hold: number;
        }[] = [
            { angleDeg: 90, distance: 0.4, duration: 1, hold: 0.5 },
            { angleDeg: -180, distance: 2, duration: 3, hold: 0.5 },
            { angleDeg: 180, distance: 2, duration: 3, hold: 0.5 },
        ];

    private _orbitControls: OrbitControls;

    private _targetY: number = 0.1;
    private _minZoom: number = 1.5;
    private _maxZoom: number = 2.4;

    public get orbitControls(){
        return this._orbitControls;
    }
    
    constructor(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, container: HTMLElement, gui?: GUI){
        this._camera = camera;

        if(window.innerWidth < window.innerHeight){ 
            this._targetY = this.calculateTargetY(container.clientHeight)
            this._minZoom = this.calculateMinZoom(container.clientHeight)
        }

        this._orbitControls = new OrbitControls(camera, renderer.domElement);

        this._orbitControls.target.set(0, this._targetY, 0);
        this._orbitControls.enableDamping = true;   // rende il movimento più fluido
        this._orbitControls.dampingFactor = 0.05;   // velocità di smorzamento

        this._orbitControls.minPolarAngle = 0.5;              // non andare più in alto di sopra
        this._orbitControls.maxPolarAngle = Math.PI / 2;    // non scendere sotto l’orizzonte

        this._orbitControls.minDistance = this._minZoom;
        this._orbitControls.maxDistance = this._maxZoom;

        this._orbitControls.enablePan = false;      // disabilita trascinamento piano XY (solo rotazione e zoom)

        this._orbitControls.update()

        if(gui){
            this.folder = gui.addFolder('Camera Controls').close();

            this.addGUIControls(this.folder);
            const initialAnimationGUI = gui?.addFolder('Camera Start Animation').close();

            const startAnimation = {
                startAnimation: () => { this.startAnimation(); }
            }

            initialAnimationGUI.add(startAnimation, 'startAnimation').name('Start Animation');

        }
    }

    public calculateTargetY(height: number) {
        const h1 = 950;
        const h2 = 667;
        const targetY1 = 0.18;
        const targetY2 = 0.1;

        let newTargetY = targetY1;

        if (height < h1) {
            if (height <= h2) {
            newTargetY = targetY2;
            } else {
            // interpolazione lineare tra 950 e 667
            const t = (height - h2) / (h1 - h2);
            newTargetY = targetY2 + (targetY1 - targetY2) * t;
            }
        }

        return newTargetY

        // // 🔹 Aggiorna il target
        // this._orbitControls.target.y = newY;
        // this._orbitControls.update();
    }

    public calculateMinZoom(height: number) {
        const h1 = 950;
        const h2 = 667;
        const zoom1 = 1.7;
        const zoom2 = 1.7;

        let newMinZoom = zoom1;

        if (height < h1) {
            if (height <= h2) {
            newMinZoom = zoom2;
            } else {
            // interpolazione lineare tra 950 e 667
            const t = (height - h2) / (h1 - h2);
            newMinZoom = zoom2 + (zoom1 - zoom2) * t;
            }
        }

        return newMinZoom;

        // this._orbitControls.update();
        // this._camera.lookAt(this._orbitControls.target);
    }

    private addGUIControls(folder: GUI){
        const STORAGE_KEY = 'Camera Controls';

        const defaultParams = {
            minZoom: this._minZoom,
            maxZoom: this._maxZoom,
            targetX: 0,
            targetY: this._targetY,
            targetZ: 0,
        }

        // valori iniziali
        let params = { ...defaultParams };

        this.orbitControls.minDistance = params.minZoom;
        this.orbitControls.maxDistance = params.maxZoom;
        this.orbitControls.target.set(params.targetX, params.targetY, params.targetZ);

        folder.add(params, 'minZoom', this._minZoom, 5, 0.1).onChange((v: number) => {
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
        folder.add(params, 'maxZoom', 0.1, 20, 0.1).onChange((v: number) => {
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
        folder.add(params, 'targetY', this._targetY, 5, 0.01).onChange((v: number) => {
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

    public startAnimation() {
        const rotation = { angle: 0 };
        const tl = gsap.timeline();
        const distance = { value: this._orbitControls.getDistance() };

        this._orbitControls.enabled = false;
        this._orbitControls.minDistance = 0.001;
        this._orbitControls.maxDistance = Infinity;

        this._cameraMoves.forEach((move) => {
            const angle = move.angleDeg * Math.PI / 180;
            // const targetDistance = THREE.MathUtils.clamp(
            //     move.distance,
            //     this._orbitControls.minDistance,
            //     this._orbitControls.maxDistance
            // );

            tl.to(rotation, {
                angle,
                duration: move.duration,
                ease: "power2.inOut",
                onUpdate: () => this.updateCamera(rotation, distance.value),
            });

            tl.to(distance, {
                value: move.distance,
                duration: move.duration,
                ease: "power2.inOut",
                onUpdate: () => this._camera.updateProjectionMatrix(),
            }, "<");

            tl.to({}, { 
                duration: move.hold
            });
        });

        // const finalAngle = 180;
        // // 👆 1.8 è un valore “preferito” che vuoi raggiungere, ma viene forzato nei limiti

        // // 🔹 Step finale: animazione verso la posizione/zoom finale
        // tl.to(rotation, {
        //     angle: finalAngle * Math.PI / 180,
        //     duration: 2,
        //     ease: "power2.inOut",
        //     onUpdate: () => this.updateCamera(rotation, baseDistance),
        // });

        // tl.to(this._camera, {
        //     zoom: 1,
        //     duration: 2,
        //     ease: "power2.inOut",
        //     onUpdate: () => this._camera.updateProjectionMatrix(),
        // }, "<");

        // // (Facoltativo) chiama qualcosa quando è tutto finito
        tl.eventCallback("onComplete", () => {
            this._orbitControls.minDistance = this._minZoom;
            this._orbitControls.maxDistance = this._maxZoom;
            this._camera.zoom = 1;
            this._camera.updateProjectionMatrix();
            this._orbitControls.enabled = true;
            console.log("✅ Animazione completata — camera in posizione finale");
        });
    }

    private setOrbitDistance(distance: number) {
        // 1️⃣ calcola la direzione (dal target alla camera)
        const dir = new THREE.Vector3()
            .copy(this._camera.position)
            .sub(this._orbitControls.target)
            .normalize();

        // 2️⃣ posiziona la camera lungo quella direzione alla distanza richiesta
        this._camera.position.copy(
            new THREE.Vector3().copy(this._orbitControls.target).add(dir.multiplyScalar(distance))
        );

        // 3️⃣ aggiorna i controlli
        this._orbitControls.update();
    }

    private updateCamera(rotation: {angle: number}, baseDistance: number) {
        this._camera.position.x = Math.sin(rotation.angle) * baseDistance;
        this._camera.position.z = Math.cos(rotation.angle) * baseDistance;
        this._camera.lookAt(this._orbitControls.target);
    }

    // private resetCameraAfterAnimation() {
    //     // 🔹 Ripristina i limiti di zoom ai valori di default
    //     this._orbitControls.minDistance = this._minZoom;
    //     this._orbitControls.maxDistance = this._maxZoom;

    //     // 🔹 Ripristina lo zoom effettivo della camera
    //     this._camera.zoom = 1;
    //     this._camera.updateProjectionMatrix();

    //     // 🔹 Posiziona la camera a una distanza valida (es. al minZoom)
    //     const distance = this._minZoom;
    //     const angle = 0; // o qualunque angolo desideri come posizione di default

    //     this._camera.position.x = Math.sin(angle) * distance;
    //     this._camera.position.z = Math.cos(angle) * distance;
    //     this._camera.position.y = this._orbitControls.target.y + 0.5; // leggermente sopra il target (opzionale)

    //     // 🔹 Aggiorna l’orientamento
    //     this._camera.lookAt(this._orbitControls.target);

    //     // 🔹 Aggiorna i controlli
    //     this._orbitControls.update();
    // }

    // private addCameraAnimationGUI(gui: GUI) {
    //     const STORAGE_KEY = "CameraAnimation";
    //     const folder = gui.addFolder("Camera Animation").close();

    //     const addMoveFolder = (move: any, index: number) => {
    //         const moveFolder = folder.addFolder(`Move ${index + 1}`);

    //         moveFolder.add(move, "angleDeg", -720, 720, 1).name("Angle (°)").onChange(() => this.saveCameraMoves(STORAGE_KEY));
    //         moveFolder.add(move, "zoom", 0.5, 5, 0.1).onChange(() => this.saveCameraMoves(STORAGE_KEY));
    //         moveFolder.add(move, "duration", 0.1, 10, 0.1).onChange(() => this.saveCameraMoves(STORAGE_KEY));
    //         moveFolder.add(move, "hold", 0, 5, 0.1).onChange(() => this.saveCameraMoves(STORAGE_KEY));

    //         const removeBtn = { remove: () => {
    //         this._cameraMoves.splice(index, 1);
    //         moveFolder.destroy();
    //         this.saveCameraMoves(STORAGE_KEY);
    //         this.rebuildCameraAnimationGUI(gui); // ricrea tutto
    //         }};
    //         moveFolder.add(removeBtn, "remove").name("🗑️ Remove");
    //     };

    //     // pulsante per aggiungere nuovi step
    //     const addBtn = {
    //         add: () => {
    //         this._cameraMoves.push({ angleDeg: 0, zoom: 1.5, duration: 2, hold: 1 });
    //         this.saveCameraMoves(STORAGE_KEY);
    //         this.rebuildCameraAnimationGUI(gui);
    //         }
    //     };

    //     folder.add(addBtn, "add").name("➕ Add Move");

    //     // crea le sotto-folder
    //     this._cameraMoves.forEach((move, i) => addMoveFolder(move, i));

    //     // play
    //     folder.add({ play: () => this.startAnimation() }, "play").name("▶️ Play Animation");
    // }

    // private rebuildCameraAnimationGUI(gui: GUI) {
    // // rimuove la vecchia folder e la ricrea
    //     const oldFolder = gui.folders.find(f => f._title === "Camera Animation");
    //     if (oldFolder) oldFolder.destroy();
    //     this.addCameraAnimationGUI(gui);
    // }

    // private saveCameraMoves(key: string) {
    //     localStorage.setItem(key, JSON.stringify(this._cameraMoves));
    // }

    // private loadCameraMoves(key: string) {
    //     const saved = localStorage.getItem(key);
    //     if (saved) this._cameraMoves = JSON.parse(saved);
    // }
}