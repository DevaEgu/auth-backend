const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/user');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Setup multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/profilePictures'),
  filename: (req, file, cb) => cb(null, `${req.userId}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// GET user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Base profile
    const response = {
      email: user.email,
      fullName: user.fullName,
      isUstaz: user.isUstaz,
      profilePicture: user.profilePicture,
    };

    // Add ustaz-specific fields if user is ustaz
    if (user.isUstaz) {
      response.phoneNumber = user.phoneNumber;
      response.experience = user.experience;
      response.specialization = user.specialization;
      response.language = user.language;
      response.certificate = user.certificate;
      response.legalId = user.legalId;
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

// PUT update profile
router.put('/profile', verifyToken, async (req, res) => {
  const {
    fullName,
    isUstaz,
    phoneNumber,
    experience,
    specialization,
    language,
    certificate,
    legalId,
  } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update general fields
    if (fullName !== undefined) user.fullName = fullName;
    if (isUstaz !== undefined) user.isUstaz = isUstaz;

    // Update ustaz-specific fields if applicable
    if (user.isUstaz) {
      if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
      if (experience !== undefined) user.experience = experience;
      if (specialization !== undefined) user.specialization = specialization;
      if (language !== undefined) user.language = language;
      if (certificate !== undefined) user.certificate = certificate;
      if (legalId !== undefined) user.legalId = legalId;
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated',
      user: {
        email: user.email,
        fullName: user.fullName,
        isUstaz: user.isUstaz,
        profilePicture: user.profilePicture,
        ...(user.isUstaz && {
          phoneNumber: user.phoneNumber,
          experience: user.experience,
          specialization: user.specialization,
          language: user.language,
          certificate: user.certificate,
          legalId: user.legalId,
        }),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
});

// POST upload profile picture
router.post('/upload-picture', verifyToken, upload.single('profilePicture'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profilePicture = `/uploads/profilePictures/${req.file.filename}`;
    await user.save();

    res.status(200).json({ message: 'Picture uploaded', profilePicture: user.profilePicture });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

module.exports = router;