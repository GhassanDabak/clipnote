import { create } from "zustand";

interface RecorderState {
  isRecording: boolean;
  stream: MediaStream | null;
  videoUrl: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  setStream: (stream: MediaStream | null) => void;
  setVideoUrl: (url: string | null) => void;
}

export const useRecorderStore = create<RecorderState>((set) => ({
  isRecording: false,
  stream: null,
  videoUrl: null,
  startRecording: () => set({ isRecording: true }),
  stopRecording: () => set({ isRecording: false }),
  setStream: (stream) => set({ stream }),
  setVideoUrl: (url) => set({ videoUrl: url }),
}));
