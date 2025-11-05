import Phaser from "phaser";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { StyledText } from "./StyledText";

export interface ConfirmModalConfig {
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export class ConfirmModal extends Modal {
  private confirmConfig: ConfirmModalConfig;

  constructor(scene: Phaser.Scene, config: ConfirmModalConfig) {
    super(scene, {
      width: 500,
      height: 250,
      backgroundColor: 0x261c3c,
    });

    this.confirmConfig = {
      confirmText: "확인",
      cancelText: "취소",
      ...config,
    };

    this.createContent();
    this.setVisible(false);
  }

  private createContent(): void {
    const container = this.getContentContainer();

    // Message text
    const messageText = new StyledText(this.scene, 0, -20, {
      text: this.confirmConfig.message,
      fontSize: "24px",
      align: "center",
      wordWrap: { width: 450 },
    });
    container.add(messageText);

    // Buttons container
    const buttonsContainer = this.scene.add.container(0, 60);
    container.add(buttonsContainer);

    // Cancel button
    const cancelButton = new Button(this.scene, -130, 0, {
      text: this.confirmConfig.cancelText!,
      width: 120,
      height: 50,
      color: "red",
      textStyle: {
        fontSize: "20px",
      },
      onClick: () => {
        this.hide(() => {
          this.confirmConfig.onCancel();
        });
      },
    });
    buttonsContainer.add(cancelButton);

    // Confirm button
    const confirmButton = new Button(this.scene, 130, 0, {
      text: this.confirmConfig.confirmText!,
      width: 120,
      height: 50,
      color: "sky",
      textStyle: {
        fontSize: "20px",
      },
      onClick: () => {
        this.hide(() => {
          this.confirmConfig.onConfirm();
        });
      },
    });
    buttonsContainer.add(confirmButton);
  }
}
