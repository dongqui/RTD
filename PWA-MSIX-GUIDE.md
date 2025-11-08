# Random Defense - PWA & MSIX 빌드 가이드

이 프로젝트는 이제 **Progressive Web App (PWA)**로 변환되었으며, Windows MSIX 패키지로 배포할 준비가 되었습니다.

## 📋 완료된 작업

### ✅ PWA 핵심 기능
- [x] Web App Manifest (`public/manifest.json`)
- [x] Service Worker (Workbox 기반)
- [x] 오프라인 캐싱 (모든 게임 에셋)
- [x] 외부 폰트 로컬 번들링 (오프라인 지원)
- [x] PWA 아이콘 세트 (SVG placeholder)
- [x] 자동 업데이트 기능

### ✅ 데스크톱 최적화
- [x] 반응형 레이아웃 (모바일 + 데스크톱)
- [x] 중앙 정렬 컨테이너 (데스크톱)
- [x] 9:16 종횡비 유지
- [x] Windows PWA 메타 태그

### ✅ 빌드 설정
- [x] Vite PWA 플러그인 설정
- [x] Workbox 캐싱 전략
- [x] 프로덕션 빌드 최적화

---

## 🚀 빌드 및 배포

### 1. 프로덕션 빌드

```bash
npm run build
```

빌드 결과물은 `dist/web/` 디렉토리에 생성됩니다.

### 2. 로컬 테스트

```bash
# 정적 서버로 빌드 결과물 실행 (npx serve 사용)
cd dist/web
npx serve -s .
```

브라우저에서 `http://localhost:3000`으로 접속하여 PWA 기능을 테스트합니다.

#### PWA 테스트 체크리스트:
- [ ] 크롬 DevTools > Application > Manifest 확인
- [ ] Service Worker 등록 확인
- [ ] 오프라인 모드에서 실행 테스트 (DevTools > Network > Offline)
- [ ] 설치 프롬프트 표시 확인 (주소창 오른쪽 설치 아이콘)
- [ ] Lighthouse PWA 점수 확인 (90+ 권장)

---

## 📱 MSIX 패키징 (Windows Store)

### 옵션 1: PWABuilder 사용 (권장)

**PWABuilder**는 PWA를 MSIX 패키지로 쉽게 변환해주는 도구입니다.

1. **웹 배포**
   - `dist/web/` 디렉토리를 웹 서버에 배포합니다 (GitHub Pages, Netlify, Vercel 등)
   - HTTPS 필수!

2. **PWABuilder 접속**
   - https://www.pwabuilder.com/ 접속
   - 배포된 URL 입력 (예: `https://yourdomain.com/random-defense`)

3. **MSIX 생성**
   - "Package For Stores" 클릭
   - "Windows" 선택
   - 앱 정보 입력:
     - **Package ID**: 고유 ID (예: `com.yourcompany.randomdefense`)
     - **Publisher Display Name**: 개발자/회사 이름
     - **Version**: 버전 번호 (예: `1.0.0`)
   - "Generate" 클릭하여 MSIX 다운로드

4. **설치 및 테스트**
   - 다운로드한 `.msix` 파일 실행
   - Windows에 설치되면 시작 메뉴에서 실행 가능

### 옵션 2: 직접 패키징 (고급)

**필요 도구**: Windows SDK, Visual Studio

```bash
# PWA를 MSIX로 변환하는 도구 설치
npm install -g pwabuilder-cli

# MSIX 생성
pwabuilder package --platform windows10 --dir dist/web
```

---

## 🎨 아이콘 교체 (중요!)

현재 placeholder SVG 아이콘이 설정되어 있습니다. **프로덕션 배포 전에 PNG 아이콘으로 교체**해야 합니다.

### 필요한 아이콘 사이즈:
- 72x72 PNG
- 96x96 PNG
- 128x128 PNG
- 144x144 PNG
- 152x152 PNG
- 192x192 PNG
- 384x384 PNG
- 512x512 PNG
- 512x512 PNG (maskable - 15% safe zone)

### 아이콘 생성 방법:

