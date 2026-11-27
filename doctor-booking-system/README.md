# ✚ CarePoint — Doctor Booking System

A fully integrated, full-stack doctor booking system with a **React** frontend, **AngularJS** frontend, and a **Node.js / Express / MongoDB Atlas** backend.

---

## 🌟 Features

| Feature | Details |
|---|---|
| **Authentication** | JWT-based register, login, logout, session restore |
| **Doctor Listing** | 6 specialists with specialty, experience, fee, rating |
| **Doctor Search** | Filter by name, specialty, or city in real time |
| **Appointment Booking** | Date + time slot selection, patient details form |
| **Duplicate Prevention** | Server-side check: same doctor + date + time is blocked |
| **Appointment Management** | View and cancel your own appointments |
| **Responsive UI** | Mobile-friendly design with teal/white CarePoint theme |
| **Dual Frontend** | React (Vite) on port 5173, AngularJS (file/live-server) on port 3001 |

---

## 🏗️ Technologies

### Backend
- Node.js + Express.js
- MongoDB Atlas (native driver)
- JSON Web Tokens (JWT)
- bcryptjs for password hashing
- dotenv, cors

### React Frontend
- React 18 + Vite
- React Router DOM v6
- Fetch API for HTTP requests

### AngularJS Frontend
- AngularJS 1.8.2
- angular-route for SPA routing
- CDN-delivered (no build step needed)

---

## 📁 Folder Structure

```
doctor-booking-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── data/
│   │   └── doctors.js            # Doctor seed data
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification
│   ├── models/
│   │   ├── User.js               # User collection methods
│   │   ├── Doctor.js             # Doctor model (static data)
│   │   └── Appointment.js        # Appointment collection methods
│   ├── routes/
│   │   ├── authRoutes.js         # POST /api/auth/*
│   │   ├── doctorRoutes.js       # GET /api/doctors/*
│   │   └── appointmentRoutes.js  # /api/appointments/*
│   ├── server.js                 # Express app entry point
│   ├── .env                      # Real credentials (not committed)
│   ├── .env.example              # Template for credentials
│   └── package.json
│
├── react-app/
│   ├── src/
│   │   ├── api.js                # Shared fetch helpers + auth utilities
│   │   ├── App.jsx               # Main app with doctor listing + booking
│   │   ├── Navbar.jsx            # Sticky nav with auth state
│   │   ├── Auth.jsx              # Login / Register modal
│   │   ├── BookingModal.jsx      # Appointment booking form + slot picker
│   │   ├── Appointments.jsx      # View & cancel appointments
│   │   ├── style.css             # Global styles
│   │   ├── Navbar.css
│   │   ├── Auth.css
│   │   ├── BookingModal.css
│   │   └── Appointments.css
│   ├── vite.config.js
│   ├── index.html
│   └── package.json
│
├── angular-app/
│   ├── index.html                # SPA shell + all ng-templates
│   ├── app.js                    # Module, services, controllers, filters
│   └── style.css
│
├── .gitignore
└── README.md
```

---

## 🌐 MongoDB Atlas Setup

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free **M0** cluster
3. Under **Database Access** → Add a database user (username + password)
4. Under **Network Access** → Add `0.0.0.0/0` (allow from anywhere) or your IP
5. Click **Connect** → **Connect your application** → copy the connection string
6. Replace `<password>` with your user password in the connection string

---

## ⚙️ Environment Variables

Create `backend/.env` using the provided `backend/.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/doctor_booking?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_secret_at_least_32_chars
JWT_EXPIRES_IN=7d
```

> ⚠️ **Never commit `.env` to version control.** It is listed in `.gitignore`.

---

## 📦 Dependency Installation

### Backend
```bash
cd doctor-booking-system/backend
npm install
```

### React Frontend
```bash
cd doctor-booking-system/react-app
npm install
```

### AngularJS Frontend
No install needed — AngularJS is loaded from CDN in `index.html`.

---

## 🚀 Running the Applications

### 1. Backend (Port 5000)
```bash
cd doctor-booking-system/backend
npm run dev
```
Or for production:
```bash
npm start
```

### 2. React Frontend (Port 5173)
```bash
cd doctor-booking-system/react-app
npm run dev
```
Open: [http://localhost:5173](http://localhost:5173)

### 3. AngularJS Frontend (Port 3001)

Install a simple static server if you don't have one:
```bash
npm install -g live-server
```
Then run:
```bash
cd doctor-booking-system/angular-app
live-server --port=3001
```
Or use VS Code **Live Server** extension → open `angular-app/index.html` → "Open with Live Server".

---

## 🔌 API Endpoints

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register a new user |
| `POST` | `/api/auth/login` | No | Login and receive JWT |
| `GET` | `/api/auth/me` | Yes | Get current user info |

### Doctors — `/api/doctors`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/doctors` | No | List all doctors (supports `?name=&specialty=&location=`) |
| `GET` | `/api/doctors/:id` | No | Get a single doctor |

### Appointments — `/api/appointments`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/appointments` | Yes | Book an appointment |
| `GET` | `/api/appointments` | Yes | List logged-in user's appointments |
| `GET` | `/api/appointments/:id` | Yes | Get a specific appointment |
| `DELETE` | `/api/appointments/:id` | Yes | Cancel an appointment |

---

## 🧪 Testing Guide

After starting the backend (`npm run dev`), you can test with curl or any REST client:

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"secret123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"secret123"}'
```

**Get Doctors:**
```bash
curl http://localhost:5000/api/doctors
```

**Book Appointment** (use token from login):
```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"doctorId":1,"patientName":"Jane Doe","email":"jane@example.com","phone":"9876543210","date":"2027-02-15","time":"09:00 AM"}'
```

---

## ✅ Tested Scenarios

- [x] MongoDB Atlas connection
- [x] Backend startup on port 5000
- [x] User registration with hashed password
- [x] Duplicate email returns 409
- [x] Login with correct credentials returns JWT
- [x] Wrong password returns 401
- [x] JWT token verification on protected routes
- [x] No token returns 401
- [x] Doctor listing (6 doctors)
- [x] Single doctor fetch
- [x] Appointment booking with slot validation
- [x] Duplicate slot prevention (409)
- [x] Get appointments (user-scoped)
- [x] Cancel/delete appointment
- [x] React frontend build (Vite)
- [x] AngularJS SPA routing

---

## 🔐 Security Notes

- Passwords are hashed with **bcryptjs** (cost factor 12)
- JWT tokens expire after **7 days**
- Appointments are **user-scoped** — users can only see/cancel their own
- CORS is configured to allow React (5173) and AngularJS (3001/5500) origins
- `.env` is in `.gitignore` — credentials never committed

---

*Built with ❤️ — CarePoint 2026*
