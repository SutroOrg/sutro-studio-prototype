import * as React from "react";

interface DataModelViewerProps {
  diagram: string;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

export function DataModelViewer({ diagram }: DataModelViewerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [svg, setSvg] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);

  const transformRef = React.useRef<Transform>({ x: 0, y: 0, scale: 1 });
  const [, forceRender] = React.useState(0);
  const applyTransform = React.useCallback(() => forceRender((n) => n + 1), []);

  // Drag state
  const dragging = React.useRef(false);
  const lastPointer = React.useRef({ x: 0, y: 0 });

  // Pinch state
  const pinchDistRef = React.useRef<number | null>(null);
  const pinchScaleStart = React.useRef(1);

  // Reset transform when diagram changes
  React.useEffect(() => {
    transformRef.current = { x: 0, y: 0, scale: 1 };
    applyTransform();
  }, [diagram, applyTransform]);

  React.useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            primaryColor: "#3f3f46",      // --accent
            primaryTextColor: "#f4f4f5",  // --foreground
            primaryBorderColor: "#3f3f46", // --border
            lineColor: "#bef26480",       // --primary at 50% opacity
            secondaryColor: "#27272a",    // --sidebar
            tertiaryColor: "#18181b",     // --card / --background
            fontFamily: "DM Sans, Inter, sans-serif",
          },
          themeCSS: ".edge path, .flowchart-link { stroke-width: 2px !important; }",
        });

        const id = `mermaid-${Date.now()}`;
        const { svg: renderedSvg } = await mermaid.render(id, diagram);
        if (!cancelled) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render diagram");
        }
      }
    }

    renderDiagram();
    return () => {
      cancelled = true;
    };
  }, [diagram]);

  // Wheel zoom
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const t = transformRef.current;
      const rect = container.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(Math.max(t.scale * delta, 0.1), 5);
      const ratio = newScale / t.scale;

      transformRef.current = {
        x: px - ratio * (px - t.x),
        y: py - ratio * (py - t.y),
        scale: newScale,
      };
      applyTransform();
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [applyTransform]);

  // Pointer handlers for drag
  const handlePointerDown = React.useCallback((e: React.PointerEvent) => {
    // Only start drag for single pointer (touch or mouse)
    if (e.pointerType === "touch") return; // let touch events handle via onTouchStart
    dragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      transformRef.current.x += dx;
      transformRef.current.y += dy;
      applyTransform();
    },
    [applyTransform],
  );

  const handlePointerUp = React.useCallback(() => {
    dragging.current = false;
  }, []);

  // Touch handlers for pan + pinch
  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    const t0 = e.touches[0];
    const t1 = e.touches[1];
    if (e.touches.length === 1 && t0) {
      dragging.current = true;
      lastPointer.current = { x: t0.clientX, y: t0.clientY };
    } else if (e.touches.length === 2 && t0 && t1) {
      dragging.current = false;
      const dx = t1.clientX - t0.clientX;
      const dy = t1.clientY - t0.clientY;
      pinchDistRef.current = Math.hypot(dx, dy);
      pinchScaleStart.current = transformRef.current.scale;
    }
  }, []);

  const handleTouchMove = React.useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      if (e.touches.length === 1 && dragging.current && t0) {
        const dx = t0.clientX - lastPointer.current.x;
        const dy = t0.clientY - lastPointer.current.y;
        lastPointer.current = { x: t0.clientX, y: t0.clientY };
        transformRef.current.x += dx;
        transformRef.current.y += dy;
        applyTransform();
      } else if (e.touches.length === 2 && pinchDistRef.current !== null && t0 && t1) {
        const dx = t1.clientX - t0.clientX;
        const dy = t1.clientY - t0.clientY;
        const dist = Math.hypot(dx, dy);
        const ratio = dist / pinchDistRef.current;
        const newScale = Math.min(Math.max(pinchScaleStart.current * ratio, 0.1), 5);

        const container = containerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          const cx = (t0.clientX + t1.clientX) / 2 - rect.left;
          const cy = (t0.clientY + t1.clientY) / 2 - rect.top;
          const cur = transformRef.current;
          const scaleRatio = newScale / cur.scale;
          transformRef.current = {
            x: cx - scaleRatio * (cx - cur.x),
            y: cy - scaleRatio * (cy - cur.y),
            scale: newScale,
          };
        } else {
          transformRef.current.scale = newScale;
        }
        applyTransform();
      }
    },
    [applyTransform],
  );

  const handleTouchEnd = React.useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      pinchDistRef.current = null;
    }
    if (e.touches.length === 0) {
      dragging.current = false;
    } else if (e.touches.length === 1) {
      const t0 = e.touches[0];
      if (t0) {
        dragging.current = true;
        lastPointer.current = { x: t0.clientX, y: t0.clientY };
      }
    }
  }, []);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <p className="text-sm text-destructive">Failed to render diagram</p>
          <p className="mt-1 text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading diagram...</p>
      </div>
    );
  }

  const t = transformRef.current;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full cursor-grab overflow-hidden active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: "none" }}
    >
      <div
        ref={contentRef}
        className="flex h-full w-full items-center justify-center p-8"
        style={{
          transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})`,
          transformOrigin: "0 0",
        }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
