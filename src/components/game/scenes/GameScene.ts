// import Preloader from "../components/Preloader";
import { gameSize } from "../config";
import MyWebSocket from "../components/WebSockets/Services";
import type WebSocketPlugin from "../plugin/WebSocketPlugin";
import { BaseScene } from "./BaseScene";
import emitter from "@/eventEmitter";
import getUuidByString from "uuid-by-string";

export default class GameScene extends BaseScene {
  private _player?: Phaser.GameObjects.Sprite;
  private _crashedPlayer?: Phaser.GameObjects.Sprite;
  private _explosion?: Phaser.GameObjects.Sprite;

  private backgrounds: {
    ratioX: number;
    sprite: Phaser.GameObjects.TileSprite;
  }[] = [];

  private velocityX: number = 1;

  private startFlyTween?: Phaser.Tweens.Tween;
  private flyingTween?: Phaser.Tweens.Tween;
  private currentPlayingTween?: Phaser.Tweens.Tween;
  private crashed: boolean;

  private _currentMultiplier: number = 1;
  private multiplierText?: Phaser.GameObjects.Text;

  private _roundId: number = 0;

  private music!: any;
  private flap_sound!: any;
  private shot_sound!: any;
  private fall_sound!: any;
  private quack_sound!: any;

  private isAudioOn: boolean = true;
  private isMusicOn: boolean = true;

  constructor() {
    super("GameScene");
    this.crashed = false;
  }

  create() {
    this.music = this.sound.add("backgroundGame");
    this.flap_sound = this.sound.add("flap");

    this.sound.stopAll();

    this.music.volume = 0;
    if (this.isMusicOn) {
      this.music.volume = 1;
    }

    this.music.play();

    this.flap_sound.volume = 0;
    if (this.isAudioOn) {
      this.flap_sound.volume = 1;
    }

    this.flap_sound.play();

    console.log("Hello from GAME SCENE");

    this.createFlyingAnimation();
    this.createExplosionAnimation();

    this.createParallaxBackground();

    this._crashedPlayer = this.add
      .sprite(300, 1080 - 100, "crashPose")
      .setScale(0.6)
      .setVisible(false);
    this._player = this.add
      .sprite(300, 1080 - 200, "idleFly", "0.png")
      .setScale(0.6);
    this._explosion = this.add
      .sprite(300, 1080 - 100, "explosion", "0.png")
      .setScale(1.2);
    this._player.play("fly");

    this.multiplierText = this.add
      .text(
        gameSize.landscape.width / 2,
        gameSize.landscape.height / 2,
        "x1.00",
        {
          fontSize: "180px",
          color: "#e47e23",
          fontFamily: "Moga",
          stroke: "black",
          strokeThickness: 10,
        }
      )
      .setOrigin(0.5);

    var gradient = this.multiplierText.context.createLinearGradient(
      0,
      0,
      0,
      this.multiplierText.height
    );
    gradient.addColorStop(0, "#dfb242");
    gradient.addColorStop(0.5, "#e47c26");

    this.multiplierText.setFill(gradient);

    // this.setStartFlyTween()
    // this.setFlyingTween()

    // this.input.keyboard.on("keydown-A", () => this.startPlay());
    // this.input.keyboard.on("keydown-S", () => this.currentPlayingTween.stop());
    // this.input.keyboard.on("keydown-C", () => this.crash());

    let hasStarted = false;

    emitter.on("startingPhaser", (gameData: any) => {
      this.scene.start("LoadingScene", { data: { gameData: gameData } });
      emitter.off("startingPhaser");
      emitter.off("startedPhaser");
      emitter.off("progressPhaser");
      emitter.off("crashPhaser");
    });

    emitter.on("crashPhaser", () => {
      this.crash();
    });

    emitter.on("progressPhaser", (gameData: any) => {
      if (!hasStarted) {
        this.startPlay();
        hasStarted = true;
      }
      this._roundId = gameData.gameData.round_id;
      this._currentMultiplier = gameData.gameData.multiplier;
      this.setMultiplier(gameData.gameData.multiplier);
    });

    emitter.emit("GameScene");
    emitter.off("GameScene");
  }

  private createParallaxBackground() {
    const { width, height } = this.scale;

    this.backgrounds.push({
      ratioX: 0.3,
      sprite: this.add
        .tileSprite(0, 0, width, height, "Level0Background")
        .setOrigin(0)
        .setScrollFactor(0),
    });

    this.backgrounds.push({
      ratioX: 0.7,
      sprite: this.add
        .tileSprite(0, 0, width, height, "Level1Background")
        .setOrigin(0)
        .setScrollFactor(0),
    });

    this.backgrounds.push({
      ratioX: 0.9,
      sprite: this.add
        .tileSprite(0, 0, width, height, "Level2Background")
        .setOrigin(0)
        .setScrollFactor(0),
    });

    this.backgrounds.push({
      ratioX: 1.2,
      sprite: this.add
        .tileSprite(0, 0, width, height, "Level3Background")
        .setOrigin(0)
        .setScrollFactor(0)
        .setDepth(1),
    });
  }

