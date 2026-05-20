# Stationery Management System

This project contains a UI and backend for a Stationery Management System using HTML, Tailwind CSS, Node.js, Express, and MongoDB.

## Files
- `server.js` — Express backend server with API routes
- `routes/auth.js` — Authentication route for login
- `routes/products.js` — Product CRUD API
- `models/User.js` — MongoDB user model
- `models/Product.js` — MongoDB product model
- `seed.js` — Seed script for initial users and products
- `landing.html` — Customer landing page with login modal
- `login.html` — Login page
- `dashboard.html` — Admin dashboard
- `staff-dashboard.html` — Staff dashboard
- `products.html` — Product management page
- `debts.html` — Debt management page
- `styles.css` — Custom utility CSS
- `scripts/auth.js` — client auth helpers and route protection
- `scripts/login.js` — login submission and role-based redirect
- `scripts/products.js` — product dashboard CRUD behavior
- `scripts/app.js` — modal and UI interactions

## Setup
1. Install Node.js and MongoDB.
2. Open a terminal in the project folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env` and update `MONGODB_URI` if needed.
5. Run `npm run seed` to populate initial users and products.
6. Run `npm start` or `npm run dev`.
7. Open `http://localhost:3000`.

## Login Credentials
- Admin: admin / admin123
- Staff: staff1 / staff123
- Customer: customer1 / cust123

## Notes
- Login uses JWT tokens stored in localStorage.
- MongoDB stores products and users.
- Admin users are redirected to `dashboard.html`.
- Staff users are redirected to `staff-dashboard.html`.
- Product CRUD is available to `admin` and `staff`.
