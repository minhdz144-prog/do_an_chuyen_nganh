[README_do_an_chuyen_nganh.md](https://github.com/user-attachments/files/31858507/README_do_an_chuyen_nganh.md)
# 💼 IT Job Portal — Recruitment & Job Matching Platform

A full-stack job portal built specifically for the IT industry, connecting **Candidates** and **Employers** through a smart skill-matching engine.

> Capstone Project — Nguyen Tat Thanh University, 2026  
> Supervisor: ThS. Phạm Mạnh Trung Nguyên

---

## ✨ Key Features

### For Candidates
- Create profile with tech stack, experience level, and resume upload
- **AI CV Parser** — upload PDF/DOCX, system auto-extracts skills using keyword matching
- Browse and search jobs with full-text search + multi-filter (location, job type, salary, level)
- **AI Job Recommendations** — get ranked job suggestions with a Match Score based on your skills
- Apply to jobs, track application status in real-time
- Export profile as a clean PDF resume

### For Employers
- Create and manage Company Profile (requires Admin verification)
- Post, edit, close job listings
- **Kanban Board** — drag-and-drop candidates across 5 stages: Applied → Reviewing → Interview → Offered → Rejected
- Recruitment analytics dashboard (Recharts)

### For Admin
- System statistics dashboard
- Verify companies (grant `isVerified` badge)
- Lock/unlock user accounts

---

## 🧠 Core Algorithm — Skill Matching Engine

Standard Jaccard Similarity penalizes candidates who have *more* skills than required. This project uses a **Precision-based approach** instead:

```
Match Score = (|Candidate Skills ∩ Job Required Skills|) / |Job Required Skills| × 100
```

**Pre-processing pipeline:**
1. Normalize strings (lowercase, strip special chars)
2. Map synonyms: `reactjs → react`, `nodejs → node`, `k8s → kubernetes` (12 pairs)
3. Prefix/substring matching with length guard (prevents `Java` matching `JavaScript`)

---

## 🏗️ Architecture

```
┌─────────────────────┐     HTTP/REST      ┌──────────────────────────┐
│   Frontend (Next.js) │ ◄────────────────► │  Backend (Express.js)    │
│   App Router + SSR   │                    │  JWT · RBAC · Helmet     │
│   TailwindCSS        │     WebSocket      │  Rate Limit · Joi        │
│   Zustand            │ ◄────────────────► │  Socket.io               │
└─────────────────────┘                    └──────────┬───────────────┘
                                                       │
                                           ┌───────────▼───────────────┐
                                           │  MongoDB Atlas            │
                                           │  User · Company · Job     │
                                           │  Application · Notification│
                                           └───────────────────────────┘
```

**Notification System (3 parallel channels on every status change):**
- 🗄️ DB — saved to `Notification` collection
- ⚡ Socket.io — real-time push to candidate's room
- 📧 Nodemailer — HTML email via Gmail SMTP (fire-and-forget)

**Application State Machine:**
```
applied → reviewing → interview → offered (terminal)
                   ↘            ↘
                    rejected (terminal, reachable from any state)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 13+ (App Router, SSR), TypeScript, TailwindCSS, Shadcn UI, Zustand |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB Atlas, Mongoose ODM |
| Auth | JWT (stateless), Google OAuth 2.0, Bcrypt (12 rounds) |
| Realtime | Socket.io |
| Email | Nodemailer + Gmail SMTP |
| File Processing | pdf-parse, mammoth (CV parsing) |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas (DB) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)

### Backend
```bash
cd server
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, GMAIL credentials
npm run dev
```

### Frontend
```bash
cd client
npm install
cp .env.example .env.local   # fill in NEXT_PUBLIC_API_URL
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
├── server/
│   ├── controllers/
│   ├── services/
│   │   ├── matching.service.js   ← Skill-matching algorithm
│   │   ├── email.service.js      ← Nodemailer templates
│   │   └── cv-extractor.service.js
│   ├── middlewares/              ← JWT, RBAC, validation, rate-limit
│   ├── models/                   ← Mongoose schemas
│   └── routes/
└── client/
    ├── app/                      ← Next.js App Router pages
    ├── components/
    └── store/                    ← Zustand stores (authStore, notificationStore)
```

---

## 📄 License

Academic project — Nguyen Tat Thanh University © 2026
