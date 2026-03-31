
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
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
  if (allowedMimes.includes(file.mimetype)) {
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
router.post('/', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res, next) => {
  try {
    const data = req.body;
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        data.image = req.files.image[0].filename;
      }
      if (req.files.video && req.files.video[0]) {
        data.videoFile = req.files.video[0].filename;
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
router.put('/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res, next) => {
  try {
    let data = req.body;
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        data.image = req.files.image[0].filename;
      }
      if (req.files.video && req.files.video[0]) {
        data.videoFile = req.files.video[0].filename;
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
