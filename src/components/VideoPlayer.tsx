import React from 'react';
import { AbsoluteFill, Video, useVideoConfig } from 'remotion';

interface VideoPlayerProps {
  src: string;
  startTime?: number;
  endTime?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  startTime = 0,
  endTime,
}) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Video
        src={src}
        startFrom={startTime * fps}
        endAt={endTime ? endTime * fps : undefined}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </AbsoluteFill>
  );
}; 