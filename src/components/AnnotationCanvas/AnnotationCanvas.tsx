import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAnnotationCanvas } from "./useAnnotationCanvas";

export function AnnotationCanvas() {
  const {
    canvasRef,
    isAnnotating,
    currentTool,
    textInput,
    textValue,
    setTextValue,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTextSubmit,
    handleTextCancel,
  } = useAnnotationCanvas();

  if (!isAnnotating) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 z-50 bg-black/5 ${
          currentTool === "eraser" ? "cursor-not-allowed" : "cursor-crosshair"
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ touchAction: 'none' }}
      />

      {textInput.show && (
        <Card
          className="fixed z-[60] shadow-xl p-3 gap-2"
          style={{ left: textInput.x, top: textInput.y }}
        >
          <Input
            type="text"
            autoFocus
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTextSubmit();
              if (e.key === "Escape") handleTextCancel();
            }}
            className="w-64"
            placeholder="Enter text..."
          />
          <div className="flex gap-2">
            <Button
              onClick={handleTextSubmit}
              size="sm"
            >
              Add
            </Button>
            <Button
              onClick={handleTextCancel}
              size="sm"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
