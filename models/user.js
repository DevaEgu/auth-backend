  const mongoose = require('mongoose');
  const bcrypt = require('bcryptjs');

  const userSchema = new mongoose.Schema({
    userId: { type: Number, unique: true },  
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, default: '' },
    experience: { type: String,default: '' },
    specialization: { type: String,default: '' },
    language: { type: String,default: '' },
    certificate: { type: String,default: '' },
    legalId: { type: String,default: '' },
    isUstaz: { type: Boolean, default: false },
    profilePicture: { type: String, default: '' },
  });

  // Password comparison method
  userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
  };

  module.exports = mongoose.model('User', userSchema);
