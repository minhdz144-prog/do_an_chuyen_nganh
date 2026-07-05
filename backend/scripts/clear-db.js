require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../src/models/User.model');
const Company = require('../src/models/Company.model');
const Job = require('../src/models/Job.model');
const Application = require('../src/models/Application.model');

const clearDatabase = async () => {
  try {
    console.log('Đang kết nối đến MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Kết nối thành công! Đang tiến hành xóa dữ liệu...');

    // Xóa toàn bộ dữ liệu trong các collection
    await User.deleteMany();
    await Company.deleteMany();
    await Job.deleteMany();
    await Application.deleteMany();

    console.log('✅ Xóa sạch dữ liệu thành công!');
    console.log('Bạn có thể bắt đầu test lại từ đầu với database trống.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi xóa dữ liệu:', error);
    process.exit(1);
  }
};

clearDatabase();
