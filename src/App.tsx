import { useState } from 'react'
import { VideoComposition } from './components/VideoComposition'
import './App.css'

type VideoProps = {
  src: string;
  startTime?: number;
  endTime?: number;
  [key: string]: unknown;
};

function App() {
  const [videoUrl, setVideoUrl] = useState<string>('/sample-video1.mp4')
  const [startTime, setStartTime] = useState<number>(0)
  const [endTime, setEndTime] = useState<number | undefined>()

  const videoProps: VideoProps = {
    src: videoUrl,
    startTime,
    endTime,
  }

  return (
    <div className="app-container">
      <div className="controls">
        <input
          type="text"
          placeholder="Enter video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <div className="time-controls">
          <input
            type="number"
            placeholder="Start time (seconds)"
            value={startTime}
            onChange={(e) => setStartTime(Number(e.target.value))}
          />
          <input
            type="number"
            placeholder="End time (seconds)"
            value={endTime || ''}
            onChange={(e) => setEndTime(e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>
      {videoUrl && (
        <div className="video-container">
          <VideoComposition {...videoProps} />
        </div>
      )}
    </div>
  )
}

export default App
