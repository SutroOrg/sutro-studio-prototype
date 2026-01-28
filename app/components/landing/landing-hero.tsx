import { ArrowRight } from "lucide-react";
import * as React from "react";

import { Button } from "~/components/ui/button";

interface LandingHeroProps {
  onSubmit: (prompt: string) => void;
}

export function LandingHero({ onSubmit }: LandingHeroProps) {
  const [prompt, setPrompt] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4" style={{ backgroundColor: "#030712" }}>
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="mb-6 text-5xl font-semibold tracking-tight text-white md:text-7xl" style={{ fontFamily: "var(--font-heading)" }}>
          Build your backend{" "}
          <span className="text-primary">with AI</span>
        </h1>
        <p className="mb-12 text-lg text-zinc-400 md:text-xl">
          Describe your application in plain English. Sutro generates the backend, API, and data model automatically.
        </p>
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
          <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-3">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onInput={handleInput}
              placeholder="Describe your application..."
              rows={3}
              className="w-full resize-none bg-transparent px-2 py-1 text-base text-white placeholder:text-zinc-500 focus:outline-none"
            />
            <div className="mt-2 flex justify-end">
              <Button
                type="submit"
                className="gap-2"
                disabled={!prompt.trim()}
              >
                Generate
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </form>
        <p className="mt-8 text-sm text-zinc-600">
          No credit card required. Start prototyping instantly.
        </p>
      </div>
    </div>
  );
}
