import React, { useEffect, useRef } from 'react';

type VideoProps = {
  src: string;
  startTime?: number;
  endTime?: number;
  [key: string]: unknown;
};

export const VideoComposition: React.FC<VideoProps> = ({
  src,
  startTime = 0,
  endTime,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = startTime;
    }
  }, [startTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && endTime) {
      const handleTimeUpdate = () => {
        if (video.currentTime >= endTime) {
          video.pause();
          video.currentTime = startTime;
        }
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }
  }, [endTime, startTime]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <video
        ref={videoRef}
        src={src}
        controls
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}; 