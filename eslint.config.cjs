// eslint.config.js
const jsdoc = require("eslint-plugin-jsdoc");

const config = [
  {
    plugins: {
      jsdoc,
    },

    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",

        _: "readonly",
        $: "readonly",
        fuzzy: "readonly",
        jQuery: "readonly",
        moment: "readonly",
        odoo: "readonly",
        openerp: "readonly",
        owl: "readonly",
        luxon: "readonly",
      },
    },

    rules: {
      "no-undef": "error",
      "no-unused-vars": "error",
      "no-use-before-define": "error",
      "prefer-const": "warn",
      "eqeqeq": "warn",

      // JSDoc
      "jsdoc/check-tag-names": "warn",
      "jsdoc/check-types": "warn",
      "jsdoc/require-param-description": "off",
      "jsdoc/require-return": "off",
      "jsdoc/require-return-description": "off",
      "jsdoc/require-return-type": "off",
    },

    settings: {
      jsdoc: {
        tagNamePreference: {
          arg: "param",
          argument: "param",
          augments: "extends",
          constructor: "class",
          exception: "throws",
          func: "function",
          method: "function",
          prop: "property",
          return: "returns",
          virtual: "abstract",
          yield: "yields",
          "odoo-module": "odoo-module",
        },
      },
    },
  },
  {
    files: ["**/*.esm.js"], // treat .esm.js as module
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
    },
  },
];

module.exports = config;
