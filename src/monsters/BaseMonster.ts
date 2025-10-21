export interface MonsterConfig {
  health: number;
  speed: number;
  reward: number;
  textureKey: string;
  scale?: number;
  attackRange?: number;
  attackDamage?: number;
  attackSpeed?: number;
}

export enum MonsterState {
  MOVING = "moving",
  ATTACKING = "attacking",
  DEAD = "dead",
}

export abstract class BaseMonster {
  protected maxHealth: number;
  protected currentHealth: number;
  protected speed: number;
  protected reward: number;
  protected state: MonsterState;
  protected scene: Phaser.Scene;
  public sprite: Phaser.GameObjects.Sprite;

  protected attackRange: number;
  protected attackDamage: number;
  protected attackSpeed: number;
  private lastAttackTime: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: MonsterConfig
  ) {
    this.scene = scene;
    this.maxHealth = config.health;
    this.currentHealth = config.health;
    this.speed = config.speed;
    this.reward = config.reward;
    this.state = MonsterState.MOVING;

    this.attackRange = config.attackRange || 100;
    this.attackDamage = config.attackDamage || 10;
    this.attackSpeed = config.attackSpeed || 1000;

    this.sprite = this.scene.add
      .sprite(x, y, config.textureKey)
      .setDisplaySize(128, 128)
      .setFlipX(true);
  }

  update(_time: number, delta: number): void {
    if (this.state === MonsterState.DEAD) return;

    const nearbyUnit = this.findNearbyUnit();

    if (nearbyUnit) {
      this.state = MonsterState.ATTACKING;
      this.attackUnit(nearbyUnit);
    } else {
      if (this.state === MonsterState.ATTACKING) {
        this.state = MonsterState.MOVING;
      }
      this.moveLeft(delta);
    }
  }

  private findNearbyUnit(): any | null {
    const units = this.scene.data.get('units') || [];

    for (const unit of units) {
      if (unit.getState() === 'dead') continue;

      const distance = Phaser.Math.Distance.Between(
        this.sprite.x,
        this.sprite.y,
        unit.spineObject.x,
        unit.spineObject.y
      );

      if (distance <= this.attackRange) {
        return unit;
      }
    }

    return null;
  }

  private attackUnit(unit: any): void {
    const currentTime = this.scene.time.now;

    if (currentTime - this.lastAttackTime >= this.attackSpeed) {
      this.lastAttackTime = currentTime;
      unit.takeDamage(this.attackDamage);

      this.sprite.setTint(0xff8800);
      this.scene.time.delayedCall(100, () => {
        if (this.state !== MonsterState.DEAD) {
          this.sprite.clearTint();
        }
      });
    }
  }

  private moveLeft(delta: number): void {
    const moveDistance = (this.speed * delta) / 1000;
    this.sprite.x -= moveDistance;

    if (this.sprite.x < -100) {
      this.reachPlayerBase();
    }
  }

  takeDamage(damage: number): void {
    if (this.state === MonsterState.DEAD) {
      console.log("Monster is already dead, ignoring damage");
      return;
    }

    this.currentHealth -= damage;
    console.log(`Monster took ${damage} damage. HP: ${this.currentHealth}/${this.maxHealth}`);

    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (this.state !== MonsterState.DEAD && this.sprite && !this.sprite.destroyed) {
        this.sprite.clearTint();
      }
    });

    if (this.currentHealth <= 0) {
      console.log("Monster died!");
      this.die();
    }
  }

  private die(): void {
    this.state = MonsterState.DEAD;
    this.scene.events.emit("monster-killed", this, this.reward);

    this.sprite.setTint(0x666666);
    this.sprite.setAlpha(0.7);

    this.scene.time.delayedCall(500, () => {
      this.sprite.destroy();
    });
  }

  private reachPlayerBase(): void {
    this.scene.events.emit("monster-reached-player-base", this);
    this.sprite.destroy();
    this.state = MonsterState.DEAD;
  }

  getCurrentHealth(): number {
    return this.currentHealth;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  getReward(): number {
    return this.reward;
  }

  getState(): MonsterState {
    return this.state;
  }
}
