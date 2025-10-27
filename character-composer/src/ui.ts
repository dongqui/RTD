import { Skin } from "@esotericsoftware/spine-core";

export class ComposerUI {
  private selectedParts: string[] = [];
  private allSkins: any = {};
  private skeletonData: any = null;
  private spineObject: any = null;
  private currentAnimation: string = "Idle";
  private isFlipped: boolean = false;
  private skinColor: string = "#ffc294";
  private hairColor: string = "#212121";

  async init() {
    await this.loadSpineData();
    this.setupEventListeners();
    this.loadPresets();

    // Phaser에서 spine 객체가 준비될 때까지 대기
    const game = (window as any).game as Phaser.Game;
    game.events.once("spine-ready", (spineObject: any) => {
      this.spineObject = spineObject;
      console.log("UI received spine object");
      this.updateCharacterSkin();
    });
  }

  async loadSpineData() {
    try {
      const response = await fetch(
        "../public/assets/spine/Fantasy Character.json"
      );
      const data = await response.json();
      this.skeletonData = data;

      if (data.skins) {
        data.skins.forEach((skin: any) => {
          this.allSkins[skin.name] = skin;
        });
      }

      this.populatePartsList();
      if (data.animations && Array.isArray(data.animations)) {
        this.populateAnimationList();
      }
    } catch (error) {
      console.error("Failed to load spine data:", error);
    }
  }

