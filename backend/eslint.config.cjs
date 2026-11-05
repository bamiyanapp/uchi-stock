const js = require("@eslint/js");
const globals = require("globals");
const sonarjs = require("eslint-plugin-sonarjs");

// プロダクションのリクエスト処理本体のみ、複雑度・sonarjs・ファイルサイズを厳格に
// チェックする（dev-standards/docs/code-quality-conventions.md「lint」）。
// seed*.js・migrate*.js（一回限りの手動実行用データ投入・移行スクリプト）・
// テストファイルは対象外とする（一度しか動かさないスクリプトに本番ハンドラと同じ
// 複雑度基準を適用しても、過剰な抽象化を招くだけで実益が薄いため）
const strictFiles = [
  "handler.js",
  "items-handler.js",
  "stock-handler.js",
  "family-handler.js",
  "auth.js",
  "http-helpers.js",
  "db-client.js",
  "dynamo-client.js",
  "stock-logic.js",
];

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.vitest,
      },
    },
    rules: {
      "no-unused-vars": "error",
      "no-console": "off",
    },
  },
  {
    ...sonarjs.configs.recommended,
    files: strictFiles,
    rules: {
      ...sonarjs.configs.recommended.rules,
      complexity: ["error", 15],
      "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],
    },
  },
];
