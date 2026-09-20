# MÔ TẢ TOÀN DIỆN ĐỒ ÁN — IT JOB PORTAL


---

## 1. Tổng quan Đề tài
**IT Job Portal** là nền tảng tuyển dụng chuyên biệt dành cho ngành Công nghệ Thông tin (IT), giải quyết bài toán kết nối thông minh giữa Ứng viên và Nhà tuyển dụng thông qua thuật toán Matching dựa trên bộ Kỹ năng (Skills).

### 1.1. Đối tượng người dùng (Role-Based Access Control)
Hệ thống phân quyền nghiêm ngặt dựa trên 3 vai trò (`role` trong `User.model.js`):
- **`candidate` (Ứng viên):** Tìm việc, lưu việc làm yêu thích (Bookmark), nộp hồ sơ ứng tuyển (Apply), quản lý Profile kỹ năng, tải CV lên để AI tự động trích xuất kỹ năng, xuất Profile thành PDF.
- **`employer` (Nhà tuyển dụng):** Đăng tin tuyển dụng, quản lý hồ sơ công ty (logo, tech stack, phúc lợi), xét duyệt hồ sơ ứng viên qua giao diện Kanban Board kéo-thả, quản lý lịch phỏng vấn.
- **`admin` (Quản trị viên):** Giám sát toàn hệ thống, xem Dashboard thống kê, duyệt/từ chối xác minh công ty (`isVerified`), khóa/mở khóa tài khoản người dùng. *Không được phép tự đăng ký* (chặn ở API `register`).

### 1.2. Giá trị cốt lõi
Điểm khác biệt lớn nhất so với các trang tuyển dụng thông thường nằm ở **Công cụ AI Live Matching** — xử lý chuẩn hóa từ đồng nghĩa công nghệ (ví dụ: `reactjs` → `react`, `k8s` → `kubernetes`), so khớp tiền tố linh hoạt (prefix matching), và tính Match Score chính xác (phần trăm) để loại bỏ tình trạng gợi ý rác trong hệ thống.

---

## 2. Tech Stack Thực Tế (Từ `package.json`)

### 2.1. Backend (Node.js — REST API Server)
| Nhóm | Thư viện | Phiên bản | Mục đích |
|---|---|---|---|
| **Core** | `express` | 5.2.1 | HTTP Framework |
| | `mongoose` | 9.7.2 | ODM cho MongoDB |
| **Bảo mật** | `jsonwebtoken` | 9.0.3 | Tạo/Xác thực JWT |
| | `bcryptjs` | 3.0.3 | Băm mật khẩu (12 round) |
| | `helmet` | 8.2.0 | Bảo vệ HTTP Headers |
| | `cors` | 2.8.6 | Chống Cross-Origin |
| | `express-rate-limit` | 8.5.2 | Giới hạn request/IP (chống brute-force) |
| **File & Parser** | `multer` | 2.2.0 | Upload file (Resume/Logo) |
| | `pdf-parse` | 1.1.4 | Đọc nội dung PDF |
| | `mammoth` | 1.12.0 | Đọc nội dung DOCX |
| **Validation** | `joi` | 18.2.3 | Schema validation cho Job CRUD |
| **Hiệu năng** | `node-cache` | 5.1.2 | In-memory caching (TTL 60s) |
| **Giao tiếp** | `nodemailer` | 9.0.3 | Gửi email qua SMTP Gmail thật |
| | `socket.io` | 4.8.3 | Realtime Notification (WebSocket) |
| **Dev/Test** | `jest` | 30.4.2 | Unit Testing |
| | `nodemon` | 3.1.14 | Hot-reload khi phát triển |
| | `morgan` | 1.11.0 | HTTP request logging |

### 2.2. Frontend (Next.js — React Framework)
| Nhóm | Thư viện | Phiên bản | Mục đích |
|---|---|---|---|
| **Core** | `next` | 16.2.10 | Framework React (App Router, Turbopack) |
| | `react` / `react-dom` | 19.2.4 | UI Library |
| **Styling** | `tailwindcss` | v4 | Utility-first CSS |
| | `shadcn` | 4.12.0 | Component Library (Button, Dialog, Select…) |
| | `lucide-react` | 1.23.0 | Bộ icon SVG |
| | `framer-motion` | 12.42.2 | Animation library |
| | `tw-animate-css` | 1.4.0 | CSS animation utilities |
| **State** | `zustand` | 5.0.14 | Global State nhẹ (thay Redux) |
| **Form** | `react-hook-form` | 7.80.0 | Form handling |
| | `zod` | 4.4.3 | Schema validation phía Client |
| **Network** | `axios` | 1.18.1 | HTTP Client |
| | `jose` | 6.2.3 | Giải mã JWT ở Client (middleware) |
| | `socket.io-client` | 4.8.3 | WebSocket client |
| **Interactive** | `@hello-pangea/dnd` | 18.0.1 | Kéo-thả Kanban Board |
| | `recharts` | 3.10.1 | Biểu đồ thống kê |
| | `react-day-picker` | 10.0.1 | Date picker component |
| **Misc** | `js-cookie` | 3.0.8 | Quản lý cookie (JWT token) |
| | `next-themes` | 0.4.6 | Dark Mode toggle |
| | `sonner` | 2.0.7 | Toast notification UI |
| | `date-fns` | 4.4.0 | Format ngày tháng |

---

## 3. Kiến Trúc Hệ Thống & Các Kỹ Thuật Nâng Cao

Hệ thống tuân thủ **Kiến trúc Phân tầng (Layered Architecture)** nghiêm ngặt:
```
Routes → Middlewares → Controllers → Services → Models (MongoDB)
```
Cùng với đó là thiết kế **RESTful API** chuẩn mực và sự kết hợp của nhiều kỹ thuật tiên tiến:

