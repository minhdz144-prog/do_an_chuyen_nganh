// src/services/email.service.js
// ★ Observer Pattern: side-effect (gửi email) tách biệt khỏi luồng chính (đổi status)
// Gọi fire-and-forget — lỗi gửi mail KHÔNG được làm fail request chính
const nodemailer = require('nodemailer');

// ★ Quyết định kiến trúc: Dùng mode "log" mặc định nếu không cấu hình SMTP
// Khi demo thật, chỉ cần set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS trong .env
const USE_REAL_SMTP = !!(process.env.SMTP_HOST && process.env.SMTP_USER);

let transporter = null;

if (USE_REAL_SMTP) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ─── HTML Email Layout ────────────────────────────────────
const emailLayout = (title, bodyContent) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding:32px 40px; text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
              🚀 IT Job <span style="color:#34d399;">Portal</span>
            </h1>
            <p style="margin:8px 0 0;color:#94a3b8;font-size:13px;">${title}</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            ${bodyContent}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background-color:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">© 2026 IT Job Portal — Nền tảng kết nối Ứng viên chất & Doanh nghiệp hàng đầu</p>
            <p style="margin:4px 0 0;color:#cbd5e1;font-size:11px;">Email này được gửi tự động, vui lòng không trả lời trực tiếp.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ─── Status Email Templates (HTML) ──────────────────────
