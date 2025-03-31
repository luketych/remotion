import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export async function clipVideo(
  videoUrl: string,
  startTime: number,
  endTime: number,
  outputFileName: string
): Promise<string> {
  console.log('Starting video clipping process...');
  console.log('Parameters:', { videoUrl, startTime, endTime, outputFileName });

  const ffmpeg = new FFmpeg();
  
  try {
    console.log('Loading FFmpeg...');
    // Load FFmpeg with default configuration
    await ffmpeg.load();
    console.log('FFmpeg loaded successfully');

    // Fetch the video file
    console.log('Fetching video file...');
    const videoData = await fetchFile(videoUrl);
    console.log('Video file fetched successfully');
    
    // Write the video file to FFmpeg's virtual filesystem
    console.log('Writing video to FFmpeg filesystem...');
    await ffmpeg.writeFile('input.mp4', videoData);
    console.log('Video written to FFmpeg filesystem');

    // Calculate duration
    const duration = endTime - startTime;
    console.log('Calculated duration:', duration);

    // Run FFmpeg command to clip the video
    console.log('Running FFmpeg command...');
    await ffmpeg.exec([
      '-i', 'input.mp4',
      '-ss', startTime.toString(),
      '-t', duration.toString(),
      '-c', 'copy',
      'output.mp4'
    ]);
    console.log('FFmpeg command completed');

    // Read the output file
    console.log('Reading output file...');
    const data = await ffmpeg.readFile('output.mp4');
    console.log('Output file read successfully');

    // Convert to blob
    console.log('Converting to blob...');
    const blob = new Blob([data], { type: 'video/mp4' });
    console.log('Blob created successfully');

    // Save to public folder using the proxied API endpoint
    console.log('Saving to public folder...');
    const response = await fetch('/api/save-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: outputFileName,
        videoData: await blob.arrayBuffer(),
      }),
    });

    if (!response.ok) {
      console.error('Failed to save video:', response.status, response.statusText);
      throw new Error('Failed to save video');
    }

    const result = await response.json();
    console.log('Video saved successfully:', result);

    // Return the URL of the saved video
    return `/clips/${outputFileName}`;
  } catch (error) {
    console.error('Error in clipVideo:', error);
    throw error;
  }
} 