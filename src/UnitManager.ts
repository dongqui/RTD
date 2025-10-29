import { BaseUnit } from "./units/BaseUnit";
import { UnitRegistry } from "./units/UnitRegistry";

export type { UnitType } from "./units/UnitRegistry";

export class UnitManager {
  private units: BaseUnit[] = [];
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.scene.data.set("units", this.units);
  }

  spawnUnit(type: string, x: number, y: number, cardId: string = ""): BaseUnit | null {
    if (!UnitRegistry.hasSpec(type)) {
      console.error(`Unknown unit type: ${type}`);
      return null;
    }

    const spec = UnitRegistry.getSpec(type);
    const UnitClass = spec.unitClass as any;
    const unit = new UnitClass(this.scene, x, y, cardId) as BaseUnit;

    this.units.push(unit);
    this.scene.data.set("units", this.units);
    this.scene.events.emit("unit-spawned", unit);

    return unit;
  }

  update(time: number, delta: number): void {
    this.units = this.units.filter((unit) => {
      if (unit.isDead() || !unit.spineObject) {
        return false;
      }
      unit.update(time, delta);
      return true;
    });
    this.scene.data.set("units", this.units);
  }

  getActiveUnits(): BaseUnit[] {
    return this.units.filter((unit) => !unit.isDead());
  }

  getActiveUnitCount(): number {
    return this.getActiveUnits().length;
  }

  removeUnit(unit: BaseUnit): void {
    const index = this.units.indexOf(unit);
    if (index > -1) {
      this.units.splice(index, 1);
      this.scene.data.set("units", this.units);
    }
  }

  clear(): void {
    this.units.forEach((unit) => {
      if (unit.spineObject) {
        unit.spineObject.destroy();
      }
    });
    this.units = [];
    this.scene.data.set("units", this.units);
  }
}
