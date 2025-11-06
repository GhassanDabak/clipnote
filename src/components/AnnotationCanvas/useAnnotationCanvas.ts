import { useEffect, useRef, useState } from "react";
import type { Point, Annotation } from "../../store/annotationStore";
import { useAnnotationStore } from "../../store/annotationStore";

export function useAnnotationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [textInput, setTextInput] = useState<{ x: number; y: number; show: boolean }>({
    x: 0,
    y: 0,
    show: false,
  });
  const [textValue, setTextValue] = useState("");

  const {
    isAnnotating,
    currentTool,
    currentColor,
    annotations,
    lineWidth,
    addAnnotation,
    setAnnotations,
  } = useAnnotationStore();

  const removeAnnotation = (id: string) => {
    setAnnotations(annotations.filter((a) => a.id !== id));
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
  }, [isAnnotating]);

  // Redraw all annotations whenever they change
  useEffect(() => {
    redrawAnnotations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotations]);

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
    if (!isAnnotating) return;

    const point = getMousePos(e);

    if (currentTool === "text") {
      setTextInput({ x: point.x, y: point.y, show: true });
      setTextValue("");
      return;
    }

    setIsDrawing(true);
    setCurrentPoints([point]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isAnnotating) return;

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
    } else if (currentTool === "eraser") {
      // Check if eraser overlaps with any annotation
      annotations.forEach((annotation) => {
        annotation.points.forEach((annotationPoint) => {
          const distance = Math.sqrt(
            Math.pow(point.x - annotationPoint.x, 2) +
            Math.pow(point.y - annotationPoint.y, 2)
          );
          if (distance < lineWidth * 3) {
            removeAnnotation(annotation.id);
          }
        });
      });
    } else if (currentTool === "arrow" || currentTool === "rectangle") {
      // Update current points with end point for shapes
      setCurrentPoints([currentPoints[0], point]);

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
    if (!isDrawing || !isAnnotating) return;

    if (currentPoints.length > 0 && currentTool !== "text" && currentTool !== "eraser") {
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

  const handleTextSubmit = () => {
    if (textValue.trim()) {
      const annotation: Annotation = {
        id: Date.now().toString(),
        tool: "text",
        color: currentColor,
        points: [{ x: textInput.x, y: textInput.y }],
        text: textValue,
      };
      addAnnotation(annotation);
    }
    setTextInput({ x: 0, y: 0, show: false });
    setTextValue("");
  };

  const handleTextCancel = () => {
    setTextInput({ x: 0, y: 0, show: false });
    setTextValue("");
  };

  return {
    // State
    canvasRef,
    isAnnotating,
    currentTool,
    textInput,
    textValue,
    setTextValue,

    // Handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTextSubmit,
    handleTextCancel,
  };
}
