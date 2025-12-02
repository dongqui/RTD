import ComposerScene from "./scenes/ComposerScene";

export class PreviewManager {
  private previewCache: Map<string, string> = new Map();
  private pendingRequests: Map<string, Promise<string>> = new Map();
  private scene: ComposerScene | null = null;

  setScene(scene: ComposerScene) {
    this.scene = scene;
  }

  async getPreview(
    partName: string,
    width: number = 128,
    height: number = 128
  ): Promise<string> {
    // 캐시 확인
    if (this.previewCache.has(partName)) {
      return this.previewCache.get(partName)!;
    }

    // 중복 요청 확인
    if (this.pendingRequests.has(partName)) {
      return this.pendingRequests.get(partName)!;
    }

    // 신규 프리뷰 생성
    if (!this.scene) {
      throw new Error("Scene not initialized");
    }

    const promise = this.scene.generatePartPreview(partName, width, height);
    this.pendingRequests.set(partName, promise);

    try {
      const dataURL = await promise;
      this.previewCache.set(partName, dataURL);
      return dataURL;
    } finally {
      this.pendingRequests.delete(partName);
    }
  }

  clearCache() {
    this.previewCache.clear();
    this.pendingRequests.clear();
  }

  getCacheSize(): number {
    return this.previewCache.size;
  }
}
