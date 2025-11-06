import { useRef } from "react";
import { useRecorderStore } from "../store/recorderStore";

export function useScreenRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { setVideoUrl, startRecording, stopRecording, setStream } =
    useRecorderStore();

  const prepare = async (onReady: () => void) => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          sampleRate: 44100,
        },
      });

      // Always try to get microphone audio
      let micStream;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch {
        // Microphone not available
      }

      const hasDisplayAudio = displayStream.getAudioTracks().length > 0;

      let finalStream: MediaStream;

      // Only capture audio if user explicitly shared tab audio
      if (hasDisplayAudio) {
        // User wants audio - mix tab audio with microphone
        if (micStream) {
          const audioContext = new AudioContext();
          const destination = audioContext.createMediaStreamDestination();

          // Add display audio
          const displayAudioSource = audioContext.createMediaStreamSource(
            new MediaStream(displayStream.getAudioTracks())
          );
          displayAudioSource.connect(destination);

          // Add microphone audio
          const micAudioSource = audioContext.createMediaStreamSource(micStream);
          micAudioSource.connect(destination);

          // Combine video from display with mixed audio
          finalStream = new MediaStream([
            ...displayStream.getVideoTracks(),
            ...destination.stream.getAudioTracks(),
          ]);
        } else {
          // Only tab audio (no mic)
          finalStream = displayStream;
        }
      } else {
        // User did NOT share audio - no audio at all (silent video)
        finalStream = new MediaStream([...displayStream.getVideoTracks()]);
      }

      const recorder = new MediaRecorder(finalStream, {
        mimeType: "video/webm;codecs=vp8,opus"
      });
      mediaRecorderRef.current = recorder;

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm;codecs=vp8,opus" });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        stopRecording();
        setStream(null);
      };

      recorder.onstart = () => {
        // Recording started
      };

      displayStream.getVideoTracks()[0].addEventListener("ended", () => {
        stop();
      });

      setStream(finalStream);

      // Call onReady callback after stream is prepared
      onReady();
    } catch {
      // Failed to prepare recording
    }
  };

  const start = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "inactive") {
      startRecording();
      recorder.start();
    }
  };

  const stop = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    useRecorderStore
      .getState()
      .stream?.getTracks()
      .forEach((t) => t.stop());
  };

  return { prepare, start, stop };
}
