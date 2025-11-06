# 🎥 ClipNote

A modern browser-based screen recording tool with powerful real-time annotation capabilities.

## ✨ Features

- **Screen Recording** - Capture your screen with high-quality video
- **Audio Mixing** - Automatically mix tab audio + microphone for perfect recordings
- **Real-time Annotations** - Draw while recording with:
  - ✏️ Pen tool
  - 🖍️ Highlighter
  - ➡️ Arrow
  - ⬜ Rectangle
  - 📝 Text
  - 🧹 Eraser
- **Smart Countdown** - 3-second countdown after selecting what to share
- **Recording Timer** - Track elapsed time during recording
- **Instant Download** - Save recordings as WebM files
- **VS Code Theme** - Clean, professional dark interface

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/GhassanDabak/clipnote.git

# Navigate to the project
cd clipnote

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Visit `http://localhost:5173` to use ClipNote.

## 🛠️ Built With

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - UI components
- **Zustand** - State management
- **MediaRecorder API** - Screen recording
- **Canvas API** - Annotations

## 📖 Usage

1. Click **"Start Recording"**
2. Select what to share in the browser dialog
3. Wait for the 3-2-1 countdown
4. Recording starts with timer display
5. Click **"Annotate"** to draw on screen (optional)
6. Click **"Stop Recording"** when done
7. Preview and **download** your recording

## 🏗️ Project Structure

```
src/
├── components/
│   ├── RecorderControls/    # Recording controls with hook
│   ├── AnnotationCanvas/     # Canvas overlay with hook
│   ├── AnnotationToolbar/    # Annotation tools with hook
│   ├── CountdownTimer/       # Countdown UI with hook
│   └── RecordingTimer/       # Timer display with hook
├── hooks/
│   └── useScreenRecorder.ts  # Recording logic
└── store/
    ├── recorderStore.ts      # Recording state
    └── annotationStore.ts    # Annotation state
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👨‍💻 Author

**Ghassan Dabak**
- GitHub: [@GhassanDabak](https://github.com/GhassanDabak)
