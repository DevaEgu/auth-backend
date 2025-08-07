const express = require('express');
const router = express.Router();
const Enroll = require('../models/enroll');
const Course = require('../models/Course');
const User = require('../models/user');
const verifyToken = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/receipts/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Enroll a user in a course
router.post('/', verifyToken, upload.single('receipt'), async (req, res) => {
  try {
    const { courseId, courseType, fullName } = req.body;

    // Validation
    if (!courseId || !courseType || !fullName) {
      return res.status(400).json({ 
        success: false,
        message: 'Course ID, type, and full name are required' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'Payment receipt is required' 
      });
    }

    // Check existing enrollment
    const existingEnroll = await Enroll.findOne({ 
      userId: req.userId, 
      courseId 
    });
    
    if (existingEnroll) {
      return res.status(400).json({ 
        success: false,
        message: 'You are already enrolled in this course' 
      });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: 'Course not found' 
      });
    }

    // Create new enrollment
    const enrollment = new Enroll({
      userId: req.userId,
      userName: fullName,
      courseId,
      courseName: course.courseName,
      receipt: req.file.path,
      courseType,
      paymentStatus: 'Pending',
      paymentDate: new Date()
    });

    await enrollment.save();

    // Response data
    const response = {
      success: true,
      message: 'Enrollment successful',
      data: {
        enrollmentId: enrollment._id,
        courseName: enrollment.courseName,
        courseType: enrollment.courseType,
        paymentStatus: enrollment.paymentStatus,
        receiptUrl: `/api/enroll/receipt/${path.basename(enrollment.receipt)}`,
        enrolledAt: enrollment.enrolledAt
      }
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Enrollment failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user's enrollments
router.get('/user/enrollments', verifyToken, async (req, res) => {
  try {
    const enrollments = await Enroll.find({ userId: req.userId })
      .populate('courseId', 'courseName courseImage courseSchedule courseTime')
      .sort({ enrolledAt: -1 });

    res.json({ 
      success: true,
      data: enrollments.map(e => ({
        enrollmentId: e._id,
        courseId: e.courseId._id,
        courseName: e.courseId.courseName,
        courseImage: e.courseId.courseImage,
        schedule: e.courseId.courseSchedule,
        time: e.courseId.courseTime,
        courseType: e.courseType,
        paymentStatus: e.paymentStatus,
        enrolledAt: e.enrolledAt
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch enrollments' 
    });
  }
});

// Get receipt file
router.get('/receipt/:filename', (req, res) => {
  try {
    const filePath = path.join(__dirname, '../uploads/receipts', req.params.filename);
    res.sendFile(filePath);
  } catch (error) {
    res.status(404).json({ 
      success: false,
      message: 'Receipt not found' 
    });
  }
});

module.exports = router;