import { Check, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router";

import { ApiDocsViewer } from "~/components/api-docs-viewer";
import { PromptBox } from "~/components/chat-panel";
import { DataModelViewer } from "~/components/data-model-viewer";
import { StudioHeader } from "~/components/studio-header";
import { SlangEditor } from "~/components/slang-editor";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useAppStore } from "~/stores/use-app-store";

export default function AppDetailPage() {
  const { appId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const app = useAppStore((s) => s.applications.find((a) => a.id === appId));
  const getApplication = useAppStore((s) => s.getApplication);
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const startGenerating = useAppStore((s) => s.startGenerating);
  const clearGenerating = useAppStore((s) => s.clearGenerating);
  const streamSlangCode = useAppStore((s) => s.streamSlangCode);
  const populateApplicationMetadata = useAppStore((s) => s.populateApplicationMetadata);
  const generatingAppId = useAppStore((s) => s.generatingAppId);
  const consumePendingGenerationPrompt = useAppStore((s) => s.consumePendingGenerationPrompt);
  const streamCleanupRef = useRef<(() => void) | null>(null);
  const currentAppIdRef = useRef(appId);
  currentAppIdRef.current = appId;
  const hasCheckedPendingPrompt = useRef(false);
  const [hasNewApiDocs, setHasNewApiDocs] = useState(false);
  const [editCount, setEditCount] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [editorResetKey, setEditorResetKey] = useState(0);

  useEffect(() => {
    setActiveTab("slang");
    setHasNewApiDocs(false);
    setEditCount(0);
    setIsThinking(false);
    setIsStreaming(false);
    setIsApplying(false);
    // Only show completion if we're navigating to a completed app
    setShowComplete(false);
    setEditorResetKey((k) => k + 1);
    hasCheckedPendingPrompt.current = false;
  }, [appId, setActiveTab]);

  useEffect(() => {
    return () => {
      streamCleanupRef.current?.();
    };
  }, []);

  const mockGenerate = useCallback(
    (id: string) => {
      startGenerating(id);
      setIsThinking(true);
      setShowComplete(false);

      const app = getApplication(id);
      const name = app?.name === "Untitled" ? "MyApp" : (app?.name.replace(/\s+/g, "") ?? "MyApp");
      const targetCode = `model ${name} {\n  description "Generated model"\n  fields {\n    Name: TEXT\n      description "Name field."\n    Email: TEXT\n      description "Email address."\n      constraints {\n        unique: true\n      }\n    Age: INTEGER\n      description "User age."\n      constraints {\n        min: 0\n        max: 150\n      }\n    Status: TEXT\n      description "Account status."\n      constraints {\n        enum: ["active", "inactive", "suspended"]\n        default: "active"\n      }\n    CreatedAt: DATETIME\n      description "Record creation timestamp."\n      constraints {\n        default: "now()"\n      }\n  }\n  relations {\n    Posts: HAS_MANY Post\n      description "User posts."\n    Profile: HAS_ONE Profile\n      description "User profile."\n  }\n}\n\nmodel Post {\n  description "Blog post"\n  fields {\n    Title: TEXT\n      description "Post title."\n    Body: TEXT\n      description "Post content."\n    Published: BOOLEAN\n      description "Publication status."\n      constraints {\n        default: "false"\n      }\n  }\n  relations {\n    Author: BELONGS_TO ${name}\n      description "Post author."\n  }\n}\n\nmodel Profile {\n  description "User profile"\n  fields {\n    Bio: TEXT\n      description "Short biography."\n    Avatar: TEXT\n      description "Avatar URL."\n  }\n  relations {\n    User: BELONGS_TO ${name}\n      description "Profile owner."\n  }\n}`;

      // 5 second "thinking" delay before streaming starts
      const timeout = setTimeout(() => {
        // Only update local UI state if still viewing the same app
        if (currentAppIdRef.current === id) {
          setIsThinking(false);
          setIsStreaming(true);
        }
        const cleanup = streamSlangCode(id, targetCode, () => {
          if (currentAppIdRef.current === id) {
            setIsStreaming(false);
            setIsApplying(true);
          }
          // Brief delay to show "Generating backend..." before completing
          setTimeout(() => {
            populateApplicationMetadata(id);
            clearGenerating();
            // Only show completion UI if still viewing the same app
            if (currentAppIdRef.current === id) {
              setIsApplying(false);
              setShowComplete(true);
              setHasNewApiDocs(true);
            }
          }, 1500);
        });
        streamCleanupRef.current = cleanup;
      }, 5000);

      streamCleanupRef.current = () => clearTimeout(timeout);
    },
    [startGenerating, getApplication, streamSlangCode, populateApplicationMetadata, clearGenerating],
  );

  // Check for pending generation prompt on mount or autoGenerate query param
  useEffect(() => {
    if (hasCheckedPendingPrompt.current || !appId) return;
    hasCheckedPendingPrompt.current = true;

    const autoGenerate = searchParams.get("autoGenerate") === "true";
    const pendingPrompt = consumePendingGenerationPrompt();

    if (pendingPrompt || autoGenerate) {
      // Clear the autoGenerate param from URL
      if (autoGenerate) {
        searchParams.delete("autoGenerate");
        setSearchParams(searchParams, { replace: true });
      }
      // Start generation immediately
      mockGenerate(appId);
    }
  }, [appId, searchParams, setSearchParams, consumePendingGenerationPrompt, mockGenerate]);

  if (!app) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Application not found.</p>
      </div>
    );
  }

  const isEmpty = !!app.empty;
  const isGenerating = generatingAppId === appId;

  // Determine generation status for header
  const generationStatus = isGenerating
    ? isThinking
      ? "thinking"
      : isStreaming
        ? "streaming"
        : isApplying
          ? "applying"
          : null
    : null;

  return (
    <div className="relative flex h-full flex-col pl-0 pr-1.5 py-[6px]">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card">
        <StudioHeader generationStatus={generationStatus} />
        <Tabs value={isEmpty ? "slang" : activeTab} onValueChange={(v) => { setActiveTab(v as "slang" | "data-model" | "api-docs"); if (v === "data-model" || v === "api-docs") { setHasNewApiDocs(false); setShowComplete(false); } }} className="flex flex-1 flex-col gap-0 overflow-hidden">
          <div
            className="overflow-hidden border-b border-border bg-zinc-800 transition-all duration-300 ease-out"
            style={{ maxHeight: isEmpty ? 0 : 40 }}
          >
            <TabsList className="border-b-0 px-3">
              <TabsTrigger value="slang">SLang</TabsTrigger>
              <TabsTrigger value="data-model">Data model</TabsTrigger>
              <TabsTrigger value="api-docs" className="gap-1.5">
                API docs
                {hasNewApiDocs && (
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-primary" />
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="slang" className="flex flex-1 flex-col overflow-hidden">
            <div
              className="shrink-0 border-b border-border bg-zinc-800 transition-all duration-300 ease-out"
              style={{ height: editCount > 0 || (isGenerating && (isThinking || isStreaming || isApplying)) || showComplete ? 52 : 0, opacity: editCount > 0 || (isGenerating && (isThinking || isStreaming || isApplying)) || showComplete ? 1 : 0 }}
            >
              <div className="flex h-full items-center justify-between px-3">
                {showComplete ? (
                  <>
                    <span className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="size-4" />
                      Generation complete! <span className="text-muted-foreground">Review your outputs in the tabs above...</span>
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => setShowComplete(false)}
                    >
                      <X className="size-4" />
                    </Button>
                  </>
                ) : isGenerating && isThinking ? (
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Thinking...
                  </span>
                ) : isGenerating && isStreaming ? (
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Generating SLang...
                  </span>
                ) : isGenerating && isApplying ? (
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Generating backend...
                  </span>
                ) : (
                  <>
                    <span className="text-sm text-muted-foreground">
                      {editCount} {editCount === 1 ? "edit" : "edits"}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditCount(0);
                          setEditorResetKey((k) => k + 1);
                        }}
                      >
                        Undo
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (appId) {
                            setIsApplying(true);
                            // Simulate async generation
                            setTimeout(() => {
                              populateApplicationMetadata(appId);
                              setEditCount(0);
                              setEditorResetKey((k) => k + 1);
                              setIsApplying(false);
                              setShowComplete(true);
                              setHasNewApiDocs(true);
                            }, 1500);
                          }
                        }}
                      >
                        Apply
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <SlangEditor
                value={app.slangCode}
                onChange={(lineChanges) => {
                  setShowComplete(false);
                  setEditCount((c) => c + lineChanges);
                }}
                readOnly={isGenerating}
                resetKey={editorResetKey}
              />
            </div>
          </TabsContent>
          {!isEmpty && (
            <>
              <TabsContent value="data-model" className="flex-1 overflow-hidden">
                <DataModelViewer diagram={app.mermaidDiagram} />
              </TabsContent>
              <TabsContent value="api-docs" className="flex-1 overflow-auto">
                <ApiDocsViewer spec={app.openApiSpec} baseUrl={app.apiEndpoint} />
              </TabsContent>
            </>
          )}
        </Tabs>
        {/* Footer hidden — metadata now shown in header */}
      </div>
      <div className="absolute inset-x-4 bottom-6 z-10 pointer-events-none">
        <div className="pointer-events-auto mx-auto flex max-w-2xl flex-col gap-2">
          <PromptBox
            inline
            disabled={isGenerating}
            placeholder={isEmpty ? "What back end would you like to build?" : "Describe your changes..."}
            onSubmit={() => {
              setActiveTab("slang");
              setEditCount(0);
              setEditorResetKey((k) => k + 1);
              if (appId) mockGenerate(appId);
            }}
          />
        </div>
      </div>
    </div>
  );
}
