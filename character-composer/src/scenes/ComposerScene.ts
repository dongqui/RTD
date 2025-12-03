import Phaser from "phaser";
import { Skin } from "@esotericsoftware/spine-core";
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
    this.spineObject = this.add.spine(
      this.scale.gameSize.width / 2,
      this.scale.gameSize.height / 2 + 100,
      "fantasy_character",
      "fantasy_character-atlas"
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
    this.game.events.emit("preview-ready", this);
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

  generatePartPreview(
    partName: string,
    width: number = 200,
    height: number = 200
  ): Promise<string> {
    return new Promise((resolve) => {
      try {
        console.log(
          `Generating preview for: ${partName}, size: ${width}x${height}`
        );

        // RenderTexture를 (0, 0)에 생성
        const renderTexture = this.add.renderTexture(0, 0, width, height);

        // 임시 Spine 오브젝트 생성
        const tempSpine = this.add.spine(
          width / 2,
          height / 2 + 100,
          "fantasy_character",
          "fantasy_character-atlas"
        );

        // 해당 파츠 스킨만 적용
        const skin = tempSpine.skeleton.data.findSkin(partName);
        if (!skin) {
          console.warn(`Skin not found: ${partName}`);
          tempSpine.destroy();
          renderTexture.destroy();
          resolve(this.getPlaceholderImage());
          return;
        }

        const customSkin = new Skin("preview");
        customSkin.addSkin(skin);
        tempSpine.skeleton.setSkin(customSkin);
        tempSpine.skeleton.setSlotsToSetupPose();
        tempSpine.skeleton.setToSetupPose();

        // 스케일 조정
        const spineHeight = tempSpine.skeleton.data.height;
        const scale = (height * 0.7) / spineHeight;
        tempSpine.setScale(scale);

        console.log(
          `Rendering ${partName} at position: ${width / 2}, ${
            height / 2 + 100
          }, scale: ${scale}`
        );

        // 렌더링 - tempSpine을 renderTexture에 그림
        renderTexture.draw(tempSpine);

        // base64로 변환
        renderTexture.snapshot(
          (snapshot: Phaser.Display.Color | HTMLImageElement) => {
            let dataURL: string;

            if (snapshot instanceof HTMLImageElement) {
              dataURL = snapshot.src;
              console.log(
                `Preview generated for ${partName}, length: ${dataURL.length}`
              );
            } else {
              console.warn(`Snapshot returned Color object for ${partName}`);
              dataURL = this.getPlaceholderImage();
            }

            // 정리
            renderTexture.destroy();
            tempSpine.destroy();

            resolve(dataURL);
          }
        );
      } catch (error) {
        console.error(`Failed to generate preview for ${partName}:`, error);
        resolve(this.getPlaceholderImage());
      }
    });
  }

  private getPlaceholderImage(): string {
    // 투명한 1x1 PNG
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  }
}
