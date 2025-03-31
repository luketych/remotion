import { useState } from 'react'
import { VideoComposition } from './components/VideoComposition'
import { clipVideo } from './utils/videoClipper'
import './App.css'

type VideoProps = {
  src: string;
  startTime?: number;
  endTime?: number;
  [key: string]: unknown;
};

type ClippedVideo = {
  url: string;
  startTime: number;
  endTime: number;
};

function App() {
  const [videoUrl, setVideoUrl] = useState<string>('/sample-video1.mp4')
  const [startTime, setStartTime] = useState<number>(0)
  const [endTime, setEndTime] = useState<number | undefined>()
  const [clippedVideos, setClippedVideos] = useState<ClippedVideo[]>([])
  const [isClipping, setIsClipping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const videoProps: VideoProps = {
    src: videoUrl,
    startTime,
    endTime,
  }

  const handleClip = async () => {
    if (!endTime) {
      console.error('End time not set');
      setError('Please set an end time before clipping');
      return;
    }
    
    console.log('Starting clip process...');
    setIsClipping(true);
    setError(null);
    
    try {
      const outputFileName = `clip_${Date.now()}.mp4`;
      console.log('Creating clip with filename:', outputFileName);
      
      const url = await clipVideo(videoUrl, startTime, endTime, outputFileName);
      console.log('Clip created successfully:', url);
      
      setClippedVideos(prev => [...prev, {
        url: `/${outputFileName}`,
        startTime,
        endTime,
      }]);
    } catch (error) {
      console.error('Error in handleClip:', error);
      setError(error instanceof Error ? error.message : 'Failed to clip video. Please try again.');
      alert('Failed to clip video. Please check the console for details.');
    } finally {
      setIsClipping(false);
    }
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
          <button 
            onClick={handleClip}
            disabled={!endTime || isClipping}
            className="clip-button"
          >
            {isClipping ? 'Clipping...' : 'Clip Video'}
          </button>
        </div>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
      {videoUrl && (
        <div className="video-container">
          <VideoComposition {...videoProps} />
        </div>
      )}
      {clippedVideos.length > 0 && (
        <div className="clipped-videos">
          <h2>Clipped Videos</h2>
          <div className="clipped-videos-grid">
            {clippedVideos.map((video, index) => (
              <div key={index} className="clipped-video-item">
                <VideoComposition
                  src={video.url}
                  startTime={0}
                />
                <div className="video-info">
                  <p>Start: {video.startTime}s</p>
                  <p>End: {video.endTime}s</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
