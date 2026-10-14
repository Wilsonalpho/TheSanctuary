# ☕ The Sanctuary — Coffee Shop Book Lending System

A mobile-responsive web application designed for coffee shops to manage book lending seamlessly through QR code scanning, instant staff approval workflows, real-time push notifications, and analytics dashboards.

---

## 🌟 Key Features

### 1. Borrower Portal (Mobile-First)
- **Physical QR Code Access**: Customers scan table/counter QR codes to open the lending form directly.
- **Data Entry Form**:
  - Book title(s) entry (supports multiple books and quick selection from the cafe's library shelf)
  - Borrower's Full Name
  - Phone Number & Email Address
  - Optional Physical Address
  - Committed Return Date with quick presets (7d, 14d, 21d, 30d)
- **Photo Upload**:
  - Snap photo directly from smartphone camera (`capture="environment"`) or choose from gallery.
  - Automatic client-side canvas compression for rapid uploads on mobile networks.
- **Submission Confirmation**:
  - Confetti celebration with a unique Request ID (e.g., `SAN-8491`).
  - Real-time loan status indicator (*Pending Staff Approval* &rarr; *Approved*).
  - Prompts borrower to present the screen to the barista before taking books off premises.
- **Borrower Self-Lookup & Returns**:
  - Search by Phone Number or Loan ID to verify return dates and return instructions.

### 2. Shopkeeper Command Hub
- **Request Approval System**:
  - Live Approval Queue showcasing customer lending requests.
  - Front-and-center book photo inspection lightbox.
  - 1-click **Approve & Hand Over** or **Decline** with custom reason.
- **Real-Time Notification System**:
  - **Server-Sent Events (SSE)** for zero-delay live push notifications without manual refreshes.
  - Web Audio API brass chime for new requests and alert tones for overdue items.
  - Browser Desktop Notification API integration.
  - Alerts for:
    - 🟡 **Pending borrow requests** awaiting counter review.
    - 🟠 **Daily notifications** for books due for return today.
    - 🔴 **Overdue alerts** for books past their committed return date.
- **Management Dashboard & Filtering**:
  - Quick filter pills: *All Records*, *Pending Approval*, *Active Loans*, *Due Today*, *Overdue*, *Returned*.
  - Responsive Table on desktop/tablet & touch-friendly swipeable cards on mobile.
  - One-click **WhatsApp Courtesy Reminders** with pre-filled return messages.
  - Mark as returned with book condition evaluation (*Pristine*, *Good*, *Wear & Tear*).
  - Due date extensions.
- **Historical Data & Analytics**:
  - Filter analytics by **Month and Year**.
  - Bar charts for monthly borrowing volume trends.
  - Top 5 most borrowed cafe books.
  - Circulation status breakdown (Active, Due Today, Overdue, Returned).
  - **Export to CSV** for shop bookkeeping and reports.
- **Counter Standee QR Generator**:
  - In-app printable table card standee with coffee shop branding and scannable QR code.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### Installation
```bash
# Clone or navigate into the repository
cd TheSanctuary

# Install dependencies
npm install
```

### Running the Application

#### Option A: Full-Stack Production Mode (Single Port 3001)
```bash
# 1. Build the frontend assets
npm run build

# 2. Start the Express server
npm start
```
Open **[http://localhost:3001](http://localhost:3001)** in your browser or phone.

#### Option B: Development Mode (Vite + Express API)
```bash
# Terminal 1: Start backend server
node server/index.js

# Terminal 2: Start Vite dev server with hot reload
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📱 Mobile Testing & Table QR Codes

- **Open on Smartphone**: Find your computer's local IP address (e.g. `192.168.1.X:3001`) to test the camera photo capture on an iPhone or Android phone on the same Wi-Fi.
- **Counter Standee**: Click the **"Counter QR"** button in the top navigation bar to open the printable cafe standee card, which can be printed directly from the browser (`Ctrl+P` / `Cmd+P`).

---

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/loans` | List loans with status, month, year, or search filters |
| `GET` | `/api/loans/:id` | Fetch details for a specific loan |
| `POST` | `/api/loans` | Submit a new borrower loan with photo upload |
| `POST` | `/api/loans/:id/approve` | Shopkeeper approves a pending loan |
| `POST` | `/api/loans/:id/reject` | Shopkeeper rejects a loan with reason |
| `POST` | `/api/loans/:id/return` | Mark book as returned with condition notes |
| `POST` | `/api/loans/:id/extend` | Extend committed return date |
| `GET` | `/api/stats` | Dashboard KPI summary counts |
| `GET` | `/api/notifications` | Current pending, due today, and overdue alerts |
| `GET` | `/api/analytics` | Monthly borrowing trends and popular books |
| `GET` | `/api/events` | Server-Sent Events (SSE) real-time event stream |
| `GET` | `/api/catalog` | Recommended books on cafe shelves |

---

## 🎨 Design Philosophy

Designed specifically for **The Sanctuary**, evoking a cozy, literary atmosphere with warm terracotta, espresso, and creamy foam tones. Typography pairs classical editorial serif headers with modern typography for fast mobile readability.
