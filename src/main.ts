import Phaser from "phaser";
import Level from "./scenes/Level";
import Preload from "./scenes/Preload";
import GameScene from "./scenes/GameScene";

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
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#0099db",
    parent: "game-container",
    scale: {
      mode: Phaser.Scale.ENVELOP,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: window.innerWidth,
      height: window.innerHeight,
    },

    scene: [Boot, Preload, Level, GameScene],
  });

  // 화면 크기 변경 시 게임 크기 조정
  window.addEventListener("resize", () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
  });

  game.scene.start("Boot");
});