### 3.1. Mô hình Observer Pattern — Hệ thống Thông báo Đa kênh
Khi một sự kiện nghiệp vụ xảy ra (ứng viên nộp CV, employer đổi trạng thái), hệ thống kích hoạt **3 kênh thông báo song song** mà không block luồng chính:
1. **Kênh DB:** Ghi bản ghi vào MongoDB (`Notification.model`) — lưu trữ bền vững, có index `{ recipient, isRead, createdAt }`.
2. **Kênh Realtime:** Phát sự kiện qua `socket.io` (`new_application`, `status_changed`) tới đúng phòng (room) của người nhận — cập nhật UI chuông báo tức thì không cần F5.
3. **Kênh Email:** Gửi email HTML chuyên nghiệp qua `nodemailer` (SMTP Gmail thật) theo kiểu **fire-and-forget** — lỗi gửi email không ảnh hưởng response chính.

### 3.2. Tìm kiếm Full-text có Trọng số (MongoDB Text Index)
Thay vì dùng `$regex` tốn CPU, Model `Job` thiết lập **Compound Text Index** có trọng số khác nhau:
- `title` — weight **10** (ưu tiên cao nhất).
- `requiredSkills` — weight **5** (ưu tiên trung bình).
- `description` — weight **1** (ưu tiên thấp).

Kết quả tìm kiếm tự động được xếp hạng (Rank) theo `textScore` — đảm bảo job có tiêu đề trùng từ khóa sẽ hiện lên đầu.

### 3.3. Chiến lược Caching (node-cache)
Bài toán tính Match Score giữa kỹ năng ứng viên và toàn bộ kho việc làm rất tốn CPU. Hệ thống áp dụng `node-cache` với **TTL 60 giây** tại 2 endpoint:
- `getRecommendedJobs` — cache key: `recommended_{userId}_{threshold}_{limit}`.
- `getMatchPreview` — cache key: `match_{skills}_{threshold}`.

Giúp giảm tải đáng kể khi nhiều ứng viên tra cứu gần nhau.

### 3.4. Trích xuất Kỹ năng từ CV (AI Parser)
Module `cvExtractor.js` chứa **bộ từ điển 54 kỹ năng IT chuẩn** (từ JavaScript, Python đến Kubernetes, Figma…). Khi ứng viên tải CV lên:
1. Hệ thống đọc nội dung file qua `pdf-parse` (PDF) hoặc `mammoth` (DOCX).
2. Duyệt toàn bộ từ điển, dùng Regex word-boundary (`\b`) để match chính xác từng kỹ năng.
3. Trả về mảng `extractedSkills` — Frontend tự động điền thêm vào ô "Kỹ năng" cho ứng viên.

### 3.5. Xác thực Đa kênh & Bảo mật
Hệ thống hỗ trợ **3 phương thức xác thực** (code tại `auth.controller.js`):

| Phương thức | Luồng xử lý |
|---|---|
| **Đăng ký/Đăng nhập truyền thống** | `register` → băm password (bcrypt 12 round) → cấp JWT. `login` → so sánh password → cấp JWT. Hỗ trợ **"Nhớ mật khẩu"** (Remember Me): token có thời hạn 30 ngày thay vì 1 ngày. |
| **Google OAuth 2.0** | `googleLogin` → Verify ID Token qua Google tokeninfo endpoint → Kiểm tra `aud` khớp Client ID → Tìm hoặc tạo User → Cấp JWT. Nếu user đã có email trùng, tự động liên kết `googleId`. |
| **Quên mật khẩu (OTP)** | `forgotPassword` → Tạo mã OTP 6 số bằng `crypto.randomInt` → Lưu vào DB với **TTL 10 phút** → Gửi email OTP qua SMTP. `resetPassword` → Xác minh OTP + TTL → Đặt lại password. Không tiết lộ email có tồn tại hay không (bảo mật). |

**Middleware bảo vệ (5 tầng):**
- `protect` — Xác thực JWT token từ header `Authorization: Bearer`.
- `restrictTo(...roles)` — Phân quyền theo vai trò (RBAC).
- `validate(schema)` — Xác thực dữ liệu đầu vào bằng Joi schema.
- `express-rate-limit` — Giới hạn 200 req/15 phút/IP (Production).
- `helmet` — Bảo vệ HTTP headers (XSS, Clickjacking…).

### 3.6. Chuẩn hóa Response & Xử lý Lỗi
- **ApiResponse** (`ApiResponse.js`): Mọi response đều trả về cùng cấu trúc `{ success, message, data, pagination? }` — giúp Frontend xử lý đồng nhất.
- **ApiError** (`ApiError.js`): Custom Error class phân biệt **lỗi nghiệp vụ** (`isOperational: true`, như 400/401/403/404/409) và **lỗi hệ thống** (500). Middleware `error.middleware.js` xử lý tập trung: bắt lỗi Mongoose (`CastError`, `ValidationError`, `11000 Duplicate`) và chuyển thành JSON response thân thiện.

### 3.7. Trải nghiệm Người dùng (UX) Nâng cao
- **Xuất PDF bản xem trước CV:** Sử dụng kỹ thuật **Print CSS** (`@media print` + `display: none`) biến trực tiếp hồ sơ web thành tệp PDF chuẩn A4, ẩn hoàn toàn form nhập liệu, sidebar, navbar — chỉ xuất đúng phần CV.
- **Proxy Rewrite file tĩnh:** Cấu hình `rewrites()` trong `next.config.ts` để chuyển tiếp request `/uploads/*` từ Frontend (port 3000) sang Backend (port 5000) — giúp xem CV PDF, logo công ty trực tiếp trên web mà không bị 404.
- **Dark Mode** toàn hệ thống thông qua `next-themes`.
- **Skeleton Loading** (`SkeletonJobCard.tsx`) và **Error/404 pages** tùy chỉnh.
- **SEO:** File `robots.ts` và `sitemap.ts` tự động sinh metadata.

### 3.8. Ứng dụng Trí tuệ Nhân tạo Tạo sinh (Generative AI) — Đột phá Trải nghiệm
Hệ thống được tích hợp mô hình ngôn ngữ lớn (LLM) thông qua API của Google Gemini nhằm tối ưu hóa quy trình tuyển dụng hai chiều mà không làm phá vỡ kiến trúc CSDL hiện tại (áp dụng mô hình Plug & Play qua micro-services riêng biệt). Toàn bộ được đóng gói trong module độc lập `ai.service.js`.

