import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import type { Plugin } from "vite";

/**
 * Vitest 환경 전용 플러그인: .ttf import를 절대 파일시스템 경로로 해석하여
 * fontkit이 테스트 중 폰트 파일을 직접 읽을 수 있게 한다.
 * 프로덕션 빌드에서는 비활성화되어 Vite 기본 asset 처리(assetsInclude)가
 * 번들된 해시 URL을 생성하도록 한다.
 */
function ttfResolverPlugin(): Plugin {
  return {
    name: "ttf-resolver",
    enforce: "pre",
    resolveId(source, importer) {
      if (!source.endsWith(".ttf")) return null;
      if (!importer) return null;
      return path.resolve(path.dirname(importer), source);
    },
    load(id) {
      if (!id.endsWith(".ttf")) return null;
      // 절대 파일시스템 경로를 모듈의 default export로 반환
      return `export default ${JSON.stringify(id)};`;
    },
  };
}

const isVitest = !!process.env.VITEST;

export default defineConfig({
  plugins: [react(), ...(isVitest ? [ttfResolverPlugin()] : [])],
  assetsInclude: ["**/*.ttf"],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    env: {
      VITE_SUPABASE_URL: "https://test.supabase.co",
      VITE_SUPABASE_ANON_KEY: "test-anon-key",
    },
  },
});

