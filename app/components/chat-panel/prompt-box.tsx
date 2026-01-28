import { ArrowUp } from "lucide-react";
import * as React from "react";

import { Button } from "~/components/ui/button";

interface PromptBoxProps {
  onSubmit?: (prompt: string) => void;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  inline?: boolean;
  disabled?: boolean;
}

export function PromptBox({ onSubmit, onValueChange, placeholder, inline, disabled }: PromptBoxProps) {
  const [value, setValue] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit?.(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const content = (
    <div className="rounded-xl border border-border bg-card p-2 shadow-lg">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onValueChange?.(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder ?? "Describe changes to your SLang model..."}
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
        />
        <Button
          size="icon"
          className="h-8 w-8 shrink-0 rounded-lg"
          disabled={disabled || !value.trim()}
          onClick={handleSubmit}
        >
          <ArrowUp className="size-4" />
        </Button>
      </div>
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <div className="absolute inset-x-4 bottom-21 z-10 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-2xl">
        {content}
      </div>
    </div>
  );
}
