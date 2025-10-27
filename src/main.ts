import Phaser from "phaser";
import Level from "./scenes/Level";
import Preload from "./scenes/Preload";
import GameScene from "./scenes/GameScene";
import HomeScene from "./scenes/HomeScene";
import DeckScene from "./scenes/DeckScene";
import { SpinePlugin } from "@esotericsoftware/spine-phaser-v3";

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
    width: window.innerWidth * window.devicePixelRatio,
    height: window.innerHeight * window.devicePixelRatio,
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
      width: window.innerWidth * window.devicePixelRatio,
      height: window.innerHeight * window.devicePixelRatio,
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
