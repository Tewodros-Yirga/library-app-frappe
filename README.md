# 📚 Library Management System

A full-stack **Library Management System** built using **Frappe Framework 15** for the backend and **React 18 + TypeScript** for the frontend. This project allows authenticated users to manage books, members, loans, and reservations, with **role-based access**, **secure REST APIs**, and a clean **custom UI (not using Frappe Desk)**.

> 🛠 Developed as part of a Junior Developer challenge at [360Ground](https://360ground.com).  
> 📅 Submitted: **July 15, 2025**

---

## 🚀 Features

### ✅ Core Functionalities

- **📚 Book Management (CRUD)**  
  Manage books with `Title`, `Author`, `Publish Date`, and `ISBN`.

- **👤 Member Management (CRUD)**  
  Add and manage library members with `Name`, `Membership ID`, `Email`, and `Phone`.

- **🔁 Loan Creation**  
  Loan books to members, tracking `Loan Date` and `Return Date`.

- **✅ Book Availability Checks**  
  Prevent simultaneous loans of the same book.

- **⏳ Reservation Queue**  
  Members can reserve books currently on loan.

- **📧 Overdue Notifications**  
  Automatically sends reminder emails for overdue loans.

- **📊 Reports**  
  View lists of currently loaned and overdue books.

- **🔐 Authentication & Roles**  
  Users are authenticated and granted access based on roles: `Admin`, `Librarian`, or `Member`.

- **🧪 RESTful API**  
  Secure API endpoints to interact with all resources externally.

---

## 🧱 Project Structure

This repo contains **only the custom Frappe app** (`library_app`) and the frontend (`library`) as required.

```bash
project-root/
├── ├── library_app/
│   │   ├── api.py          # All RESTful API logic
│   │   ├── hooks.py        # Linked backend events
│   │   └── library/doctype/        # Custom DocTypes: Book, Member, Loan, Reservation
│   └── ...
└── frontend/
    └── src/
        ├── components/     # Reusable UI components
        ├── pages/          # Core pages: Books, Members, Loans
        └── App.tsx         # Root layout and routing  
  
  
---

## ⚙️ Setup Instructions

This setup was performed using **WSL2 with Ubuntu 22.04** on Windows.

### 🔧 Prerequisites

Ensure you have the following installed:

- WSL2 + Ubuntu 22.04
- Python 3.10+
- Node.js 18+ and Yarn
- Frappe Bench CLI
- Redis & MariaDB (installed with Frappe)

---

## 🗂️ Backend & Frontend Setup

This project uses a Frappe backend and a **custom React + TypeScript SPA** generated using the [Doppio boilerplate](https://github.com/NagariaHussain/doppio), added directly into your Frappe app.

---

### 🧱 Backend Setup (Frappe App + SPA Integration)

```bash
# Step 1: Install system dependencies
sudo apt update
sudo apt install -y python3.10-venv python3-pip redis-server mariadb-server curl git

# Step 2: Install Frappe Bench CLI
pip install frappe-bench

# Step 3: Initialize Frappe bench
bench init library-bench --frappe-branch version-15
cd library-bench

# Step 4: Create your custom Frappe app
bench new-app library_app --app-title "Library"

# Step 5: Install Doppio (SPA boilerplate with React + TypeScript)
bench get-app doppio https://github.com/NagariaHussain/doppio

# Step 6: Add a SPA dashboard (creates frontend inside app)
bench add-spa

# You will be prompted:
# Dashboard Name: library
# App: library_app
# Framework: react
# TypeScript: yes

# Step 7: Create a new site
bench new-site library.localhost

# Step 8: Use the site
bench use library.localhost

# Step 9: Install your custom app
bench install-app library_app

# Step 10: Start Frappe development server
bench start


## 🖥️ Frontend Setup (React + TypeScript)
The frontend is a React + TypeScript SPA located in apps/library_app/library.
# Navigate to the frontend directory
cd apps/library_app/library

# Install dependencies
yarn install

# Start development server
yarn dev

Ensure the .env file includes your backend API:
VITE_API_BASE_URL=http://localhost:8000



---

## 🏁 Run Locally (Clone & Launch Full System)

> This repository contains only the custom app (`library_app`) and the frontend SPA (`library`) inside it.  
> You'll need to install this app inside your own Frappe bench environment.

---

### 1️⃣ Clone This Repo

```bash
git clone https://github.com/Tewodros-Yirga/library-app-frappe.git

This repository contains:

* **`library_app/`**: The backend Frappe app, encompassing all custom DocTypes, server-side logic, and APIs.
* **`library/`**: The standalone frontend Single Page Application (SPA), built with React and TypeScript.

Please note that the Frappe Framework itself is not included in this repository. Follow the setup steps below to configure the Frappe environment.



### 🔐 Authentication & Role Management

Authentication is managed using Frappe's built-in API methods:
* `/api/method/login`
* `/api/method/logout`
* `/api/method/library_app.api.register_user` - custom api

The system defines the following roles:
* **Admin**: Possesses full access to all functionalities.
* **Librarian**: Permitted to manage books, members, and loans.
* **Member**: Allowed to browse available books and make reservations.

Role-based access control is enforced through both backend permissions and frontend route protection to ensure secure access.

### 🌐 Custom API Endpoints

Some custom API endpoints are defined in `library_app/api.py`.

| Feature         | Method | Endpoint                                    |
|-----------------|--------|---------------------------------------------|
| List books      | GET    | `/api/method/library_app.api.get_books`     |
| Add book        | POST   | `/api/method/library_app.api.create_book`   |
| Add member      | POST   | `/api/method/library_app.api.create_member` |
| Create loan     | POST   | `/api/method/library_app.api.create_loan`   |
| Reserve book    | POST   | `/api/method/library_app.api.reserve_book`  |
| Get reports     | GET    | `/api/method/library_app.api.get_reports`   |

All endpoints require authentication via session cookies or API key.

### 🧪 Testing & Validation

**Manual testing was conducted for all critical flows to ensure correctness:**

**Book & Member CRUD**: Verified creation, viewing, editing, and deletion of books and members through the custom front-end.
**Loan creation with availability validation**: Confirmed the process of loaning books to members, capturing loan and return dates, and ensuring prevention of duplicate loans for books already on loan.
**Reservation queuing logic**: Tested the ability for members to reserve currently unavailable books.
**Authentication + role-based access control**: Validated user registration, login, logout, and permissions based on Admin, Librarian, and Member roles.
**Overdue Email notification triggers**: Tested the system's ability to trigger email notifications for overdue loans (mocked for development).

While comprehensive automated test coverage (e.g., ≥ 80% as per Stretch Story SS-02 ) was not implemented due to time constraints, the application's structure, including test functions and API validations, is designed for straightforward expansion of automated tests in the future.

### ⚖️ Trade-offs & Shortcuts

Due to time constraints and the scope of a short, fixed timeline, the following trade-offs and shortcuts were made:

| Feature                   | Decision / Shortcut                                    | Reasoning                                                       |
|:--------------------------|:-------------------------------------------------------|:----------------------------------------------------------------|
| **CSV Export** | Not implemented.                                       | Prioritized core "MUST complete" user stories.                  |
| **CI/CD** | Manual deployment; no automated pipeline implemented.  | Focused on core application development.                        |
| **Automated Testing** | Manual only; test scaffolds are in place.              | Prioritized functional completeness over automated test coverage. |
| **State Management (Frontend)** | No advanced state management libraries (e.g., Redux, Zustand) used. | Reduced frontend complexity and development time.               |

### ✨ Future Enhancements

If this project were to evolve into a production system, the following enhancements would be prioritized:

* **Comprehensive Automated Test Coverage**: Achieve 80%+ automated test coverage, including robust unit, integration (pytest), and API tests to ensure stability and reliability for future changes.
* **Enhanced Reporting and Export**: Implement CSV and PDF export functionalities for detailed loan history and other reports, providing librarians with greater data analysis capabilities.
* **Full CI/CD Pipeline**: Establish a complete Continuous Integration/Continuous Deployment pipeline (e.g., using Render or Docker) to automate testing, building, and deployment processes, enabling faster and more reliable releases.
* **Admin Dashboard with Visual Analytics**: Develop an intuitive admin dashboard featuring visual analytics to provide librarians with insights into book availability, loan trends, and member activity.
* **Real-time Push Notifications**: Integrate real-time push notifications for members regarding reservation availability and overdue book reminders, improving user experience and book return rates.
* **Progressive Web App (PWA) Support**: Implement PWA features to enable offline access for librarians, ensuring continuous operation even in environments with limited or no internet connectivity.

### 👨‍💻 Author

Tewodros Yirga (Teddy)

📧 tewodrosy21@gmail.com
