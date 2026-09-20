// src/models/Job.model.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  requiredSkills: { type: [String], default: [] },
  location:    String,
  salary: { min: { type: Number, default: 0 }, max: { type: Number, default: 0 } },
  jobType: { type: String, enum: ['full-time', 'part-time', 'remote', 'internship', 'contract'], required: true },
  level: { type: String, enum: ['intern', 'fresher', 'junior', 'middle', 'senior', 'lead'] },
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  status: { type: String, enum: ['active', 'draft', 'closed'], default: 'active' },
  deadline: Date,
  views: { type: Number, default: 0 },
}, { timestamps: true });

jobSchema.index({ requiredSkills: 1 });
jobSchema.index({ status: 1, deadline: 1 });
jobSchema.index({ company: 1, employer: 1 });

// Full-text search index
jobSchema.index(
  { title: 'text', description: 'text', requiredSkills: 'text' },
  { weights: { title: 10, requiredSkills: 5, description: 1 }, name: 'job_fulltext' }
);

jobSchema.virtual('isExpired').get(function () {
  if (!this.deadline) return false;
  return this.deadline < new Date();
});

module.exports = mongoose.model('Job', jobSchema);