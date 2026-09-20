// src/routes/ai.routes.js
// ★ Plug & Play AI Routes — Không đụng chạm Schema/Logic cũ
const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const { generateInterviewQuestions, generateCoverLetter, generateJobDescription, assessCandidate, suggestCareerPath } = require('../services/ai.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const router = express.Router();

// Tất cả AI routes đều yêu cầu đăng nhập
router.use(protect);

/**
 * POST /api/ai/interview-questions
 * Employer sinh câu hỏi phỏng vấn AI cho ứng viên
 */
router.post('/interview-questions', restrictTo('employer'), async (req, res, next) => {
  try {
    const { candidateSkills, jobRequiredSkills, jobTitle } = req.body;

    if (!candidateSkills || !jobRequiredSkills || !jobTitle) {
      return next(ApiError.badRequest('Thiếu thông tin: candidateSkills, jobRequiredSkills, jobTitle'));
    }

    const questions = await generateInterviewQuestions({
      candidateSkills,
      jobRequiredSkills,
      jobTitle,
    });

    ApiResponse.success(res, { questions }, 'Sinh câu hỏi phỏng vấn AI thành công');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/cover-letter
 * Candidate sinh Cover Letter AI
 */
router.post('/cover-letter', restrictTo('candidate'), async (req, res, next) => {
  try {
    const { candidateName, candidateSkills, jobTitle, jobDescription, companyName } = req.body;

    if (!jobTitle) {
      return next(ApiError.badRequest('Thiếu thông tin: jobTitle'));
    }

    const coverLetter = await generateCoverLetter({
      candidateName: candidateName || req.user.name,
      candidateSkills: candidateSkills || req.user.candidateProfile?.skills || [],
      jobTitle,
      jobDescription,
      companyName,
    });

    ApiResponse.success(res, { coverLetter }, 'Sinh Cover Letter AI thành công');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/job-description
 * Employer sinh mô tả công việc (Job Description)
 */
router.post('/job-description', restrictTo('employer'), async (req, res, next) => {
  try {
    const { title, skills } = req.body;
    if (!title || !skills || !Array.isArray(skills)) {
      return next(ApiError.badRequest('Thiếu thông tin: title, skills (mảng)'));
    }
    const description = await generateJobDescription({ title, skills });
    ApiResponse.success(res, { description }, 'Sinh mô tả công việc thành công');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/assess-candidate
 * Employer đánh giá ứng viên
 */
router.post('/assess-candidate', restrictTo('employer'), async (req, res, next) => {
  try {
    const { candidateSkills, candidateExperience, jobRequiredSkills, jobTitle } = req.body;
    if (!candidateSkills || candidateExperience === undefined || !jobRequiredSkills || !jobTitle) {
      return next(ApiError.badRequest('Thiếu thông tin để đánh giá ứng viên'));
    }
    const assessment = await assessCandidate({ candidateSkills, candidateExperience, jobRequiredSkills, jobTitle });
    ApiResponse.success(res, { assessment }, 'Đánh giá ứng viên thành công');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/career-path
 * Candidate gợi ý lộ trình nghề nghiệp
 */
router.post('/career-path', restrictTo('candidate'), async (req, res, next) => {
  try {
    const { candidateSkills } = req.body;
    const skillsToUse = candidateSkills || req.user.candidateProfile?.skills || [];
    const path = await suggestCareerPath({ candidateSkills: skillsToUse });
    ApiResponse.success(res, { path }, 'Gợi ý lộ trình thành công');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