Hệ sinh thái Generative AI trong đồ án bao gồm 5 trợ lý thông minh:
1. **AI Viết JD (Job Description Generator):** Tự động mở rộng từ Chức danh và Kỹ năng yêu cầu thành một bản JD hoàn chỉnh, chuyên nghiệp.
2. **AI Sinh Câu hỏi Phỏng vấn:** Phân tích chênh lệch (gap) giữa kỹ năng Ứng viên và Yêu cầu Công việc để sinh ra 5 câu hỏi phỏng vấn chuyên sâu.
3. **AI Đánh giá Ứng viên (Assessment):** Phân tích mức độ phù hợp và đưa ra quyết định gợi ý (Nên phỏng vấn hay Loại) dựa trên logic kỹ năng.
4. **AI Tự động hóa Cover Letter:** Ánh xạ điểm mạnh của Ứng viên với JD để viết Thư xin việc mang tính cá nhân hóa cao.
5. **AI Gợi ý Lộ trình (Career Path):** Đề xuất các kỹ năng cần học tiếp theo (Next Skills) dựa trên Profile hiện tại của ứng viên.

**Cơ chế Graceful Degradation (Fallback Mechanism):**
Để giải quyết bài toán thiếu ổn định của các API AI miễn phí (như lỗi 503 Service Unavailable khi quá tải), `ai.service.js` được thiết kế với cơ chế Fallback an toàn. Hệ thống áp dụng `Promise.race` với Timeout 15-35 giây. Nếu API AI phản hồi chậm hoặc lỗi, Backend sẽ tự động trả về **Fallback Data** (dữ liệu mẫu hợp lệ được chuẩn bị sẵn) với HTTP Status 200, đảm bảo Frontend luôn có dữ liệu để render mà không bị crash hoặc treo vô thời hạn.


---

## 4. Thiết Kế Cơ Sở Dữ Liệu (5 Core Models)
Cơ sở dữ liệu NoSQL (MongoDB Atlas) được tổ chức thành **5 Models** với Mongoose ODM, sử dụng kỹ thuật **Embedded Document**, **Reference**, **Compound Index** và **Mongoose Hook**.

### 4.1. User (`User.model.js`) — 50 dòng
- **Định danh:** `email` (unique, lowercase, trim, regex validation), `password` (minlength 6, `select: false`, băm tự động qua Hook `pre('save')` với bcrypt 12 round).
- **Phân quyền:** `role` (enum: `admin`, `employer`, `candidate`).
- **Google OAuth:** `googleId` (sparse index), `authProvider` (enum: `local`, `google`).
- **Quên mật khẩu:** `resetPasswordOTP` + `resetPasswordExpires` (cả hai `select: false`).
- **Embedded Document:** `candidateProfile` — lưu `skills` (mảng), `yearsOfExperience`, `educationLevel` (enum 5 cấp), `resumeUrl`, `bio`, `location`. Không cần tách thành bảng riêng.
- **Reference Array:** `savedJobs` — mảng ObjectId tham chiếu tới Job (Bookmark).
- **Tham chiếu:** `companyId` → Company (dành cho Employer).
- **Instance Method:** `comparePassword(plain)` — so sánh mật khẩu.

### 4.2. Company (`Company.model.js`) — 26 dòng
- **Thông tin:** `name`, `logo`, `description`, `website`, `location`, `industry`.
- **Mở rộng:** `employeeCount`, `foundedYear`, mảng `techStack`, mảng `benefits`, `coverImage`, `socialLinks` (embedded: linkedin, facebook, github).
- **Tham chiếu:** `ownerId` → User (Employer sở hữu).
- **Kiểm duyệt:** `isVerified` (Boolean, default `false`) — Admin duyệt trước khi Employer được phép đăng tin.

### 4.3. Job (`Job.model.js`) — 34 dòng
- **Thông tin:** `title`, `description`, mảng `requiredSkills`, `location`, `salary` (embedded: min, max), `jobType` (enum 5 loại), `level` (enum 6 cấp), `deadline`, `views`.
- **Tham chiếu:** `employer` → User, `company` → Company.
- **Trạng thái:** `status` (enum: `active`, `draft`, `closed`).
- **Virtual:** `isExpired` — tự tính xem Job đã hết hạn chưa.
- **Indexes (4 indexes):**
  - `{ requiredSkills: 1 }` — tìm kiếm theo kỹ năng.
  - `{ status: 1, deadline: 1 }` — lọc job active/hết hạn.
  - `{ company: 1, employer: 1 }` — truy vấn theo công ty.
  - **Full-text Index** `{ title: 'text', description: 'text', requiredSkills: 'text' }` với weights `{ title: 10, requiredSkills: 5, description: 1 }`.

### 4.4. Application (`Application.model.js`) — 51 dòng
- **Hồ sơ nộp:** `job` → Job, `candidate` → User, `resumeUrl`, `coverLetter`.
- **Trạng thái:** `status` (enum 5 trạng thái: `applied`, `reviewing`, `interview`, `offered`, `rejected`).
- **Phỏng vấn:** `interviewDate`, `interviewNote`.
- **Lịch sử thay đổi:** `statusHistory` — mảng Embedded Document ghi `{ status, note, changedBy, changedAt }`.
- **Compound Unique Index:** `{ job: 1, candidate: 1 }` — chống spam nộp 1 công việc nhiều lần ở cấp CSDL.
- **State Machine:** Hằng số `VALID_TRANSITIONS` + Instance Method `canTransitionTo(newStatus)` — ràng buộc chuyển trạng thái hợp lệ.

### 4.5. Notification (`Notification.model.js`) — 15 dòng
- **Thông tin:** `recipient` → User, `type` (enum: `new_application`, `status_changed`, `system`), `title`, `message`, `link`, `isRead`.
- **Compound Index:** `{ recipient: 1, isRead: 1, createdAt: -1 }` — truy vấn nhanh thông báo chưa đọc.

---

## 5. Thiết Kế Luồng Nghiệp Vụ (Workflow)

### 5.1. Luồng Máy Trạng Thái (State Machine) — Quản lý Hồ sơ Ứng tuyển
Vòng đời của mỗi hồ sơ ứng viên (Application) bị ràng buộc nghiêm ngặt trong hằng số `VALID_TRANSITIONS`:

