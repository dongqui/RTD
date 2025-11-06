export interface SpawnGroup {
  enemyType: string;
  count: number;
  interval: number;
  healthMultiplier: number;
  speedMultiplier?: number;
  rewardMultiplier?: number;
  delay?: number;
}

export interface WaveConfig {
  waveNumber: number;
  spawnGroups: SpawnGroup[];
  description?: string;
}

export class WaveConfigManager {
  private static configs: WaveConfig[] = [
    {
      waveNumber: 1,
      description: "첫 번째 웨이브",
      spawnGroups: [
        {
          enemyType: "enemy_warrior",
          count: 5,
          interval: 2000,
          healthMultiplier: 1.0,
          rewardMultiplier: 1.0,
        },
      ],
    },
    {
      waveNumber: 2,
      description: "조금 더 많은 적",
      spawnGroups: [
        {
          enemyType: "enemy_warrior",
          count: 8,
          interval: 1800,
          healthMultiplier: 1.2,
          rewardMultiplier: 1.1,
        },
      ],
    },
    {
      waveNumber: 3,
      description: "더 강한 적",
      spawnGroups: [
        {
          enemyType: "enemy_warrior",
          count: 10,
          interval: 1600,
          healthMultiplier: 1.5,
          rewardMultiplier: 1.2,
        },
      ],
    },
    {
      waveNumber: 4,
      description: "빠른 웨이브",
      spawnGroups: [
        {
          enemyType: "enemy_warrior",
          count: 12,
          interval: 1400,
          healthMultiplier: 1.8,
          speedMultiplier: 1.2,
          rewardMultiplier: 1.3,
        },
      ],
    },
    {
      waveNumber: 5,
      description: "첫 번째 도전",
      spawnGroups: [
        {
          enemyType: "enemy_warrior",
          count: 15,
          interval: 1200,
          healthMultiplier: 2.0,
          speedMultiplier: 1.3,
          rewardMultiplier: 1.5,
        },
      ],
    },
    {
      waveNumber: 6,
      description: "물량 공세",
      spawnGroups: [
        {
          enemyType: "enemy_warrior",
          count: 20,
          interval: 1000,
          healthMultiplier: 2.2,
          speedMultiplier: 1.3,
          rewardMultiplier: 1.6,
        },
      ],
    },
    {
      waveNumber: 7,
      description: "강화된 적들",
      spawnGroups: [
        {
          enemyType: "enemy_warrior",
          count: 18,
          interval: 1100,
          healthMultiplier: 2.5,
          speedMultiplier: 1.4,
          rewardMultiplier: 1.7,
        },
      ],
    },
    {
      waveNumber: 8,
      description: "지옥의 시작",
      spawnGroups: [
        {
          enemyType: "enemy_warrior",
          count: 22,
          interval: 900,
          healthMultiplier: 3.0,
          speedMultiplier: 1.5,
          rewardMultiplier: 1.8,
        },
      ],
    },
    {
      waveNumber: 9,
      description: "두 번째 도전",
      spawnGroups: [
        {
          enemyType: "enemy_warrior",
          count: 25,
          interval: 800,
          healthMultiplier: 3.5,
          speedMultiplier: 1.6,
          rewardMultiplier: 2.0,
        },
      ],
    },
    {
      waveNumber: 10,
      description: "절반의 성공",
      spawnGroups: [
        {
          enemyType: "enemy_warrior",
          count: 28,
          interval: 750,
          healthMultiplier: 4.0,
          speedMultiplier: 1.7,
          rewardMultiplier: 2.2,
        },
      ],
    },
    {
      waveNumber: 11,
      description: "극한의 물량",
      spawnGroups: [
        {
          enemyType: "enemy_warrior",
          count: 32,
          interval: 700,
          healthMultiplier: 4.5,
          speedMultiplier: 1.8,
          rewardMultiplier: 2.4,
        },
      ],
    },
    {
      waveNumber: 12,
      description: "최강의 적들",
      spawnGroups: [
        {
          enemyType: "enemy_warrior",
          count: 35,
          interval: 650,
          healthMultiplier: 5.0,
          speedMultiplier: 2.0,
          rewardMultiplier: 2.6,
        },
      ],
    },
    {
      waveNumber: 13,
      description: "악몽",
      spawnGroups: [
        {
          enemyType: "enemy_warrior",
          count: 40,
          interval: 600,
          healthMultiplier: 5.5,
          speedMultiplier: 2.2,
          rewardMultiplier: 2.8,
        },
      ],
    },
    {
      waveNumber: 14,
      description: "최후의 시험",
      spawnGroups: [
        {
          enemyType: "enemy_warrior",
          count: 45,
          interval: 550,
          healthMultiplier: 6.0,
          speedMultiplier: 2.4,
          rewardMultiplier: 3.0,
        },
      ],
    },
    {
      waveNumber: 15,
      description: "최종 결전",
      spawnGroups: [
        {
          enemyType: "enemy_warrior",
          count: 50,
          interval: 500,
          healthMultiplier: 7.0,
          speedMultiplier: 2.5,
          rewardMultiplier: 3.5,
        },
      ],
    },
  ];

  static getWaveConfig(waveNumber: number): WaveConfig | null {
    const config = this.configs.find((c) => c.waveNumber === waveNumber);
    return config || null;
  }

  static getTotalWaves(): number {
    return this.configs.length;
  }

  static getAllConfigs(): WaveConfig[] {
    return [...this.configs];
  }
}
