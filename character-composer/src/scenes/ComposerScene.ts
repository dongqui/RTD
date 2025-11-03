import Phaser from "phaser";
import { Skin, Vector2 } from "@esotericsoftware/spine-core";
import { SpineGameObject } from "@esotericsoftware/spine-phaser-v3";
type CenterOptions = {
  scale?: number; // 고정 스케일 (기본 1)
  padding?: number; // 바깥 여백(px, 스케일 적용 전 기준)
  setupPose?: boolean; // 스냅샷 전 SetupPose로 초기화할지
};
export default class ComposerScene extends Phaser.Scene {
  private spineObject: SpineGameObject | null = null;

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
      this.scale.gameSize.width,
      this.scale.gameSize.height,
      "fantasy_character",
      "fantasy_character-atlas"
    );

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
      const slot = this.spineObject?.skeleton?.findSlot(slotName);
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

  captureCharacter(
    unitType: string,
    width: number = 512,
    height: number = 512
  ) {
    if (!this.spineObject) {
      console.error("Spine object not ready");
      return;
    }

    // renderTexture를 (0, 0)에 생성 (월드 좌표 계산 간단화)
    const renderTexture = this.add.renderTexture(
      0,
      0,
      this.scale.gameSize.width,
      this.scale.gameSize.height
    );

    // 원본 위치와 스케일 저장
    const originalX = this.spineObject.x;
    const originalY = this.spineObject.y;
    const originalScaleX = this.spineObject.scaleX;
    const originalScaleY = this.spineObject.scaleY;

    const spineHeight =
      this.spineObject.skeleton.data.height * this.spineObject.scaleY;
    this.spineObject.setPosition(
      this.scale.gameSize.width / 2,
      this.scale.gameSize.height / 2 + spineHeight / 2
    );
    // renderTexture에 그리기
    renderTexture.draw(this.spineObject);

    // 원래 위치와 스케일로 복원
    this.spineObject.setPosition(originalX, originalY);
    this.spineObject.setScale(originalScaleX);

    // 스냅샷 생성
    renderTexture.snapshot((image: any) => {
      this.downloadImage(image, unitType);
      renderTexture.destroy();
    });
  }

  private downloadImage(image: HTMLImageElement, unitType: string) {
    const link = document.createElement("a");
    link.download = `unit_portrait_${unitType}.png`;
    link.href = image.src;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log(`Image saved as: unit_portrait_${unitType}.png`);
  }

  update() {
    // Phaser Spine 플러그인이 자동으로 업데이트 처리
  }
}
