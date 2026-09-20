// src/models/Company.model.js
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  logo:        String,
  description: String,
  website:     String,
  location:    String,
  size: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500+'] }, // legacy
  employeeCount: { type: Number },
  foundedYear: { type: Number },
  techStack: { type: [String], default: [] },
  benefits: { type: [String], default: [] },
  coverImage: String,
  socialLinks: {
    linkedin: String,
    facebook: String,
    github: String
  },
  industry:    String,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isVerified:  { type: Boolean, default: false },  // ★ F.2: Admin phải duyệt công ty trước khi employer đăng tin
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);