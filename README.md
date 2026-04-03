# EduMerge — Admission Management & CRM

A web-based Admission Management System for colleges to manage programs, quotas, applicants, seat allocation, and admission confirmations.

## Tech Stack

| Layer     | Technology                     |
|-----------|-------------------------------|
| Frontend  | React 18, Vite 4, Tailwind CSS |
| Backend   | Node.js, Express.js            |
| Database  | MongoDB (local)                |
| Auth      | JWT (role-based)               |



---

## Prerequisites

- **Node.js** >= 14.18 (tested on v14.21.3)
- **MongoDB** running locally on `mongodb://localhost:27017`
- **npm** >= 6

---

## Setup Instructions

### 1. Clone / Download

```bash
cd /path/to/your/workspace
```

### 2. Install All Dependencies

```bash
# From the root directory
npm run install:all
```

This installs packages for root, server, and client.

Alternatively, install manually:
```bash
npm install               # root
cd server && npm install  # backend
cd ../client && npm install  # frontend
```

### 3. Configure Environment

The server `.env` file is pre-created at `server/.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/edumerge
JWT_SECRET=edumerge_jwt_secret_2024_xK9mN2pQrT8sL3wD
CLIENT_URL=http://localhost:5173
```

> Make sure MongoDB is running: `sudo systemctl start mongod` (Linux) or `brew services start mongodb-community` (Mac)

### 4. Seed the Database

```bash
npm run seed
# or: cd server && node seed.js
```

This creates:
- 3 user accounts (see credentials below)
- 1 sample institution, campus, department, program, and seat matrix

### 5. Start the Application

```bash
# Run both server and client together
npm run dev
```

Or start separately:
```bash
npm run server   # Backend on http://localhost:5000
npm run client   # Frontend on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## Demo Credentials

| Role              | Email                       | Password    |
|-------------------|-----------------------------|-------------|
| Admin             | admin@edumerge.com          | Admin@123   |
| Admission Officer | officer@edumerge.com        | Officer@123 |
| Management View   | management@edumerge.com     | Mgmt@123    |

> The login page also has quick-fill buttons for each role.

---

## User Roles & Permissions

| Feature                     | Admin | Admission Officer | Management |
|-----------------------------|:-----:|:-----------------:|:----------:|
| Dashboard                   | ✓     | ✓                 | ✓          |
| Create Institutions         | ✓     | ✗                 | ✗          |
| Create Campuses/Depts       | ✓     | ✗                 | ✗          |
| Create Programs             | ✓     | ✗                 | ✗          |
| Configure Seat Matrix       | ✓     | ✗                 | ✗          |
| Create/Edit Applicants      | ✓     | ✓                 | ✗          |
| Allocate Seats              | ✓     | ✓                 | ✗          |
| Update Document/Fee Status  | ✓     | ✓                 | ✗          |
| Confirm Admission           | ✓     | ✓                 | ✗          |
| View Confirmed Admissions   | ✓     | ✓                 | ✓          |

---

## Key Features

### 1. Seat Matrix & Quota Control
- Configure KCET / COMEDK / Management quota seats per program
- Total base quotas must equal program intake (validated on save)
- Real-time seat counters updated on each allocation
- **Atomic seat allocation** — race-condition-safe using MongoDB conditional update

### 2. Admission Workflow
```
Create Applicant → Allocate Seat → Verify Documents → Mark Fee Paid → Confirm Admission
```
- Seat allocation blocked if quota is full
- Admission confirmation requires: seat allocated + fee paid
- Rejected applicants automatically release their seat back to the quota

### 3. Admission Number Generation
Format: `INST/YEAR/COURSETYPE/PROGCODE/QUOTA/SEQUENCE`

Example: `SVCE/2026/UG/CSE/KCET/0001`

- Generated only once per applicant (immutable)
- Sequential counter per program+quota+year combination
- Atomic counter increment (no duplicates possible)

### 4. Dashboard
- Total intake vs admitted per program
- Quota-wise filled / remaining seats with visual progress bars
- Applicant status breakdown (pending, allocated, confirmed, rejected)
- Pending documents and fee counts

---

## Project Structure

```
├── package.json              # Root: scripts for running both
├── server/
│   ├── .env                  # Environment variables
│   ├── server.js             # Express app entry point
│   ├── seed.js               # Database seeder
│   ├── config/db.js          # MongoDB connection
│   ├── middleware/auth.js    # JWT + role-based auth middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Institution.js
│   │   ├── Campus.js
│   │   ├── Department.js
│   │   ├── Program.js
│   │   ├── SeatMatrix.js
│   │   ├── Applicant.js
│   │   └── AdmissionCounter.js
│   └── routes/
│       ├── auth.js
│       ├── institutions.js
│       ├── campuses.js
│       ├── departments.js
│       ├── programs.js
│       ├── seatMatrix.js
│       ├── applicants.js     # Includes allocate/confirm logic
│       └── dashboard.js
└── client/
    ├── vite.config.js        # Proxy /api → localhost:5000
    ├── tailwind.config.js
    └── src/
        ├── App.jsx           # Routes + role guards
        ├── context/AuthContext.jsx
        ├── services/api.js   # Axios instance
        ├── components/
        │   ├── Layout.jsx
        │   ├── Sidebar.jsx   # Role-based navigation
        │   └── Modal.jsx
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── master/       # Institutions, Campuses, Depts, Programs, SeatMatrix
            ├── applicants/   # List, Form, Detail (+ all actions)
            └── admissions/   # Confirmed admissions list
