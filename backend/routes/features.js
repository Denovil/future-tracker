
const express = require('express');
const router = express.Router();
const featureModel = require('../models/feature');
const { validateFeature } = require('../middleware/validate');
const multer = require('multer');
const path = require('path');

// Multer setup for image and video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept images and videos
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/pjpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.mov'];
  const extension = path.extname(file.originalname || '').toLowerCase();
  if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Get all features
router.get('/', async (req, res, next) => {
  try {
    const features = await featureModel.getAllFeatures();
    res.json(features);
  } catch (err) {
    next(err);
  }
});

// Get feature by ID
router.get('/:id', async (req, res, next) => {
  try {
    const feature = await featureModel.getFeatureById(req.params.id);
    if (!feature) return res.status(404).json({ error: 'Feature not found' });
    res.json(feature);
  } catch (err) {
    next(err);
  }
});

// Create feature with image and/or video upload
router.post('/', upload.fields([
  { name: 'image', maxCount: 1 }, 
  { name: 'imageClip', maxCount: 20 },
  { name: 'video', maxCount: 10 }  // Allow up to 10 video uploads
]), async (req, res, next) => {
  try {
    const data = req.body;
    
    // Parse videos, videoFiles, imageClips and links from JSON strings if present
    if (data.videos && typeof data.videos === 'string') {
      data.videos = JSON.parse(data.videos);
    }
    if (data.videoFiles && typeof data.videoFiles === 'string') {
      data.videoFiles = JSON.parse(data.videoFiles);
    }
    if (data.imageClips && typeof data.imageClips === 'string') {
      data.imageClips = JSON.parse(data.imageClips);
    }
    if (data.links && typeof data.links === 'string') {
      data.links = JSON.parse(data.links);
    }
    
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        data.image = req.files.image[0].filename;
      }
      // Handle multiple image clip uploads
      if (req.files.imageClip && req.files.imageClip.length > 0) {
        const uploadedImageClips = req.files.imageClip.map((file, idx) => ({
          id: "img-" + Date.now() + "-" + idx,
          title: idx === 0 && data.imageClipTitle ? data.imageClipTitle : "Image " + (idx + 1),
          description: idx === 0 && data.imageClipDescription ? data.imageClipDescription : "",
          fileName: file.filename,
          filePath: `/api/features/images/${file.filename}`,
          views: 0,
          viewed: false,
          isFile: true
        }));
        data.imageClips = uploadedImageClips;
        if (!data.image && uploadedImageClips[0]?.fileName) {
          data.image = uploadedImageClips[0].fileName;
        }
      }
      // Handle multiple video uploads
      if (req.files.video && req.files.video.length > 0) {
        const uploadedVideos = req.files.video.map((file, idx) => ({
          id: "v-" + Date.now() + "-" + idx,
          title: "Video Clip " + (idx + 1),
          fileName: file.filename,
          filePath: `/api/features/videos/${file.filename}`,
          views: 0,
          viewed: false,
          isFile: true
        }));
        data.videoFiles = uploadedVideos;
      }
    }
    // Validate other fields manually (skip middleware)
    if (!data.title || !data.priority || !data.status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const newFeature = await featureModel.createFeature(data);
    res.status(201).json(newFeature);
  } catch (err) {
    next(err);
  }
});
// Serve uploaded images and videos statically
router.use('/images', express.static(path.join(__dirname, '../uploads')));
router.use('/videos', express.static(path.join(__dirname, '../uploads')));

// Update feature (allow partial update and image/video upload)
router.put('/:id', upload.fields([
  { name: 'image', maxCount: 1 }, 
  { name: 'imageClip', maxCount: 20 },
  { name: 'video', maxCount: 10 }  // Allow up to 10 video uploads
]), async (req, res, next) => {
  try {
    let data = req.body;
    
    // Parse videos, videoFiles, imageClips and links from JSON strings if present
    if (data.videos && typeof data.videos === 'string') {
      data.videos = JSON.parse(data.videos);
    }
    if (data.videoFiles && typeof data.videoFiles === 'string') {
      data.videoFiles = JSON.parse(data.videoFiles);
    }
    if (data.imageClips && typeof data.imageClips === 'string') {
      data.imageClips = JSON.parse(data.imageClips);
    }
    if (data.links && typeof data.links === 'string') {
      data.links = JSON.parse(data.links);
    }
    
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        data.image = req.files.image[0].filename;
      }
      // Handle multiple image clip uploads - append to existing ones
      if (req.files.imageClip && req.files.imageClip.length > 0) {
        const newImageClips = req.files.imageClip.map((file, idx) => ({
          id: "img-" + Date.now() + "-" + idx,
          title: idx === 0 && data.imageClipTitle ? data.imageClipTitle : "Image " + (idx + 1),
          description: idx === 0 && data.imageClipDescription ? data.imageClipDescription : "",
          fileName: file.filename,
          filePath: `/api/features/images/${file.filename}`,
          views: 0,
          viewed: false,
          isFile: true
        }));
        // Get existing feature to preserve existing imageClips
        const existingFeature = await featureModel.getFeatureById(req.params.id);
        if (existingFeature && existingFeature.imageClips) {
          data.imageClips = [...existingFeature.imageClips, ...newImageClips];
        } else {
          data.imageClips = newImageClips;
        }
        if (!data.image && newImageClips[0]?.fileName) {
          data.image = newImageClips[0].fileName;
        }
      }
      // Handle multiple video uploads - append to existing ones
      if (req.files.video && req.files.video.length > 0) {
        const newVideoFiles = req.files.video.map((file, idx) => ({
          id: "v-" + Date.now() + "-" + idx,
          title: "Video Clip " + (idx + 1),
          fileName: file.filename,
          filePath: `/api/features/videos/${file.filename}`,
          views: 0,
          viewed: false,
          isFile: true
        }));
        // Get existing feature to preserve existing videoFiles
        const existingFeature = await featureModel.getFeatureById(req.params.id);
        if (existingFeature && existingFeature.videoFiles) {
          data.videoFiles = [...existingFeature.videoFiles, ...newVideoFiles];
        } else {
          data.videoFiles = newVideoFiles;
        }
      }
    }
    // Allow partial update: only update provided fields
    const updated = await featureModel.updateFeature(req.params.id, data);
    if (!updated) return res.status(404).json({ error: 'Feature not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Delete feature
router.delete('/:id', async (req, res, next) => {
  try {
    await featureModel.deleteFeature(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
