// src/controllers/company.controller.js
const Company = require('../models/Company.model');
const User = require('../models/User.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const createCompany = async (req, res, next) => {
  try {
    if (req.user.companyId) {
      return next(ApiError.badRequest('Bạn đã tạo công ty rồi, không thể tạo thêm'));
    }

    const { name, logo, description, website, location, size, industry } = req.body;
    
    // Tạo company
    const company = await Company.create({
      name,
      logo,
      description,
      website,
      location,
      size,
      industry,
      ownerId: req.user._id
    });

    // Cập nhật companyId cho User
    await User.findByIdAndUpdate(req.user._id, { companyId: company._id });

    ApiResponse.created(res, { company }, 'Tạo hồ sơ công ty thành công');
  } catch (error) {
    next(error);
  }
};

const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).populate('ownerId', 'name email');
    if (!company) return next(ApiError.notFound('Không tìm thấy thông tin công ty'));

    ApiResponse.success(res, { company });
  } catch (error) {
    next(error);
  }
};

const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return next(ApiError.notFound('Không tìm thấy thông tin công ty'));

    // Kiểm tra quyền (chỉ chủ công ty hoặc admin mới được sửa)
    if (company.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(ApiError.forbidden('Bạn không có quyền chỉnh sửa công ty này'));
    }

    const ALLOWED_FIELDS = ['name', 'logo', 'description', 'website', 'location', 'size', 'industry'];
    ALLOWED_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        company[field] = req.body[field];
      }
    });

    await company.save();
    ApiResponse.success(res, { company }, 'Cập nhật thông tin công ty thành công');
  } catch (error) {
    next(error);
  }
};

module.exports = { createCompany, getCompanyById, updateCompany };
