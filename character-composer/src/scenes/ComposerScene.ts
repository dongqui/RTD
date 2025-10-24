import Phaser from "phaser";
import { Skin } from "@esotericsoftware/spine-core";

export default class ComposerScene extends Phaser.Scene {
  private spineObject: any;

  constructor() {
    super({ key: "ComposerScene" });
  }

  preload() {
    this.load.spineJson(
      "fantasy_character",
      "assets/spine/Fantasy Character.json"
    );
    this.load.spineAtlas(
      "fantasy_character-atlas",
      "assets/spine/Fantasy Character.atlas.txt"
    );
  }

  create() {
    console.log("ComposerScene created");
    this.spineObject = this.add.spine(
      400,
      500,
      "fantasy_character",
      "fantasy_character-atlas"
    );
    this.spineObject.setScale(0.5);
    console.log("Spine object created:", this.spineObject);
    console.log("Available skins:", this.spineObject.skeleton.data.skins);

    console.log(
      "Available slots:",
      this.spineObject.skeleton.slots.map((s: any) => s.data.name)
    );

    (window as any).spineObject = this.spineObject;
    (window as any).changeSlotColor = (
      slotName: string,
      r: number,
      g: number,
      b: number,
      a: number = 1
    ) => {
      const slot = this.spineObject.skeleton.findSlot(slotName);
      if (slot) {
        slot.color.r = r / 255;
        slot.color.g = g / 255;
        slot.color.b = b / 255;
        slot.color.a = a;
        console.log(`Color changed for slot "${slotName}":`, { r, g, b, a });
      } else {
        console.error(`Slot "${slotName}" not found`);
      }
    };

    this.game.events.emit("spine-ready", this.spineObject);
  }

  update() {
    // Phaser Spine 플러그인이 자동으로 업데이트 처리
  }
}
