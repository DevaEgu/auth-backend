const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseId: { type: String, required: true },
  courseName: { type: String, required: true },
  courseType: { type: String, required: true },
  coursePrice: { type: String, required: true },
  priceType: { type: String, required: true },
  courseSchedule: { type: [String], required: true },
  courseTime: { type: String, required: true },
  courseDescription: { type: String, required: true },
  courseTopic: { type: String, required: true },
  courseImage: { type: String,default: '' },
  ustazAssigned: { type: String,default: 'Not Assigned' },
  courseLInk: { type: String,default: '' },
  courseStatus: { type: String, default: 'Not Started' },
});

module.exports = mongoose.model('Course', courseSchema);