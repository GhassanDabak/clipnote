import { create } from "zustand";

export type AnnotationTool = "pen" | "highlighter" | "arrow" | "rectangle" | "text" | "eraser";

export interface Point {
  x: number;
  y: number;
}

export interface Annotation {
  id: string;
  tool: AnnotationTool;
  color: string;
  points: Point[];
  width?: number;
  text?: string;
}

interface AnnotationState {
  isAnnotating: boolean;
  currentTool: AnnotationTool;
  currentColor: string;
  annotations: Annotation[];
  lineWidth: number;
  setIsAnnotating: (isAnnotating: boolean) => void;
  setCurrentTool: (tool: AnnotationTool) => void;
  setCurrentColor: (color: string) => void;
  addAnnotation: (annotation: Annotation) => void;
  setAnnotations: (annotations: Annotation[]) => void;
  clearAnnotations: () => void;
  undoLastAnnotation: () => void;
  setLineWidth: (width: number) => void;
}

export const useAnnotationStore = create<AnnotationState>((set) => ({
  isAnnotating: false,
  currentTool: "pen",
  currentColor: "#ff0000",
  annotations: [],
  lineWidth: 3,
  setIsAnnotating: (isAnnotating) => set({ isAnnotating }),
  setCurrentTool: (tool) => set({ currentTool: tool }),
  setCurrentColor: (color) => set({ currentColor: color }),
  addAnnotation: (annotation) =>
    set((state) => ({ annotations: [...state.annotations, annotation] })),
  setAnnotations: (annotations) => set({ annotations }),
  clearAnnotations: () => set({ annotations: [] }),
  undoLastAnnotation: () =>
    set((state) => ({ annotations: state.annotations.slice(0, -1) })),
  setLineWidth: (width) => set({ lineWidth: width }),
}));
