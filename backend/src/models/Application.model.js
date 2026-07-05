// src/models/Application.model.js
// ★ Quyết định kiến trúc: Dùng 'offered' thay vì 'accepted' để phù hợp với thực tế HR
// (Employer đưa ra lời đề nghị làm việc, ứng viên mới chính thức accept sau)
const mongoose = require('mongoose');

const APPLICATION_STATES = Object.freeze({
  APPLIED:   'applied',
  REVIEWING: 'reviewing',
  INTERVIEW: 'interview',
  OFFERED:   'offered',     // ★ Thay 'accepted' bằng 'offered' cho đúng nghĩa nghiệp vụ
  REJECTED:  'rejected',
});

const VALID_TRANSITIONS = Object.freeze({
  applied:   ['reviewing', 'rejected'],
  reviewing: ['interview', 'rejected'],
  interview: ['offered', 'rejected'],
  offered:   [],
  rejected:  [],
});

const statusHistorySchema = new mongoose.Schema({
  status:    { type: String, enum: Object.values(APPLICATION_STATES) },
  note:      String,
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changedAt: { type: Date, default: Date.now },
}, { _id: false });

const applicationSchema = new mongoose.Schema({
  job:         { type: mongoose.Schema.Types.ObjectId, ref: 'Job',  required: true },
  candidate:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter: String,
  resumeUrl:   String,  // ★ Không bắt buộc — ứng viên có thể chưa có CV URL
  status: { type: String, enum: Object.values(APPLICATION_STATES), default: APPLICATION_STATES.APPLIED },
  statusHistory: [statusHistorySchema],
  interviewDate: Date,
  interviewNote: String,
}, { timestamps: true });

// ★ Index unique: 1 candidate chỉ nộp được 1 lần cho mỗi job (chặn duplicate ở DB level)
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

applicationSchema.methods.canTransitionTo = function (newStatus) {
  const allowedNext = VALID_TRANSITIONS[this.status] ?? [];
  return allowedNext.includes(newStatus);
};

applicationSchema.statics.STATES = APPLICATION_STATES;
applicationSchema.statics.TRANSITIONS = VALID_TRANSITIONS;

module.exports = mongoose.model('Application', applicationSchema);