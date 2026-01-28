import type { languages } from "monaco-editor";

export const SLANG_LANGUAGE_ID = "slang";

export const slangLanguageConfig: languages.LanguageConfiguration = {
  comments: {
    lineComment: "//",
  },
  brackets: [
    ["{", "}"],
    ["(", ")"],
  ],
  autoClosingPairs: [
    { open: "{", close: "}" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "`", close: "`" },
  ],
  surroundingPairs: [
    { open: "{", close: "}" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "`", close: "`" },
  ],
};

export const slangTokensProvider: languages.IMonarchLanguage = {
  keywords: [
    "model",
    "relation",
    "action",
    "trigger",
    "queue",
    "fields",
    "description",
    "group",
    "on",
    "when",
    "set",
    "notify",
    "for",
    "each",
    "linked",
    "through",
    "becomes",
    "decrement",
    "increment",
    "evaluate",
    "ordered",
    "by",
    "descending",
    "ascending",
    "regenerate",
    "recalculate",
    "parent",
    "changes",
    "minLength",
    "maxLength",
  ],

  typeKeywords: [
    "TEXT",
    "INTEGER",
    "FLOAT",
    "BOOLEAN",
    "DATETIME",
    "ENUM",
    "URL",
  ],

  operators: ["-->", "-->>", ":=", "=", ">=", "<=", ">", "<"],

  logicalOperators: ["OR", "AND"],

  tokenizer: {
    root: [
      // Comments
      [/\/\/.*$/, "comment"],

      // Strings (double-quoted)
      [/"/, "string", "@string"],

      // Backtick-quoted identifiers
      [/`/, "variable.name", "@backtickIdentifier"],

      // Annotations
      [/@\w+/, "annotation"],

      // Arrow operators (must come before other symbol rules)
      [/-->>/, "operator.arrow"],
      [/-->/, "operator.arrow"],

      // Assignment operator
      [/:=/, "operator"],

      // Comparison operators
      [/>=|<=|=|>|</, "operator"],

      // Numbers
      [/\d+\.\d+/, "number.float"],
      [/\d+/, "number"],

      // Boolean literals
      [/\b(true|false)\b/, "constant.boolean"],

      // Logical operators (OR, AND)
      [
        /\b(OR|AND)\b/,
        "keyword.operator",
      ],

      // Type keywords
      [
        /\b(TEXT|INTEGER|FLOAT|BOOLEAN|DATETIME|ENUM|URL)\b/,
        "type",
      ],

      // Keywords
      [
        /\b(model|relation|action|trigger|queue|fields|description|group|on|when|set|notify|for|each|linked|through|becomes|decrement|increment|evaluate|ordered|by|descending|ascending|regenerate|recalculate|parent|changes|minLength|maxLength)\b/,
        "keyword",
      ],

      // Identifiers (model names, field names, etc.)
      [/[A-Z][a-zA-Z0-9]*/, "type.identifier"],
      [/[a-z][a-zA-Z0-9]*/, "identifier"],

      // Braces and parens
      [/[{}()]/, "delimiter.bracket"],

      // Whitespace
      [/\s+/, "white"],
    ],

    string: [
      [/[^"]+/, "string"],
      [/"/, "string", "@pop"],
    ],

    backtickIdentifier: [
      [/[^`]+/, "variable.name"],
      [/`/, "variable.name", "@pop"],
    ],
  },
};
