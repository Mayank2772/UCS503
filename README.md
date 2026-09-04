# 🎓 CampusConnect – College Placement Management System

A full-stack web-based placement management portal built to simplify the interaction between **students** and the **college placement cell**. CampusConnect provides a centralized platform for placement drives, eligibility checking, applications, document management, and application tracking.

---

## 📌 Project Overview

CampusConnect replaces scattered placement notices and manual processes with one unified portal where students can:

- Register & Login using institute email
- Complete academic profile
- Browse placement drives
- Check eligibility (CGPA, Branch, Backlogs)
- Apply for companies
- Track application status
- Receive notifications

Admins can manage drives, verify documents, review applications, and update placement status.

---

## 🚀 Features

### 👨‍🎓 Student
- Secure Registration & Login (JWT)
- Profile Management
- Resume & Document Upload
- Browse Placement Drives
- Search & Filter Companies
- Eligibility Checking
- Apply for Placement
- Track Application Status
- In-app Notifications

### 👩‍💼 Placement Admin
- Manage Students
- Create / Update / Delete Drives
- Set Eligibility Criteria
- Review Applications
- Verify Documents
- Shortlist / Reject Candidates
- Generate Placement Reports

---

## 🛠️ Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcryptjs |
| API | REST API |

---

## 🏗️ System Architecture

Frontend (React + Vite)
↓
REST API (Express.js)
↓
Business Logic
↓
MongoDB Database

---

## 📂 Project Structure

```text
CampusConnect/
├── client/
│   ├── pages/
│   ├── components/
│   └── services/
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── config/
│
├── docs/
└── README.md
```

---

## 🔐 Authentication

- JWT-based Authentication
- Password hashing using bcryptjs
- Role-Based Authorization
- Protected API Routes

---

## 🗄️ Database Collections

- Users
- Students
- Admins
- Drives
- Applications
- Documents
- Notifications

---

## 📡 REST APIs

| Module | Endpoint |
|---------|----------|
| Login | `POST /api/auth/login` |
| Register | `POST /api/auth/register` |
| Student Profile | `GET /api/students/profile` |
| Update Profile | `PUT /api/students/profile` |
| Drives | `GET /api/drives` |
| Eligibility | `GET /api/drives/:id/eligibility` |
| Apply | `POST /api/applications/apply/:driveId` |
| My Applications | `GET /api/applications/my` |

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/your-username/CampusConnect.git
cd CampusConnect
```

### Install Dependencies

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

### Environment Variables

Create a `.env` file inside `server/`

```env
PORT=5000
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

### Run Project

```bash
# Backend
npm run dev

# Frontend
npm run dev
```

---

## 📖 Workflow

1. Student Login
2. Dashboard
3. Browse Placement Drives
4. View Drive Details
5. Check Eligibility
6. Apply for Drive
7. Upload Documents
8. Review & Submit
9. Track Application Status

---

## 🎯 Future Enhancements

- Email Notifications
- Resume Parser
- Interview Scheduling
- Company Portal
- Analytics Dashboard

---

## 👥 Team

- **Paryag Bansal**
- **Mayank Garg**
- **Aashana**

---

## 📄 License

This project is developed as a **Software Engineering Course Project** at **Thapar Institute of Engineering & Technology**.