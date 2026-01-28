import Editor, { type Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useRef } from "react";

import {
  SLANG_LANGUAGE_ID,
  slangLanguageConfig,
  slangTokensProvider,
} from "./slang-language";

interface SlangEditorProps {
  value: string;
  onChange?: (lineChanges: number) => void;
  readOnly?: boolean;
  resetKey?: number;
}

function registerSlangLanguage(monaco: Monaco) {
  if (monaco.languages.getLanguages().some((l: { id: string }) => l.id === SLANG_LANGUAGE_ID)) {
    return;
  }

  monaco.languages.register({ id: SLANG_LANGUAGE_ID });
  monaco.languages.setLanguageConfiguration(SLANG_LANGUAGE_ID, slangLanguageConfig);
  monaco.languages.setMonarchTokensProvider(SLANG_LANGUAGE_ID, slangTokensProvider);

  monaco.editor.defineTheme("slang-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "c084fc", fontStyle: "bold" },       // purple-400
      { token: "keyword.operator", foreground: "c084fc" },                 // purple-400
      { token: "type", foreground: "22d3ee", fontStyle: "bold" },          // cyan-400
      { token: "type.identifier", foreground: "bef264" },                  // lime-300 (Sutro primary)
      { token: "string", foreground: "a3e635" },                           // lime-400
      { token: "number", foreground: "fb923c" },                           // orange-400
      { token: "number.float", foreground: "fb923c" },                     // orange-400
      { token: "constant.boolean", foreground: "fb923c" },                 // orange-400
      { token: "annotation", foreground: "facc15" },                       // yellow-400
      { token: "comment", foreground: "71717a", fontStyle: "italic" },     // zinc-500
      { token: "variable.name", foreground: "7dd3fc" },                    // sky-300
      { token: "operator", foreground: "a1a1aa" },                         // zinc-400
      { token: "operator.arrow", foreground: "f472b6" },                   // pink-400
      { token: "delimiter.bracket", foreground: "a1a1aa" },                // zinc-400
      { token: "identifier", foreground: "e4e4e7" },                       // zinc-200
    ],
    colors: {
      "editor.background": "#18181b",
      "editor.foreground": "#e4e4e7",
      "editorLineNumber.foreground": "#52525b",
      "editorLineNumber.activeForeground": "#a1a1aa",
      "editor.selectionBackground": "#3f3f4640",
      "editor.lineHighlightBackground": "#27272a40",
      "scrollbarSlider.background": "#52525b40",
      "scrollbarSlider.hoverBackground": "#71717a60",
      "scrollbarSlider.activeBackground": "#a1a1aa60",
    },
  });
}

export function SlangEditor({
  value,
  onChange,
  readOnly = false,
  resetKey = 0,
}: SlangEditorProps) {
  const monacoRef = useRef<Monaco | null>(null);
  const onChangeRef = useRef(onChange);
  const touchedLinesRef = useRef<Set<number>>(new Set());
  const resetKeyRef = useRef(resetKey);
  onChangeRef.current = onChange;

  // Clear touched lines when resetKey changes
  if (resetKeyRef.current !== resetKey) {
    resetKeyRef.current = resetKey;
    touchedLinesRef.current.clear();
  }

  const handleBeforeMount = (monaco: Monaco) => {
    monacoRef.current = monaco;
    registerSlangLanguage(monaco);
  };

  const handleMount = (editorInstance: editor.IStandaloneCodeEditor) => {
    editorInstance.onDidChangeModelContent((e) => {
      const previousCount = touchedLinesRef.current.size;

      for (const change of e.changes) {
        // Track all lines affected by this change
        const startLine = change.range.startLineNumber;
        const endLine = change.range.endLineNumber;
        const newLines = change.text.split("\n").length;

        // Mark affected lines as touched
        for (let i = startLine; i <= Math.max(endLine, startLine + newLines - 1); i++) {
          touchedLinesRef.current.add(i);
        }
      }

      const newCount = touchedLinesRef.current.size;
      const delta = newCount - previousCount;

      if (delta > 0) {
        onChangeRef.current?.(delta);
      }
    });
  };

  return (
    <div className="h-full w-full overflow-hidden bg-card">
      <Editor
        height="100%"
        language={SLANG_LANGUAGE_ID}
        value={value}
        theme="slang-dark"
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          padding: { top: 16, bottom: 68 },
          renderLineHighlight: "none",
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
            useShadows: false,
          },
        }}
      />
    </div>
  );
}
