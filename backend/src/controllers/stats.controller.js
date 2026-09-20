const User = require('../models/User.model');
const Job = require('../models/Job.model');
const Company = require('../models/Company.model');
const ApiResponse = require('../utils/ApiResponse');

const getPublicStats = async (req, res, next) => {
  try {
    const [totalCandidates, totalVerifiedCompanies, totalActiveJobs] = await Promise.all([
      User.countDocuments({ role: 'candidate' }),
      Company.countDocuments({ isVerified: true }),
      Job.countDocuments({ status: 'active' }),
    ]);

    ApiResponse.success(res, {
      totalCandidates,
      totalVerifiedCompanies,
      totalActiveJobs
    }, 'Lấy public stats thành công');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/stats/categories — Đếm số job active theo industry của công ty.
 * Dùng aggregation pipeline: join Job → Company để lấy industry thật.
 * Public, không cần auth.
 */
const getCategoryStats = async (req, res, next) => {
  try {
    const result = await Job.aggregate([
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'companies',
          localField: 'company',
          foreignField: '_id',
          as: 'companyData',
        },
      },
      { $unwind: { path: '$companyData', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$companyData.industry',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Chuyển thành { industryName: count } object
    const categoryCounts = {};
    result.forEach(({ _id, count }) => {
      if (_id) categoryCounts[_id] = count;
    });

    ApiResponse.success(res, { categoryCounts }, 'Lấy category stats thành công');
  } catch (error) {
    next(error);
  }
};

module.exports = { getPublicStats, getCategoryStats };
