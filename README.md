# Stationery Management System

This project contains a full-stack UI for a Stationery Management System using HTML, Tailwind CSS, and PHP (no database).

## Files
- `index.php` — Login page (entry point)
- `login_process.php` — PHP login handler (hardcoded credentials)
- `dashboard.php` — Admin/Staff Dashboard
- `logout.php` — Logout handler
- `products.html` — Product Management page
- `debts.html` — Debt Management page
- `landing.html` — Customer landing page
- `styles.css` — Custom utility CSS
- `scripts/app.js` — Modal and mobile menu interactions

## Setup
1. Install PHP (XAMPP or similar).
2. Place files in your web server root (e.g., htdocs).
3. Open `index.php` in browser.

## Login Credentials
- Admin: admin / admin123
- Staff: staff1 / staff123
- Customer: customer1 / cust123

## Notes
- Uses sessions for authentication.
- Role-based access (Admin sees all, Staff sees products, Customer limited).
- No database required - hardcoded credentials.
