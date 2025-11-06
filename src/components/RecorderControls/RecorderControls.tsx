import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRecorderControls } from "./useRecorderControls";
import { CountdownTimer } from "../CountdownTimer";
import { RecordingTimer } from "../RecordingTimer";

export function RecorderControls() {
  const {
    isRecording,
    videoUrl,
    isAnnotating,
    countdown,
    recordingTimer,
    handleRecordingToggle,
    toggleAnnotation,
    handleDownload,
    handleDiscard,
    handleVideoMetadata,
  } = useRecorderControls();

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <div className="flex gap-3">
        <Button
          onClick={handleRecordingToggle}
          disabled={isAnnotating || !!videoUrl}
          size="lg"
          variant={isRecording ? "destructive" : "default"}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>

        {isRecording && (
          <Button
            onClick={toggleAnnotation}
            size="lg"
            variant={isAnnotating ? "default" : "outline"}
          >
            <Pencil size={18} />
            {isAnnotating ? "Annotating..." : "Annotate"}
          </Button>
        )}
      </div>

      {videoUrl && (
        <Card className="mt-4 flex flex-col items-center p-0 gap-0">
          <video
            src={videoUrl}
            controls
            autoPlay={false}
            className="w-[640px] rounded-t-lg"
            onLoadedMetadata={handleVideoMetadata}
          />

          <div className="flex gap-3 p-4">
            <Button onClick={handleDownload}>Download</Button>

            <Button onClick={handleDiscard} variant="destructive">
              Discard
            </Button>
          </div>
        </Card>
      )}

      <CountdownTimer count={countdown.count} />
      <RecordingTimer
        formattedTime={recordingTimer.formattedTime}
        isVisible={isRecording}
      />
    </div>
  );
}
