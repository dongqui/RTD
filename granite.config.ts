import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "random-heroes",
  brand: {
    displayName: "random-heroes", // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: "#3182F6", // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: "", // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
    bridgeColorMode: "basic",
  },
  web: {
    host: "http://172.30.1.28",
    port: 8080,
    commands: {
      dev: "vite --config vite/config.dev.mjs --host",
      build:
        "vite build --config vite/config.prod.mjs && phaser-asset-pack-hashing -j -r dist",
    },
  },
  permissions: [],
  outdir: "dist",
});
