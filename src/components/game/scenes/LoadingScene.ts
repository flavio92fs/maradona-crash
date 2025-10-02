// import Preloader from "../components/Preloader";
import emitter from "@/eventEmitter";
import { gameSize } from "../config";
import MyWebSocket from "../components/WebSockets/Services";
import { GUI } from "dat.gui";
import { BaseScene } from "./BaseScene";
import getUuidByString from "uuid-by-string";

export default class LoadingScene extends BaseScene {
  // private _preloader: Preloader;
  private _background!: Phaser.GameObjects.Image;

  private _player!: Phaser.GameObjects.Sprite;
  private _loadingPlatform!: Phaser.GameObjects.Image;

  private _loadingBar!: Phaser.GameObjects.Image;
  private _loadingBarLoad!: Phaser.GameObjects.Image;
  private _mask!: Phaser.GameObjects.Image;

  private _startValue = 0;
  private _valueToReach = 0;

  private _roundId: number = 0;

  private loading_music!: any;

  private isMusicOn: boolean = true;

  constructor() {
    super("LoadingScene");
  }

  preload(data: any) {}

  init(data: any) {
    this.setTime(
      data.data.gameData.gameData.server_time,
      data.data.gameData.gameData.start_time
    );

    this._roundId = data.data.gameData.gameData.round_id;

    console.log("Round ID:" + this._roundId);

    emitter.emit("sceneComplete");
  }

  private create(data: any) {
    console.log("Hello from LoadingScene");

    this.loading_music = this.sound.add("loadingSound", { loop: true });

    this.sound.stopAll();
    this.loading_music.volume = 0;
    if (this.isMusicOn) {
      this.loading_music.volume = 1;
    }
    // this.loading_music.play();
    this.createLoadingAnimation();

    this._background = this.add
      .image(0, 0, "loadingBackground")
      .setOrigin(0, 0);

    this.createLoadingBar();

    this._player = this.add.sprite(1080, 410, "smokeLoading", "0.png");
    this._player.play("loading");
    this._loadingPlatform = this.add.image(980, 602, "loadingPlatform");

    emitter.on("startedPhaser", () => {
      this.scene.start("GameScene");
      emitter.off("startingPhaser");
      emitter.off("startedPhaser");
      emitter.off("progressPhaser");
      emitter.off("crashPhaser");
    });

    emitter.emit("LoadingScene");
    emitter.off("LoadingScene");
  }

  private createLoadingBar() {
    this._loadingBar = this.add.image(
      gameSize.landscape.width / 2,
      835,
      "loadingBar"
    );
    this._mask = this.make
      .sprite({ x: 418, y: 835, key: "loadingBarMask", add: false })
      .setOrigin(0, 0.5);
    this._loadingBarLoad = this.make
      .sprite({ x: 418, y: 835, key: "loadingBarMask", add: true })
      .setOrigin(0, 0.5);

    this._loadingBarLoad.mask = new Phaser.Display.Masks.BitmapMask(
      this,
      this._mask
    );

    this._mask.x = 1 * (672 + 418) - 672;

    let normalizedObject = {
      value: 0,
    };

    // let gui = new GUI()
    // gui.add(normalizedObject, 'value', 0, 1, 0.01).onChange(() => {this._mask.x = normalizedObject.value*(672 + 418)-672})
  }

  private createLoadingAnimation() {
    this.anims.create({
      key: "loading",
      frames: "smokeLoading",
      frameRate: 30,
      repeat: -1,
    });
  }

  setTime(startValue: number, valueToReach: number) {
    console.log("timeSetted");
    this._startValue = valueToReach * 1000;
    this._valueToReach = startValue * 1000;
  }

  update(time: number, delta: number): void {
    let currentTime = Date.now();

    let normalizedValue =
      (currentTime - this._startValue) /
      (this._valueToReach - this._startValue);
    if (normalizedValue <= 1) {
      this._mask.x = normalizedValue * (672 + 418) - 672;
    }
  }

  sendBet(betValue: number, buttonId: number, cashout_at: number) {
    console.log(buttonId);
    console.log(this._roundId);
    let betObject = {
      type: "game.bet",
      data: {
        hash: getUuidByString(this._roundId + buttonId.toString()),
        amount: betValue,
        cashout_at: cashout_at,
      },
    };

    console.log("Send Data: " + JSON.stringify(betObject.data));
    this.wsplugin.webSocket.send(JSON.stringify(betObject));
  }

  cancelBet(buttonId: number) {
    console.log(buttonId);
    console.log(this._roundId);

    let betObject = {
      type: "game.cancel-bet",
      data: {
        hash: getUuidByString(this._roundId + buttonId.toString()),
      },
    };

    console.log("Cancel Data: " + JSON.stringify(betObject.data));

    console.log(betObject.data.hash);
    this.wsplugin.webSocket.send(JSON.stringify(betObject));
  }

  setMusic(value: boolean) {
    this.isMusicOn = value;

    if (this.isMusicOn) {
      this.loading_music.volume = 1;
    } else {
      this.loading_music.volume = 0;
    }
  }
}
