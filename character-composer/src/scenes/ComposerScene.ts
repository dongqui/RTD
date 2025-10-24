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

    // this.spineObject.skeleton.setSkinByName("skin_1");
    // this.spineObject.skeleton.setToSetupPose();

    const skin = this.spineObject.skeleton.skin;
    console.log("Current skin:", skin);
    console.log(
      "Available slots:",
      this.spineObject.skeleton.slots.map((s: any) => s.data.name)
    );
    console.log("Skin attachments:", skin?.attachments);

    (window as any).spineObject = this.spineObject;

    this.game.events.emit("spine-ready", this.spineObject);
  }

  update() {
    // Phaser Spine 플러그인이 자동으로 업데이트 처리
  }
}
