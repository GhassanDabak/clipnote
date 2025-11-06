import { Undo, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAnnotationToolbar } from "./useAnnotationToolbar";

export function AnnotationToolbar() {
  const {
    isAnnotating,
    currentTool,
    currentColor,
    lineWidth,
    tools,
    colors,
    widths,
    setCurrentTool,
    setCurrentColor,
    setLineWidth,
    undoLastAnnotation,
    clearAnnotations,
    handleDone,
  } = useAnnotationToolbar();

  if (!isAnnotating) return null;

  return (
    <Card className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] shadow-2xl p-2 flex-row items-center gap-1">
      {/* Tools */}
      <div className="flex items-center gap-1 pr-2 border-r">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Button
              key={tool.name}
              onClick={() => setCurrentTool(tool.name)}
              variant={currentTool === tool.name ? "default" : "ghost"}
              size="icon-sm"
              title={tool.label}
            >
              <Icon size={18} />
            </Button>
          );
        })}
      </div>

      {/* Colors */}
      <div className="flex items-center gap-1 px-2 border-r">
        {colors.map((color) => (
          <Button
            key={color.value}
            onClick={() => setCurrentColor(color.value)}
            variant="ghost"
            size="icon-sm"
            className={`w-6 h-6 p-0 rounded border-2 transition-all hover:bg-transparent ${
              currentColor === color.value
                ? "border-primary scale-110"
                : "border-border"
            }`}
            style={{ backgroundColor: color.value }}
            title={color.label}
          />
        ))}
      </div>

      {/* Line Width */}
      <div className="flex items-center gap-1 px-2 border-r">
        {widths.map((width) => (
          <Button
            key={width.value}
            onClick={() => setLineWidth(width.value)}
            variant={lineWidth === width.value ? "default" : "ghost"}
            size="sm"
            title={width.label}
          >
            {width.label}
          </Button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 pl-2">
        <Button
          onClick={undoLastAnnotation}
          variant="ghost"
          size="icon-sm"
          title="Undo"
        >
          <Undo size={18} />
        </Button>
        <Button
          onClick={clearAnnotations}
          variant="ghost"
          size="icon-sm"
          title="Clear All"
        >
          <Trash2 size={18} />
        </Button>
        <Button
          onClick={handleDone}
          variant="destructive"
          size="sm"
          className="ml-2"
        >
          Done
        </Button>
      </div>
    </Card>
  );
}
