import idleFlyAnim from '../assets/Animation/IdleFlyAnim/IdleFlyAnim.png'
import idleFlyAnimJson from '../assets/Animation/IdleFlyAnim/IdleFlyAnim.json'
import loadingAnim from '../assets/Animation/LoadingAnim/LoadingSmokeAnim.png'
import loadingAnimJson from '../assets/Animation/LoadingAnim/LoadingSmokeAnim.json'

import loadingBar from '../assets/LoadingBar/LoadingBar.png'
import loadingBarMask from '../assets/LoadingBar/LoadingBarMask.png'
import loadingPlatform from '../assets/LoadingBar/LoadingPlatform.png'

import background from '../assets/Backgrounds/background.png'
import loadingBackground from '../assets/Backgrounds/LoadingBackground.png'

import skyBackground from '../assets/Backgrounds/SkyBackground.png'
import lawnLayerBackground from '../assets/Backgrounds/LawnBackground.png'
import lawnLayer2Background from '../assets/Backgrounds/Lawn2Background.png'
import cloudsBackground from '../assets/Backgrounds/CloudsBackground.png'

import explosionAnim from '../assets/Animation/ExplosionAnim/Explosion.png'
import explosionAnimJson from '../assets/Animation/ExplosionAnim/explosion.json'

import crashPose from '../assets/CrashPose.png'

import loadingSound from '../assets/Sounds/LoadingSound.mp3'
import shot from '../assets/Sounds/RifleShot.mp3'
import fall from '../assets/Sounds/Fall.mp3'
import quack from '../assets/Sounds/Quack.mp3'
import backgroundGame from '../assets/Sounds/BackgroundGame.mp3'
import flap from '../assets/Sounds/flap.mp3'

import WebFontLoader from 'phaser3-rex-plugins/plugins/webfontloader.js';
import '../assets/Fonts/Fonts.css'


export default class Preloader{
    private _scene: Phaser.Scene
    constructor(scene: Phaser.Scene){
        this._scene = scene
    }

    loadFont(){
        WebFontLoader.call(this._scene.load, {
            custom: {
                families: ['Moga'],
            }
        })
    }

    preloadLoadingAnimation(){
        this._scene.load.image('loadingBar', loadingBar)
        this._scene.load.image('loadingBarMask', loadingBarMask)
        this._scene.load.image('loadingPlatform', loadingPlatform)
        this._scene.load.image('loadingBackground', loadingBackground);
        this._scene.load.image('titleBackground', background);
        this._scene.load.atlas('idleFly', idleFlyAnim, idleFlyAnimJson);
        this._scene.load.atlas('smokeLoading', loadingAnim, loadingAnimJson);
    }

    preloadGameBackgrounds(){
        this._scene.load.image('Level0Background',skyBackground)
        this._scene.load.image('Level1Background',cloudsBackground)
        this._scene.load.image('Level2Background',lawnLayer2Background)
        this._scene.load.image('Level3Background',lawnLayerBackground)
    }

    preloadGameAnimation(){
        this._scene.load.atlas('idleFly', idleFlyAnim, idleFlyAnimJson);
        this._scene.load.atlas('explosion', explosionAnim, explosionAnimJson)
    }

    preloadCrashPose(){
        this._scene.load.image('crashPose', crashPose)
    }

    preloadSounds(){
        this._scene.load.audio('loadingSound',loadingSound)
        this._scene.load.audio('shot',shot)
        this._scene.load.audio('fall', fall)
        this._scene.load.audio('quack', quack)
        this._scene.load.audio('backgroundGame', backgroundGame)
        this._scene.load.audio('flap', flap)
    }
}