```
applied → reviewing → interview → offered
   ↓          ↓           ↓
rejected   rejected    rejected
```

- Từ mỗi trạng thái chỉ có thể chuyển sang các trạng thái hợp lệ: `applied` → `[reviewing, rejected]`, `reviewing` → `[interview, rejected]`, `interview` → `[offered, rejected]`.
- `offered` và `rejected` là **trạng thái cuối** (terminal state) — không thể chuyển đi nữa.
- Controller gọi `application.canTransitionTo(status)` — nếu vi phạm sẽ trả lỗi 400 kèm danh sách trạng thái hợp lệ.

### 5.2. Luồng Kanban Board & Automation Email
Phân hệ Employer sử dụng `@hello-pangea/dnd` xây dựng **Bảng Kéo-Thả (Kanban Board)** với các cột: `Mới`, `Đang xem`, `Phỏng vấn`, `Trúng tuyển`, `Từ chối`. Khi kéo-thả CV sang cột mới, hệ thống tự động:
1. Gọi API `PATCH /api/applications/:id/status` (validate State Machine).
2. Lưu lịch sử thay đổi vào `statusHistory`.
3. Tạo Notification trong DB + phát sự kiện Socket.io tới ứng viên.
4. **Gửi email HTML chuyên nghiệp** tới hộp thư Gmail thật của ứng viên — mỗi trạng thái có template riêng:
   - `reviewing` → Email "Hồ sơ đang được xem xét".
   - `interview` → **Thư mời phỏng vấn** (kèm ngày giờ, ghi chú, hướng dẫn chuẩn bị).
   - `offered` → Email "Chúc mừng trúng tuyển" (có banner đặc biệt).
   - `rejected` → Email "Cảm ơn đã ứng tuyển" (khuyến khích tiếp tục tìm kiếm).

### 5.3. Luồng Thuật toán Matching (`matching.service.js`)
Thuật toán Matching là **trái tim kỹ thuật** của đồ án, gồm 4 hàm:

| Hàm | Chức năng |
|---|---|
| `normalizeSkill(skill)` | Chuẩn hóa: lowercase → bỏ `.`, `-`, `_`, `/`, khoảng trắng → tra bảng synonym (12 cặp: `js`→`javascript`, `k8s`→`kubernetes`, `reactjs`→`react`, `dotnet`→`.net`…). |
| `isSkillMatch(c, r)` | So khớp 2 kỹ năng: **Exact/Synonym** → score 1.0, **Prefix** (≥3 ký tự, diff ≤3) → score 0.5. Chống false positive: `Java` ≠ `JavaScript`. |
| `calculateMatchScore(cSkills, rSkills)` | Tính % = `(totalScore / requiredSkills.length) × 100`. Trả về `{ score, matched[], missing[] }`. Ứng viên có thừa kỹ năng không bị phạt (khác Jaccard). |
| `getRecommendedJobs(skills, jobs, threshold)` | Lọc jobs có score ≥ threshold → Sắp xếp giảm dần. |

**Được tái sử dụng tại 4 nơi:**
- **Gợi ý việc làm** (`/jobs/recommended`) — Skills ứng viên ↔ Toàn bộ Job active.
- **Việc làm liên quan** (`/jobs/:id` → `relatedJobs`) — Skills của 1 Job ↔ Các Job khác (threshold 40% → fallback 20%).
- **AI Search** (`/jobs/ai-search`) — Skills do người dùng nhập ↔ Tất cả Job (có phân trang + filter location).
- **Live Match Preview** (`/jobs/match-preview`) — Đếm nhanh số lượng job khớp + lấy 3 title mẫu (hiển thị trên Hero section).

### 5.4. Luồng Upload & Trích xuất CV
1. Ứng viên chọn file PDF/DOCX → Frontend gửi `POST /api/uploads/resume` (multipart/form-data).
2. Middleware `multer` lưu file vào `uploads/resumes/` với tên `{userId}_{timestamp}.ext` (chống trùng).
3. Backend đọc file → gọi `extractSkillsFromPDF()` hoặc `extractSkillsFromDocx()`.
4. Trả về `{ url, originalName, extractedSkills[] }` → Frontend tự động điền kỹ năng mới vào form.

### 5.5. Luồng Kiểm duyệt Công ty
1. Employer đăng ký → Tạo Company (mặc định `isVerified: false`).
2. Employer không thể đăng tin tuyển dụng (`createJob` kiểm tra `company.isVerified`).
3. Admin vào bảng duyệt → `PATCH /api/admin/companies/:id/verify` → Đặt `isVerified: true`.
4. Employer giờ mới được đăng tin.

---

## 6. Tính Năng Chi Tiết Theo Phân Hệ

### 6.1. Backend — RESTful API Routes (9 Route Files, 8 Controllers)

**Auth Routes** (`auth.routes.js` → `auth.controller.js`):
- `POST /api/auth/register` — Đăng ký (chặn role admin).
- `POST /api/auth/login` — Đăng nhập (hỗ trợ Remember Me).
- `POST /api/auth/google` — Đăng nhập Google OAuth 2.0.
- `POST /api/auth/forgot-password` — Gửi OTP qua email.
- `POST /api/auth/reset-password` — Đặt lại mật khẩu bằng OTP.
- `GET /api/auth/me` — Lấy thông tin bản thân (protected).
- `PUT /api/auth/me` — Cập nhật thông tin (protected).

**Job Routes** (`job.routes.js` → `job.controller.js`):
- `GET /api/jobs` — Danh sách việc làm (filter: keyword, location, jobType, level, salary, phân trang).
- `GET /api/jobs/:id` — Chi tiết + Related Jobs (matching algorithm).
- `GET /api/jobs/recommended` — Gợi ý việc làm AI (candidate, cached).
- `GET /api/jobs/match-preview` — Live preview số lượng match (public).
- `GET /api/jobs/ai-search` — Tìm kiếm AI theo kỹ năng (public).
- `POST /api/jobs` — Đăng tin (employer, kiểm tra company verified).
- `PUT|PATCH /api/jobs/:id` — Sửa tin (employer, whitelist fields).
- `DELETE /api/jobs/:id` — Xóa tin (employer hoặc admin).
- `POST /api/jobs/:jobId/apply` — Ứng viên nộp hồ sơ.
- `GET /api/jobs/:jobId/applications` — Employer xem danh sách ứng viên.