  startPlay() {
    this.crashed = false;

    this.startFlyTween = this.tweens.add({
      targets: this._player,
      ease: Phaser.Math.Easing.Sine.InOut,
      x: 1920 - 300,
      y: 100,
      duration: 2000,
      onStart: () => (this.currentPlayingTween = this.startFlyTween),
      onComplete: () => {
        this.startFlyingTween();
      },
    });
  }

  crash() {
    this.shot_sound = this.sound.add("shot");
    this.quack_sound = this.sound.add("quack");

    this.currentPlayingTween?.stop();
    this._explosion?.setPosition(this._player?.x, this._player?.y);
    this._explosion?.play("explosion");

    if (!this.isAudioOn) {
      this.shot_sound.volume = 0;
      this.quack_sound.volume = 0;
    }

    this.shot_sound.play();

    this._explosion?.on("animationupdate", () => {
      if (this._explosion?.frame.name === "30.png") {
        this.sound.stopAll();
        this.quack_sound.play();
        this._player?.anims.stop();
        this._player?.setVisible(false);
        this._crashedPlayer?.setPosition(this._player?.x, this._player?.y);
        this._crashedPlayer?.setVisible(true);
        this.crashed = true;
      }
    });

    this._explosion?.on("animationcomplete", () => {
      this.crashTween();
    });
  }

  private startFlyingTween() {
    let targetToReachY = 500;
    let repeat = false;

    this.flyingTween = this.tweens.add({
      targets: this._player,
      duration: 2000,
      ease: Phaser.Math.Easing.Sine.InOut,
      loop: -1,
      onStart: () => (this.currentPlayingTween = this.flyingTween),
      y: {
        getStart: (target: Phaser.GameObjects.Container) => {
          if (repeat) {
            if (targetToReachY == 500) {
              targetToReachY = -500;
            } else {
              targetToReachY = 500;
            }
          }
          repeat = true;
          return target.y;
        },

        getEnd: (target: Phaser.GameObjects.Container) => {
          return target.y + targetToReachY;
        },
      },
    });
  }

  private createFlyingAnimation() {
    this.anims.create({
      key: "fly",
      frames: "idleFly",
      frameRate: 15,
      repeat: -1,
    });
  }

  private createExplosionAnimation() {
    this.anims.create({
      key: "explosion",
      frames: "explosion",
      frameRate: 60,
    });
  }

  private crashTween() {
    this.fall_sound = this.sound.add("fall");

    if (!this.isAudioOn) {
      this.fall_sound.volume = 0;
    }

    this.tweens.add({
      targets: this._crashedPlayer,
      y: 2000,
      ease: Phaser.Math.Easing.Back.In,
      duration: 1500,
      onStart: () => this.fall_sound.play(),
    });
  }

  update(time: number, delta: number): void {
    if (!this.crashed) {
      this.backgrounds.forEach((background) => {
        background.sprite.tilePositionX += this.velocityX * background.ratioX;
      });
    }
  }

  setAudio(value: boolean) {
    this.isAudioOn = value;

    if (this.isAudioOn) {
      this.flap_sound.volume = 1;
    } else {
      this.flap_sound.volume = 0;
    }

    console.log("Audio in game set");
    console.log("Audio Status: " + value);
  }

  setMusic(value: boolean) {
    this.isMusicOn = value;
    if (this.isMusicOn) {
      this.music.volume = 1;
    } else {
      this.music.volume = 0;
    }

    console.log("Music in game set");
    console.log("Music Status: " + value);
  }

  setMultiplier(value: number) {
    if (this.multiplierText != null) {
      this.multiplierText.setText("X" + value.toFixed(2));
    }
  }

  drawCash(buttonId: number) {
    let betObject = {
      type: "game.cashout",
      data: {
        hash: getUuidByString(this._roundId + buttonId.toString()),
        multiplier: this._currentMultiplier,
      },
    };

    console.log(betObject.data.hash);
    this.wsplugin.webSocket.send(JSON.stringify(betObject));
  }

  getLeaderboard(subtype: string, period: string) {
    console.log(subtype, period);
    this.wsplugin.webSocket.send(
      JSON.stringify({
        type: "game.leaderboard",
        subtype: subtype,
        period: period,
      })
    );
  }
}
