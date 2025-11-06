# SoundManager 사용 가이드

게임의 모든 사운드를 중앙에서 관리하는 SoundManager입니다.

## 주요 기능

- 전역 볼륨 조절
- 음소거/음소거 해제
- 설정 자동 저장 (localStorage)
- 싱글톤 패턴으로 어디서든 접근 가능

## 사용 방법

### 1. 기본 사운드 재생

```typescript
import { SoundManager } from "../utils/SoundManager";

// 사운드 재생
SoundManager.getInstance().play("sound_hit");

// 볼륨 조절하여 재생
SoundManager.getInstance().play("sound_hit", { volume: 0.3 });
```

### 2. 지연 재생

```typescript
// 200ms 후에 사운드 재생
SoundManager.getInstance().playDelayed("sound_hit", 200, { volume: 0.3 });
```

### 3. 볼륨 제어

```typescript
const soundManager = SoundManager.getInstance();

// 마스터 볼륨 설정 (0.0 ~ 1.0)
soundManager.setMasterVolume(0.5);

// 현재 볼륨 가져오기
const volume = soundManager.getMasterVolume();
```

### 4. 음소거 제어

```typescript
const soundManager = SoundManager.getInstance();

// 음소거
soundManager.mute();

// 음소거 해제
soundManager.unmute();

// 토글
const isMuted = soundManager.toggleMute();

// 상태 확인
if (soundManager.isMuted()) {
  console.log("현재 음소거 상태");
}
```

## 설정 저장

모든 설정(볼륨, 음소거 상태)은 자동으로 localStorage에 저장됩니다.
사용자가 페이지를 새로고침해도 설정이 유지됩니다.

## 초기화

SoundManager는 Preload 씬에서 자동으로 초기화됩니다.
별도의 초기화 코드는 필요하지 않습니다.

## 기존 코드 마이그레이션

### Before
```typescript
this.scene.sound.play("sound_hit", { volume: 0.3 });

this.scene.time.delayedCall(200, () => {
  this.scene.sound.play("sound_hit", { volume: 0.3 });
});
```

### After
```typescript
SoundManager.getInstance().play("sound_hit", { volume: 0.3 });

SoundManager.getInstance().playDelayed("sound_hit", 200, { volume: 0.3 });
```