**Application Routes** (`application.routes.js` → `application.controller.js`):
- `GET /api/applications/my` — Ứng viên xem lịch sử ứng tuyển.
- `PATCH /api/applications/:id/status` — Employer đổi trạng thái (State Machine).

**Company Routes** (`company.routes.js` → `company.controller.js`):
- `POST /api/companies` — Tạo công ty (employer).
- `GET /api/companies/:id` — Xem thông tin công ty (public).
- `PUT /api/companies/:id` — Cập nhật (employer owner).

**User Routes** (`user.routes.js` → `user.controller.js`):
- `GET /api/users/me` — Lấy profile (protected).
- `PUT /api/users/me` — Cập nhật profile (whitelist nghiêm ngặt).
- `POST /api/users/me/saved-jobs/:jobId` — Toggle bookmark (addToSet/pull).
- `GET /api/users/me/saved-jobs` — Danh sách đã lưu.

**Admin Routes** (`admin.routes.js` → `admin.controller.js`):
- `GET /api/admin/users` — Danh sách user (filter role, isActive, phân trang).
- `PATCH /api/admin/users/:id/status` — Khóa/Mở khóa user (chặn tự khóa).
- `GET /api/admin/stats` — Thống kê toàn hệ thống (11 lệnh đếm chạy song song `Promise.all`).
- `GET /api/admin/companies` — Danh sách công ty (filter isVerified).
- `PATCH /api/admin/companies/:id/verify` — Duyệt/Hủy xác minh.

**Upload Routes** (`upload.routes.js`):
- `POST /api/uploads/resume` — Upload CV (candidate, ≤5MB, PDF/DOC/DOCX) + AI trích xuất kỹ năng.
- `POST /api/uploads/logo` — Upload logo (employer, ≤2MB, JPG/PNG/WEBP).

**Stats Routes** (`stats.routes.js` → `stats.controller.js`):
- `GET /api/stats/public` — Số ứng viên, công ty đã xác minh, job đang tuyển (public).
- `GET /api/stats/categories` — Đếm job theo ngành (Aggregation Pipeline: Job → Lookup Company → Group by industry).

**Notification Routes** (`notification.routes.js` → `notification.controller.js`):
- `GET /api/notifications` — Danh sách thông báo (protected).
- `PATCH /api/notifications/read-all` — Đánh dấu tất cả đã đọc.

### 6.2. Frontend — Phân vùng Route Groups (Next.js App Router)

**`(public)` — Trang công khai:**
- **Landing Page** (`page.tsx` — 20KB): Hero section với Live Matching Preview (nhập kỹ năng → đếm realtime số job khớp), Particle Network animation, Company Marquee, Category Jobs, Latest Jobs, Promo Banners.
- **Danh sách Job** (`jobs/page.tsx`): Bộ lọc nâng cao (keyword, location, jobType, level, salary range), phân trang.
- **Chi tiết Job** (`jobs/[id]/page.tsx`): Thông tin đầy đủ, nút Apply/Bookmark, Related Jobs (AI matching).
- **Trang Công ty** (`companies/[id]/page.tsx`): Hồ sơ công ty, danh sách job đang tuyển.

**`(auth)` — Xác thực:**
- **Đăng nhập** (`login/page.tsx`): Form email/password + Remember Me + nút Google Sign-In.
- **Đăng ký** (`register/page.tsx`): Form đăng ký với lựa chọn role (candidate/employer).
- **Quên mật khẩu** (`forgot-password/page.tsx`): Luồng 3 bước (nhập email → nhập OTP → đặt mật khẩu mới).

**`candidate` — Phân hệ Ứng viên:**
- **Hồ sơ cá nhân** (`profile/page.tsx`): Form cập nhật thông tin + Upload CV (AI trích kỹ năng) + **Bản xem trước CV** dạng A4 + **Nút Xuất PDF**.
- **Lịch sử ứng tuyển** (`applications/page.tsx`): Danh sách hồ sơ đã nộp kèm trạng thái realtime.
- **Việc làm đã lưu** (`saved-jobs/page.tsx`): Danh sách Bookmark.
- **Gợi ý việc làm AI** (`jobs/recommended/page.tsx`): Danh sách job được AI matching + hiển thị Match Score.

**`employer` — Phân hệ Nhà tuyển dụng:**
- **Dashboard** (`dashboard/page.tsx`): Biểu đồ thống kê (recharts), tổng quan việc làm.
- **Quản lý việc làm** (`jobs/page.tsx`): CRUD tin tuyển dụng, tạo/sửa/đóng.
- **Hồ sơ ứng viên** (`applications/page.tsx`): **Kanban Board** kéo-thả + chế độ xem Danh sách.
- **Lịch phỏng vấn** (`calendar/page.tsx`): Quản lý lịch hẹn phỏng vấn.
- **Hồ sơ công ty** (`company/page.tsx`): Cập nhật thông tin, logo, techStack, benefits.

**`admin` — Phân hệ Quản trị:**
- **Dashboard** (`dashboard/page.tsx`): Thống kê toàn hệ thống.
- **Quản lý Người dùng** (`users/page.tsx`): Bảng danh sách + Khóa/Mở khóa tài khoản.
- **Quản lý Công ty** (`companies/page.tsx`): Bảng duyệt công ty (Xác minh/Hủy xác minh).
- **Cấu hình** (`settings/page.tsx`): Cài đặt hệ thống.

