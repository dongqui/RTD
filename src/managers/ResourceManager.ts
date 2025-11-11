export default class RuneManager {
  private scene: Phaser.Scene;
  private currentResource: number;
  private maxResource: number;
  private rechargeRate: number;
  private lastRechargeTime: number;

  constructor(scene: Phaser.Scene, maxResource: number = 10, rechargeRate: number = 2000) {
    this.scene = scene;
    this.maxResource = maxResource;
    this.currentResource = maxResource;
    this.rechargeRate = rechargeRate;
    this.lastRechargeTime = 0;
  }

  update(time: number): void {
    if (this.currentResource < this.maxResource) {
      if (time - this.lastRechargeTime >= this.rechargeRate) {
        this.lastRechargeTime = time;
        this.addResource(1);
      }
    }
  }

  canSpend(amount: number): boolean {
    return this.currentResource >= amount;
  }

  spendResource(amount: number): boolean {
    if (this.canSpend(amount)) {
      this.currentResource -= amount;
      this.scene.events.emit('resource-changed', this.currentResource);
      return true;
    }
    return false;
  }

  addResource(amount: number): void {
    this.currentResource = Math.min(this.currentResource + amount, this.maxResource);
    this.scene.events.emit('resource-changed', this.currentResource);
  }

  getCurrentResource(): number {
    return this.currentResource;
  }

  getMaxResource(): number {
    return this.maxResource;
  }
}
