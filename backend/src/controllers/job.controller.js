// src/controllers/job.controller.js
const Job = require('../models/Job.model');
const User = require('../models/User.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { getRecommendedJobs: matchJobs } = require('../services/matching.service');

const getAllJobs = async (req, res, next) => {
  try {
    const { keyword, location, jobType, level, page = 1, limit = 10, status = 'active', employer } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (employer) filter.employer = employer;
    
    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(keyword, 'i')] } },
      ];
    }
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (jobType) filter.jobType = jobType;
    if (level) filter.level = level;
    
    const skip = (Number(page) - 1) * Number(limit);
    const [jobs, total] = await Promise.all([
      Job.find(filter).populate('company', 'name logo location').populate('employer', 'name').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Job.countDocuments(filter),
    ]);
    ApiResponse.paginated(res, { jobs }, { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) { next(error); }
};

const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('company', 'name logo location description website industry size').populate('employer', 'name avatar');
    if (!job) return next(ApiError.notFound('Không tìm thấy tin tuyển dụng'));
    Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();
    ApiResponse.success(res, { job });
  } catch (error) { next(error); }
};

const createJob = async (req, res, next) => {
  try {
    if (!req.user.companyId) return next(ApiError.badRequest('Bạn chưa tạo hồ sơ công ty. Vui lòng tạo Company trước.'));
    const job = await Job.create({ ...req.body, employer: req.user._id, company: req.user.companyId });
    ApiResponse.created(res, { job }, 'Đăng tin tuyển dụng thành công');
  } catch (error) { next(error); }
};

const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return next(ApiError.notFound('Không tìm thấy tin tuyển dụng'));
    if (job.employer.toString() !== req.user._id.toString()) return next(ApiError.forbidden('Bạn không có quyền chỉnh sửa tin này'));
    
    const ALLOWED = ['title', 'description', 'requiredSkills', 'location', 'salary', 'jobType', 'level', 'status', 'deadline'];
    ALLOWED.forEach((field) => { if (req.body[field] !== undefined) job[field] = req.body[field]; });
    await job.save();
    ApiResponse.success(res, { job }, 'Cập nhật tin tuyển dụng thành công');
  } catch (error) { next(error); }
};

const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return next(ApiError.notFound('Không tìm thấy tin tuyển dụng'));
    if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(ApiError.forbidden('Bạn không có quyền xóa tin này'));
    }
    await job.deleteOne();
    ApiResponse.success(res, null, 'Xóa tin tuyển dụng thành công');
  } catch (error) { next(error); }
};

const getRecommendedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const candidateSkills = user.candidateProfile?.skills || [];
    const activeJobs = await Job.find({ status: 'active' })
      .populate('company', 'name logo location')
      .populate('employer', 'name')
      .lean();
    
    const threshold = Number(req.query.threshold) || 30;
    const limit = Number(req.query.limit) || 20;

    // ★ Trả về mảng {job, score, matched, missing} đã sort giảm dần
    const recommendations = matchJobs(candidateSkills, activeJobs, threshold)
      .slice(0, limit);

    ApiResponse.success(res, { recommendations }, 'Lấy danh sách gợi ý thành công');
  } catch (error) { next(error); }
};

module.exports = { getAllJobs, getJobById, createJob, updateJob, deleteJob, getRecommendedJobs };