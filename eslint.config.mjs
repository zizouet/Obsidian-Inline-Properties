import eslint from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import unusedImports from "eslint-plugin-unused-imports";
import stylisticJs from "@stylistic/eslint-plugin-js";

export default [
  {
    ignores: ["node_modules/**", "dist/**", "build/**", "main.js", "*.mjs"],
  },
  eslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        module: "readonly",
        require: "readonly",
        process: "readonly",
        __dirname: "readonly",
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "unused-imports": unusedImports,
      "@stylistic/js": stylisticJs,
    },
    rules: {
      // TypeScript Strict Rules
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs.strict.rules,
      "@typescript-eslint/no-explicit-any": "warn", // Relaxed to warn to prevent strict build failures
      "@typescript-eslint/no-invalid-void-type": "off", // Fixes the void error in your editor extension

      // Turn off core no-undef because TypeScript handles this automatically!
      // This fixes all the 'HTMLElement', 'React', 'Node', and 'process' errors.
      "no-undef": "off",

      // Unused Imports Strict Enforcement
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        { 
          "vars": "all", 
          "varsIgnorePattern": "^_", 
          "args": "after-used", 
          "argsIgnorePattern": "^_" 
        }
      ],

      // Code Style Strictness
      "@stylistic/js/semi": ["error", "always"],
      "@stylistic/js/quotes": ["error", "double"],
      
      // General Code Quality
      "eqeqeq": ["error", "always"],
      "no-console": ["warn", { allow: ["warn", "error"] }]
    }
  }
];