### 6.3. Shared Components (18 component dùng chung)
- `ApplyButton`, `BookmarkButton` — Nút ứng tuyển / lưu việc.
- `JobCard`, `FeaturedJobCard`, `SkeletonJobCard` — Card hiển thị việc làm.
- `JobFilters`, `JobSearchHero` — Bộ lọc, thanh tìm kiếm.
- `MatchingScoreIndicator` — Hiển thị % Match Score dạng vòng tròn.
- `NotificationBell`, `NotificationDropdown` — Chuông thông báo realtime.
- `SocketProvider` — Provider quản lý kết nối WebSocket.
- `ThemeToggle` — Nút chuyển Dark/Light Mode.
- `ParticleNetwork` — Animation mạng hạt (Landing page).
- `CompanyLogoMark`, `CompanyMarquee` — Logo công ty + Marquee.
- `SectionReveal` — Animation xuất hiện khi cuộn (scroll).
- `Pagination`, `EmptyState` — Phân trang + trạng thái rỗng.

### 6.4. State Management (Zustand)
- **`authStore.ts`:** Quản lý user hiện tại, token, login/logout/updateUser.
- **`notificationStore.ts`:** Quản lý danh sách thông báo, unread count, markAllAsRead, lắng nghe Socket event.

---

## 7. Kiểm Thử Hệ Thống (Testing)
Hệ thống được bảo vệ qua 3 luồng kiểm thử:

### 7.1. Unit Testing — Jest (`matching.service.test.js`)
File test chứa **4 describe block** với tổng cộng **16 test case** bao phủ toàn bộ thuật toán lõi:

| Hàm | Số test | Điểm nhấn |
|---|---|---|
| `normalizeSkill` | 4 | Kiểm tra lowercase, bỏ dấu `.`, `-`, `_`, giữ nguyên chuỗi đã chuẩn. |
| `isSkillMatch` | 6 | Exact match (score 1.0), Synonym match (ReactJS→React), **Chống false positive: Java ≠ JavaScript, C ≠ C++**, Edge case chuỗi rỗng. |
| `calculateMatchScore` | 4 | 100% khi đủ kỹ năng, tính đúng %, 0% khi không trùng, **Không bị phạt khi thừa kỹ năng** (10 skills ứng viên, 2 yêu cầu → vẫn 100%). |
| `getRecommendedJobs` | 4 | Lọc đúng threshold, sort giảm dần, mảng rỗng khi không đạt, **Fuzzy matching hoạt động trong context recommend**. |

### 7.2. Black-box Testing (Postman)
- Chạy trên tất cả RESTful APIs (Job, Company, Application, Notification, Admin).
- Xác minh việc bảo vệ endpoint bằng JWT Header.
- Cố tình gửi request nhảy vọt trạng thái Application (ví dụ: `applied` → `offered`) → Confirm Middleware State Machine chặn đứng với thông báo lỗi rõ ràng.

### 7.3. Workflow Testing (End-to-end thủ công)
Giả lập luồng hoàn chỉnh: Đăng ký → Upload CV → AI trích xuất kỹ năng → Gợi ý việc làm → Nộp đơn → Employer kéo thẻ Kanban → Email thư mời phỏng vấn gửi tới Gmail thật → Notification rung chuông trên UI ứng viên → Ứng viên xuất CV thành PDF.

---

---

## 8. Thực Nghiệm Triển Khai Hệ Thống (Giao diện thực tế)
*(Phần này tương ứng với Chương 4 trong Báo cáo Đồ án của bạn)*

Quá trình triển khai hệ thống thực tế với giao diện Web (Next.js) tích hợp sâu các công nghệ Trí tuệ nhân tạo (Generative AI) và Thuật toán lõi, mang lại trải nghiệm đột phá cho cả Ứng viên, Nhà tuyển dụng và Quản trị viên. Dưới đây là toàn bộ các phân hệ chức năng đã triển khai thành công:

### 8.1. Giao diện Công khai & Trang chủ (Public UI & Landing Page)
Đây là "bộ mặt" của hệ thống, nơi thu hút ứng viên ngay từ ánh nhìn đầu tiên:
- **Trang chủ (Landing Page):** Giao diện Hero Section bắt mắt với thanh tìm kiếm trung tâm.
- **AI Live Matching:** Khi ứng viên gõ kỹ năng vào thanh tìm kiếm (ví dụ: `React, TypeScript`), thuật toán Matching sẽ chạy ngầm và trả về các việc làm tương thích nhất kèm theo **Match Score (%)**.
- **Danh sách Việc làm (Jobs List):** Hệ thống thẻ việc làm (Job Card) hiển thị mức lương, kỹ năng yêu cầu và vị trí. Có bộ lọc (Filter) bên trái để lọc theo ngành nghề, mức lương.
- **Trang Chi tiết Công ty (Company Profile):** Nơi hiển thị thông tin giới thiệu, hình ảnh văn phòng và danh sách các việc làm đang mở của công ty đó.

> **[CHÈN ẢNH TẠI ĐÂY]** Chụp màn hình Trang chủ với thanh Tìm kiếm.
> **[CHÈN ẢNH TẠI ĐÂY]** Chụp kết quả trả về của AI Live Matching (hiển thị % Match Score).
> **[CHÈN ẢNH TẠI ĐÂY]** Chụp giao diện Trang chi tiết một công việc (Job Detail) hiển thị đầy đủ JD.
> **[CHÈN ẢNH TẠI ĐÂY]** Chụp giao diện Trang Hồ sơ Công ty (FPT / Shopee / VNG...).

### 8.2. Hệ thống Tài khoản & Xác thực (Authentication)
Bảo vệ hệ thống với đa phương thức xác thực và giao diện thân thiện:
- **Đăng nhập/Đăng ký Đa kênh:** Hỗ trợ đăng nhập bằng tài khoản nội bộ (Local) hoặc thông qua tài khoản Google (OAuth 2.0).
- **Quên mật khẩu (OTP):** Giao diện yêu cầu khôi phục mật khẩu. Hệ thống gửi mã OTP 6 số qua Email thực để người dùng thiết lập lại mật khẩu.

> **[CHÈN ẢNH TẠI ĐÂY]** Chụp màn hình Form Đăng nhập / Đăng ký (Có nút Google).
> **[CHÈN ẢNH TẠI ĐÂY]** Chụp màn hình Nhập mã OTP Khôi phục mật khẩu.
> **[CHÈN ẢNH TẠI ĐÂY]** Chụp màn hình hộp thư Gmail nhận được mã OTP từ hệ thống.

