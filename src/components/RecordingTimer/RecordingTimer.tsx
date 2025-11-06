import { Card } from "@/components/ui/card";

interface RecordingTimerProps {
  formattedTime: string;
  isVisible: boolean;
}

export function RecordingTimer({ formattedTime, isVisible }: RecordingTimerProps) {
  if (!isVisible) return null;

  return (
    <Card className="fixed top-4 right-4 z-[90] shadow-2xl p-3 flex-row items-center gap-3">
      <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
      <div className="text-lg font-mono font-semibold">{formattedTime}</div>
    </Card>
  );
}
