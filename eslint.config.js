import reactRefresh from "eslint-plugin-react-refresh";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["node_modules", "build", "dist", ".react-router"],
  },
  { files: ["**/*.{js,mjs,cjs,ts}"] },
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
