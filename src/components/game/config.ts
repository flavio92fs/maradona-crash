import Phaser from "phaser";
import WebSocketPlugin from "./plugin/WebSocketPlugin";
import BootScene from "./scenes/BootScene";
import GameScene from "./scenes/GameScene";
import LoadingScene from "./scenes/LoadingScene";

const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;

export const game: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scale: {
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: "game-container",
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  plugins: {
    global: [
      { key: 'wsPlugin', plugin: WebSocketPlugin, mapping: 'wsplugin', start: true }
    ]
  },
  scene: [BootScene, GameScene, LoadingScene],
};

export const gameSize = {
  landscape: {
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
};
