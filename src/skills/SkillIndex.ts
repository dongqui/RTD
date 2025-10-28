import { SkillRegistry } from "./SkillRegistry";
import { resourceBoostSkillSpec } from "./impl/ResourceBoostSkill";
import { healAllSkillSpec } from "./impl/HealAllSkill";
import { attackSpeedBoostSkillSpec } from "./impl/AttackSpeedBoostSkill";
import { slowMonsterSkillSpec } from "./impl/SlowMonsterSkill";

export function registerAllSkills(): void {
  SkillRegistry.register(resourceBoostSkillSpec);
  SkillRegistry.register(healAllSkillSpec);
  SkillRegistry.register(attackSpeedBoostSkillSpec);
  SkillRegistry.register(slowMonsterSkillSpec);
}

registerAllSkills();

export { SkillRegistry };
export type { SkillSpec } from "./SkillTypes";
export { CardType, SkillEffectType } from "./SkillTypes";
