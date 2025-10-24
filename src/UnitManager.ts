import { BaseUnit } from "./units/BaseUnit";
import { WarriorUnit } from "./units/WarriorUnit";
import { ArcherUnit } from "./units/ArcherUnit";

export type UnitType = "warrior" | "archer";

export class UnitManager {
  private units: BaseUnit[] = [];
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.scene.data.set("units", this.units);
  }

  spawnUnit(type: UnitType, x: number, y: number): BaseUnit | null {
    let unit: BaseUnit;

    switch (type) {
      case "warrior":
        unit = new WarriorUnit(this.scene, x, y);
        break;
      case "archer":
        unit = new ArcherUnit(this.scene, x, y);
        break;
      default:
        return null;
    }

    this.addUnit(unit);

    return unit;
  }

  addUnit(unit: BaseUnit): void {
    this.units.push(unit);
    this.scene.data.set("units", this.units);
    this.scene.events.emit("unit-spawned", unit);
  }

  update(time: number, delta: number): void {
    this.units = this.units.filter((unit) => {
      if (unit.getState() === "dead" || !unit.spineObject) {
        return false;
      }
      unit.update(time, delta);
      return true;
    });
    this.scene.data.set("units", this.units);
  }

  getActiveUnits(): BaseUnit[] {
    return this.units.filter((unit) => unit.getState() !== "dead");
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
