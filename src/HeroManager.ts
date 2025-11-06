import { BaseHero } from "./units/heroes/BaseHero";
import { HeroRegistry } from "./units/heroes";

export type { HeroType } from "./units/heroes";

export class HeroManager {
  private heroes: BaseHero[] = [];
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.scene.data.set("heroes", this.heroes);
  }

  spawnHero(type: string, x: number, y: number, cardId: string = ""): BaseHero | null {
    if (!HeroRegistry.hasSpec(type)) {
      console.error(`Unknown hero type: ${type}`);
      return null;
    }

    const spec = HeroRegistry.getSpec(type);
    const HeroClass = spec.heroClass as any;
    const hero = new HeroClass(this.scene, x, y, cardId) as BaseHero;

    this.heroes.push(hero);
    this.scene.data.set("heroes", this.heroes);
    this.scene.events.emit("hero-spawned", hero);

    return hero;
  }

  update(time: number, delta: number): void {
    this.heroes = this.heroes.filter((hero) => {
      if (hero.isDead() || !hero.spineObject) {
        return false;
      }
      hero.update(time, delta);
      return true;
    });
    this.scene.data.set("heroes", this.heroes);
  }

  getActiveHeroes(): BaseHero[] {
    return this.heroes.filter((hero) => !hero.isDead());
  }

  getActiveHeroCount(): number {
    return this.getActiveHeroes().length;
  }

  removeHero(hero: BaseHero): void {
    const index = this.heroes.indexOf(hero);
    if (index > -1) {
      this.heroes.splice(index, 1);
      this.scene.data.set("heroes", this.heroes);
    }
  }

  clear(): void {
    this.heroes.forEach((hero) => {
      hero.destroy();
      if (hero.spineObject) {
        hero.spineObject.destroy();
      }
    });
    this.heroes = [];
    this.scene.data.set("heroes", this.heroes);
  }
}
