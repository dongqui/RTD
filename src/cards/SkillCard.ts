import { BaseCard, CardConfig } from "./BaseCard";
import { SkillRegistry } from "../skills/SkillRegistry";
import { BaseSkill } from "../skills/BaseSkill";

export interface SkillCardConfig extends CardConfig {
  skillType: string;
}

export class SkillCard extends BaseCard {
  private skillType: string;
  private skill: BaseSkill | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, config: SkillCardConfig) {
    super(scene, x, y, config);
    this.skillType = config.skillType;

    if (SkillRegistry.hasSpec(this.skillType)) {
      this.skill = SkillRegistry.create(this.skillType, scene);
    }

    this.renderCard();
  }

  protected renderCard(): void {
    this.drawCardBackground(true);

    const cardColor = this.getCardColor();

    this.background.fillStyle(0xf5deb3, 1);
    this.background.fillRoundedRect(15, 15, 125, 105, 12);

    this.background.fillStyle(0xfff8dc, 1);
    this.background.fillRoundedRect(15, 115, 125, 22.5, 10);

    this.background.fillStyle(0x5a4a3a, 0.9);
    this.background.fillRoundedRect(15, 137.5, 125, 60, 10);

    this.background.fillStyle(cardColor, 1);
    this.background.fillCircle(22.5, 22.5, 16);
    this.background.lineStyle(4, 0xffffff, 1);
    this.background.strokeCircle(45, 45, 32);

    this.nameText = this.scene.add.text(80, 125, this.config.name, {
      fontSize: "28px",
      color: "#2a2a3a",
      fontStyle: "bold",
      fontFamily: "Arial",
    });
    this.nameText.setOrigin(0.5);

    const description = this.skill?.getDescription() || this.config.description || "";
    this.descText = this.scene.add.text(80, 167.5, description, {
      fontSize: "18px",
      color: "#ffffff",
      fontFamily: "Arial",
      align: "center",
      wordWrap: { width: 110 },
    });
    this.descText.setOrigin(0.5);

    this.costText = this.scene.add.text(40, 60, `${this.config.cost}`, {
      fontSize: "48px",
      color: "#ffffff",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 5,
    });
    this.costText.setOrigin(0.5);

    const skillIcon = this.scene.add.text(80, 60, "✨", {
      fontSize: "60px",
    });
    skillIcon.setOrigin(0.5);

    this.container.add([
      this.background,
      this.nameText,
      this.descText,
      this.costText,
      skillIcon,
    ]);
  }

  protected getCardColor(): number {
    return 0xff44ff;
  }

  getSkillType(): string {
    return this.skillType;
  }

  getSkill(): BaseSkill | null {
    return this.skill;
  }
}
