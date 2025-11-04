import BottomNavigation from "../ui/BottomNavigation";

export default class UIScene extends Phaser.Scene {
  private navigation: BottomNavigation;

  constructor() {
    super("UIScene");
  }

  create(): void {
    // 투명 배경으로 하위 씬들이 보이도록 설정
    this.cameras.main.setBackgroundColor("rgba(0,0,0,0)");

    // UIScene을 최상위로 이동하여 항상 위에 렌더링되도록 함
    this.scene.bringToTop();

    // BottomNavigation 생성 (싱글톤)
    this.navigation = BottomNavigation.getInstance(this);

    // 게임 이벤트를 통한 네비게이션 제어
    this.game.events.on("hideNavigation", this.hideNavigation, this);
    this.game.events.on("showNavigation", this.showNavigation, this);
  }

  private hideNavigation(): void {
    this.navigation.hide();
  }

  private showNavigation(): void {
    this.navigation.show();
  }

  shutdown(): void {
    // 이벤트 리스너 정리
    this.game.events.off("hideNavigation", this.hideNavigation, this);
    this.game.events.off("showNavigation", this.showNavigation, this);
  }
}
