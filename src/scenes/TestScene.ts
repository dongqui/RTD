import { Modal } from "../ui/Modal";
import { StyledText } from "../ui/StyledText";
import { Button } from "../ui/Button";

export default class TestScene extends Phaser.Scene {
  private modal?: Modal;

  constructor() {
    super("TestScene");
  }

  create(): void {
    const { width, height } = this.scale.gameSize;

    // Background
    const background = this.add
      .rectangle(0, 0, width, height, 0x1a1a2e)
      .setOrigin(0, 0);

    // Title
    const title = new StyledText(this, width / 2, 60, {
      text: "Modal UI Test Scene",
      fontSize: "32px",
      color: "#ffffff",
    });
    title.setOrigin(0.5);

    // Test Modal 1 - Default Size
    const testButton1 = new Button(this, width / 2, height / 2 - 100, {
      text: "기본 크기 모달 테스트",
      width: 300,
      height: 60,
      color: "sky",
      textStyle: {
        fontSize: "20px",
      },
      onClick: () => this.showTestModal1(),
    });

    // Test Modal 2 - Large Size
    const testButton2 = new Button(this, width / 2, height / 2, {
      text: "큰 모달 테스트",
      width: 300,
      height: 60,
      color: "yellow",
      textStyle: {
        fontSize: "20px",
      },
      onClick: () => this.showTestModal2(),
    });

    // Test Modal 3 - Small Size
    const testButton3 = new Button(this, width / 2, height / 2 + 100, {
      text: "작은 모달 테스트",
      width: 300,
      height: 60,
      color: "red",
      textStyle: {
        fontSize: "20px",
      },
      onClick: () => this.showTestModal3(),
    });
  }

  private showTestModal1(): void {
    if (this.modal) {
      this.modal.destroy();
    }

    this.modal = new Modal(this, {
      title: "기본 크기 모달",
      width: 600,
      height: 400,
      showCloseButton: true,
      onClose: () => {
        this.modal?.hide();
      },
    });

    const container = (this.modal as any).getContentContainer();

    const text = new StyledText(this, 0, 0, {
      text: "이것은 기본 크기 모달입니다.\n\nNineSlice를 이용한 새로운 디자인!",
      fontSize: "20px",
      color: "#ffffff",
      align: "center",
      wordWrap: { width: 500 },
    });
    container.add(text);

    const closeButton = new Button(this, 0, 120, {
      text: "닫기",
      width: 150,
      height: 50,
      color: "red",
      textStyle: {
        fontSize: "18px",
      },
      onClick: () => {
        this.modal?.hide();
      },
    });
    container.add(closeButton);

    this.modal.show();
  }

  private showTestModal2(): void {
    if (this.modal) {
      this.modal.destroy();
    }

    this.modal = new Modal(this, {
      title: "큰 모달",
      width: 900,
      height: 600,
      showCloseButton: true,
      onClose: () => {
        this.modal?.hide();
      },
    });

    const container = (this.modal as any).getContentContainer();

    const text = new StyledText(this, 0, -50, {
      text: "이것은 큰 모달입니다.\n\n더 많은 콘텐츠를 표시할 수 있습니다.",
      fontSize: "24px",
      color: "#ffffff",
      align: "center",
      wordWrap: { width: 800 },
    });
    container.add(text);

    const closeButton = new Button(this, 0, 200, {
      text: "닫기",
      width: 200,
      height: 60,
      color: "yellow",
      textStyle: {
        fontSize: "22px",
      },
      onClick: () => {
        this.modal?.hide();
      },
    });
    container.add(closeButton);

    this.modal.show();
  }

  private showTestModal3(): void {
    if (this.modal) {
      this.modal.destroy();
    }

    this.modal = new Modal(this, {
      title: "작은 모달",
      width: 400,
      height: 300,
      showCloseButton: true,
      onClose: () => {
        this.modal?.hide();
      },
    });

    const container = (this.modal as any).getContentContainer();

    const text = new StyledText(this, 0, -20, {
      text: "작은 모달 테스트",
      fontSize: "18px",
      color: "#ffffff",
      align: "center",
    });
    container.add(text);

    const closeButton = new Button(this, 0, 80, {
      text: "닫기",
      width: 120,
      height: 45,
      color: "sky",
      textStyle: {
        fontSize: "16px",
      },
      onClick: () => {
        this.modal?.hide();
      },
    });
    container.add(closeButton);

    this.modal.show();
  }
}
