import emitter from "@/eventEmitter";
import Preloader from "../components/Preloader";
import { BaseScene } from "./BaseScene";


export default class BootScene extends BaseScene {
    private _preloader: Preloader;

    constructor() {
        super("BootScene");
        this._preloader = new Preloader(this);
    }

    preload() {
        this._preloader.loadFont();
        this._preloader.preloadLoadingAnimation();
        this._preloader.preloadGameBackgrounds();
        this._preloader.preloadGameAnimation();
        this._preloader.preloadCrashPose();
        this._preloader.preloadSounds();

        this.load.on('complete', () => emitter.emit("loadComplete"));
    }

    create(){
        this.sound.stopAll();
        
        emitter.on('startingPhaser',(gameData: any) => {
            this.scene.start('LoadingScene', {data: {gameData: gameData}})
            emitter.off('startingPhaser')
            emitter.off('startedPhaser')
            emitter.off('progressPhaser')
            emitter.off('crashPhaser')
        })

        emitter.on('startedPhaser',() =>{
            this.scene.start('GameScene')
            emitter.off('startingPhaser')
            emitter.off('startedPhaser')
            emitter.off('progressPhaser')
            emitter.off('crashPhaser')
        })

        emitter.on('crashPhaser',() =>{
            this.scene.start('GameScene')
            emitter.off('startingPhaser')
            emitter.off('startedPhaser')
            emitter.off('progressPhaser')
            emitter.off('crashPhaser')
        })

        emitter.on('progressPhaser',() =>{
            this.scene.start('GameScene')
            emitter.off('startingPhaser')
            emitter.off('startedPhaser')
            emitter.off('progressPhaser')
            emitter.off('crashPhaser')
        })

        emitter.emit('BootScene')
    }
}
