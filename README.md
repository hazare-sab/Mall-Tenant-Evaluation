# Mall Tenant Evaluation System

A web-based application designed to simplify mall tenant management by organizing tenant records, rent payment proofs, and payment verification through a centralized dashboard.

## Overview

Managing multiple tenants and tracking their rent payments can involve repetitive paperwork and manual verification. The Mall Tenant Evaluation System aims to make this process more organized by providing separate interfaces for administrators and tenants.

Administrators can manage tenant records, review uploaded payment receipts, and monitor payment statuses, while tenants can access their accounts and submit payment proofs online.

## Features

- **Role-Based Access** — Separate login and dashboards for administrators and tenants.
- **Tenant Management** — Add, view, and delete tenant records.
- **Payment Proof Submission** — Tenants can upload rent payment receipts.
- **Payment Verification** — Administrators can approve or reject submitted receipts.
- **Payment History** — View payment records and their verification status.
- **Receipt Management** — View and download uploaded payment proofs.
- **Dashboard Statistics** — Track tenant and payment information.
- **Authentication** — Login and logout functionality.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python, Flask
- **Database:** SQLite
- **File Handling:** Local receipt uploads

## Project Structure

```text
Mall-Tenant-Evaluation/
├── app.py
├── database.db
├── uploads/
└── templates/
    ├── login.html
    ├── admin_dashboard.html
    ├── base.html
    ├── admin/
    └── tenant/
        └── payments.html
```

## Getting Started

### Prerequisites

- Python 3.x
- pip

### Installation

1. Clone the repository:

   ```bash
   git clone <your-repository-url>
   ```

2. Navigate to  project directory:

   ```bash
   cd Mall-Tenant-Evaluation
   ```

3. Install Flask:

   ```bash
   pip install flask
   ```

4. Run the application:

   ```bash
   python app.py
   ```

5. Open the local URL shown in your terminal in a web browser.

## Project Objective

The objective of this project is to explore how web technologies can improve tenant administration, payment tracking, and document verification through a centralized digital workflow.

## Future Improvements

- Automated rent reminders and payment due notifications.
- Monthly rent reports and analytics.
- Integration with online payment gateways.
- Improved security and document access controls.
- Migration to a production database and cloud-based file storage.

## Author

**Hazare Sab**

Computer Science and Engineering (CSE Core)

