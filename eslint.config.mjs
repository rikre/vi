import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Reference repo — not part of this project
    ".vibe-video-ref/**",
  ]),
  {
    files: ["src/**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/\\b(text|bg|border|ring)-(red|green|emerald|amber|cyan|purple|pink|indigo|teal|rose|blue|orange|violet|fuchsia)-[0-9]/]",
          message:
            "禁止使用 Tailwind 默认色板。请使用语义 token：text-danger, text-success, text-warning, text-info, bg-brand 等。详见 docs/loop-prompts/round1-design-tokens.md",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "lucide-react",
              message:
                "请使用 @/components/icons 中的自定义图标，保持全站图标体系统一。",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
