# Lead Management Application

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing customer leads with Role-Based Access Control (RBAC).

## Features

- **Authentication**: Secure login with JWT.
- **Roles**: Super Admin, Sub-Admin, Support Agent.
- **Lead Management**: Create, Read, Update, Delete (CRUD) leads.
- **Assignment**: Admins can assign leads to agents.
- **Filtering**: Advanced filtering by Status, Tags, Search, Agent, and Date Range.
- **Import/Export**: Import leads from Excel, Export filtered leads to Excel.
- **Dashboard**: Visual statistics and performance metrics.

## Prerequisites

- **Node.js**: [Download and Install](https://nodejs.org/)
- **MongoDB Atlas**: You need a running MongoDB cluster.
  1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
  2. Create a free cluster.
  3. Create a database user (e.g., `admin`).
  4. Allow IP access (0.0.0.0/0 for testing).
  5. Get the Connection String (driver Node.js).
  6. It should look like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/leadDB`.

## Setup & Running

This project consists of two parts: `server` (Backend) and `client` (Frontend).

### 1. Setup Backend (Server)

Open a terminal/command prompt and run:

```bash
cd server
npm install
```

**Configuration**:
The `.env` file is already created in `server/.env`. Ensure `MONGO_URI` is correct.

**Create Initial Admin User**:
Run this command once to create the Super Admin account:

```bash
npm run seed
```

_Creates user: `admin@example.com` / `password123`_

**Start Server**:

```bash
npm run dev
```

The server will run on `http://localhost:5000`.

### 2. Setup Frontend (Client)

Open a **new** terminal window and run:

```bash
cd client
npm install
```

**Start Client**:

```bash
npm run dev
```

The application will open at `http://localhost:5173`.

## Usage Guide

1. **Login**: Use `admin@example.com` / `password123` to log in as Super Admin.
2. **Create Users**: Go to "Users" page to create Sub-Admins or Support Agents.
3. **Manage Leads**:
   - Go to "Leads" page.
   - Click "Add Lead" or "Import" (Excel).
   - Use Filters (Filter button) to search and filter leads.
   - Click "Edit" on a lead to assign it to an agent (if you are an Admin).
4. **Dashboard**: View charts and stats on the home page.

## Project Structure

- **server/**: Node.js/Express Backend
  - `models/`: Database schemas (User, Lead)
  - `controllers/`: Logic for handling requests
  - `routes/`: API endpoints
- **client/**: React Frontend
  - `src/pages/`: Main views (Dashboard, Leads, Users)
  - `src/components/`: Reusable components
  - `src/utils/`: API helpers
