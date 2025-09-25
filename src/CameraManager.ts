export default class CameraManager {
  private scene: Phaser.Scene;
  private camera: Phaser.Cameras.Scene2D.Camera;
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private isDragBlocked: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.camera = scene.cameras.main;
  }

  setupCameraDrag(): void {
    let lastPointerDistance = 0;

    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // 모바일: 터치, 데스크톱: 우클릭
      if ((pointer.rightButtonDown() || this.scene.input.activePointer.primaryDown) && !this.isDragBlocked) {
        this.isDragging = true;
        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
      }
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      // 핀치 줌 감지 (멀티터치)
      if (this.scene.input.pointer1 && this.scene.input.pointer2 && this.scene.input.pointer1.isDown && this.scene.input.pointer2.isDown) {
        const distance = Phaser.Math.Distance.Between(
          this.scene.input.pointer1.x, this.scene.input.pointer1.y,
          this.scene.input.pointer2.x, this.scene.input.pointer2.y
        );

        if (lastPointerDistance > 0) {
          const deltaDistance = distance - lastPointerDistance;
          const zoomFactor = deltaDistance > 0 ? 1.02 : 0.98;
          this.camera.zoom = Phaser.Math.Clamp(this.camera.zoom * zoomFactor, 0.3, 2.0);
        }

        lastPointerDistance = distance;
        this.isDragging = false; // 핀치 중에는 드래그 비활성화
        return;
      } else {
        lastPointerDistance = 0;
      }

      // 드래그 이동
      if (this.isDragging && (pointer.rightButtonDown() || pointer.primaryDown) && !this.isDragBlocked) {
        const deltaX = this.dragStartX - pointer.x;
        const deltaY = this.dragStartY - pointer.y;

        this.camera.scrollX += deltaX;
        this.camera.scrollY += deltaY;

        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
      }
    });

    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.rightButtonDown() && !pointer.primaryDown) {
        this.isDragging = false;
      }
    });

    // 데스크톱 휠 줌
    this.scene.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number) => {
      const zoomFactor = deltaY > 0 ? 0.9 : 1.1;
      this.camera.zoom = Phaser.Math.Clamp(this.camera.zoom * zoomFactor, 0.3, 2.0);
    });
  }

  centerOn(x: number, y: number): void {
    this.camera.centerOn(x, y);
  }

  setZoom(zoom: number): void {
    this.camera.setZoom(Phaser.Math.Clamp(zoom, 0.5, 2.0));
  }

  getZoom(): number {
    return this.camera.zoom;
  }

  blockDrag(): void {
    this.isDragBlocked = true;
  }

  unblockDrag(): void {
    this.isDragBlocked = false;
  }
}