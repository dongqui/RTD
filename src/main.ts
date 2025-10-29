import Phaser from "phaser";
import Level from "./scenes/Level";
import Preload from "./scenes/Preload";
import GameScene from "./scenes/GameScene";
import HomeScene from "./scenes/HomeScene";
import DeckScene from "./scenes/DeckScene";
import { SpinePlugin } from "@esotericsoftware/spine-phaser-v3";

// Base(가상 좌표계)
export const BASE_W = 720;
export const BASE_H = 1280;

// Safe area (ENVELOP, 19.5:9 ~ 4:3 커버)
export const SAFE_AREA = {
  left: 64,
  right: BASE_W - 64, // 656
  top: 160,
  bottom: BASE_H - 160, // 1120
  width: BASE_W - 64 * 2, // 592
  height: BASE_H - 160 * 2, // 960
};

class Boot extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    this.load.pack("pack", "assets/preload-asset-pack.json");
  }

  create() {
    this.scene.start("Preload");
  }
}

window.addEventListener("load", function () {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    backgroundColor: "#0099db",
    parent: "game-container",
    plugins: {
      scene: [
        {
          key: "spine.SpinePlugin",
          plugin: SpinePlugin,
          mapping: "spine",
        },
      ],
    },
    scale: {
      mode: Phaser.Scale.ENVELOP,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: BASE_W,
      height: BASE_H,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },

    scene: [Boot, Preload, HomeScene, Level, GameScene, DeckScene],
  });

  // 화면 크기 변경 시 게임 크기 조정
  window.addEventListener("resize", () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
  });

  game.scene.start("Boot");
});
