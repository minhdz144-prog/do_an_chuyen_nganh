// src/models/User.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const candidateProfileSchema = new mongoose.Schema({
  skills: { type: [String], default: [] },
  yearsOfExperience: { type: Number, default: 0 },
  educationLevel: { type: String, enum: ['high_school', 'college', 'bachelor', 'master', 'phd'] },
  resumeUrl: String,
  bio: String,
  location: String,
}, { _id: false });

const userSchema = new mongoose.Schema({
  name:  { type: String, required: [true, 'Tên không được để trống'], trim: true },
  email: {
    type: String, required: [true, 'Email không được để trống'],
    unique: true, lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
  },
  password: {
    type: String, required: [true, 'Mật khẩu không được để trống'],
    minlength: [6, 'Mật khẩu tối thiểu 6 ký tự'],
    select: false, 
  },
  role: { type: String, enum: ['admin', 'employer', 'candidate'], default: 'candidate' },
  avatar:   String,
  phone:    String,
  isActive: { type: Boolean, default: true },
  candidateProfile: candidateProfileSchema,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);