import { TowerType } from "./TowerManager";

export interface Reward {
  id: string;
  type: RewardType;
  name: string;
  description: string;
  iconKey?: string;
  towerType?: TowerType;
}

export enum RewardType {
  TOWER = "tower",
  UPGRADE = "upgrade",
  POWERUP = "powerup"
}

export class RewardSystem {
  private scene: Phaser.Scene;
  private availableRewards: Reward[];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initializeRewards();
  }

  private initializeRewards() {
    this.availableRewards = [
      {
        id: "arrow_tower",
        type: "tower",
        name: "화살 타워",
        description: "빠른 공격속도의 기본 타워",
        towerType: "arrow"
      },
      {
        id: "cannon_tower",
        type: "tower",
        name: "대포 타워",
        description: "강력한 피해의 범위 공격 타워",
        towerType: "cannon"
      },
      {
        id: "frost_tower",
        type: "tower",
        name: "냉기 타워",
        description: "적을 둔화시키는 특수 타워",
        towerType: "frost"
      },
      {
        id: "extra_arrow",
        type: "tower",
        name: "추가 화살 타워",
        description: "또 다른 화살 타워를 배치하세요",
        towerType: "arrow"
      }
    ];
  }

  getRandomRewards(count: number = 4): Reward[] {
    const shuffled = [...this.availableRewards].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, this.availableRewards.length));
  }

  getRewardById(id: string): Reward | undefined {
    return this.availableRewards.find(reward => reward.id === id);
  }
}