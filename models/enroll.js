const mongoose = require('mongoose');

const EnrollSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {  // New field
    type: String,
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  courseName: {  // New field
    type: String,
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
  receipt: {
    type: String,
    required: true,
  },
  courseType: {
    type: String,
    enum: ['Individual', 'Group'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending',
  },
  paymentDate: {
    type: Date,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Enroll', EnrollSchema);