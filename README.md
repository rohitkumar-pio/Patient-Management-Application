# Patient Management Application

A modern web-based patient management system designed for medical practices to streamline consultation workflows, patient records, appointments, and prescription management.

## 🚀 Features

- **Patient Management**: Register, search, and manage patient profiles with comprehensive data
- **Authentication System**: Secure JWT-based authentication with protected routes
- **Consultation Workflow**: Record patient complaints, vitals, diagnosis, and medications
- **Prescription Printing**: Generate and print professional prescriptions with customizable clinic info
- **Appointment Scheduling**: Schedule and track patient appointments with status management
- **Patient History**: View complete patient visit history with filtering capabilities
- **Data Export**: Export patient and visit data in CSV/PDF formats
- **Real-time Search**: Fast patient search with < 5 second response time
- **Responsive Design**: Works seamlessly across desktop and tablet devices

## 🛠 Tech Stack

### Backend
- **Node.js** with **Express.js** - REST API server
- **TypeScript** - Type-safe development
- **Prisma** - Database ORM
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Jest & Supertest** - Testing framework

### Frontend
- **React 18** with **TypeScript** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Zustand** - State management
- **TanStack Query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first styling
- **Vitest** - Testing framework

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PostgreSQL** (v14 or higher)
- **Git** (for version control)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
cd c:\Work\Copilot-AI\worktrees\foundation
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory (see `.env.example`):

```env
DATABASE_URL="postgresql://username:password@localhost:5432/patient_management"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"
PORT=5000
NODE_ENV="development"
```

### 3. Database Setup

```bash
# Run Prisma migrations to create database schema
cd backend
npx prisma migrate dev

# (Optional) Seed the database with test data
npx prisma db seed

# Open Prisma Studio to view/edit data (GUI)
npx prisma studio
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory (see `.env.example`):

```env
VITE_API_URL="http://localhost:5000/api"
```

## 🚀 Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on: **http://localhost:5000**

Health check: **http://localhost:5000/api/health**

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend will run on: **http://localhost:5173**

### Access the Application

Open your browser and navigate to: **http://localhost:5173**

**Test Login Credentials:**
- Email: `doctor@test.com`
- Password: `password123`

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm test -- --ui
```

### Type Checking

```bash
# Backend TypeScript check
cd backend
npx tsc --noEmit

# Frontend TypeScript check
cd frontend
npx tsc --noEmit
```

## 📦 Building for Production

### Backend Build

```bash
cd backend
npm run build

# Start production server
npm start
```

### Frontend Build

```bash
cd frontend
npm run build

# Preview production build
npm run preview
```

## 🗄 Database Commands

### Create New Migration

```bash
cd backend
npx prisma migrate dev --name your_migration_name
```

### Apply Migrations (Production)

```bash
cd backend
npx prisma migrate deploy
```

### Reset Database (Development Only - ⚠️ Deletes All Data)

```bash
cd backend
npx prisma migrate reset
```

### Generate Prisma Client (After Schema Changes)

```bash
cd backend
npx prisma generate
```

## 📁 Project Structure

```
foundation/
├── backend/
│   ├── src/
│   │   ├── app.ts                 # Express app configuration
│   │   ├── server.ts              # Server entry point
│   │   ├── config/
│   │   │   └── database.ts        # Database connection
│   │   ├── controllers/           # Request handlers
│   │   ├── middleware/            # Auth, error handling, logging
│   │   ├── routes/                # API routes
│   │   ├── services/              # Business logic
│   │   ├── utils/                 # Helper functions
│   │   └── validators/            # Request validation schemas
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/            # Migration history
│   ├── tests/                     # Backend tests
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx                # Main app component
│   │   ├── main.tsx               # Entry point
│   │   ├── components/            # Reusable components
│   │   ├── pages/                 # Page components
│   │   ├── stores/                # Zustand state stores
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── lib/                   # API client
│   │   ├── types/                 # TypeScript types
│   │   └── utils/                 # Helper functions
│   ├── tests/                     # Frontend tests
│   └── package.json
└── README.md
```

## 🔐 Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/dbname` |
| `JWT_SECRET` | Secret key for JWT signing | `your-super-secret-key` |
| `JWT_EXPIRES_IN` | JWT token expiration time | `24h`, `7d` |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode | `development`, `production` |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

## 📚 API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Patients

- `GET /api/patients` - List patients (with search & pagination)
- `POST /api/patients` - Create patient
- `GET /api/patients/:id` - Get single patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Visits

- `POST /api/visits` - Create visit with medications
- `GET /api/patients/:patientId/visits` - Get patient visits
- `GET /api/visits/:id` - Get single visit
- `PUT /api/visits/:id` - Update visit
- `DELETE /api/visits/:id` - Delete visit

### Appointments

- `POST /api/appointments` - Schedule appointment
- `GET /api/appointments` - List appointments (by date)
- `GET /api/appointments/today` - Today's appointments
- `PATCH /api/appointments/:id/status` - Update status
- `DELETE /api/appointments/:id` - Delete appointment

### Prescriptions

- `GET /api/visits/:id/prescription` - Generate and download prescription PDF

## 🎯 Performance Targets

- **Page Load Time**: < 2 seconds
- **Patient Search**: < 5 seconds
- **Consultation Record**: 2-3 minutes
- **Prescription Generation**: < 10 seconds
- **History Retrieval**: < 5 seconds

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Verify PostgreSQL is running
# Windows: Check Services (services.msc)

# Test connection
psql -U postgres

# Recreate database
createdb patient_management
```

### Port Already in Use

```bash
# Backend (port 5000)
# Find process: netstat -ano | findstr :5000
# Kill process: taskkill /PID <PID> /F

# Frontend (port 5173)
# Find process: netstat -ano | findstr :5173
# Kill process: taskkill /PID <PID> /F
```

### Prisma Client Not Generated

```bash
cd backend
npx prisma generate
```

### Module Not Found Errors

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Write tests for new functionality
4. Run all tests and builds
5. Commit with descriptive messages
6. Push and create a Pull Request

## 📝 License

This project is proprietary and confidential.

## 👥 Authors

- Development Team

## 🔄 Version

**v1.0.0** - Foundation Phase Complete

---

## 📞 Support

For issues or questions, please contact the development team.

---

**Last Updated**: May 8, 2026