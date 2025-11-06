import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { useAnnotationStore } from "../store/annotationStore";
import type { Point, Annotation } from "../store/annotationStore";
import { AnnotationToolbar } from "./AnnotationToolbar";

export function AnnotationOverlay() {
  const { isAnnotating } = useAnnotationStore();
  const overlayWindowRef = useRef<Window | null>(null);

  useEffect(() => {
    if (isAnnotating && !overlayWindowRef.current) {
      // Create overlay window
      const overlayWindow = window.open(
        "",
        "annotation-overlay",
        `width=${screen.width},height=${screen.height},left=0,top=0,resizable=no,scrollbars=no,toolbar=no,menubar=no,location=no,status=no`
      );

      if (overlayWindow) {
        overlayWindowRef.current = overlayWindow;

        // Setup overlay window HTML
        overlayWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Annotation Overlay</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                  overflow: hidden;
                  background: transparent;
                  cursor: crosshair;
                }
                #root { width: 100vw; height: 100vh; }
              </style>
              <link rel="stylesheet" href="/src/index.css">
            </head>
            <body>
              <div id="root"></div>
            </body>
          </html>
        `);
        overlayWindow.document.close();

        // Wait for window to load then render React
        overlayWindow.addEventListener("load", () => {
          const rootElement = overlayWindow.document.getElementById("root");
          if (rootElement) {
            const root = createRoot(rootElement);
            root.render(<OverlayContent />);
          }
        });
      }
    } else if (!isAnnotating && overlayWindowRef.current) {
      overlayWindowRef.current.close();
      overlayWindowRef.current = null;
    }

    return () => {
      if (overlayWindowRef.current) {
        overlayWindowRef.current.close();
        overlayWindowRef.current = null;
      }
    };
  }, [isAnnotating]);

  return null;
}

function OverlayContent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);

  const {
    currentTool,
    currentColor,
    annotations,
    lineWidth,
    addAnnotation,
  } = useAnnotationStore();

  const redrawAnnotations = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    annotations.forEach((annotation) => {
      drawAnnotation(ctx, annotation);
    });
  };

  // Initialize canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redrawAnnotations();
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw all annotations whenever they change
  useEffect(() => {
    redrawAnnotations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotations]);

  const drawAnnotation = (
    ctx: CanvasRenderingContext2D,
    annotation: Annotation
  ) => {
    if (annotation.points.length === 0) return;

    ctx.strokeStyle = annotation.color;
    ctx.lineWidth = annotation.width || lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    switch (annotation.tool) {
      case "pen":
        ctx.globalAlpha = 1;
        drawPath(ctx, annotation.points);
        break;
      case "highlighter":
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = (annotation.width || lineWidth) * 3;
        drawPath(ctx, annotation.points);
        ctx.globalAlpha = 1;
        break;
      case "arrow":
        if (annotation.points.length >= 2) {
          const start = annotation.points[0];
          const end = annotation.points[annotation.points.length - 1];
          drawArrow(ctx, start, end);
        }
        break;
      case "rectangle":
        if (annotation.points.length >= 2) {
          const start = annotation.points[0];
          const end = annotation.points[annotation.points.length - 1];
          drawRectangle(ctx, start, end);
        }
        break;
      case "text":
        if (annotation.text && annotation.points[0]) {
          ctx.fillStyle = annotation.color;
          ctx.font = "24px Inter, sans-serif";
          ctx.fillText(
            annotation.text,
            annotation.points[0].x,
            annotation.points[0].y
          );
        }
        break;
    }
  };

  const drawPath = (ctx: CanvasRenderingContext2D, points: Point[]) => {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  };

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    start: Point,
    end: Point
  ) => {
    const headLength = 15;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headLength * Math.cos(angle - Math.PI / 6),
      end.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headLength * Math.cos(angle + Math.PI / 6),
      end.y - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const drawRectangle = (
    ctx: CanvasRenderingContext2D,
    start: Point,
    end: Point
  ) => {
    ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const point = getMousePos(e);

    if (currentTool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        const annotation: Annotation = {
          id: Date.now().toString(),
          tool: "text",
          color: currentColor,
          points: [point],
          text,
        };
        addAnnotation(annotation);
      }
      setIsDrawing(false);
      return;
    }

    setCurrentPoints([point]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const point = getMousePos(e);

    if (currentTool === "pen" || currentTool === "highlighter") {
      setCurrentPoints((prev) => [...prev, point]);

      // Draw preview
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      redrawAnnotations();

      const tempAnnotation: Annotation = {
        id: "temp",
        tool: currentTool,
        color: currentColor,
        points: [...currentPoints, point],
        width: lineWidth,
      };
      drawAnnotation(ctx, tempAnnotation);
    } else if (currentTool === "arrow" || currentTool === "rectangle") {
      // Draw preview for shapes
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      redrawAnnotations();

      const tempAnnotation: Annotation = {
        id: "temp",
        tool: currentTool,
        color: currentColor,
        points: [currentPoints[0], point],
        width: lineWidth,
      };
      drawAnnotation(ctx, tempAnnotation);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;

    if (currentPoints.length > 0 && currentTool !== "text") {
      const annotation: Annotation = {
        id: Date.now().toString(),
        tool: currentTool,
        color: currentColor,
        points: currentPoints,
        width: lineWidth,
      };
      addAnnotation(annotation);
    }

    setIsDrawing(false);
    setCurrentPoints([]);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          cursor: "crosshair",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <AnnotationToolbar />
    </div>
  );
}
