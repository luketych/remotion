import { useState, useEffect } from 'react'
import { VideoComposition } from './components/VideoComposition'
import { clipVideo } from './utils/videoClipper'
import './App.css'

type VideoProps = {
  src: string;
  startTime?: number;
  endTime?: number;
  [key: string]: unknown;
};

type ClipInfo = {
  name: string;
  url: string;
  size: number;
  created: string;
};

function App() {
  const [videoUrl, setVideoUrl] = useState<string>('/sample-video1.mp4')
  const [startTime, setStartTime] = useState<number>(0)
  const [endTime, setEndTime] = useState<number | undefined>()
  const [clippedVideos, setClippedVideos] = useState<string[]>([])
  const [isClipping, setIsClipping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadExistingClips = async () => {
      try {
        console.log('Fetching clips from server...');
        const response = await fetch('/api/clips');
        if (!response.ok) throw new Error('Failed to fetch clips');
        
        const clips: ClipInfo[] = await response.json();
        console.log('Server returned clips:', clips);
        
        const videoUrls = clips.map(clip => clip.url);
        console.log('Setting video URLs:', videoUrls);
        setClippedVideos(videoUrls);
      } catch (error) {
        console.error('Error loading clips:', error);
      }
    };

    console.log('Initial clips load');
    loadExistingClips();

    // Check for new clips every 2 seconds
    const interval = setInterval(loadExistingClips, 2000);
    console.log('Clip polling initialized');

    return () => {
      console.log('Cleaning up clip polling');
      clearInterval(interval);
    };
  }, []);

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
      
      const clipUrl = await clipVideo(videoUrl, startTime, endTime, outputFileName);
      console.log('Clip created successfully at:', clipUrl);
      
      // The polling will automatically pick up the new clip
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
          <h2>Clipped Videos ({clippedVideos.length})</h2>
          <div className="clipped-videos-grid">
            {clippedVideos.map(url => (
              <div key={url} className="clipped-video-item">
                <div className="video-wrapper">
                  <VideoComposition
                    src={url}
                    startTime={0}
                  />
                  <button 
                    className="load-clip-button"
                    onClick={() => {
                      setVideoUrl(url);
                      setStartTime(0);
                      setEndTime(undefined);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Load into Clipper
                  </button>
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
