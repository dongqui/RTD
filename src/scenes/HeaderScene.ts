import CurrencyManager from "../managers/CurrencyManager";

export default class HeaderScene extends Phaser.Scene {
  private diamondText!: Phaser.GameObjects.Text;
  private currencyManager: CurrencyManager;
  private onCurrencyChange: (diamonds: number) => void;

  constructor() {
    super("HeaderScene");
    this.currencyManager = CurrencyManager.getInstance();
    this.onCurrencyChange = (diamonds: number) => this.updateDiamondDisplay(diamonds);
  }

  create(): void {
    // 투명 배경으로 하위 씬들이 보이도록 설정
    this.cameras.main.setBackgroundColor("rgba(0,0,0,0)");

    // HeaderScene을 최상위로 이동
    this.scene.bringToTop();

    this.createResourceBar();

    // Subscribe to currency changes
    this.currencyManager.onChange(this.onCurrencyChange);

    // Cleanup on scene shutdown
    this.events.on("shutdown", () => {
      this.currencyManager.offChange(this.onCurrencyChange);
    });
  }

  private createResourceBar(): void {
    // 헤더 설정
    const leftMargin = 20; // 왼쪽 여백
    const barY = 40; // 상단에서 40px 위치

    // 다이아몬드 바 설정
    const barWidth = 150;
    const barHeight = 50;
    const barX = leftMargin + barWidth / 2; // 왼쪽 정렬

    // resource_bar_bg를 나인슬라이스로 생성
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
    resourceBarBg.setTint(0x1a152d);
    resourceBarBg.setDepth(10);

    // 다이아몬드 아이콘
    const iconSize = 35;
    const iconX = barX - barWidth / 2 + 35;
    const icon = this.add.image(iconX, barY, "icon_diamond");
    icon.setDisplaySize(iconSize, iconSize);
    icon.setDepth(10);

    // 다이아몬드 숫자 텍스트
    const textX = barX + 10;
    this.diamondText = this.add.text(
      textX,
      barY,
      this.currencyManager.getDiamonds().toString(),
      {
        fontSize: "26px",
        color: "#FFFFFF",
        fontFamily: "Germania One",
        fontStyle: "bold",
      }
    );
    this.diamondText.setOrigin(0.5);
    this.diamondText.setDepth(10);
  }

  private updateDiamondDisplay(diamonds: number): void {
    if (this.diamondText) {
      this.diamondText.setText(diamonds.toString());
    }
  }
}
