import { BaseSkill } from "./BaseSkill";
import { SkillSpec, SkillConfig } from "./SkillTypes";

export class SkillRegistry {
  private static skills: Map<string, SkillSpec> = new Map();

  static register(spec: SkillSpec): void {
    if (this.skills.has(spec.id)) {
      console.warn(`Skill ${spec.id} is already registered`);
      return;
    }
    this.skills.set(spec.id, spec);
  }

  static getSpec(id: string): SkillSpec {
    const spec = this.skills.get(id);
    if (!spec) {
      throw new Error(`Skill ${id} not found in registry`);
    }
    return spec;
  }

  static hasSpec(id: string): boolean {
    return this.skills.has(id);
  }

  static create(id: string, scene: Phaser.Scene): BaseSkill {
    const spec = this.getSpec(id);
    const config: SkillConfig = {
      id: spec.id,
      name: spec.name,
      description: spec.description,
      cost: spec.cost,
      icon: spec.icon,
      consumable: spec.consumable,
      effectType: spec.effectType,
    };
    return new spec.skillClass(scene, config);
  }

  static getAllSpecs(): SkillSpec[] {
    return Array.from(this.skills.values());
  }
}
