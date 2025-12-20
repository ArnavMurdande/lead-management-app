# LeadFlow – Lead Management Application

LeadFlow is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) application designed to manage customer leads efficiently with secure authentication, role-based access control, advanced lead operations, and analytics dashboards. The project demonstrates a scalable, secure, and user-friendly CRM-style system.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based secure authentication
- Role-Based Access Control (RBAC)
- User roles:
  - Super Admin
  - Sub-Admin
  - Support Agent

### 👥 User Management
- Super Admin can create, edit, and delete Sub-Admins and Support Agents
- Role-based access restrictions enforced across the application

### 📋 Lead Management
- Create, Read, Update, and Delete (CRUD) leads
- Lead details include:
  - Name
  - Email
  - Phone
  - Source
  - Status (New, Contacted, Qualified, Lost, Won)
  - Tags
  - Notes / Comments
  - Assigned Agent
  - Created and Updated timestamps
- Admins can assign leads to Support Agents
- Support Agents can view and update only their assigned leads

### 🏷️ Advanced Lead Features
- Tag creation and management
- Advanced filtering by:
  - Status
  - Tags
  - Assigned Agent
  - Date range
  - Search by name, email, or phone
- Import leads from Excel files
- Export filtered lead data to Excel

### 📊 Dashboard & Analytics
- Overview of total leads
- Lead status distribution
- Agent performance metrics
- Recent activity log

---

## 🛠️ Tech Stack

- Frontend: React.js (Vite), Material UI
- Backend: Node.js, Express.js
- Database: MongoDB Atlas
- Authentication: JWT, bcrypt
- File Handling: XLSX

---

## 📦 Prerequisites

- Node.js (https://nodejs.org/)
- MongoDB Atlas (Free Tier)

Example MongoDB connection string format:
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/leadDB

---

## ⚙️ Setup & Running Locally

The project contains two folders:
- server (Backend)
- client (Frontend)

### Backend Setup

Steps:
1. Open terminal
2. Run the following commands:

cd server
npm install

3. Create a file named .env inside the server folder with the following content:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

4. Create initial Super Admin user (run once):

npm run seed

Default Super Admin credentials:
Email: admin@example.com
Password: password123

5. Start backend server:

npm run dev

Backend runs on:
http://localhost:5000

---

### Frontend Setup

Steps:
1. Open a new terminal
2. Run the following commands:

cd client
npm install
npm run dev

Frontend runs on:
http://localhost:5173

---

## 🧭 Usage

1. Login using Super Admin credentials
2. Create Sub-Admins and Support Agents from the Users page
3. Manage leads from the Leads page (Add, Edit, Assign, Import, Export)
4. Use filters to search and segment leads
5. View analytics and performance metrics on the Dashboard


---

## 🌐 Deployment

- Frontend: Netlify / Vercel
- Backend: Render / Railway / Fly.io
- Database: MongoDB Atlas

---

## 📄 License

This project is licensed under the MIT License.