### 8.3. Phân hệ Ứng viên (Candidate Portal)
Khu vực dành riêng cho người tìm việc, tối ưu hóa tỷ lệ trúng tuyển nhờ Trợ lý AI:
- **Quản lý Profile (Hồ sơ):** Giao diện cho phép ứng viên nhập thông tin cá nhân, cập nhật kỹ năng, trình độ học vấn.
- **Tự động trích xuất CV (AI CV Parser):** Khi ứng viên upload file CV (PDF/DOCX), hệ thống tự động bóc tách từ khóa kỹ năng và điền vào form.
- **Xuất PDF Hồ sơ:** Ứng viên có thể bấm một nút để "in" thẳng Profile của mình trên web thành một bản CV PDF tiêu chuẩn A4.
- **Quản lý Ứng tuyển & Lưu việc làm:** Theo dõi trạng thái hồ sơ (Chờ duyệt, Phỏng vấn, Đậu/Rớt) và các việc làm đã Bookmark.
- **✨ Trợ lý AI Lộ trình (Career Path):** Dựa vào bộ kỹ năng hiện có, AI phân tích và bật Popup gợi ý các kỹ năng nên học tiếp theo (Next Skills) và định hướng sự nghiệp.
- **✨ Trợ lý AI Viết Cover Letter:** Tại form Nộp đơn (Apply Job), ứng viên bấm nút để AI tự sinh ra Thư xin việc (Cover Letter) khớp hoàn hảo giữa kỹ năng của ứng viên và JD của công ty.

> **[CHÈN ẢNH TẠI ĐÂY]** Chụp màn hình Trang Hồ sơ Ứng viên (Profile Page).
> **[CHÈN ẢNH TẠI ĐÂY]** Chụp màn hình Popup "✨ AI Gợi Ý Định Hướng Nghề Nghiệp" (Career Path).
> **[CHÈN ẢNH TẠI ĐÂY]** Chụp màn hình Modal Nộp đơn, hiển thị đoạn Cover Letter do AI vừa viết.
> **[CHÈN ẢNH TẠI ĐÂY]** Chụp màn hình chức năng In/Xuất PDF Hồ sơ ứng viên.

### 8.4. Phân hệ Nhà tuyển dụng (Employer Portal)
Bảng điều khiển (Dashboard) quyền lực giúp quản trị toàn bộ vòng đời tuyển dụng:
- **Biểu đồ Thống kê (Analytics):** Biểu đồ Recharts hiển thị số lượng hồ sơ nộp vào theo thời gian thực (Line Chart, Bar Chart).
- **Quản lý Việc làm (CRUD):** Giao diện Thêm, Sửa, Xóa tin tuyển dụng.
- **✨ AI Viết JD (Job Description):** Trong form tạo Job, nhập Chức danh và Kỹ năng rồi bấm nút, AI Gemini sẽ tự động sinh ra JD dài và chuyên nghiệp trong 15s.
- **Quản trị Hồ sơ (Kanban Board):** Tính năng "ăn tiền" nhất của hệ thống. Kéo-thả thẻ (Card) ứng viên qua 4 cột: Chờ duyệt → Phỏng vấn → Từ chối → Nhận việc.
- **✨ AI Đánh giá & Sinh câu hỏi phỏng vấn:** Bấm vào thẻ ứng viên trên Kanban, AI sẽ đối chiếu CV với JD để đưa ra Đánh giá (Khuyên nhận/loại) và sinh ra 5 câu hỏi phỏng vấn kỹ thuật hóc búa.
- **Gửi Email Tự động:** Mỗi lần kéo-thả đổi trạng thái, hệ thống ngầm gửi Email HTML tuyệt đẹp (Thư mời phỏng vấn, Thư cảm ơn...) tới Gmail của ứng viên.

> **[CHÈN ẢNH TẠI ĐÂY]** Chụp màn hình Biểu đồ Thống kê Dashboard của Nhà tuyển dụng.
> **[CHÈN ẢNH TẠI ĐÂY]** Chụp màn hình Form Tạo Việc Làm lúc đang điền và bấm nút "✨ AI Viết JD".
> **[CHÈN ẢNH TẠI ĐÂY]** Chụp màn hình Bảng Kanban Kéo-thả quản lý hồ sơ ứng viên.
> **[CHÈN ẢNH TẠI ĐÂY]** Chụp màn hình Popup Đánh giá Ứng viên & Danh sách Câu hỏi phỏng vấn do AI sinh ra.
> **[CHÈN ẢNH TẠI ĐÂY]** Chụp màn hình Email HTML thực tế (Thư mời phỏng vấn / Thư từ chối) trong Gmail ứng viên.

### 8.5. Phân hệ Quản trị viên (Admin Dashboard)
Khu vực kiểm soát quyền lực cao nhất toàn hệ thống (Superuser):
- **Tổng quan Hệ thống (Overview):** Hiển thị tổng số User, tổng số Công ty, Việc làm, và Hồ sơ rác.
- **Quản lý User:** Bảng danh sách toàn bộ người dùng, chức năng Khóa (Ban) / Mở khóa tài khoản chỉ với 1 click.
- **Kiểm duyệt Công ty (Verify Company):** Xác thực độ uy tín của các nhà tuyển dụng mới đăng ký (Cấp dấu tick xanh `isVerified`).
- **Quản lý Tin tuyển dụng rác:** Quyền xóa bất kỳ tin tuyển dụng nào vi phạm quy chế.

> **[CHÈN ẢNH TẠI ĐÂY]** Chụp màn hình Tổng quan Dashboard Admin.
> **[CHÈN ẢNH TẠI ĐÂY]** Chụp màn hình Bảng Quản lý User (hiển thị các nút Khóa/Mở khóa).
> **[CHÈN ẢNH TẠI ĐÂY]** Chụp màn hình Bảng Kiểm duyệt Công ty (Duyệt tick xanh).

### 8.6. Tính năng Hệ thống chung (System-wide Features)
- **Thông báo Realtime (Websocket):** Sau khi đăng nhập, nút chuông (🔔) hiện ra ở góc phải thanh Navbar. Khi có hồ sơ nộp vào hoặc trạng thái thay đổi, số đỏ tự nảy lên ngay tức khắc (không cần F5) nhờ Socket.io.
- **Chế độ Sáng/Tối (Dark Mode):** Nút chuyển đổi ☀️/🌙 nằm cạnh chuông thông báo trên Navbar (hiện sau khi đăng nhập). Click một lần để chuyển toàn bộ giao diện sang Dark Mode.