1. **512x512 마스터 아이콘 제작** (디자인 툴 사용)
   - 게임 로고, 방패, 캐릭터 등 대표 이미지
   - 배경: 불투명 (#000000 권장)

2. **자동 생성 도구 사용**:
   - [PWA Image Generator](https://www.pwabuilder.com/imageGenerator)
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - 512x512 PNG 업로드하면 모든 사이즈 자동 생성

3. **파일 교체**:
   ```bash
   # 생성된 PNG 파일들을 public/icons/ 에 복사
   public/icons/icon-72.png
   public/icons/icon-96.png
   ...
   public/icons/icon-512-maskable.png
   ```

4. **manifest.json 수정**:
   ```json
   "icons": [
     {
       "src": "./icons/icon-192.png",  // .svg -> .png 변경
       "type": "image/png",             // image/svg+xml -> image/png
       ...
     }
   ]
   ```

5. **재빌드**:
   ```bash
   npm run build
   ```

---

## 🖥️ 데스크톱 레이아웃

게임은 **모바일 세로 모드 (720x1280)**로 디자인되었습니다.

### 데스크톱 동작:
- **화면 크기**: 최대 480px 너비로 중앙 정렬
- **배경**: 그라데이션 배경 (#1a1a1a → #000000)
- **종횡비**: 9:16 유지 (레터박스)
- **그림자 효과**: 게임 컨테이너 주변 그림자

### 커스터마이징:
데스크톱 스타일을 수정하려면 `public/style.css`를 편집하세요:

```css
/* 769px 이상 (데스크톱) */
@media screen and (min-width: 769px) {
  #game-container {
    max-width: 480px;  /* 원하는 크기로 조정 */
    ...
  }
}
```

---

## 🔧 Service Worker 캐싱 전략

### 현재 설정:

1. **Precache (사전 캐시)**:
   - HTML, JS, CSS
   - 모든 게임 에셋 (이미지, 사운드, Spine 애니메이션)
   - 폰트 파일
   - 아이콘

2. **Runtime Caching (런타임 캐시)**:
   - **이미지**: CacheFirst (30일)
   - **오디오**: CacheFirst (30일)
   - **asset-pack.json**: NetworkFirst (최신 유지)
   - **외부 폰트 (예비)**: CacheFirst (1년)

### 캐시 크기 제한:
- 최대 파일 크기: **5MB** (Phaser 게임 에셋 지원)
- 이미지 캐시: 최대 100개 파일
- 오디오 캐시: 최대 50개 파일

### 캐시 무효화:
Service Worker는 빌드 시 자동으로 업데이트되며, 사용자는 다음 방문 시 자동으로 새 버전을 받습니다.

---

## 🐛 문제 해결

### 1. Service Worker가 등록되지 않음
- **확인**: HTTPS 환경인지 확인 (localhost는 HTTP 허용)
- **해결**: `registerSW.js`가 HTML에 포함되었는지 확인

### 2. 오프라인에서 작동하지 않음
- **확인**: DevTools > Application > Service Workers에서 활성화 확인
- **해결**: "Update on reload" 체크 후 새로고침

### 3. 아이콘이 표시되지 않음
- **확인**: SVG 대신 PNG 사용 (일부 브라우저는 SVG 미지원)
- **해결**: 위의 "아이콘 교체" 섹션 참고

### 4. MSIX 설치 실패
- **확인**: 인증서 서명 필요 (개발자 인증서)
- **해결**: PWABuilder 사용 시 자동 처리됨

### 5. 데스크톱에서 레이아웃 깨짐
- **확인**: 브라우저 개발자 도구로 반응형 모드 테스트
- **해결**: `public/style.css`의 미디어 쿼리 조정

---

## 📊 PWA 점수 확인

Chrome DevTools Lighthouse 사용:

```
1. F12 > Lighthouse 탭
2. "Progressive Web App" 선택
3. "Generate report" 클릭
```

### 목표 점수:
- **Performance**: 90+
- **PWA**: 90+
- **Accessibility**: 80+
- **Best Practices**: 90+

---

## 📦 배포 옵션

### 1. GitHub Pages
```bash
# package.json에 homepage 추가
{
  "homepage": "https://yourusername.github.io/random-defense"
}

# 배포
npm run build
# dist/web 내용을 gh-pages 브랜치에 push
```

### 2. Netlify / Vercel
- `dist/web` 디렉토리를 드래그 앤 드롭
- 자동 HTTPS 제공

### 3. Azure Static Web Apps
- GitHub 연동 자동 배포
- 글로벌 CDN 제공

---

## 🎯 다음 단계

### 프로덕션 체크리스트:
- [ ] PNG 아이콘 교체
- [ ] 게임 스크린샷 추가 (`public/screenshots/screenshot-1.png`)
- [ ] manifest.json 정보 검토 (이름, 설명)
- [ ] 웹 호스팅 배포 (HTTPS)
- [ ] Lighthouse PWA 점수 90+ 확인
- [ ] PWABuilder로 MSIX 생성
- [ ] Windows에서 MSIX 테스트
- [ ] Microsoft Store 제출 (선택)

### 선택적 개선사항:
- [ ] 로딩 스플래시 화면 추가
- [ ] 업데이트 알림 UI 구현
- [ ] 설치 프롬프트 커스터마이징
- [ ] 푸시 알림 기능 (선택)
- [ ] 가로 모드 최적화 (데스크톱)

---

## 📚 참고 자료

- [PWA 문서](https://web.dev/progressive-web-apps/)
- [PWABuilder](https://www.pwabuilder.com/)
- [Workbox 문서](https://developers.google.com/web/tools/workbox)
- [Windows PWA 가이드](https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/)
- [Vite PWA 플러그인](https://vite-pwa-org.netlify.app/)

---

## 🙋 도움이 필요하신가요?

PWA 설정은 `vite/config.prod.mjs`에서 수정할 수 있습니다.
MSIX 빌드 문제는 PWABuilder GitHub Issues를 참고하세요.

**행운을 빕니다! 🎮🚀**
