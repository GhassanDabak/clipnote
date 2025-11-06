import { useRecorderStore } from "../../store/recorderStore";
import { useScreenRecorder } from "../../hooks/useScreenRecorder";
import { useAnnotationStore } from "../../store/annotationStore";
import { useCountdownTimer } from "../CountdownTimer";
import { useRecordingTimer } from "../RecordingTimer";

export function useRecorderControls() {
  const { isRecording, videoUrl } = useRecorderStore();
  const { prepare, start, stop } = useScreenRecorder();
  const { isAnnotating, setIsAnnotating } = useAnnotationStore();

  // Recording timer (elapsed time during recording)
  const recordingTimer = useRecordingTimer();

  // Countdown timer (after sharing dialog, before recording starts)
  const countdown = useCountdownTimer({
    initialCount: 3,
    onComplete: () => {
      start();
      recordingTimer.start();
    },
  });

  const handleDownload = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `clipnote-${Date.now()}.webm`;
    a.click();
  };

  const handleVideoMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    video.volume = 1.0;
    video.muted = false;
  };

  const handleDiscard = () => {
    useRecorderStore.getState().setVideoUrl(null);
  };

  const toggleAnnotation = () => {
    setIsAnnotating(!isAnnotating);
  };

  const handleRecordingToggle = async () => {
    if (isRecording) {
      stop();
      recordingTimer.stop();
    } else {
      // First show sharing dialog and prepare stream
      await prepare(() => {
        // After user selects what to share, start countdown
        countdown.start();
      });
    }
  };

  return {
    // State
    isRecording,
    videoUrl,
    isAnnotating,

    // Timers
    countdown,
    recordingTimer,

    // Handlers
    handleRecordingToggle,
    toggleAnnotation,
    handleDownload,
    handleDiscard,
    handleVideoMetadata,
  };
}
