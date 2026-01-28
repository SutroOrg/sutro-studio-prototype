import sutroConfig, { standardIgnores } from "@sutro/eslint-config";
import reactRefresh from "eslint-plugin-react-refresh";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: standardIgnores,
  },
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  ...sutroConfig,
  {
    files: ["**/*.{tsx,jsx}"],
    plugins: {
      "react-refresh": reactRefresh,
    },
    rules: {
      "react-refresh/only-export-components": [
        "error",
        {
          allowExportNames: [
            "meta",
            "links",
            "headers",
            "loader",
            "action",
            "Layout",
          ],
        },
      ],
    },
  },
  {
    ignores: ["*.json"],
    rules: {},
  },
];