const STATUS_EMAIL_CONTENT = {
  reviewing: {
    subject: '📋 Hồ sơ của bạn đang được xem xét — IT Job Portal',
    html: ({ candidateName, jobTitle, companyName }) => emailLayout(
      'Cập nhật trạng thái hồ sơ ứng tuyển',
      `<p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 16px;">Xin chào <strong>${candidateName}</strong>,</p>
       <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 20px;">Chúng tôi xin thông báo hồ sơ ứng tuyển của bạn cho vị trí <strong style="color:#0f172a;">"${jobTitle}"</strong> tại <strong style="color:#10b981;">${companyName}</strong> hiện đang được nhà tuyển dụng xem xét kỹ lưỡng.</p>
       <div style="background:#f0fdf4;border-left:4px solid #10b981;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 20px;">
         <p style="margin:0;color:#166534;font-size:14px;">✅ Trạng thái hiện tại: <strong>Đang xem xét (Reviewing)</strong></p>
       </div>
       <p style="color:#64748b;font-size:14px;margin:0;">Vui lòng theo dõi trạng thái cập nhật trên hệ thống IT Job Portal.</p>`
    ),
  },
  interview: {
    subject: '🎉 THƯ MỜI PHỎNG VẤN — IT Job Portal',
    html: ({ candidateName, jobTitle, companyName, interviewDate, interviewNote }) => emailLayout(
      'Thư mời phỏng vấn chính thức',
      `<p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 16px;">Kính gửi <strong>${candidateName}</strong>,</p>
       <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 20px;">Qua quá trình sàng lọc hồ sơ, chúng tôi rất ấn tượng với năng lực và kinh nghiệm của bạn. <strong style="color:#10b981;">${companyName}</strong> trân trọng kính mời bạn tham dự buổi phỏng vấn cho vị trí:</p>
       
       <!-- Job Info Card -->
       <div style="background:linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 100%);border:1px solid #bbf7d0;border-radius:12px;padding:24px;margin:0 0 24px;">
         <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;font-weight:700;">${jobTitle}</h2>
         <p style="margin:0 0 4px;color:#10b981;font-size:14px;font-weight:600;">🏢 ${companyName}</p>
         ${interviewDate ? `<p style="margin:12px 0 0;color:#0f172a;font-size:15px;">📅 <strong>Thời gian:</strong> ${new Date(interviewDate).toLocaleString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>` : ''}
         ${interviewNote ? `<p style="margin:8px 0 0;color:#475569;font-size:14px;">📝 <strong>Ghi chú:</strong> ${interviewNote}</p>` : ''}
       </div>

       <!-- Preparation Tips -->
       <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin:0 0 24px;">
         <h3 style="margin:0 0 12px;color:#1e40af;font-size:15px;">💡 Hướng dẫn chuẩn bị</h3>
         <ul style="margin:0;padding:0 0 0 20px;color:#334155;font-size:14px;line-height:1.8;">
           <li>Chuẩn bị CV bản in và các chứng chỉ liên quan</li>
           <li>Tìm hiểu về công ty và vị trí ứng tuyển</li>
           <li>Đến sớm 10-15 phút trước giờ hẹn</li>
           <li>Ăn mặc lịch sự, chuyên nghiệp</li>
         </ul>
       </div>
       
       <p style="color:#64748b;font-size:14px;margin:0 0 8px;">Nếu cần thay đổi lịch phỏng vấn, vui lòng liên hệ sớm nhất có thể qua hệ thống IT Job Portal.</p>
       <p style="color:#334155;font-size:15px;margin:24px 0 0;font-weight:600;">Chúc bạn phỏng vấn thành công! 🎯</p>`
    ),
  },
  offered: {
    subject: '🏆 CHÚC MỪNG! Bạn đã trúng tuyển — IT Job Portal',
    html: ({ candidateName, jobTitle, companyName }) => emailLayout(
      'Thông báo kết quả tuyển dụng',
      `<p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 16px;">Kính gửi <strong>${candidateName}</strong>,</p>
       
       <!-- Congratulation Banner -->
       <div style="background:linear-gradient(135deg,#fef3c7 0%,#fde68a 100%);border:2px solid #f59e0b;border-radius:12px;padding:28px;text-align:center;margin:0 0 24px;">
         <p style="margin:0 0 8px;font-size:40px;">🎊🏆🎊</p>
         <h2 style="margin:0 0 8px;color:#92400e;font-size:22px;">CHÚC MỪNG BẠN ĐÃ TRÚNG TUYỂN!</h2>
         <p style="margin:0;color:#78350f;font-size:15px;">Vị trí: <strong>"${jobTitle}"</strong></p>
         <p style="margin:4px 0 0;color:#78350f;font-size:15px;">Tại: <strong>${companyName}</strong></p>
       </div>

       <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 16px;">Sau quá trình đánh giá kỹ lưỡng, chúng tôi rất vui mừng thông báo rằng bạn đã được chọn cho vị trí trên. Nhà tuyển dụng sẽ liên hệ trực tiếp với bạn trong thời gian sớm nhất để thảo luận chi tiết về thư mời nhận việc (Offer Letter).</p>
       
       <div style="background:#f0fdf4;border-left:4px solid #10b981;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 20px;">
         <p style="margin:0;color:#166534;font-size:14px;">✅ Trạng thái: <strong>Đã được đề nghị nhận việc (Offered)</strong></p>
       </div>

       <p style="color:#334155;font-size:15px;margin:0;font-weight:600;">Chúc mừng và chào đón bạn vào đội ngũ! 🚀</p>`
    ),
  },
  rejected: {
    subject: '📨 Cập nhật về hồ sơ ứng tuyển — IT Job Portal',
    html: ({ candidateName, jobTitle, companyName }) => emailLayout(
      'Thông báo kết quả xét tuyển',
      `<p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 16px;">Kính gửi <strong>${candidateName}</strong>,</p>
       <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 20px;">Cảm ơn bạn đã dành thời gian quan tâm và ứng tuyển vào vị trí <strong>"${jobTitle}"</strong> tại <strong>${companyName}</strong>.</p>
       <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 20px;">Sau khi xem xét cẩn thận, chúng tôi rất tiếc phải thông báo rằng hồ sơ của bạn chưa phù hợp với yêu cầu của vị trí này trong đợt tuyển dụng lần này.</p>
       
       <div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 20px;">
         <p style="margin:0;color:#1e40af;font-size:14px;">💪 Đừng nản lòng! Hãy tiếp tục khám phá các cơ hội khác trên IT Job Portal.</p>
       </div>
       
       <p style="color:#64748b;font-size:14px;margin:0;">Chúng tôi luôn trân trọng sự quan tâm của bạn và hy vọng có cơ hội hợp tác trong tương lai.</p>`
    ),
  },
};

/**
 * Gửi email thông báo đổi trạng thái hồ sơ ứng tuyển (HTML)
 * ★ Fire-and-forget: hàm này KHÔNG throw error ra ngoài
 */
const sendApplicationStatusEmail = async ({ candidateEmail, candidateName, jobTitle, companyName, newStatus, interviewDate, interviewNote }) => {
  try {
    const template = STATUS_EMAIL_CONTENT[newStatus];
    if (!template) {
      console.log(`📧 [Email] Không có template cho trạng thái: ${newStatus}`);
      return;
    }

    const emailContent = {
      from: process.env.SMTP_FROM || '"IT Job Portal" <noreply@itjobportal.com>',
      to: candidateEmail,
      subject: template.subject,
      html: template.html({ candidateName, jobTitle, companyName, interviewDate, interviewNote }),
    };

    if (USE_REAL_SMTP && transporter) {
      await transporter.sendMail(emailContent);
      console.log(`📧 [Email] ĐÃ GỬI THẬT tới ${candidateEmail}: ${emailContent.subject}`);
    } else {
      console.log('\n' + '═'.repeat(60));
      console.log('📧 [Email Notification — Demo Mode]');
      console.log('═'.repeat(60));
      console.log(`  To:      ${emailContent.to}`);
      console.log(`  Subject: ${emailContent.subject}`);
      console.log(`  [HTML Email — ${newStatus} template]`);
      console.log('═'.repeat(60) + '\n');
    }
  } catch (error) {
    console.error(`📧 [Email Error] Không thể gửi email tới ${candidateEmail}:`, error.message);
  }
};

/**
 * Gửi email OTP đặt lại mật khẩu (HTML)
 */
const sendResetPasswordEmail = async (email, otp) => {
  try {
    const emailContent = {
      from: process.env.SMTP_FROM || '"IT Job Portal" <noreply@itjobportal.com>',
      to: email,
      subject: '🔐 Mã xác nhận đặt lại mật khẩu — IT Job Portal',
      html: emailLayout(
        'Yêu cầu đặt lại mật khẩu',
        `<p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 16px;">Xin chào,</p>
         <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn trên IT Job Portal. Vui lòng sử dụng mã OTP bên dưới:</p>
         
         <!-- OTP Box -->
         <div style="text-align:center;margin:0 0 24px;">
           <div style="display:inline-block;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);border-radius:12px;padding:20px 40px;">
             <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Mã xác nhận</p>
             <p style="margin:0;color:#34d399;font-size:36px;font-weight:800;letter-spacing:8px;">${otp}</p>
           </div>
         </div>
         
         <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 20px;">
           <p style="margin:0;color:#991b1b;font-size:13px;">⚠️ Mã này có hiệu lực trong <strong>10 phút</strong>. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
         </div>
         
         <p style="color:#64748b;font-size:13px;margin:0;">Vì lý do bảo mật, tuyệt đối không chia sẻ mã này với bất kỳ ai.</p>`
      ),
    };

    if (USE_REAL_SMTP && transporter) {
      await transporter.sendMail(emailContent);
      console.log(`📧 [Email] ĐÃ GỬI OTP tới ${email}`);
    } else {
      console.log('\n' + '═'.repeat(60));
      console.log('📧 [Reset Password OTP — Demo Mode]');
      console.log('═'.repeat(60));
      console.log(`  To:  ${email}`);
      console.log(`  OTP: ${otp}`);
      console.log('═'.repeat(60) + '\n');
    }
  } catch (error) {
    console.error(`📧 [Email Error] Không thể gửi OTP tới ${email}:`, error.message);
  }
};

module.exports = { sendApplicationStatusEmail, sendResetPasswordEmail };
