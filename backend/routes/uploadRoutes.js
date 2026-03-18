import express from 'express';
import { upload } from '../config/cloudinary.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/upload
// @desc    Upload an image to Cloudinary and get the URL back
// @access  Private (Only Admins can upload product images)
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Cloudinary returns the live URL of the image in req.file.path
  res.status(200).json({
    message: 'Image uploaded successfully',
    imageUrl: req.file.path,
  });
});

export default router;
