const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS
app.use(cors());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const cvDir = path.join(uploadsDir, 'cv');
const photoDir = path.join(uploadsDir, 'photos');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(cvDir)) {
  fs.mkdirSync(cvDir);
}
if (!fs.existsSync(photoDir)) {
  fs.mkdirSync(photoDir);
}

// Setup storage for CV uploads
const cvStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, cvDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `cv-${uniqueSuffix}${ext}`);
  }
});

// Setup storage for photo uploads
const photoStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, photoDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `photo-${uniqueSuffix}${ext}`);
  }
});

// File filters
const cvFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Not a PDF file! Please upload only PDF files.'), false);
  }
};

const photoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only image files.'), false);
  }
};

// Setup upload middleware
const uploadCV = multer({ 
  storage: cvStorage,
  fileFilter: cvFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max size
  }
});

const uploadPhoto = multer({ 
  storage: photoStorage,
  fileFilter: photoFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB max size
  }
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CV upload endpoint
app.post('/api/upload/cv', uploadCV.single('cv'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Return file path that can be stored in the database
    const filePath = `/uploads/cv/${req.file.filename}`;
    res.json({ 
      success: true, 
      filePath,
      fileUrl: `${req.protocol}://${req.get('host')}${filePath}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Photo upload endpoint
app.post('/api/upload/photo', uploadPhoto.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Return file path that can be stored in the database
    const filePath = `/uploads/photos/${req.file.filename}`;
    res.json({ 
      success: true, 
      filePath,
      fileUrl: `${req.protocol}://${req.get('host')}${filePath}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large' });
    }
    return res.status(400).json({ error: err.message });
  }
  
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`File upload server running on port ${PORT}`);
});