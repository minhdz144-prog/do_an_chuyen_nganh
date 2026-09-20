// src/controllers/job.controller.js
const Job = require('../models/Job.model');
const User = require('../models/User.model');
const Company = require('../models/Company.model');  // ★ F.2: Company verification
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { getRecommendedJobs: matchJobs } = require('../services/matching.service');
const NodeCache = require('node-cache');

const matchCache = new NodeCache({ stdTTL: 60 }); // cache 60 giây

const getAllJobs = async (req, res, next) => {
  try {
    const { keyword, location, jobType, level, page = 1, limit = 10, status = 'active', employer, company, salaryMin, salaryMax } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (employer) filter.employer = employer;
    if (company) filter.company = company;
    if (salaryMin) filter['salary.max'] = { $gte: Number(salaryMin) };
    if (salaryMax) filter['salary.min'] = { $lte: Number(salaryMax) };
    
    let sortOption = { createdAt: -1 };
    if (keyword) {
      filter.$text = { $search: keyword };
      sortOption = { score: { $meta: 'textScore' } };
    }
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (jobType) filter.jobType = jobType;
    if (level) filter.level = level;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    let query = Job.find(filter);
    if (keyword) {
        query = query.select({ score: { $meta: 'textScore' } });
    }
    
    const [jobs, total] = await Promise.all([
      query.populate('company', 'name logo location').populate('employer', 'name').sort(sortOption).skip(skip).limit(Number(limit)),
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
    
    // Fetch related jobs using matching algorithm (job-to-job matching)
    const otherActiveJobs = await Job.find({ _id: { $ne: job._id }, status: 'active' }).populate('company', 'name logo location').limit(50);
    const jobSkills = job.requiredSkills || [];
    
    // Try matching with threshold 40% first, then fallback to 20%
    let relatedJobs = matchJobs(jobSkills, otherActiveJobs, 40).slice(0, 4);
    
    if (relatedJobs.length < 2 && jobSkills.length > 0) {
      relatedJobs = matchJobs(jobSkills, otherActiveJobs, 20).slice(0, 4);
    }
    
    // If still no matches, show jobs from the same company or latest jobs
    if (relatedJobs.length === 0) {
      const fallbackJobs = otherActiveJobs
        .filter(j => j.company?._id?.toString() === job.company?._id?.toString() || j.location === job.location)
        .slice(0, 4);
      
      if (fallbackJobs.length > 0) {
        relatedJobs = fallbackJobs.map(j => ({ job: j, score: 0 }));
      } else {
        relatedJobs = otherActiveJobs.slice(0, 4).map(j => ({ job: j, score: 0 }));
      }
    }
    
    ApiResponse.success(res, { job, relatedJobs: relatedJobs.map(r => r.job) });
  } catch (error) { next(error); }
};

const createJob = async (req, res, next) => {
  try {
    if (!req.user.companyId) return next(ApiError.badRequest('Bạn chưa tạo hồ sơ công ty. Vui lòng tạo Company trước.'));
    
    // ★ F.2: Kiểm tra công ty đã được Admin duyệt chưa
    const company = await Company.findById(req.user.companyId);
    if (!company || !company.isVerified) {
      return next(ApiError.forbidden('Công ty của bạn chưa được xác minh. Vui lòng đợi Admin duyệt trước khi đăng tin tuyển dụng.'));
    }
    
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

    const cacheKey = `recommended_${req.user._id}_${threshold}_${limit}`;
    const cached = matchCache.get(cacheKey);
    if (cached) return ApiResponse.success(res, cached);

    // ★ Trả về mảng {job, score, matched, missing} đã sort giảm dần
    const recommendations = matchJobs(candidateSkills, activeJobs, threshold)
      .slice(0, limit);

    const result = { recommendations };
    matchCache.set(cacheKey, result);

    ApiResponse.success(res, result, 'Lấy danh sách gợi ý thành công');
  } catch (error) { next(error); }
};

const getMatchPreview = async (req, res, next) => {
  try {
    const skillsString = req.query.skills || '';
    const candidateSkills = skillsString.split(',').map(s => s.trim()).filter(s => s);
    
    if (candidateSkills.length === 0) {
      return ApiResponse.success(res, { count: 0, sampleTitles: [] });
    }

    const threshold = Number(req.query.threshold) || 10;
    const cacheKey = `match_${skillsString}_${threshold}`;
    
    const cached = matchCache.get(cacheKey);
    if (cached) return ApiResponse.success(res, cached);

    const activeJobs = await Job.find({ status: 'active' }).select('title requiredSkills').lean();
    
    const recommendations = matchJobs(candidateSkills, activeJobs, threshold);

    const count = recommendations.length;
    const sampleTitles = recommendations.slice(0, 3).map(r => r.job.title);
    
    const result = { count, sampleTitles };
    matchCache.set(cacheKey, result);

    ApiResponse.success(res, result);
  } catch (error) { next(error); }
};
const aiSearchJobs = async (req, res, next) => {
  try {
    const skillsString = req.query.skills || '';
    const candidateSkills = skillsString.split(',').map(s => s.trim()).filter(s => s);
    const location = req.query.location || '';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const threshold = Number(req.query.threshold) || 10;
    
    if (candidateSkills.length === 0) {
      return ApiResponse.paginated(res, { jobs: [] }, { total: 0, page, limit, totalPages: 0 });
    }

    let filter = { status: 'active' };
    if (location && location !== 'all') filter.location = { $regex: location, $options: 'i' };

    const activeJobs = await Job.find(filter)
      .populate('company', 'name logo location')
      .populate('employer', 'name')
      .lean();
    
    const recommendations = matchJobs(candidateSkills, activeJobs, threshold);
    
    const total = recommendations.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedResults = recommendations.slice((page - 1) * limit, page * limit);
    
    // Attach matching score to each job object
    const jobs = paginatedResults.map(r => ({
      ...r.job,
      matchScore: r.score,
      matchedSkills: r.matched,
      missingSkills: r.missing,
    }));

    ApiResponse.paginated(res, { jobs }, { total, page, limit, totalPages });
  } catch (error) { next(error); }
};

module.exports = { getAllJobs, getJobById, createJob, updateJob, deleteJob, getRecommendedJobs, getMatchPreview, aiSearchJobs };