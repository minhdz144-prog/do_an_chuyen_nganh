// src/controllers/application.controller.js
const Application = require('../models/Application.model');
const Job = require('../models/Job.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { coverLetter, resumeUrl } = req.body;
    const job = await Job.findById(jobId);
    
    if (!job || job.status !== 'active') return next(ApiError.notFound('Tin tuyển dụng không tồn tại hoặc đã đóng'));
    if (job.deadline && job.deadline < new Date()) return next(ApiError.badRequest('Đã hết hạn nộp hồ sơ cho vị trí này'));
    
    const application = await Application.create({
      job: jobId,
      candidate: req.user._id,
      coverLetter,
      resumeUrl: resumeUrl || req.user.candidateProfile?.resumeUrl,
      statusHistory: [{ status: Application.STATES.APPLIED, changedBy: req.user._id, note: 'Ứng viên nộp hồ sơ' }],
    });
    ApiResponse.created(res, { application }, 'Nộp hồ sơ thành công!');
  } catch (error) {
    if (error.code === 11000) return next(ApiError.conflict('Bạn đã nộp hồ sơ cho vị trí này rồi'));
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note, interviewDate } = req.body;
    const application = await Application.findById(req.params.id).populate('job', 'employer title');
    
    if (!application) return next(ApiError.notFound('Không tìm thấy hồ sơ ứng tuyển'));
    if (application.job.employer.toString() !== req.user._id.toString()) return next(ApiError.forbidden('Không có quyền cập nhật hồ sơ này'));
    if (!application.canTransitionTo(status)) {
      const validTransitions = Application.TRANSITIONS[application.status];
      return next(ApiError.badRequest(`Không thể chuyển trạng thái sang '${status}'. Hợp lệ: [${validTransitions.join(', ')}]`));
    }
    
    application.status = status;
    application.statusHistory.push({ status, note: note || '', changedBy: req.user._id });
    if (status === Application.STATES.INTERVIEW && interviewDate) application.interviewDate = new Date(interviewDate);
    
    await application.save();
    ApiResponse.success(res, { application }, `Cập nhật trạng thái thành công → '${status}'`);
  } catch (error) { next(error); }
};

const getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return next(ApiError.notFound('Không tìm thấy tin tuyển dụng'));
    if (job.employer.toString() !== req.user._id.toString()) return next(ApiError.forbidden('Không có quyền xem hồ sơ của tin này'));
    
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { job: req.params.jobId };
    if (status) filter.status = status;
    
    const [applications, total] = await Promise.all([
      Application.find(filter).populate('candidate', 'name email avatar phone candidateProfile').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
      Application.countDocuments(filter),
    ]);
    ApiResponse.paginated(res, { applications }, { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) { next(error); }
};

const getMyApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { candidate: req.user._id };
    if (status) filter.status = status;
    const [applications, total] = await Promise.all([
      Application.find(filter).populate({ path: 'job', select: 'title location salary jobType', populate: { path: 'company', select: 'name logo' } }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
      Application.countDocuments(filter),
    ]);
    ApiResponse.paginated(res, { applications }, { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) { next(error); }
};

module.exports = { applyToJob, updateApplicationStatus, getJobApplications, getMyApplications };