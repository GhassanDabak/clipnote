import { Toaster } from "@/components/ui/sonner";
import { RecorderControls } from "./components/RecorderControls";
import { AnnotationCanvas } from "./components/AnnotationCanvas";
import { AnnotationToolbar } from "./components/AnnotationToolbar";

export default function App() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-vscode-bg)] text-[var(--color-vscode-text)]">
      <h1 className="text-2xl font-semibold mb-6">🎥 ClipNote</h1>
      <RecorderControls />
      <AnnotationCanvas />
      <AnnotationToolbar />
      <Toaster />
    </main>
  );
}
