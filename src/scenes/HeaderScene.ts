export default class HeaderScene extends Phaser.Scene {
  private diamondText: Phaser.GameObjects.Text;
  private diamondCount: number = 100; // 임시 값

  constructor() {
    super("HeaderScene");
  }

  create(): void {
    // 투명 배경으로 하위 씬들이 보이도록 설정
    this.cameras.main.setBackgroundColor("rgba(0,0,0,0)");

    // HeaderScene을 최상위로 이동
    this.scene.bringToTop();

    this.createResourceBar();
  }

  private createResourceBar(): void {
    const { width } = this.scale.gameSize;

    // 헤더 설정
    const headerPadding = 15; // 위아래 패딩
    const leftMargin = 20; // 왼쪽 여백
    const barY = 40; // 상단에서 40px 위치

    // 다이아몬드 바 설정
    const barWidth = 150; // 200 -> 150으로 줄임
    const barHeight = 50;
    const barX = leftMargin + barWidth / 2; // 왼쪽 정렬

    // resource_bar_bg를 나인슬라이스로 생성
    // spriteBorder: {x: 32, y: 29, z: 32, w: 27}
    const resourceBarBg = this.add.nineslice(
      barX,
      barY,
      "resource_bar_bg",
      undefined,
      barWidth,
      barHeight,
      32, // leftWidth
      29, // topHeight
      32, // rightWidth
      27 // bottomHeight
    );
    resourceBarBg.setOrigin(0.5);
    resourceBarBg.setTint(0x1a152d); // #1A152D 색상
    resourceBarBg.setDepth(10); // DeckScene의 배경 rectangle보다 높은 depth

    // 다이아몬드 아이콘
    const iconSize = 35;
    const iconX = barX - barWidth / 2 + 35; // 왼쪽에서 35px
    const icon = this.add.image(iconX, barY, "icon_diamond");
    icon.setDisplaySize(iconSize, iconSize);
    icon.setDepth(10); // DeckScene의 배경 rectangle보다 높은 depth

    // 다이아몬드 숫자 텍스트 (흰색)
    const textX = barX + 10; // 바 중앙보다 약간 오른쪽
    this.diamondText = this.add.text(
      textX,
      barY,
      this.diamondCount.toString(),
      {
        fontSize: "26px",
        color: "#FFFFFF",
        fontFamily: "Germania One",
        fontStyle: "bold",
      }
    );
    this.diamondText.setOrigin(0.5);
    this.diamondText.setDepth(10); // DeckScene의 배경 rectangle보다 높은 depth
  }

  public updateDiamondCount(count: number): void {
    this.diamondCount = count;
    if (this.diamondText) {
      this.diamondText.setText(this.diamondCount.toString());
    }
  }

  public getDiamondCount(): number {
    return this.diamondCount;
  }
}
