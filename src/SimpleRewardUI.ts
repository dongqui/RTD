import { Reward } from "./RewardSystem";

export class SimpleRewardUI {
  private scene: Phaser.Scene;
  private onRewardSelected: (reward: Reward) => void;
  private rewardElements: Phaser.GameObjects.GameObject[] = [];
  private background: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, onRewardSelected: (reward: Reward) => void) {
    this.scene = scene;
    this.onRewardSelected = onRewardSelected;
  }

  showRewards(rewards: Reward[]) {
    console.log('=== SimpleRewardUI: Showing rewards ===');
    this.clearRewards();

    const { width, height } = this.scene.scale.gameSize;

    // 반투명 배경
    this.background = this.scene.add.graphics();
    this.background.fillStyle(0x000000, 0.8);
    this.background.fillRect(0, 0, width, height);
    this.background.setScrollFactor(0);
    this.background.setDepth(5000);
    this.rewardElements.push(this.background);

    // 제목
    const title = this.scene.add.text(width / 2, height / 2 - 200, '보상 선택', {
      fontSize: '48px',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(5001);
    this.rewardElements.push(title);

    // 카드 배치
    const cardWidth = 200;
    const cardHeight = 280;
    const spacing = 50;
    const totalWidth = (cardWidth * rewards.length) + (spacing * (rewards.length - 1));
    const startX = (width - totalWidth) / 2 + cardWidth / 2;
    const cardY = height / 2;

    rewards.forEach((reward, index) => {
      const cardX = startX + (cardWidth + spacing) * index;
      this.createSimpleCard(reward, cardX, cardY, cardWidth, cardHeight);
    });
  }

  private createSimpleCard(reward: Reward, x: number, y: number, width: number, height: number) {
    console.log(`Creating simple card for: ${reward.name} at (${x}, ${y})`);

    // 카드 배경
    const cardBg = this.scene.add.graphics();
    cardBg.fillStyle(0x2C3E50, 1);
    cardBg.fillRoundedRect(x - width/2, y - height/2, width, height, 10);
    cardBg.lineStyle(3, 0x3498DB);
    cardBg.strokeRoundedRect(x - width/2, y - height/2, width, height, 10);
    cardBg.setScrollFactor(0);
    cardBg.setDepth(5002);
    this.rewardElements.push(cardBg);

    // 타워 아이콘
    const iconColor = this.getTowerColor(reward.towerType);
    const icon = this.scene.add.graphics();
    icon.fillStyle(iconColor, 1);
    icon.fillCircle(x, y - 60, 40);
    icon.setScrollFactor(0);
    icon.setDepth(5003);
    this.rewardElements.push(icon);

    // 보상 이름
    const nameText = this.scene.add.text(x, y - 10, reward.name, {
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(5003);
    this.rewardElements.push(nameText);

    // 보상 설명
    const descText = this.scene.add.text(x, y + 40, reward.description, {
      fontSize: '14px',
      color: '#BDC3C7',
      align: 'center',
      wordWrap: { width: width - 20 }
    }).setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(5003);
    this.rewardElements.push(descText);

    // 클릭 영역 - 가장 위에
    const clickArea = this.scene.add.rectangle(x, y, width, height, 0x000000, 0);
    clickArea.setInteractive({ useHandCursor: true });
    clickArea.setScrollFactor(0);
    clickArea.setDepth(5004);
    this.rewardElements.push(clickArea);

    // 이벤트
    clickArea.on('pointerover', () => {
      console.log(`HOVER: ${reward.name}`);
      cardBg.clear();
      cardBg.fillStyle(0x34495E, 1);
      cardBg.fillRoundedRect(x - width/2, y - height/2, width, height, 10);
      cardBg.lineStyle(3, 0x52C0F5);
      cardBg.strokeRoundedRect(x - width/2, y - height/2, width, height, 10);
    });

    clickArea.on('pointerout', () => {
      console.log(`LEAVE: ${reward.name}`);
      cardBg.clear();
      cardBg.fillStyle(0x2C3E50, 1);
      cardBg.fillRoundedRect(x - width/2, y - height/2, width, height, 10);
      cardBg.lineStyle(3, 0x3498DB);
      cardBg.strokeRoundedRect(x - width/2, y - height/2, width, height, 10);
    });

    clickArea.on('pointerdown', () => {
      console.log(`!!! CLICK: ${reward.name} !!!`);
      this.selectReward(reward);
    });
  }

  private getTowerColor(towerType?: string): number {
    switch (towerType) {
      case 'arrow': return 0x2ECC71;  // 녹색
      case 'cannon': return 0xE74C3C; // 빨간색
      case 'frost': return 0x3498DB;  // 파란색
      default: return 0x95A5A6;       // 회색
    }
  }

  private selectReward(reward: Reward) {
    console.log(`=== SELECTING: ${reward.name} ===`);
    this.hide();
    this.onRewardSelected(reward);
  }

  private clearRewards() {
    this.rewardElements.forEach(element => element.destroy());
    this.rewardElements = [];
  }

  hide() {
    this.clearRewards();
  }

  destroy() {
    this.hide();
  }
}