  populatePartsList() {
    const categoriesDiv = document.getElementById("parts-categories")!;
    const categories: { [key: string]: string[] } = {};

    Object.keys(this.allSkins).forEach((skinName) => {
      if (skinName === "default" || skinName === "full_skins_f") return;

      const parts = skinName.split("/");
      const categoryName = parts[0];

      if (!categories[categoryName]) {
        categories[categoryName] = [];
      }
      categories[categoryName].push(skinName);
    });

    const sortedCategories = Object.keys(categories).sort();
    categoriesDiv.innerHTML = "";

    sortedCategories.forEach((categoryName) => {
      const categoryDiv = document.createElement("div");
      categoryDiv.className = "category";

      const header = document.createElement("div");
      header.className = "category-header";
      header.innerHTML = `
        <span class="category-title">${categoryName}</span>
        <span class="category-count">${categories[categoryName].length}</span>
      `;

      const itemsDiv = document.createElement("div");
      itemsDiv.className = "category-items";

      categories[categoryName].sort().forEach((skinName) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "part-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `part-${skinName}`;
        checkbox.value = skinName;
        checkbox.addEventListener("change", (e) => this.onPartToggle(e));

        const label = document.createElement("label");
        label.htmlFor = `part-${skinName}`;
        label.textContent = skinName.split("/")[1] || skinName;

        itemDiv.appendChild(checkbox);
        itemDiv.appendChild(label);
        itemsDiv.appendChild(itemDiv);
      });

      header.addEventListener("click", () => {
        itemsDiv.classList.toggle("collapsed");
      });

      categoryDiv.appendChild(header);
      categoryDiv.appendChild(itemsDiv);
      categoriesDiv.appendChild(categoryDiv);
    });
  }

  populateAnimationList() {
    if (!this.skeletonData || !this.skeletonData.animations) {
      console.warn("No animations found in skeleton data");
      return;
    }

    const select = document.getElementById(
      "animation-select"
    ) as HTMLSelectElement;
    select.innerHTML = "";

    const animations = this.skeletonData.animations;

    if (Array.isArray(animations)) {
      animations.forEach((anim: any) => {
        const option = document.createElement("option");
        option.value = anim.name || anim;
        option.textContent = anim.name || anim;
        select.appendChild(option);
      });
    } else if (typeof animations === "object") {
      Object.keys(animations).forEach((animName) => {
        const option = document.createElement("option");
        option.value = animName;
        option.textContent = animName;
        select.appendChild(option);
      });
    }

    if (select.options.length > 0) {
      select.value = this.currentAnimation;
    }
  }

  onPartToggle(event: Event) {
    const target = event.target as HTMLInputElement;
    const skinName = target.value;

    if (target.checked) {
      if (!this.selectedParts.includes(skinName)) {
        this.selectedParts.push(skinName);
      }
    } else {
      this.selectedParts = this.selectedParts.filter((p) => p !== skinName);
    }

    this.selectedParts.sort();
    this.updateCharacterSkin();
    this.updateOutput();
  }

  updateCharacterSkin() {
    if (!this.spineObject) {
      console.log("Spine object not ready yet");
      return;
    }

    console.log("Updating skin with parts:", this.selectedParts);

    const customSkin = new Skin("custom");

    this.selectedParts.forEach((skinName) => {
      const skin = this.spineObject.skeleton.data.findSkin(skinName);
      console.log(skin);

      if (skin) {
        console.log("Adding skin:", skinName);
        customSkin.addSkin(skin);
      } else {
        console.warn("Skin not found:", skinName);
      }
    });

    this.spineObject.skeleton.setSkin(customSkin);
    this.spineObject.skeleton.setSlotsToSetupPose();

    this.applyColors();
    console.log("Skin updated successfully");
  }

  private applyColors() {
    if (!this.spineObject) return;

    const skinSlots: string[] = [
      "arm_r",
      "leg_l",
      "leg_r",
      "body",
      "head",
      "arm_l",
    ];

    const hairSlots: string[] = ["hair_long", "beard", "brow", "hair", "helmet_hair"];

    const skinRgb = this.hexToRgb(this.skinColor);
    skinSlots.forEach((slotName) => {
      const slot = this.spineObject.skeleton.findSlot(slotName);
      if (slot) {
        slot.color.r = skinRgb.r / 255;
        slot.color.g = skinRgb.g / 255;
        slot.color.b = skinRgb.b / 255;
        slot.color.a = 1;
      }
    });

    const hairRgb = this.hexToRgb(this.hairColor);
    hairSlots.forEach((slotName) => {
      const slot = this.spineObject.skeleton.findSlot(slotName);
      if (slot) {
        slot.color.r = hairRgb.r / 255;
        slot.color.g = hairRgb.g / 255;
        slot.color.b = hairRgb.b / 255;
        slot.color.a = 1;
      }
    });
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 50, g: 60, b: 70 };
  }

  updateOutput() {
    const tsOutput = document.getElementById("output-ts")!;
    const jsonOutput = document.getElementById("output-json")!;

    const formattedParts = this.selectedParts
      .map((p) => `    "${p}"`)
      .join(",\n");

    const colorConfig = `
skinColor = "${this.skinColor}";
hairColor = "${this.hairColor}";
skinKeys = [
${formattedParts}
];`;

    tsOutput.innerHTML = `<code>${colorConfig}</code>`;

    const outputData = {
      skinColor: this.skinColor,
      hairColor: this.hairColor,
      skinKeys: this.selectedParts
    };

    jsonOutput.innerHTML = `<code>${JSON.stringify(
      outputData,
      null,
      2
    )}</code>`;
  }

  setupEventListeners() {
    document
      .getElementById("animation-select")!
      .addEventListener("change", (e) => {
        const target = e.target as HTMLSelectElement;
        this.currentAnimation = target.value;
        if (this.spineObject && this.spineObject.animationState) {
          this.spineObject.animationState.setAnimation(
            0,
            this.currentAnimation,
            true
          );
        }
      });

    const scaleSlider = document.getElementById(
      "scale-slider"
    ) as HTMLInputElement;
    const scaleValue = document.getElementById("scale-value")!;
    scaleSlider.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      const scale = parseFloat(target.value);
      scaleValue.textContent = scale.toFixed(1);
      if (this.spineObject) {
        this.spineObject.setScale(this.isFlipped ? -scale : scale, scale);
      }
    });

    document.getElementById("reset-btn")!.addEventListener("click", () => {
      this.selectedParts = [];
      document
        .querySelectorAll('.part-item input[type="checkbox"]')
        .forEach((cb) => {
          (cb as HTMLInputElement).checked = false;
        });
      this.updateCharacterSkin();
      this.updateOutput();
    });

    document.getElementById("flip-btn")!.addEventListener("click", () => {
      this.isFlipped = !this.isFlipped;
      if (this.spineObject) {
        const scale = parseFloat(scaleSlider.value);
        this.spineObject.setScale(this.isFlipped ? -scale : scale, scale);
      }
    });

    document.getElementById("copy-btn")!.addEventListener("click", () => {
      const outputData = {
        skinColor: this.skinColor,
        hairColor: this.hairColor,
        skinKeys: this.selectedParts
      };

      const text = JSON.stringify(outputData, null, 2);
      navigator.clipboard
        .writeText(text)
        .then(() => {
          alert("설정이 클립보드에 복사되었습니다!");
        })
        .catch((err) => {
          console.error("Failed to copy:", err);
        });
    });

    document
      .getElementById("save-preset-btn")!
      .addEventListener("click", () => {
        const name = prompt("프리셋 이름을 입력하세요:");
        if (name && name.trim()) {
          this.savePreset(name.trim());
        }
      });

    const searchInput = document.getElementById("search") as HTMLInputElement;
    searchInput.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      this.filterParts(target.value.toLowerCase());
    });

    const skinColorInput = document.getElementById(
      "skin-color"
    ) as HTMLInputElement;
    skinColorInput.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      this.skinColor = target.value;
      this.applyColors();
      this.updateOutput();
    });

    const hairColorInput = document.getElementById(
      "hair-color"
    ) as HTMLInputElement;
    hairColorInput.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      this.hairColor = target.value;
      this.applyColors();
      this.updateOutput();
    });

    document.getElementById("export-image-btn")!.addEventListener("click", () => {
      const unitTypeInput = document.getElementById("unit-type-input") as HTMLInputElement;
      const unitType = unitTypeInput.value.trim();

      if (!unitType) {
        alert("유닛 타입을 입력해주세요! (예: warrior, archer, lightning_wizard, frozen_wizard)");
        return;
      }

      const game = (window as any).game as Phaser.Game;
      const scene = game.scene.getScene("ComposerScene") as any;

      if (scene && scene.captureCharacter) {
        scene.captureCharacter(unitType);
        alert(`이미지가 unit_portrait_${unitType}.png 로 저장됩니다!`);
      } else {
        console.error("Scene not found or captureCharacter method missing");
      }
    });
  }

  filterParts(searchTerm: string) {
    const allItems = document.querySelectorAll(".part-item");
    allItems.forEach((item) => {
      const label = item.querySelector("label")!;
      const text = label.textContent!.toLowerCase();
      if (text.includes(searchTerm)) {
        (item as HTMLElement).style.display = "flex";
      } else {
        (item as HTMLElement).style.display = "none";
      }
    });
  }

  savePreset(name: string) {
    const presets = this.loadPresetsData();
    presets[name] = {
      skinKeys: [...this.selectedParts],
      skinColor: this.skinColor,
      hairColor: this.hairColor
    };
    localStorage.setItem("character-presets", JSON.stringify(presets));
    this.loadPresets();
    alert(`프리셋 "${name}"이(가) 저장되었습니다!`);
  }

  loadPresetsData(): { [key: string]: any } {
    const data = localStorage.getItem("character-presets");
    return data ? JSON.parse(data) : {};
  }

  loadPresets() {
    const presets = this.loadPresetsData();
    const presetsList = document.getElementById("presets-list")!;

    presetsList.innerHTML = "";

    Object.keys(presets).forEach((name) => {
      const presetDiv = document.createElement("div");
      presetDiv.className = "preset-item";

      presetDiv.innerHTML = `
        <span class="preset-name">${name}</span>
        <div class="preset-actions">
          <button class="load-btn" data-name="${name}">불러오기</button>
          <button class="delete-btn" data-name="${name}">삭제</button>
        </div>
      `;

      presetDiv.querySelector(".load-btn")!.addEventListener("click", () => {
        this.applyPreset(name);
      });

      presetDiv.querySelector(".delete-btn")!.addEventListener("click", () => {
        if (confirm(`프리셋 "${name}"을(를) 삭제하시겠습니까?`)) {
          this.deletePreset(name);
        }
      });

      presetsList.appendChild(presetDiv);
    });
  }

  applyPreset(name: string) {
    const presets = this.loadPresetsData();
    const preset = presets[name];

    if (!preset) return;

    document
      .querySelectorAll('.part-item input[type="checkbox"]')
      .forEach((cb) => {
        (cb as HTMLInputElement).checked = false;
      });

    if (Array.isArray(preset)) {
      this.selectedParts = [...preset];
    } else {
      this.selectedParts = [...(preset.skinKeys || [])];
      this.skinColor = preset.skinColor || "#32323c";
      this.hairColor = preset.hairColor || "#8b4513";

      const skinColorInput = document.getElementById("skin-color") as HTMLInputElement;
      const hairColorInput = document.getElementById("hair-color") as HTMLInputElement;
      if (skinColorInput) skinColorInput.value = this.skinColor;
      if (hairColorInput) hairColorInput.value = this.hairColor;
    }

    this.selectedParts.forEach((skinName) => {
      const checkbox = document.getElementById(
        `part-${skinName}`
      ) as HTMLInputElement;
      if (checkbox) {
        checkbox.checked = true;
      }
    });

    this.updateCharacterSkin();
    this.updateOutput();
  }

  deletePreset(name: string) {
    const presets = this.loadPresetsData();
    delete presets[name];
    localStorage.setItem("character-presets", JSON.stringify(presets));
    this.loadPresets();
  }
}

// 초기화
window.addEventListener("DOMContentLoaded", () => {
  const ui = new ComposerUI();
  ui.init();
});
