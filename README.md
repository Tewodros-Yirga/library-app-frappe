# 📚 Library Management System

A full-stack **Library Management System** developed using [Frappe Framework 15](https://frappeframework.com/) (backend) and **React 18+ with TypeScript** (frontend). This system allows authenticated users to manage books, members, loans, and reservations — all through a **custom frontend**, without using Frappe Desk.

> 🛠 Developed as part of a Junior Developer challenge at [360Ground](https://360ground.com), submitted on **July 15, 2025**.

---

## 🚀 Project Features

### ✅ Core Functionalities

- **📚 Book Management (CRUD)**  
  Add, update, view, and delete books with attributes: `Title`, `Author`, `Publish Date`, and `ISBN`.

- **👤 Member Management (CRUD)**  
  Manage library members with details like `Name`, `Membership ID`, `Email`, and `Phone`.

- **📄 Loan Management**  
  Loan books to members while capturing `Loan Date` and `Return Date`.

- **🟡 Availability Check**  
  Prevents multiple simultaneous loans of the same book.

- **⏳ Reservation Queue**  
  Members can reserve books that are currently on loan.

- **📧 Overdue Notifications**  
  Sends email reminders for overdue loans.

- **📊 Reporting**  
  Generates reports of books on loan and overdue items.

- **🔐 Role-Based Access Control**  
  Includes `Admin`, `Librarian`, and `Member` roles with secure authentication.

- **🧪 RESTful API**  
  Endpoints for secure, authenticated interaction with all core resources.

### 🧩 Optional (Stretch) Features

> ⚠️ Due to time constraints, these were considered but not fully implemented:

- CSV export of loan history  
- Auto-deployment pipelines  
- Automated testing (targeting 80% coverage)

---

## 🧱 Architecture Overview

```
project-root/
├── ├── library_app/
│   │   ├── api.py          # All RESTful API logic
│   │   ├── hooks.py        # Linked backend events
│   │   └── doctype/        # Custom DocTypes: Book, Member, Loan, Reservation
│   └── ...
└── frontend/
    └── src/
        ├── components/     # Reusable UI components
        ├── pages/          # Core pages: Books, Members, Loans
        └── App.tsx         # Root layout and routing

# Project Setup Guide

This guide will walk you through setting up both the backend (Frappe) and frontend (React with Doppio) for your project.

---

## ⚙️ Setup Instructions

### 🔧 Prerequisites

Before you begin, ensure you have the following installed on your system:

* **WSL2 with Ubuntu 22.04:** This project is developed and tested within a Windows Subsystem for Linux 2 (WSL2) environment running Ubuntu 22.04.
* **Python 3.10+:** Ensure you have Python version 3.10 or newer installed.
* **Node.js 18+, Yarn:** These are required for front-end asset compilation.
* **Redis & MariaDB (installed via Frappe):** These database services are typically installed as part of the Frappe framework setup.

---

## 🗂️ Backend Setup (Frappe)

This section guides you through setting up the Frappe backend, including system dependencies, Frappe Bench, and your custom application.

```bash
# Step 1: Install system dependencies
# These packages are essential for Frappe, Python environments, and database services.
sudo apt update
sudo apt install -y python3.10-venv python3-pip redis-server mariadb-server curl git

# Step 2: Setup Frappe Bench
# Frappe Bench is the command-line interface to manage Frappe installations.

# Install Frappe Bench
# It's recommended to install bench in a separate directory or globally,
# but for simplicity, we'll install it where it can be used to initialize.
pip install frappe-bench

# Initialize a new Frappe Bench
# This creates a 'library-bench' directory which will house your Frappe apps and sites.
bench init library-bench --frappe-branch version-15

# Navigate into your new Frappe Bench directory
cd library-bench
# Step 3: Create & Setup Site
# This involves creating a new Frappe site and integrating your custom app.

# Create a new Frappe site
# 'library.local' will be the name of your development site.
bench new-site library.local

# Get your custom app and link it to the bench
# Replace 'library_app' with the actual name of your custom app.
# The '.' indicates that your app repository is in the current directory (within 'apps' later).
bench get-app library_app .

# Install your custom app on the newly created site
bench install-app library_app
# Step 4: Start the Backend
# This command starts the Frappe development server.
bench start

## 🗂️ Frontend Setup 

# Step 1: Clone & Install
# In your bench directory 

# Clone the Doppio frontend repository

[https://github.com/NagariaHussain/doppio]

# follow the documentation


# Step 2: Run the frontend
# This command starts the React development server.
yarn dev

---
## 🧪 Testing

Manual testing was performed on the following functionalities to ensure proper operation:

* **Book/member CRUD:** Creation, reading, updating, and deletion of book and member records.
* **Loan logic (with constraints):** Verification of borrowing rules, due dates, and other loan-related restrictions.
* **Reservation queueing:** Testing the system for managing book reservations and their order.
* **Authentication & role access:** Confirmation that user authentication works correctly and that role-based access controls are enforced.
* **Notification triggers (mocked during dev):** Although notifications were mocked during development, their triggers were tested to ensure they would fire under the correct conditions.

Automated tests were not implemented due to time constraints; however, test hooks are structured and ready in `library_app for future implementation.

---
## ⚖️ Trade-offs & Shortcuts

Due to the limited timeframe for this project, certain **stretch goals** and features were not fully implemented. These include:

* **CSV export:** The functionality to export data in CSV format was not developed.
* **Auto-deployment:** Automated deployment pipelines were not set up.
* **Comprehensive test coverage:** While manual testing was performed, extensive automated test coverage was not implemented.
---
## ✨ Future Enhancements 

* **Robust test suite with 80–90% coverage:** Implementing comprehensive automated tests to ensure stability, reliability, and prevent regressions.
* **Fully automated CI/CD with Docker or Render:** Setting up continuous integration and continuous deployment pipelines for efficient and reliable code delivery.
* **Admin dashboard with analytics:** Developing a dedicated dashboard for administrators to monitor key metrics such as loan trends, active members, and inventory status.
* **PDF and CSV export options:** Adding functionality to export data in various formats for reporting and external use.
* **Push notifications for reservations & returns:** Implementing real-time notifications to inform users about their reservations and overdue returns.
* **Offline access/PWA support for librarians:** Enhancing the librarian interface with Progressive Web App (PWA) capabilities to allow for offline functionality.

---
## 🙌 Author

**Tewodros Yirga (Teddy)**
