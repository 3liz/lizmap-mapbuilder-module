import js from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";
export default [
  js.configs.recommended,
  jsdoc.configs['flat/recommended'],

  {
    plugins: {
      jsdoc,
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
        OpenLayers: "readonly",
        lizMap: "readonly",
        lizDict: "readonly",
        lizUrls: "readonly",
        lizProj4: "readonly",

        window: "readonly",
        document: "readonly",
        HTMLElement: "readonly",
        Node: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        Event: "readonly",

        $: "readonly",
        jQuery: "readonly",
      },
    },
    rules: {
      "indent": ["error", 4, {
        "SwitchCase": 1,
        "ignoredNodes": ["TemplateLiteral *"],
      }],
      "no-prototype-builtins": "off",
      "no-undef": "off",
      'jsdoc/require-description': 'warn',
    },
  },
];