> **[CHÈN ẢNH TẠI ĐÂY]** Chụp góc trên bên phải Navbar khi đã đăng nhập: hiển thị chuông 🔔 đang có số đỏ + nút ☀️/🌙 Dark Mode.
> **[CHÈN ẢNH TẠI ĐÂY]** Chụp toàn trang (ví dụ trang danh sách Job) ở chế độ Dark Mode sau khi bật.

---

## 9. Cấu Trúc Thư Mục (Source Code Tree)

```
Do-An-Job-Portal/
├── backend/
│   ├── server.js                    # Entry point, kết nối MongoDB, khởi tạo Socket.io
│   ├── src/
│   │   ├── app.js                   # Express setup (middleware stack, routes, error handler)
│   │   ├── socket.js                # Socket.io init & room management
│   │   ├── models/                  # 5 Mongoose Models
│   │   │   ├── User.model.js
│   │   │   ├── Company.model.js
│   │   │   ├── Job.model.js
│   │   │   ├── Application.model.js
│   │   │   └── Notification.model.js
│   │   ├── controllers/             # 8 Controllers (business logic)
│   │   │   ├── auth.controller.js
│   │   │   ├── job.controller.js
│   │   │   ├── application.controller.js
│   │   │   ├── company.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── admin.controller.js
│   │   │   ├── notification.controller.js
│   │   │   └── stats.controller.js
│   │   ├── services/                # 3 Service modules
│   │   │   ├── matching.service.js  # ★ Thuật toán Matching lõi
│   │   │   ├── email.service.js     # ★ 4 HTML Email templates + SMTP
│   │   │   └── token.service.js     # JWT generate/verify
│   │   ├── middlewares/             # 6 Middlewares
│   │   │   ├── auth.middleware.js   # JWT protect
│   │   │   ├── role.middleware.js   # RBAC restrictTo
│   │   │   ├── validate.middleware.js
│   │   │   ├── upload.middleware.js # Multer (resume + logo)
│   │   │   ├── error.middleware.js  # Global error handler
│   │   │   └── responseHandler.js   # Attach ApiResponse methods
│   │   ├── routes/                  # 9 Route files
│   │   ├── validators/              # Joi schemas (job.validator.js)
│   │   └── utils/                   # ApiError, ApiResponse, cvExtractor
│   ├── tests/
│   │   └── matching.service.test.js # ★ 16 Unit Tests
│   └── uploads/                     # File storage (resumes/, logos/)
│
├── frontend/
│   ├── next.config.ts               # Rewrites (proxy uploads)
│   ├── src/
│   │   ├── app/                     # Next.js App Router
│   │   │   ├── (public)/            # Landing, Jobs list, Company
│   │   │   ├── (auth)/              # Login, Register, Forgot Password
│   │   │   ├── candidate/           # Profile, Applications, Saved Jobs
│   │   │   ├── employer/            # Dashboard, Jobs CRUD, Kanban, Calendar
│   │   │   └── admin/               # Dashboard, Users, Companies, Settings
│   │   ├── components/
│   │   │   ├── shared/              # 18 shared components
│   │   │   ├── public/              # Landing page sections
│   │   │   ├── employer/            # KanbanBoard, JobForm, AnalyticsChart
│   │   │   ├── admin/               # MazerSidebar
│   │   │   ├── layouts/             # Navbar, Footer
│   │   │   ├── providers/           # ThemeProvider
│   │   │   └── ui/                  # shadcn UI components
│   │   ├── lib/
│   │   │   ├── axios.ts             # Axios instance + interceptors
│   │   │   └── api/                 # 5 API modules (auth, jobs, applications, companies, users)
│   │   ├── store/                   # 2 Zustand stores (auth, notification)
│   │   └── types/                   # TypeScript interfaces
│   └── public/
│       └── images/icons/            # Custom SVG icons
│
└── PROJECT_DESCRIPTION.md           # File này
```

---

## 10. Kết Luận & Định Hướng Phát Triển

### 10.1. Tổng kết
Đồ án đã xây dựng thành công một hệ thống tuyển dụng IT hoàn chỉnh với nhiều điểm nhấn kỹ thuật nổi bật:
- **Thuật toán AI Matching** với bộ chuẩn hóa từ đồng nghĩa + prefix matching + tính điểm phần trăm chính xác.
- **State Machine Kanban Board** kéo-thả trực quan, kích hoạt tự động hóa 3 kênh (DB + Socket + Email).
- **MongoDB Full-text Search** có trọng số + **Aggregation Pipeline** cho thống kê theo ngành.
- **Xác thực đa kênh** (Local + Google OAuth + OTP email) với hệ thống middleware bảo mật 5 tầng.
- **AI Parser CV** tự động trích xuất kỹ năng từ PDF/DOCX.
- **Email HTML template chuyên nghiệp** gửi qua SMTP Gmail thật cho mọi trạng thái ứng tuyển.
- **Unit Test** bao phủ 100% thuật toán lõi Matching (16 test case, bao gồm chống false positive).
- **Trợ lý AI Tạo sinh (Generative AI)** tự động hóa quy trình cho cả Ứng viên (Sinh Lộ trình, Viết Cover Letter) và Nhà tuyển dụng (Viết JD, Sinh Câu hỏi phỏng vấn, Đánh giá Ứng viên).

### 10.2. Định hướng phát triển
- Nâng cấp CV Parser thành mô hình AI/NLP (Natural Language Processing) để hiểu ngữ cảnh sâu hơn thay vì chỉ khớp từ khóa.
- Triển khai container hóa (Docker/Kubernetes) và CI/CD tự động.
- Bổ sung Realtime Chat giữa ứng viên và nhà tuyển dụng.
- Tích hợp hệ thống thanh toán cho gói tuyển dụng Premium.
- Phát triển ứng dụng di động (React Native) kế thừa API hiện có.
