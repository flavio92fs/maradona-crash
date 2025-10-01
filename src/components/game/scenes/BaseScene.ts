import type WebSocketPlugin from "../plugin/WebSocketPlugin";

export abstract class BaseScene extends Phaser.Scene {
    wsplugin!: WebSocketPlugin;
  }