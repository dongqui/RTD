import { Reward } from "./RewardSystem";

export class RewardUI {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Graphics;
  private rewardCards: Phaser.GameObjects.Container[] = [];
  private onRewardSelected: (reward: Reward) => void;

  constructor(scene: Phaser.Scene, onRewardSelected: (reward: Reward) => void) {
    this.scene = scene;
    this.onRewardSelected = onRewardSelected;
    this.createUI();
  }

  private createUI() {
    const { width, height } = this.scene.scale.gameSize;

    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(10000);
    this.container.setVisible(false);

    // 반투명 배경
    this.background = this.scene.add.graphics();
    this.background.fillStyle(0x000000, 0.8);
    this.background.fillRect(0, 0, width, height);
    this.container.add(this.background);

    const isMobile = width < 800 || height < 600;

    // 제목
    const title = this.scene.add.text(width / 2, height / 2 - (isMobile ? 120 : 200), '보상 선택', {
      fontSize: isMobile ? '36px' : '48px',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    this.container.add(title);

    // 설명
    const description = this.scene.add.text(width / 2, height / 2 - (isMobile ? 80 : 150), '아래 보상 중 하나를 선택하세요', {
      fontSize: isMobile ? '18px' : '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5, 0.5);
    this.container.add(description);
  }

  showRewards(rewards: Reward[]) {
    // 기존 카드들 제거
    this.clearRewardCards();

    const { width, height } = this.scene.scale.gameSize;
    const isMobile = width < 800 || height < 600;

    const cardWidth = isMobile ? 150 : 200;
    const cardHeight = isMobile ? 200 : 280;
    const spacing = isMobile ? 20 : 50;
    const totalWidth = (cardWidth * rewards.length) + (spacing * (rewards.length - 1));
    const startX = (width - totalWidth) / 2 + cardWidth / 2;
    const cardY = isMobile ? height / 2 + 20 : height / 2;

    console.log('Creating reward cards...');
    console.log('Screen size:', width, 'x', height);
    console.log('Card positions will be at y:', cardY);

    rewards.forEach((reward, index) => {
      const cardX = startX + (cardWidth + spacing) * index;
      console.log(`Creating card ${index} at position (${cardX}, ${cardY})`);
      const card = this.createRewardCard(reward, cardX, cardY, cardWidth, cardHeight);
      this.rewardCards.push(card);
      this.container.add(card);

      // 컨테이너 레벨에서도 클릭 처리 추가 (백업)
      card.setInteractive(new Phaser.Geom.Rectangle(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight), Phaser.Geom.Rectangle.Contains);
      card.on('pointerdown', () => {
        console.log(`!!! Container level click: ${reward.name} !!!`);
        this.selectReward(reward);
      });
    });

    this.container.setVisible(true);
    console.log('RewardUI container is now visible');
  }

  private createRewardCard(reward: Reward, x: number, y: number, width: number, height: number): Phaser.GameObjects.Container {
    const card = this.scene.add.container(x, y);

    // 인터랙티브 영역을 먼저 생성 (가장 위에)
    const hitArea = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.setDepth(1000); // 높은 depth 설정

    // 카드 배경
    const cardBg = this.scene.add.graphics();
    cardBg.fillStyle(0x2C3E50, 1);
    cardBg.fillRoundedRect(-width/2, -height/2, width, height, 10);
    cardBg.lineStyle(3, 0x3498DB);
    cardBg.strokeRoundedRect(-width/2, -height/2, width, height, 10);
    card.add(cardBg);

    // 타워 아이콘 (임시로 색깔 원으로 표시)
    const iconColor = this.getTowerColor(reward.towerType);
    const icon = this.scene.add.graphics();
    icon.fillStyle(iconColor, 1);
    const iconRadius = isMobile ? 30 : 40;
    const iconY = isMobile ? -40 : -60;
    icon.fillCircle(0, iconY, iconRadius);
    card.add(icon);

    const isMobile = width < 800 || height < 600;

    // 보상 이름
    const nameText = this.scene.add.text(0, isMobile ? 0 : -10, reward.name, {
      fontSize: isMobile ? '16px' : '18px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: width - 20 }
    }).setOrigin(0.5, 0.5);
    card.add(nameText);

    // 보상 설명
    const descText = this.scene.add.text(0, isMobile ? 30 : 40, reward.description, {
      fontSize: isMobile ? '12px' : '14px',
      color: '#BDC3C7',
      align: 'center',
      wordWrap: { width: width - 20 }
    }).setOrigin(0.5, 0.5);
    card.add(descText);

    // hitArea를 마지막에 추가 (가장 위에 오도록)
    card.add(hitArea);

    // 이벤트 리스너들
    hitArea.on('pointerover', () => {
      console.log(`Hovering over ${reward.name}`);
      cardBg.clear();
      cardBg.fillStyle(0x34495E, 1);
      cardBg.fillRoundedRect(-width/2, -height/2, width, height, 10);
      cardBg.lineStyle(3, 0x52C0F5);
      cardBg.strokeRoundedRect(-width/2, -height/2, width, height, 10);
    });

    hitArea.on('pointerout', () => {
      console.log(`Left ${reward.name}`);
      cardBg.clear();
      cardBg.fillStyle(0x2C3E50, 1);
      cardBg.fillRoundedRect(-width/2, -height/2, width, height, 10);
      cardBg.lineStyle(3, 0x3498DB);
      cardBg.strokeRoundedRect(-width/2, -height/2, width, height, 10);
    });

    hitArea.on('pointerdown', () => {
      console.log(`!!! Reward card clicked: ${reward.name} !!!`);
      this.selectReward(reward);
    });

    // 디버깅을 위한 테스트 로그
    console.log(`Created reward card for: ${reward.name} at (${x}, ${y})`);

    return card;
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
    console.log(`=== SELECTING REWARD: ${reward.name} ===`);
    console.log('Reward object:', reward);
    console.log('Calling onRewardSelected callback...');

    this.hide();
    this.onRewardSelected(reward);

    console.log('RewardUI hidden, callback executed');
  }

  private clearRewardCards() {
    this.rewardCards.forEach(card => card.destroy());
    this.rewardCards = [];
  }

  hide() {
    this.container.setVisible(false);
    this.clearRewardCards();
  }

  destroy() {
    this.hide();
    this.container.destroy();
  }
}