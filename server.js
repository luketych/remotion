import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178', 'http://localhost:5179'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Parse JSON bodies
app.use(express.json({ limit: '50mb' }));

// Serve static files from the public directory
app.use(express.static('public'));

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Create clips directory if it doesn't exist
const clipsDir = path.join(publicDir, 'clips');
if (!fs.existsSync(clipsDir)) {
  fs.mkdirSync(clipsDir);
}

// Endpoint to save video
app.post('/api/save-video', (req, res) => {
  console.log('Received request to save video');
  const { fileName, videoData } = req.body;
  console.log('File details:', { fileName, dataSize: videoData?.byteLength });

  if (!fileName || !videoData) {
    console.error('Missing required fields');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const filePath = path.join(clipsDir, fileName);
  console.log('Saving to:', filePath);

  // Convert ArrayBuffer to Buffer and save
  const buffer = Buffer.from(new Uint8Array(videoData));
  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      console.error('Error saving file:', err);
      return res.status(500).json({ error: 'Failed to save video' });
    }
    console.log('File saved successfully');
    res.json({ success: true, path: `/clips/${fileName}` });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 