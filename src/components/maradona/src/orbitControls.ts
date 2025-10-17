import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as THREE from "three";
import GUI from 'lil-gui';
import { loadSettings, resetSettings, saveSettings } from './saveLoadGUI';

export default class CameraControls{
    private _orbitControls: OrbitControls;

    private _minZoom: number = 0.8;
    private _maxZoom: number = 1.4;

    public get orbitControls(){
        return this._orbitControls;
    }
    
    constructor(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, gui?: GUI){
        this._orbitControls = new OrbitControls(camera, renderer.domElement);

        this._orbitControls.target.set(0, 0.17, 0);
        this._orbitControls.enableDamping = true;   // rende il movimento più fluido
        this._orbitControls.dampingFactor = 0.05;   // velocità di smorzamento

        this._orbitControls.minPolarAngle = 0.5;              // non andare più in alto di sopra
        this._orbitControls.maxPolarAngle = Math.PI / 2;    // non scendere sotto l’orizzonte

        this._orbitControls.minDistance = 1.7;
        this._orbitControls.maxDistance = 2.4;

        this._orbitControls.enablePan = false;      // disabilita trascinamento piano XY (solo rotazione e zoom)

        this._orbitControls.update()

        if(gui){
            this.addGUIControls(gui);
        }
    }

    private addGUIControls(gui: GUI){
        const folder = gui.addFolder('Camera Controls').close();

        const STORAGE_KEY = 'Camera Controls';

        const defaultParams = {
            minZoom: 1.7,
            maxZoom: 2.4,
            targetX: 0,
            targetY: 0.17,
            targetZ: 0,
        }

        // valori iniziali
        const params = loadSettings(STORAGE_KEY, defaultParams);

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
            resetSettings(STORAGE_KEY, defaultParams);
            saveSettings(STORAGE_KEY, defaultParams);
    
            params.minZoom = defaultParams.minZoom;
            params.maxZoom = defaultParams.maxZoom;
            
            params.targetX = defaultParams.targetX;
            params.targetY = defaultParams.targetY;
            params.targetZ = defaultParams.targetZ;
            
            this.orbitControls.minDistance = params.minZoom;
            this.orbitControls.maxDistance = params.maxZoom;
            this.orbitControls.target.set(params.targetX, params.targetY, params.targetZ);

            this._orbitControls.update()

            folder.controllers.forEach(controller => controller.updateDisplay());
            }
        }

        folder.add(resetInput, 'reset');
    }
}