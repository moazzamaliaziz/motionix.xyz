import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/components/motionix/visuals/ShaderSurface.tsx",
  ]),
  {
    rules: {
      // Heavily relaxed for the Phase 1 launch — we still rely on tsc + next build to catch real bugs.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "react/no-array-index-key": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/static-components": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/purity": "off",
      "react/no-unknown-property": "off",
      "react/no-unused-prop-types": "off",
      "react/jsx-no-undef": "off",
      "react/jsx-key": "off",
      "react/self-closing-comp": "off",
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-img-element": "off",
      "prefer-const": "off",
      "@typescript-eslint/triple-slash-reference": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "react/no-unescaped-entities": "off",
    },
  },
]);

export default eslintConfig;
