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
app.use(cors());

// Parse multipart/form-data
import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/clips/')
  },
  filename: function (req, file, cb) {
    // Use fileName from form data if available, otherwise use a timestamp
    const fileName = req.body.fileName || `clip_${Date.now()}.mp4`;
    cb(null, fileName);
  }
});

const upload = multer({ storage: storage });

// Add body parser for URL-encoded data
app.use(express.urlencoded({ extended: true }));

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
app.post('/api/save-video', upload.single('videoData'), (req, res) => {
  console.log('Received request to save video');
  console.log('Request body:', req.body);
  
  if (!req.file) {
    console.error('No file received');
    return res.status(400).json({ error: 'No file received' });
  }

  console.log('File details:', {
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype
  });

  // Check if file size is too small (less than 1KB might indicate an issue)
  if (req.file.size < 1024) {
    console.error('Warning: File size is suspiciously small:', req.file.size, 'bytes');
  }

  // Verify the file exists and is readable
  const filePath = path.join(clipsDir, req.file.filename);
  try {
    const stats = fs.statSync(filePath);
    console.log('Saved file size:', stats.size, 'bytes');
    
    if (stats.size !== req.file.size) {
      console.error('Warning: File size mismatch. Expected:', req.file.size, 'Actual:', stats.size);
    }
  } catch (error) {
    console.error('Error verifying saved file:', error);
    return res.status(500).json({ error: 'Failed to verify saved file' });
  }

  console.log('File saved successfully:', req.file.filename);
  res.json({ 
    success: true, 
    path: `/clips/${req.file.filename}`,
    size: req.file.size
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
