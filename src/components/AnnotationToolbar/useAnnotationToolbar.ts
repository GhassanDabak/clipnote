import { useAnnotationStore } from "../../store/annotationStore";
import type { AnnotationTool } from "../../store/annotationStore";
import {
  Pencil,
  Highlighter,
  ArrowRight,
  Square,
  Type,
  Eraser,
} from "lucide-react";

export function useAnnotationToolbar() {
  const {
    isAnnotating,
    currentTool,
    currentColor,
    lineWidth,
    setCurrentTool,
    setCurrentColor,
    setLineWidth,
    undoLastAnnotation,
    clearAnnotations,
    setIsAnnotating,
  } = useAnnotationStore();

  const tools: { name: AnnotationTool; icon: typeof Pencil; label: string }[] =
    [
      { name: "pen", icon: Pencil, label: "Pen" },
      { name: "highlighter", icon: Highlighter, label: "Highlighter" },
      { name: "arrow", icon: ArrowRight, label: "Arrow" },
      { name: "rectangle", icon: Square, label: "Rectangle" },
      { name: "text", icon: Type, label: "Text" },
      { name: "eraser", icon: Eraser, label: "Eraser" },
    ];

  const colors = [
    { value: "#ff0000", label: "Red" },
    { value: "#00ff00", label: "Green" },
    { value: "#0066ff", label: "Blue" },
    { value: "#ffff00", label: "Yellow" },
    { value: "#ff00ff", label: "Magenta" },
    { value: "#ffffff", label: "White" },
    { value: "#000000", label: "Black" },
  ];

  const widths = [
    { value: 2, label: "Thin" },
    { value: 4, label: "Medium" },
    { value: 8, label: "Thick" },
  ];

  const handleDone = () => {
    setIsAnnotating(false);
    clearAnnotations();
  };

  return {
    // State
    isAnnotating,
    currentTool,
    currentColor,
    lineWidth,

    // Data
    tools,
    colors,
    widths,

    // Actions
    setCurrentTool,
    setCurrentColor,
    setLineWidth,
    undoLastAnnotation,
    clearAnnotations,
    handleDone,
  };
}
