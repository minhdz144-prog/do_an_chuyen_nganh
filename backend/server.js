// server.js — Entry point duy nhất của ứng dụng
require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB(); // Kết nối DB trước

    const server = app.listen(PORT, () => {
      console.log(
        `🚀 Server: http://localhost:${PORT} [${process.env.NODE_ENV}]`
      );
    });

    // Xử lý lỗi bất đồng bộ chưa được catch (vd: DB ngắt kết nối sau khi start)
    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION:', err.name, err.message);
      server.close(() => process.exit(1));
    });

  } catch (error) {
    console.error('Không thể khởi động server:', error.message);
    process.exit(1);
  }
};

startServer();