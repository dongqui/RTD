import Phaser from "phaser";
import { SpinePlugin } from "@esotericsoftware/spine-phaser-v3";
import { Skin } from "@esotericsoftware/spine-core";
import ComposerScene from "./scenes/ComposerScene";

window.addEventListener("load", () => {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game-container",
    backgroundColor: "#c3cfe2",
    plugins: {
      scene: [
        {
          key: "spine.SpinePlugin",
          plugin: SpinePlugin,
          mapping: "spine",
        },
      ],
    },
    scene: [ComposerScene],
  });

  (window as any).game = game;
});
