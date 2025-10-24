# Fantasy Character Composer

Spine 캐릭터 파츠를 시각적으로 조합하고, 게임에서 사용할 스킨 배열을 쉽게 생성할 수 있는 웹 기반 툴입니다.

## 기능

### 1. 파츠 선택
- 카테고리별로 분류된 Spine 스킨 파츠 목록
- 체크박스로 원하는 파츠 선택/해제
- 검색 기능으로 원하는 파츠 빠르게 찾기
- 카테고리 접기/펼치기 가능

### 2. 실시간 미리보기
- Phaser 3 + Spine 플러그인으로 실시간 캐릭터 렌더링
- 애니메이션 선택 (Idle, Run, Attack 등)
- 스케일 조정 (0.1 ~ 1.0)
- 좌우 반전 기능
- 초기화 버튼

### 3. 배열 생성
- TypeScript 형식 배열 자동 생성
- JSON 형식 배열 자동 생성
- 클립보드 복사 버튼

### 4. 프리셋 관리
- 현재 조합을 이름을 지정하여 저장
- 저장된 프리셋 불러오기
- 프리셋 삭제
- 로컬스토리지에 자동 저장

## 사용 방법

### 1. 실행
```bash
# RTD 프로젝트 루트에서
cd character-composer
# 로컬 서버 실행 (예: Live Server 또는 http-server)
```

브라우저에서 `index.html`을 열면 됩니다.

### 2. 파츠 선택
1. 왼쪽 패널에서 원하는 카테고리 클릭
2. 체크박스를 클릭하여 파츠 선택
3. 중앙 캔버스에서 실시간으로 확인

### 3. 조합 확인
- 애니메이션 드롭다운에서 다양한 동작 확인 가능
- 스케일 슬라이더로 크기 조정
- 좌우 반전 버튼으로 방향 확인

### 4. 배열 복사
1. 오른쪽 패널에서 생성된 배열 확인
2. "클립보드에 복사" 버튼 클릭
3. 게임 코드에 붙여넣기

예시:
```typescript
private static readonly LEVEL_1_SKIN_KEYS = [
    "back/back_f_21",
    "boots/boots_f_2",
    "bottom/bottom_f_1",
    "eyes/eyes_f_9",
    "gear_right/gear_right_f_25",
    "hair_short/hair_short_f_1",
    "mouth/mouth_f_2",
    "skin/skin_1",
    "top/top_f_56"
];
```

### 5. 프리셋 저장
1. 원하는 조합 완성
2. "프리셋 저장" 버튼 클릭
3. 이름 입력 (예: "Archer Level 1", "Warrior Level 2")
4. 저장된 프리셋은 하단에 표시됨

### 6. 프리셋 불러오기
1. 하단 "저장된 프리셋" 섹션에서 원하는 프리셋 선택
2. "불러오기" 버튼 클릭
3. 해당 조합이 자동으로 적용됨

## 파일 구조

```
character-composer/
├── index.html          # 메인 HTML
├── style.css           # 스타일링
├── app.js              # 메인 로직
└── README.md           # 이 파일
```

## 기술 스택

- **HTML5/CSS3**: UI 구성
- **Vanilla JavaScript**: 로직 구현
- **Phaser 3**: 게임 엔진
- **@esotericsoftware/spine-phaser**: Spine 플러그인
- **LocalStorage**: 프리셋 저장

## 주의사항

1. 이 툴은 RTD 프로젝트의 Spine 에셋(`../public/assets/spine/`)을 참조합니다.
2. 로컬 서버에서 실행해야 CORS 이슈 없이 JSON 파일을 로드할 수 있습니다.
3. 프리셋은 브라우저의 로컬스토리지에 저장되므로, 브라우저 데이터를 삭제하면 프리셋도 삭제됩니다.

## RTD 프로젝트에서 사용하기

1. Character Composer에서 원하는 조합 생성
2. 배열 복사
3. `src/units/ArcherUnit.ts` 또는 `src/units/WarriorUnit.ts` 등에서 사용:

```typescript
export class CustomUnit extends BaseUnit {
  private static readonly LEVEL_1_SKIN_KEYS = [
    // 여기에 복사한 배열 붙여넣기
  ];

  protected setupAnimations(): void {
    const initSkin = new Skin("custom");

    CustomUnit.LEVEL_1_SKIN_KEYS.forEach((key) => {
      const skin = this.spineObject.skeleton.data.findSkin(key);
      if (skin) {
        initSkin.addSkin(skin);
      }
    });
    this.spineObject.skeleton.setSkin(initSkin);

    // ...
  }
}
```

## 문제 해결

### Spine 캐릭터가 보이지 않음
- 브라우저 콘솔에서 에러 확인
- `../public/assets/spine/` 경로가 올바른지 확인
- 로컬 서버로 실행 중인지 확인

### 애니메이션이 재생되지 않음
- 애니메이션 드롭다운에서 다른 애니메이션 선택
- 브라우저 새로고침

### 프리셋이 저장되지 않음
- 브라우저가 로컬스토리지를 지원하는지 확인
- 시크릿/프라이빗 모드가 아닌지 확인

## 라이선스

RTD 프로젝트와 동일한 라이선스 적용
