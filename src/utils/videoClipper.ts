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
    await ffmpeg.load({
      coreURL: window.location.origin + '/ffmpeg/ffmpeg-core.js',
      wasmURL: window.location.origin + '/ffmpeg/ffmpeg-core.wasm',
      workerURL: window.location.origin + '/ffmpeg/ffmpeg-core.worker.js'
    });
    console.log('FFmpeg loaded successfully');

    // Fetch the video file
    console.log('Fetching video file...');
    const inputVideoData = await fetchFile(videoUrl);
    console.log('Video file fetched successfully');
    
    // Write the video file to FFmpeg's virtual filesystem
    console.log('Writing video to FFmpeg filesystem...');
    await ffmpeg.writeFile('input.mp4', inputVideoData);
    console.log('Video written to FFmpeg filesystem');

    // Calculate duration
    const duration = endTime - startTime;
    console.log('Calculated duration:', duration);

    // Run FFmpeg command to clip the video with proper encoding
    console.log('Running FFmpeg command...');
    await ffmpeg.exec([
      // Seek to the keyframe before start time for more accurate cutting
      '-ss', startTime.toString(),
      '-i', 'input.mp4',
      '-t', duration.toString(),
      '-map', '0:v:0',       // Map the first video stream
      '-map', '0:a:0?',      // Map the first audio stream if it exists
      '-c:v', 'copy',        // Copy video stream without re-encoding
      '-c:a', 'aac',         // Use AAC codec for audio
      '-avoid_negative_ts', 'make_zero',  // Adjust timestamps
      '-movflags', '+faststart',          // Enable streaming
      '-f', 'mp4',           // Force MP4 format
      'output.mp4'
    ]);
    console.log('FFmpeg command completed');

    // Verify the output file exists before reading
    const files = await ffmpeg.listDir('.');
    const outputExists = files.some(f => f.name === 'output.mp4');
    if (!outputExists) {
      throw new Error('FFmpeg failed to create output file');
    }

    // Read the output file
    console.log('Reading output file...');
    const outputData = await ffmpeg.readFile('output.mp4');
    if (!outputData) {
      throw new Error('Failed to read output file');
    }

    // Handle the data based on its type
    const processedVideoData = outputData instanceof Uint8Array ? outputData : new TextEncoder().encode(outputData);
    console.log('Output file read, size:', processedVideoData.length, 'bytes');

    if (processedVideoData.length < 1024) {
      throw new Error('Generated video file is too small, likely corrupted');
    }

    // Log some debug info about the data
    const firstBytes = processedVideoData.slice(0, 32);
    console.log('First 32 bytes:', 
      [...firstBytes].map(b => b.toString(16).padStart(2, '0')).join(' ')
    );

    // Create blob with proper MIME type
    console.log('Preparing video data for upload...');
    const blob = new Blob([processedVideoData], { 
      type: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"' 
    });
    console.log('Blob created successfully, size:', blob.size, 'bytes');

    // Create FormData and append the blob directly
    const formData = new FormData();
    formData.append('fileName', outputFileName);
    formData.append('videoData', blob, outputFileName);
    
    const response = await fetch('/api/save-video', {
      method: 'POST',
      body: formData,
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