```

---

## API Endpoints

| Method | Endpoint                          | Description                        |
|--------|-----------------------------------|------------------------------------|
| POST   | /api/auth/login                   | Login                              |
| GET    | /api/auth/me                      | Current user                       |
| POST   | /api/auth/register                | Register user (admin only)         |
| GET    | /api/institutions                 | List institutions                  |
| POST   | /api/institutions                 | Create institution                 |
| PUT    | /api/institutions/:id             | Update institution                 |
| GET    | /api/campuses                     | List campuses                      |
| GET    | /api/departments                  | List departments                   |
| GET    | /api/programs                     | List programs                      |
| GET    | /api/seat-matrix                  | List seat matrices                 |
| POST   | /api/seat-matrix                  | Create seat matrix                 |
| PUT    | /api/seat-matrix/:id              | Update seat matrix                 |
| GET    | /api/applicants                   | List applicants (filterable)       |
| POST   | /api/applicants                   | Create applicant                   |
| GET    | /api/applicants/:id               | Get applicant detail               |
| PUT    | /api/applicants/:id               | Update applicant                   |
| POST   | /api/applicants/:id/allocate      | **Allocate seat (atomic)**         |
| PUT    | /api/applicants/:id/documents     | Update document status             |
| PUT    | /api/applicants/:id/fee           | Update fee status                  |
| POST   | /api/applicants/:id/confirm       | **Confirm admission + generate #** |
| PUT    | /api/applicants/:id/reject        | Reject (releases seat)             |
| GET    | /api/dashboard                    | Dashboard stats                    |

---

## Business Rules Implemented

1. ✅ Quota seats total must equal program intake
2. ✅ No seat allocation if quota is full (returns error with remaining count)
3. ✅ Atomic seat allocation (MongoDB conditional update prevents double-booking)
4. ✅ Admission number generated exactly once (immutable after creation)
5. ✅ Admission confirmation requires fee = Paid
6. ✅ Seat counters update in real-time on allocation
7. ✅ Rejected applicants release their quota seat back
8. ✅ Confirmed applicants cannot be edited

## Out of Scope (as per BRS)
- Payment gateway integration
- SMS/WhatsApp notifications
- Multi-college complex scenarios
- Marketing automation
- AI predictions
