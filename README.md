# Store Ratings Platform

Full‑stack web application where users can rate stores from 1–5, with three roles:
**System Administrator**, **Normal User**, and **Store Owner**. All roles use a
single login screen; access is controlled by role‑based permissions.

---

## Tech Stack

- **Frontend**: React, React Router, Axios, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MySQL (using `mysql2` pool)
- **Auth**: JWT + `bcryptjs` password hashing

Folder layout:

- `client/` – React app (login, signup, dashboards, stores + ratings)
- `server/` – Express API, MySQL models, controllers, routes

---

## Features by Role

### 1. System Administrator

- **Dashboard stats**
  - Total number of users
  - Total number of stores
  - Total number of submitted ratings
- **Manage users**
  - Add new users with: **Name, Email, Password, Address, Role**
  - Roles supported: `ADMIN`, `USER` (normal user), `STORE_OWNER`
  - View a table of all users with: Name, Email, Address, Role
  - Filter users by Name, Email, Address, Role
  - View full details of a specific user; if the user is a **Store Owner**,
    also see the average rating of their store
- **Manage stores**
  - Add new stores with: **Name, Email, Address, Owner ID (Store Owner)**  
  - View a table of all stores with: Name, Email, Address, Rating (average)
  - Filter stores by Name, Email, Address
- **Auth**
  - Logs in via the same login form as all other roles
  - Can log out from the system

### 2. Normal User

- **Auth**
  - Can **sign up** with: Name, Email, Address, Password
  - Can log in via the shared login form
  - Can update their password after logging in
- **Stores & ratings**
  - Can view a list of all registered stores
  - Can search for stores by Name and Address
  - Store listings show:
    - Store Name
    - Address
    - Overall Rating (average)
    - User's own submitted rating
    - Option to submit a rating
    - Option to modify their existing rating
  - Can submit ratings between **1 and 5** for each store
  - Can log out from the system

### 3. Store Owner

- **Auth**
  - Logs in via the shared login form
  - Can update their password after logging in
- **Dashboard**
  - See the **average rating** of their store
  - View a table of **users who have submitted ratings** for their store
    (with rating and date)
  - Can log out from the system

---

## Validation Rules (Frontend & Backend)

All forms enforce the same rules on both client and server:

- **Name**: min 20 characters, max 60 characters
- **Address**: max 400 characters
- **Password**: 8–16 characters, must contain at least one uppercase letter
  and one special character
- **Email**: must be a valid email format

Errors are shown inline under the relevant fields or at the top of the form.

---

## Backend Setup (`server/`)

### 1. Environment variables

Create `server/.env` with your DB and JWT settings, e.g.:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=store_ratings
JWT_SECRET=your_jwt_secret_here
```

### 2. Install dependencies

```bash
cd server
npm install
```

### 3. Run the server

```bash
npm run dev
```

The server will:

- Connect to MySQL via a connection pool
- Ensure the following tables exist (and auto‑migrate some legacy columns):
  - `users` – with `password_hash` for secure storage and `role`
  - `stores`
  - `ratings`

By default the API listens on `http://localhost:5000`.

---

## Frontend Setup (`client/`)

### 1. Install dependencies

```bash
cd client
npm install
```

### 2. Run the React app

```bash
npm start
```

This starts the dev server on `http://localhost:3000`, configured to call
the backend at `http://localhost:5000/api` via Axios.

---

## Main Routes (Frontend)

- `/` – Landing page with overview and CTAs to Login / Signup
- `/login` – Shared login for all roles
- `/signup` – Normal user registration
- `/dashboard` – Role‑aware dashboard:
  - Admin: stats + user/store management views
  - Normal user: summary + link to Stores + password update
  - Store owner: store rating overview + rater list + password update
- `/stores` – Normal user store listing and rating page

Protected routes are wrapped with a `ProtectedRoute` component that checks
authentication and optionally enforces roles.

---

## Notes

- **Passwords are never stored in plain text** – all passwords are hashed
  with `bcryptjs` and verified on login.
- API errors are handled gracefully and surfaced as inline messages in the UI.
- The app is built with a **dark, responsive UI** so it works well on
  both small and large screens.

