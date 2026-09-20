/**
 * scripts/seed_final.js — Unified Seed Data cho Đồ án (Hoàn thiện nhất)
 * - Tên công ty thực tế (FPT, Shopee, Techcombank...) khớp với logo.
 * - Hơn 35 Jobs bao phủ 8 category chính (IT, Business, Marketing, Finance, Design, HR, Construction, Education).
 * - Có sẵn tài khoản test dễ nhớ (admin@a.com, employer@a.com, candidate@a.com).
 * - Hạn chót (deadline) luôn là tương lai.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User.model');
const Company = require('../src/models/Company.model');
const Job = require('../src/models/Job.model');
const Application = require('../src/models/Application.model');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// ─── Utils ────────────────────────────────────────────────────────────────────
const future = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return d; };

// ─── Data định nghĩa ──────────────────────────────────────────────────────────
const ADMINS = [
  { name: 'Admin', email: 'admin@a.com', password: '123456', role: 'admin' },
];

const EMPLOYERS = [
  { name: 'Nhà Tuyển Dụng Demo', email: 'employer@a.com',  password: '123456', role: 'employer' }, // Tài khoản mặc định
  { name: 'HR FPT',              email: 'hr@fpt.com.vn',       password: '123456', role: 'employer' },
  { name: 'HR Shopee',           email: 'hr@shopee.vn',        password: '123456', role: 'employer' },
  { name: 'HR VNG',              email: 'hr@vng.com.vn',       password: '123456', role: 'employer' },
  { name: 'HR Momo',             email: 'hr@momo.vn',          password: '123456', role: 'employer' },
  { name: 'HR Techcombank',      email: 'hr@techcombank.com.vn', password: '123456', role: 'employer' },
  { name: 'HR Vinamilk',         email: 'hr@vinamilk.com.vn',  password: '123456', role: 'employer' },
  { name: 'HR Viettel',          email: 'hr@viettel.com.vn',   password: '123456', role: 'employer' },
  { name: 'HR Masan',            email: 'hr@masangroup.com',   password: '123456', role: 'employer' },
];

const COMPANIES = [
  { name: 'FPT Corporation',      industry: 'IT Phần mềm',       location: 'Hà Nội', size: '500+', employeeCount: 30000, foundedYear: 1988, techStack: ['Java', 'C#', '.NET', 'React'], benefits: ['FPT Care', 'Xe đưa đón', 'Khám sức khỏe'], isVerified: true, logo: '/images/logos/fpt.png' },
  { name: 'Shopee Vietnam',       industry: 'Kinh doanh / Bán lẻ', location: 'TP.HCM', size: '500+', employeeCount: 5000,  foundedYear: 2015, techStack: ['Go', 'React', 'Python', 'Kubernetes'], benefits: ['Stock Options', 'Làm việc linh hoạt', 'MacBook'], isVerified: true, logo: '/images/logos/shopee.png' },
  { name: 'VNG Corporation',      industry: 'IT Phần mềm',       location: 'TP.HCM', size: '500+', employeeCount: 3500,  foundedYear: 2004, techStack: ['C++', 'Python', 'Go', 'Redis'], benefits: ['Canteen miễn phí', 'Gym/Pool', 'Bảo hiểm cao cấp'], isVerified: true, logo: '/images/logos/vng.png' },
  { name: 'MoMo',                 industry: 'Tài chính / Ngân hàng', location: 'TP.HCM', size: '500+', employeeCount: 1500, foundedYear: 2007, techStack: ['Java', 'Microservices', 'Kafka', 'React Native'], benefits: ['Nghỉ phép 15 ngày', 'Bảo hiểm PVI', 'CLB Thể thao'], isVerified: true, logo: '/images/logos/momo.png' },
  { name: 'Techcombank',          industry: 'Tài chính / Ngân hàng', location: 'Hà Nội', size: '500+', employeeCount: 12000, foundedYear: 1993, techStack: ['Java', 'Oracle', 'Spring Boot', 'AWS'], benefits: ['Lãi suất ưu đãi', 'Thưởng tháng 13-14', 'Bảo hiểm sức khỏe'], isVerified: true, logo: '/images/logos/techcombank.png' },
  { name: 'Vinamilk',             industry: 'Sản xuất / Vận hành', location: 'TP.HCM', size: '500+', employeeCount: 10000, foundedYear: 1976, techStack: ['SAP ERP', 'SQL Server', 'Power BI'], benefits: ['Nhà ở nhân viên', 'Du lịch hàng năm', 'Cổ phiếu ưu đãi'], isVerified: true, logo: '/images/logos/vinamilk.png' },
  { name: 'Viettel Group',        industry: 'Viễn thông / IT',    location: 'Hà Nội', size: '500+', employeeCount: 50000, foundedYear: 1989, techStack: ['C/C++', 'Python', 'Java', 'Hadoop'], benefits: ['Môi trường quân đội', 'Đào tạo nước ngoài', 'Thưởng dự án'], isVerified: true, logo: '/images/logos/viettel.png' },
  { name: 'Masan Group',          industry: 'Sản xuất / Vận hành', location: 'TP.HCM', size: '500+', employeeCount: 35000, foundedYear: 1996, techStack: ['SAP', 'Data Warehouse', 'Python'], benefits: ['Cổ phiếu ESOP', 'Giảm giá nội bộ', 'Khám sức khỏe'], isVerified: true, logo: '/images/logos/masan.png' },
];

const CANDIDATES = [
  { name: 'Ứng Viên Demo',      email: 'candidate@a.com', password: '123456', role: 'candidate', candidateProfile: { skills: ['React', 'Node.js', 'TypeScript'], yearsOfExperience: 3, location: 'TP.HCM', bio: 'Full-stack Developer', educationLevel: 'bachelor' } },
  { name: 'Phạm Minh Anh',     email: 'minhanh@demo.vn', password: '123456', role: 'candidate', candidateProfile: { skills: ['Marketing', 'SEO', 'Content'], yearsOfExperience: 3, location: 'TP.HCM', bio: 'Chuyên gia Digital Marketing.', educationLevel: 'bachelor' } },
  { name: 'Trần Văn Tài',      email: 'vantai@demo.vn',  password: '123456', role: 'candidate', candidateProfile: { skills: ['Tài chính', 'Kế toán', 'ACCA'], yearsOfExperience: 5, location: 'Hà Nội', bio: 'Kế toán trưởng với 5 năm kinh nghiệm.', educationLevel: 'master' } },
];

function makeJobs(companies, employers) {
  const c = (name) => companies.find(x => x.name === name)._id;
  const e = (email) => employers.find(x => x.email === email)._id;
  const empDefault = e('employer@a.com'); // Sẽ gán cho FPT làm mặc định

  return [
    // --- 1. IT Phần mềm ---
    { title: 'Senior Java Backend', company: c('FPT Corporation'), employer: empDefault, requiredSkills: ['Java','Spring Boot','Microservices'], salary:{min:2000,max:3500}, level:'senior', jobType:'full-time', location:'Hà Nội', deadline: future(30), description: 'Phát triển backend hệ thống core cho khối ngân hàng.' },
    { title: '.NET Fullstack Developer', company: c('FPT Corporation'), employer: empDefault, requiredSkills: ['.NET','C#','ReactJS'], salary:{min:1200,max:2500}, level:'middle', jobType:'full-time', location:'TP.HCM', deadline: future(40), description: 'Xây dựng web app cho khách hàng Nhật Bản.' },
    { title: 'Senior Golang Developer', company: c('Shopee Vietnam'), employer: e('hr@shopee.vn'), requiredSkills: ['Golang','Redis','Kafka'], salary:{min:3000,max:5000}, level:'senior', jobType:'full-time', location:'TP.HCM', deadline: future(20), description: 'Tối ưu hệ thống e-commerce xử lý hàng triệu RPS dịp Flash Sale.' },
    { title: 'Frontend Engineer (React/Vue)', company: c('Shopee Vietnam'), employer: e('hr@shopee.vn'), requiredSkills: ['React','Vue','TypeScript'], salary:{min:1500,max:3000}, level:'middle', jobType:'full-time', location:'TP.HCM', deadline: future(45), description: 'Phát triển giao diện web mượt mà, tối ưu hiệu suất.' },
    { title: 'Data Scientist (Zalo AI)', company: c('VNG Corporation'), employer: e('hr@vng.com.vn'), requiredSkills: ['Python','Machine Learning','NLP'], salary:{min:2500,max:4500}, level:'senior', jobType:'full-time', location:'TP.HCM', deadline: future(60), description: 'Xây dựng mô hình ngôn ngữ lớn (LLM) tiếng Việt.' },
    { title: 'Game Developer (C++/Unity)', company: c('VNG Corporation'), employer: e('hr@vng.com.vn'), requiredSkills: ['C++','Unity','Game Engine'], salary:{min:1500,max:3500}, level:'middle', jobType:'full-time', location:'TP.HCM', deadline: future(25), description: 'Phát triển client và server cho tựa game MMORPG mới.' },
    { title: 'Android Developer', company: c('MoMo'), employer: e('hr@momo.vn'), requiredSkills: ['Kotlin','Android SDK','Coroutines'], salary:{min:1800,max:3000}, level:'middle', jobType:'full-time', location:'TP.HCM', deadline: future(50), description: 'Phát triển tính năng thanh toán cho Super App MoMo.' },
    { title: 'Cloud Infrastructure Architect', company: c('Techcombank'), employer: e('hr@techcombank.com.vn'), requiredSkills: ['AWS','Kubernetes','System Design'], salary:{min:3500,max:6000}, level:'lead', jobType:'full-time', location:'Hà Nội', deadline: future(90), description: 'Thiết kế kiến trúc Cloud-native cho Core Banking mới.' },
    { title: 'Kỹ sư Viễn thông (5G/6G)', company: c('Viettel Group'), employer: e('hr@viettel.com.vn'), requiredSkills: ['Viễn thông','LTE/5G','C/C++'], salary:{min:2000,max:4000}, level:'senior', jobType:'full-time', location:'Hà Nội', deadline: future(90), description: 'Nghiên cứu và phát triển thiết bị trạm thu phát sóng thế hệ mới.' },
    
    // --- 2. Kinh doanh / Bán hàng ---
    { title: 'Category Manager (Kinh doanh)', company: c('Shopee Vietnam'), employer: e('hr@shopee.vn'), requiredSkills: ['Sales','B2B','Phân tích dữ liệu'], salary:{min:1500,max:3000}, level:'middle', jobType:'full-time', location:'TP.HCM', deadline: future(30), description: 'Quản lý doanh thu và đối tác ngành hàng Điện tử.' },
    { title: 'Chuyên viên Tín dụng Doanh nghiệp', company: c('Techcombank'), employer: e('hr@techcombank.com.vn'), requiredSkills: ['Tài chính','Tín dụng','Sales B2B'], salary:{min:1000,max:2500}, level:'middle', jobType:'full-time', location:'Hà Nội', deadline: future(45), description: 'Phát triển khách hàng doanh nghiệp vừa và nhỏ.' },
    { title: 'Nhân viên Kinh doanh B2B', company: c('Viettel Group'), employer: e('hr@viettel.com.vn'), requiredSkills: ['Kinh doanh','B2B','Đàm phán'], salary:{min:800,max:1500}, level:'junior', jobType:'full-time', location:'Hà Nội', deadline: future(30), description: 'Bán các gói giải pháp doanh nghiệp (Cloud, Office).' },
    { title: 'Store Manager (Quản lý cửa hàng)', company: c('Masan Group'), employer: e('hr@masangroup.com'), requiredSkills: ['Quản lý vận hành','Bán lẻ','Nhân sự'], salary:{min:700,max:1200}, level:'middle', jobType:'full-time', location:'TP.HCM', deadline: future(30), description: 'Quản lý vận hành siêu thị mini WinMart+.' },
    { title: 'Business Development Executive', company: c('FPT Corporation'), employer: empDefault, requiredSkills: ['Sales B2B', 'Giao tiếp Tiếng Anh', 'Phát triển thị trường'], salary:{min:800,max:1500}, level:'junior', jobType:'full-time', location:'Hà Nội', deadline: future(20), description: 'Mở rộng thị trường xuất khẩu phần mềm sang Châu Âu.' },

    // --- 3. Marketing - Truyền thông ---
    { title: 'Product Manager (Loyalty App)', company: c('Masan Group'), employer: e('hr@masangroup.com'), requiredSkills: ['Quản lý dự án','Agile','Data-driven'], salary:{min:2500,max:4500}, level:'senior', jobType:'full-time', location:'TP.HCM', deadline: future(40), description: 'Phát triển siêu ứng dụng khách hàng thân thiết WIN.' },
    { title: 'Digital Marketing Specialist', company: c('Shopee Vietnam'), employer: e('hr@shopee.vn'), requiredSkills: ['Digital Marketing', 'SEO', 'Facebook Ads', 'Tiktok Ads'], salary:{min:1000,max:2000}, level:'middle', jobType:'full-time', location:'TP.HCM', deadline: future(30), description: 'Chạy chiến dịch quảng cáo dịp Mega Sale 11.11, 12.12.' },
    { title: 'Content Creator / Copywriter', company: c('VNG Corporation'), employer: e('hr@vng.com.vn'), requiredSkills: ['Content', 'Copywriting', 'Sáng tạo nội dung', 'Social Media'], salary:{min:600,max:1200}, level:'junior', jobType:'full-time', location:'TP.HCM', deadline: future(25), description: 'Xây dựng nội dung cho fanpage các tựa game nổi tiếng.' },
    { title: 'Brand Manager', company: c('Vinamilk'), employer: e('hr@vinamilk.com.vn'), requiredSkills: ['Brand Management', 'FMCG', 'Marketing Strategy'], salary:{min:2500,max:4000}, level:'lead', jobType:'full-time', location:'TP.HCM', deadline: future(60), description: 'Quản trị thương hiệu ngành hàng sữa nước.' },

    // --- 4. Kế toán - Tài chính - Ngân hàng ---
    { title: 'Nhân viên Kế toán', company: c('VNG Corporation'), employer: e('hr@vng.com.vn'), requiredSkills: ['Kế toán','Excel','SAP'], salary:{min:700,max:1200}, level:'junior', jobType:'full-time', location:'TP.HCM', deadline: future(40), description: 'Kiểm soát chứng từ, thanh toán nội bộ.' },
    { title: 'Data Analyst (Phân tích Tài chính)', company: c('Masan Group'), employer: e('hr@masangroup.com'), requiredSkills: ['SQL','Power BI','Python', 'Tài chính'], salary:{min:1000,max:2000}, level:'middle', jobType:'full-time', location:'TP.HCM', deadline: future(60), description: 'Phân tích dữ liệu hành vi người dùng trên chuỗi WinMart.' },
    { title: 'Giao dịch viên Ngân hàng', company: c('Techcombank'), employer: e('hr@techcombank.com.vn'), requiredSkills: ['Giao tiếp', 'Kế toán ngân hàng', 'Ngoại hình'], salary:{min:500,max:900}, level:'junior', jobType:'full-time', location:'Hà Nội', deadline: future(20), description: 'Thực hiện các nghiệp vụ giao dịch tại quầy cho khách hàng.' },
    { title: 'Chuyên viên Phân tích Rủi ro (Risk Analyst)', company: c('MoMo'), employer: e('hr@momo.vn'), requiredSkills: ['Risk Management', 'SQL', 'Data Analysis'], salary:{min:1200,max:2500}, level:'middle', jobType:'full-time', location:'TP.HCM', deadline: future(45), description: 'Phát hiện và ngăn chặn gian lận giao dịch thanh toán.' },

    // --- 5. Thiết kế - Sáng tạo ---
    { title: 'Product Designer (UI/UX)', company: c('MoMo'), employer: e('hr@momo.vn'), requiredSkills: ['Figma', 'UI/UX', 'Prototyping', 'User Research'], salary:{min:1500,max:2500}, level:'middle', jobType:'full-time', location:'TP.HCM', deadline: future(30), description: 'Thiết kế trải nghiệm cho các mini-app trên MoMo.' },
    { title: '2D/3D Graphic Designer', company: c('VNG Corporation'), employer: e('hr@vng.com.vn'), requiredSkills: ['Photoshop', 'Maya', 'Blender', 'Illustration'], salary:{min:1200,max:2000}, level:'middle', jobType:'full-time', location:'TP.HCM', deadline: future(40), description: 'Thiết kế nhân vật và bối cảnh cho dự án game mới.' },
    { title: 'Video Editor / Motion Graphics', company: c('Shopee Vietnam'), employer: e('hr@shopee.vn'), requiredSkills: ['Premiere', 'After Effects', 'Tiktok', 'Motion Graphics'], salary:{min:800,max:1500}, level:'junior', jobType:'full-time', location:'TP.HCM', deadline: future(20), description: 'Chỉnh sửa video quảng cáo ngắn cho các chiến dịch Sale.' },

    // --- 6. Nhân sự - Hành chính ---
    { title: 'Chuyên viên Nhân sự (IT Recruiter)', company: c('FPT Corporation'), employer: empDefault, requiredSkills: ['Tuyển dụng','HR','Giao tiếp'], salary:{min:800,max:1500}, level:'middle', jobType:'full-time', location:'Hà Nội', deadline: future(60), description: 'Tuyển dụng kỹ sư CNTT và quản lý nguồn ứng viên.' },
    { title: 'HR Manager', company: c('Vinamilk'), employer: e('hr@vinamilk.com.vn'), requiredSkills: ['HR Management', 'C&B', 'Luật lao động', 'Tuyển dụng'], salary:{min:2000,max:4000}, level:'lead', jobType:'full-time', location:'TP.HCM', deadline: future(90), description: 'Quản trị toàn bộ hoạt động nhân sự của nhà máy.' },
    { title: 'Chuyên viên Hành chính (Admin)', company: c('Viettel Group'), employer: e('hr@viettel.com.vn'), requiredSkills: ['Hành chính', 'Văn thư', 'Excel'], salary:{min:500,max:800}, level:'junior', jobType:'full-time', location:'Hà Nội', deadline: future(30), description: 'Quản lý giấy tờ, công văn và hỗ trợ hậu cần cho phòng ban.' },
    
    // --- 7. Xây dựng - Bất động sản ---
    { title: 'Kỹ sư Xây dựng / Chỉ huy trưởng', company: c('Viettel Group'), employer: e('hr@viettel.com.vn'), requiredSkills: ['Xây dựng', 'AutoCAD', 'Quản lý dự án'], salary:{min:1500,max:3000}, level:'senior', jobType:'full-time', location:'Hà Nội', deadline: future(60), description: 'Giám sát thi công xây dựng trạm thu phát sóng và trung tâm dữ liệu.' },
    { title: 'Kỹ sư Cơ điện (M&E)', company: c('FPT Corporation'), employer: empDefault, requiredSkills: ['Cơ điện', 'AutoCAD', 'Hệ thống điện', 'PCCC'], salary:{min:1000,max:1800}, level:'middle', jobType:'full-time', location:'Hà Nội', deadline: future(40), description: 'Triển khai hệ thống cơ điện cho tòa nhà FPT Tower.' },
    { title: 'Kiến trúc sư', company: c('Masan Group'), employer: e('hr@masangroup.com'), requiredSkills: ['Kiến trúc', 'Revit', 'Sketchup', 'Thiết kế nội thất'], salary:{min:1200,max:2200}, level:'middle', jobType:'full-time', location:'TP.HCM', deadline: future(45), description: 'Thiết kế concept và bản vẽ thi công chuỗi siêu thị WIN.' },

    // --- 8. Giáo dục - Đào tạo ---
    { title: 'Giảng viên Lập trình (Tech Mentor)', company: c('FPT Corporation'), employer: empDefault, requiredSkills: ['Java', 'C++', 'Giảng dạy', 'Sư phạm'], salary:{min:1500,max:2500}, level:'senior', jobType:'full-time', location:'Hà Nội', deadline: future(60), description: 'Giảng dạy thực hành cho sinh viên Đại học FPT.' },
    { title: 'Chuyên viên Đào tạo Nội bộ (L&D)', company: c('Techcombank'), employer: e('hr@techcombank.com.vn'), requiredSkills: ['L&D', 'Đào tạo', 'E-learning', 'HR'], salary:{min:1000,max:1800}, level:'middle', jobType:'full-time', location:'Hà Nội', deadline: future(30), description: 'Xây dựng chương trình đào tạo nghiệp vụ cho nhân viên mới.' },
    { title: 'Giáo viên Tiếng Anh Doanh nghiệp', company: c('Vinamilk'), employer: e('hr@vinamilk.com.vn'), requiredSkills: ['Tiếng Anh', 'IELTS 7.5+', 'Giảng dạy', 'Giao tiếp'], salary:{min:800,max:1500}, level:'middle', jobType:'full-time', location:'TP.HCM', deadline: future(40), description: 'Đào tạo Tiếng Anh giao tiếp cho cán bộ công nhân viên.' },

    // --- 9. Nghề nghiệp Đa dạng khác (Bổ sung 16 Jobs) ---
    { title: 'Chuyên gia An toàn thông tin (Security)', company: c('Viettel Group'), employer: e('hr@viettel.com.vn'), requiredSkills: ['Cybersecurity', 'CEH', 'Penetration Testing', 'Network Security'], salary:{min:2500,max:4000}, level:'senior', jobType:'full-time', location:'Hà Nội', deadline: future(30), description: 'Đảm bảo an toàn thông tin cho hệ thống mạng lõi Viettel.' },
    { title: 'Kỹ sư Nông nghiệp Công nghệ cao (AgTech)', company: c('Vinamilk'), employer: e('hr@vinamilk.com.vn'), requiredSkills: ['IoT', 'Data Analysis', 'AgTech', 'Sensors'], salary:{min:1200,max:2500}, level:'middle', jobType:'full-time', location:'Lâm Đồng', deadline: future(60), description: 'Phát triển hệ thống IoT giám sát sức khỏe đàn bò sữa chuẩn Châu Âu.' },
    { title: 'Chuyên gia Triển khai ERP (Supply Chain)', company: c('Masan Group'), employer: e('hr@masangroup.com'), requiredSkills: ['SAP', 'ERP', 'Logistics', 'SQL'], salary:{min:2000,max:3500}, level:'lead', jobType:'full-time', location:'Bình Dương', deadline: future(45), description: 'Triển khai và vận hành hệ thống phần mềm quản lý kho bãi tự động.' },
    { title: 'Chuyên viên Mua sắm Công nghệ (IT Procurement)', company: c('Masan Group'), employer: e('hr@masangroup.com'), requiredSkills: ['IT Procurement', 'Hardware', 'Software Licensing', 'Đàm phán'], salary:{min:1000,max:1800}, level:'middle', jobType:'full-time', location:'TP.HCM', deadline: future(30), description: 'Đàm phán và mua sắm hệ thống Server, bản quyền phần mềm cho tập đoàn.' },
    { title: 'iOS Developer', company: c('FPT Corporation'), employer: empDefault, requiredSkills: ['Swift', 'Objective-C', 'iOS SDK', 'AutoLayout'], salary:{min:1500,max:3000}, level:'middle', jobType:'full-time', location:'Đà Nẵng', deadline: future(50), description: 'Phát triển ứng dụng iOS cho khách hàng thị trường Mỹ.' },
    { title: 'Blockchain Engineer', company: c('MoMo'), employer: e('hr@momo.vn'), requiredSkills: ['Blockchain', 'Solidity', 'Smart Contract', 'Web3'], salary:{min:3000,max:6000}, level:'senior', jobType:'full-time', location:'TP.HCM', deadline: future(30), description: 'Nghiên cứu ứng dụng Web3 và Blockchain vào hệ thống ví.' },
    { title: 'QA/QC Tester (Manual & Automation)', company: c('Shopee Vietnam'), employer: e('hr@shopee.vn'), requiredSkills: ['Testing', 'QA/QC', 'Selenium', 'Postman'], salary:{min:1000,max:2000}, level:'middle', jobType:'full-time', location:'TP.HCM', deadline: future(40), description: 'Đảm bảo chất lượng tính năng mới trước khi release.' },
    { title: 'Scrum Master / Agile Coach', company: c('Techcombank'), employer: e('hr@techcombank.com.vn'), requiredSkills: ['Scrum', 'Agile', 'Jira', 'Leadership'], salary:{min:2500,max:4000}, level:'senior', jobType:'full-time', location:'Hà Nội', deadline: future(60), description: 'Huấn luyện và duy trì văn hóa Agile cho 5 đội phát triển.' },
    { title: 'Data Engineer (Big Data)', company: c('Shopee Vietnam'), employer: e('hr@shopee.vn'), requiredSkills: ['Hadoop', 'Spark', 'Python', 'ETL'], salary:{min:2000,max:4500}, level:'senior', jobType:'full-time', location:'TP.HCM', deadline: future(45), description: 'Xây dựng data pipeline xử lý hàng TB dữ liệu người dùng mỗi ngày.' },
    { title: 'Luật sư Sở hữu Trí tuệ (IT Legal Counsel)', company: c('Techcombank'), employer: e('hr@techcombank.com.vn'), requiredSkills: ['Luật CNTT', 'Bản quyền phần mềm', 'Data Privacy', 'Tiếng Anh pháp lý'], salary:{min:1200,max:2500}, level:'middle', jobType:'full-time', location:'Hà Nội', deadline: future(30), description: 'Thẩm định tính pháp lý và bảo mật dữ liệu cho các sản phẩm Fintech.' },
    { title: 'IT Helpdesk / IT Support', company: c('Shopee Vietnam'), employer: e('hr@shopee.vn'), requiredSkills: ['IT Helpdesk', 'Network', 'Hardware', 'Troubleshooting'], salary:{min:500,max:900}, level:'junior', jobType:'full-time', location:'TP.HCM', deadline: future(20), description: 'Hỗ trợ xử lý sự cố máy tính, mạng nội bộ cho nhân viên văn phòng.' },
    { title: 'Kỹ sư Tự động hóa & Robotics', company: c('Viettel Group'), employer: e('hr@viettel.com.vn'), requiredSkills: ['Robotics', 'C++', 'Computer Vision', 'ROS'], salary:{min:1500,max:3000}, level:'middle', jobType:'full-time', location:'Hà Nội', deadline: future(90), description: 'Lập trình hệ thống Robot kho bãi tự hành bằng Computer Vision.' },
    { title: 'Product Owner (Fintech / Payment)', company: c('MoMo'), employer: e('hr@momo.vn'), requiredSkills: ['Product Management', 'Tài chính', 'UI/UX', 'Data Analytics'], salary:{min:2500,max:5000}, level:'lead', jobType:'full-time', location:'TP.HCM', deadline: future(60), description: 'Làm chủ sản phẩm Ví trả sau, định hình tính năng và roadmap.' },
    { title: 'Kỹ sư AI Y tế (MedTech AI Engineer)', company: c('Vinamilk'), employer: e('hr@vinamilk.com.vn'), requiredSkills: ['Machine Learning', 'Computer Vision', 'HealthTech', 'Python'], salary:{min:1500,max:2500}, level:'middle', jobType:'full-time', location:'Nghệ An', deadline: future(45), description: 'Phân tích hình ảnh sức khỏe bò sữa bằng AI để phát hiện bệnh sớm.' },
    { title: 'Developer Relations (DevRel)', company: c('VNG Corporation'), employer: e('hr@vng.com.vn'), requiredSkills: ['DevRel', 'Community Management', 'Technical Writing', 'Public Speaking'], salary:{min:1000,max:1800}, level:'middle', jobType:'full-time', location:'TP.HCM', deadline: future(30), description: 'Tổ chức các sự kiện Hackathon và kết nối cộng đồng lập trình viên.' },
    { title: 'Giám đốc Thương mại Điện tử (E-com Director)', company: c('FPT Corporation'), employer: empDefault, requiredSkills: ['E-commerce', 'Chiến lược kinh doanh', 'Data-driven', 'Digital Marketing'], salary:{min:4000,max:8000}, level:'lead', jobType:'full-time', location:'TP.HCM', deadline: future(90), description: 'Điều hành nền tảng bán lẻ trực tuyến FPT Shop, tối ưu UI/UX & tỷ lệ chuyển đổi.' }
  ];
}

async function run() {
  try {
    console.log('Đang kết nối MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected\n');

    console.log('Đang làm sạch Database...');
    await User.deleteMany();
    await Company.deleteMany();
    await Job.deleteMany();
    await Application.deleteMany();
    console.log('✅ Đã xóa sạch dữ liệu cũ\n');

    console.log('Đang tạo Users (Admins, Employers & Candidates)...');
    
    // Sửa lỗi: Cần băm (hash) mật khẩu trước khi insertMany vì insertMany bỏ qua pre('save') hook của Mongoose
    const hashedPassword = await bcrypt.hash('123456', 12);
    const mapPassword = user => ({ ...user, password: hashedPassword });

    const createdAdmins = await User.insertMany(ADMINS.map(mapPassword));
    const createdEmployers = await User.insertMany(EMPLOYERS.map(mapPassword));
    const createdCandidates = await User.insertMany(CANDIDATES.map(mapPassword));
    console.log(`✅ Đã tạo ${createdAdmins.length} admins, ${createdEmployers.length} employers và ${createdCandidates.length} candidates\n`);

    console.log('Đang tạo Companies (Real Brands)...');
    const companiesWithOwner = COMPANIES.map(c => {
      // Logic: Gắn công ty với employer tương ứng. Dùng 'employer@a.com' cho FPT.
      let owner;
      if (c.name.includes('FPT')) owner = createdEmployers.find(e => e.email === 'employer@a.com');
      else if (c.name.includes('Shopee')) owner = createdEmployers.find(e => e.email === 'hr@shopee.vn');
      else if (c.name.includes('VNG')) owner = createdEmployers.find(e => e.email === 'hr@vng.com.vn');
      else if (c.name.includes('MoMo')) owner = createdEmployers.find(e => e.email === 'hr@momo.vn');
      else if (c.name.includes('Techcombank')) owner = createdEmployers.find(e => e.email === 'hr@techcombank.com.vn');
      else if (c.name.includes('Vinamilk')) owner = createdEmployers.find(e => e.email === 'hr@vinamilk.com.vn');
      else if (c.name.includes('Viettel')) owner = createdEmployers.find(e => e.email === 'hr@viettel.com.vn');
      else if (c.name.includes('Masan')) owner = createdEmployers.find(e => e.email === 'hr@masangroup.com');
      else owner = createdEmployers[0];

      return { ...c, ownerId: owner._id };
    });
    const createdCompanies = await Company.insertMany(companiesWithOwner);
    console.log(`✅ Đã tạo ${createdCompanies.length} companies\n`);

    // Gắn companyId ngược lại cho Employer
    for (const emp of createdEmployers) {
      const comp = createdCompanies.find(c => c.ownerId.equals(emp._id));
      if (comp) {
        await User.findByIdAndUpdate(emp._id, { companyId: comp._id });
      }
    }

    console.log('Đang tạo Jobs (36 Jobs bao phủ 8 categories)...');
    const jobsToInsert = makeJobs(createdCompanies, createdEmployers);
    
    // Tự động fake views và applies cho thực tế
    let jobCount = 0;
    for (const jd of jobsToInsert) {
      const views = Math.floor(Math.random() * 500) + 50; 
      await Job.create({ ...jd, status: 'active', views });
      jobCount++;
    }
    const createdJobs = await Job.find(); // Load back
    console.log(`✅ Đã tạo ${jobCount} jobs hợp lệ (Deadline tương lai)\n`);

    console.log('Đang tạo Applications (Hồ sơ ứng tuyển mẫu)...');
    const appsToInsert = [];
    
    // Ứng viên 1 (candidate@a.com) nộp 2 job FPT
    const candidateDemoId = createdCandidates.find(c => c.email === 'candidate@a.com')._id;
    const empDefaultId = createdEmployers.find(e => e.email === 'employer@a.com')._id;
    const fptJobs = createdJobs.filter(j => j.employer.equals(empDefaultId));
    
    if (fptJobs.length >= 2) {
      appsToInsert.push({ job: fptJobs[0]._id, candidate: candidateDemoId, employer: fptJobs[0].employer, coverLetter: 'Kính gửi HR FPT, tôi đã có 3 năm kinh nghiệm với công nghệ Java/Spring và rất mong muốn được thử sức với hệ thống core banking.', status: 'reviewing' });
      appsToInsert.push({ job: fptJobs[1]._id, candidate: candidateDemoId, employer: fptJobs[1].employer, coverLetter: 'Tôi có kinh nghiệm .NET ReactJS, mong muốn đồng hành cùng FPT.', status: 'applied' });
    }

    if (appsToInsert.length > 0) {
      await Application.insertMany(appsToInsert);
      console.log(`✅ Đã tạo ${appsToInsert.length} applications mẫu\n`);
    }

    console.log('==================================================');
    console.log('🎉 TẤT CẢ DỮ LIỆU (BẢN FINAL 35+ JOBS) ĐÃ SẴN SÀNG!');
    console.log('==================================================');
    console.log('TÀI KHOẢN MẪU CƠ BẢN (Mật khẩu: 123456)');
    console.log('  Admin:     admin@a.com');
    console.log('  Employer:  employer@a.com (Công ty FPT)');
    console.log('  Candidate: candidate@a.com');
    console.log('--------------------------------------------------');
    console.log('TÀI KHOẢN KHÁC KHÁC (Mật khẩu: 123456)');
    console.log('  Nhà Tuyển Dụng: hr@shopee.vn, hr@vng.com.vn...');
    console.log('  Ứng Viên: minhanh@demo.vn, vantai@demo.vn...');
    console.log('==================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

run();
