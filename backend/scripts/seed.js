require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User.model');
const Company = require('../src/models/Company.model');
const Job = require('../src/models/Job.model');

// ★ Script tạo dữ liệu mẫu (seed) cho demo đồ án — KHÔNG chạy trong production
const seed = async () => {
  try {
    console.log('🔌 Đang kết nối MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Kết nối thành công! Bắt đầu tạo dữ liệu mẫu...\n');

    // --- 1. TẠO TÀI KHOẢN ADMIN ---
    const existingAdmin = await User.findOne({ role: 'admin' });
    let admin;
    if (!existingAdmin) {
      admin = await User.create({
        name: 'Admin Hệ thống',
        email: 'admin@itjobportal.com',
        password: 'Admin@123456',
        role: 'admin',
      });
      console.log(`👤 Admin: ${admin.email} / Admin@123456`);
    } else {
      admin = existingAdmin;
      console.log(`👤 Admin đã tồn tại: ${admin.email}`);
    }

    // --- 2. TẠO TÀI KHOẢN EMPLOYER ---
    let employer = await User.findOne({ email: 'employer@techcorp.com' });
    if (!employer) {
      employer = await User.create({
        name: 'Nguyễn Tuyển Dụng',
        email: 'employer@techcorp.com',
        password: 'Employer@123',
        role: 'employer',
      });
      console.log(`🏢 Employer: ${employer.email} / Employer@123`);
    }

    // --- 3. TẠO CÔNG TY ---
    let company = await Company.findOne({ ownerId: employer._id });
    if (!company) {
      company = await Company.create({
        name: 'TechCorp Vietnam',
        industry: 'Software Development',
        location: 'Quận 1, TP.HCM',
        description: 'Công ty phát triển phần mềm hàng đầu Việt Nam, chuyên về Web/Mobile và AI.',
        website: 'https://techcorp.vn',
        size: '51-200',
        ownerId: employer._id,
      });
      await User.findByIdAndUpdate(employer._id, { companyId: company._id });
      console.log(`🏢 Công ty: ${company.name}`);
    } else {
      // Đảm bảo employer có companyId
      await User.findByIdAndUpdate(employer._id, { companyId: company._id });
    }

    // Reload employer với companyId
    employer = await User.findById(employer._id);

    // --- 4. TẠO CÁC TÀI KHOẢN ỨNG VIÊN ---
    const candidatesData = [
      {
        name: 'Trần Văn Frontend',
        email: 'candidate1@gmail.com',
        password: 'Candidate@123',
        candidateProfile: {
          skills: ['React', 'TypeScript', 'Next.js', 'TailwindCSS', 'Redux'],
          yearsOfExperience: 3,
          location: 'TP.HCM',
          bio: 'Frontend Developer 3 năm kinh nghiệm, đam mê UI/UX.',
          educationLevel: 'bachelor',
        },
      },
      {
        name: 'Lê Thị Backend',
        email: 'candidate2@gmail.com',
        password: 'Candidate@123',
        candidateProfile: {
          skills: ['Node.js', 'Express', 'MongoDB', 'Docker', 'AWS'],
          yearsOfExperience: 2,
          location: 'Hà Nội',
          bio: 'Backend Developer với kinh nghiệm triển khai microservices.',
          educationLevel: 'bachelor',
        },
      },
      {
        name: 'Phạm Văn Fresher',
        email: 'candidate3@gmail.com',
        password: 'Candidate@123',
        candidateProfile: {
          skills: ['JavaScript', 'HTML', 'CSS', 'React'],
          yearsOfExperience: 0,
          location: 'TP.HCM',
          educationLevel: 'bachelor',
        },
      },
    ];

    for (const cData of candidatesData) {
      const exists = await User.findOne({ email: cData.email });
      if (!exists) {
        await User.create({ ...cData, role: 'candidate' });
        console.log(`👤 Candidate: ${cData.email} / Candidate@123`);
      }
    }

    // --- 5. TẠO TIN TUYỂN DỤNG ---
    const existingJobs = await Job.countDocuments({ company: company._id });
    if (existingJobs === 0) {
      const jobsData = [
        {
          title: 'Senior React Developer',
          description: 'Chúng tôi đang tìm kiếm Senior React Developer có kinh nghiệm 3+ năm...\n\n**Yêu cầu:**\n- React/Next.js\n- TypeScript\n- Redux hoặc Zustand\n\n**Quyền lợi:**\n- Lương cạnh tranh $1500-$2500\n- Thưởng theo dự án\n- Làm việc từ xa 3 ngày/tuần',
          requiredSkills: ['React', 'TypeScript', 'Next.js', 'Redux'],
          location: 'Quận 1, TP.HCM',
          salary: { min: 1500, max: 2500 },
          jobType: 'full-time',
          level: 'senior',
          employer: employer._id,
          company: company._id,
          status: 'active',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
        },
        {
          title: 'Node.js Backend Developer',
          description: 'Tìm kiếm Backend Developer có kinh nghiệm làm việc với Node.js và MongoDB...\n\n**Yêu cầu:**\n- Node.js & Express\n- MongoDB\n- Docker\n\n**Quyền lợi:**\n- Lương $1000-$1800\n- Bảo hiểm đầy đủ',
          requiredSkills: ['Node.js', 'Express', 'MongoDB', 'Docker'],
          location: 'Remote',
          salary: { min: 1000, max: 1800 },
          jobType: 'remote',
          level: 'middle',
          employer: employer._id,
          company: company._id,
          status: 'active',
          deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Frontend Intern (React)',
          description: 'Thực tập sinh Frontend, phù hợp cho sinh viên năm cuối hoặc mới ra trường...',
          requiredSkills: ['JavaScript', 'React', 'HTML', 'CSS'],
          location: 'Quận 7, TP.HCM',
          salary: { min: 200, max: 400 },
          jobType: 'internship',
          level: 'intern',
          employer: employer._id,
          company: company._id,
          status: 'active',
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Full-stack Developer (Next.js + Node.js)',
          description: 'Full-stack Developer có thể làm cả Frontend và Backend...',
          requiredSkills: ['Next.js', 'Node.js', 'TypeScript', 'MongoDB', 'TailwindCSS'],
          location: 'Quận 1, TP.HCM',
          salary: { min: 1200, max: 2000 },
          jobType: 'full-time',
          level: 'junior',
          employer: employer._id,
          company: company._id,
          status: 'active',
        },
      ];

      for (const jobData of jobsData) {
        const job = await Job.create(jobData);
        console.log(`💼 Job: ${job.title}`);
      }
    } else {
      console.log(`💼 Đã có ${existingJobs} tin tuyển dụng, bỏ qua tạo jobs.`);
    }

    console.log('\n✅ Seeding hoàn tất!');
    console.log('='.repeat(50));
    console.log('📋 Tài khoản demo:');
    console.log('  Admin:    admin@itjobportal.com / Admin@123456');
    console.log('  Employer: employer@techcorp.com / Employer@123');
    console.log('  Candidate: candidate1@gmail.com / Candidate@123 (có kỹ năng React/TS)');
    console.log('  Candidate: candidate2@gmail.com / Candidate@123 (có kỹ năng Node/Docker)');
    console.log('  Candidate: candidate3@gmail.com / Candidate@123 (Fresher)');
    console.log('='.repeat(50));
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi seed:', error.message);
    process.exit(1);
  }
};

seed();
