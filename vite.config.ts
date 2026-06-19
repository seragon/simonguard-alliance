import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import type { Plugin } from "vite";

/** テスト環境で .ttf import をプロジェクトルートからの絶対パスに解決するプラグイン */
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
      // Return the absolute path as the module's default export
      return `export default ${JSON.stringify(id)};`;
    },
  };
}

export default defineConfig({
  plugins: [react(), ttfResolverPlugin()],
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

