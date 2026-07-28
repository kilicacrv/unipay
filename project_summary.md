# Project Overview: Kampüs Pay (UniPay)

**Kampüs Pay** is a localized, closed-loop loyalty and discount ecosystem designed specifically to bridge the gap between university students and local campus businesses. It operates as a web-based progressive application with three distinct user roles: Students, Businesses (Venues), and System Administrators.

## Core Value Proposition
- **For Students:** Provides exclusive, verified discounts at local cafes, restaurants, and entertainment venues to help manage student budgets. 
- **For Businesses:** Increases foot traffic, especially during off-peak hours, and builds long-term customer loyalty through gamified points and flash campaigns.
- **For Admins:** A centralized, data-driven platform to manage the local campus economy, oversee user verification, and run targeted marketing campaigns.

## How the System Works (Role-Based Workflow)

### 1. Student Flow
1. **Registration & Verification:** Students sign up using their credentials and must upload a valid Student Certificate (via e-Government PDF) to prove their active student status.
2. **Approval:** Their account remains in a "Pending" state until the system Administrator reviews the uploaded document and approves the account. 
3. **Usage (QR Code Generation):** Once approved, students can browse participating venues, active discounts, and flash campaigns on their dashboard. To claim a discount at a venue, the student generates a unique, time-sensitive **QR Code**.
4. **Loyalty (Kampüs Puan):** With every successful transaction, students earn "Kampüs Puan" (Campus Points) which gamifies the experience and encourages repeat visits.

### 2. Business (Venue) Flow
1. **Dashboard Access:** Business owners log in to their dedicated dashboard using credentials provided by the Admin.
2. **QR Scanning & Validation:** When a student shows their QR code at the checkout counter, the business owner clicks "Scan QR" (or enters the code manually). The system validates the code in real-time, verifying that the student is legitimate and the code hasn't expired.
3. **Analytics & Analytics:** Businesses have access to real-time analytics showing their daily customer visits, total revenue generated through the app, and peak hours.

### 3. Administrator Flow (The Control Center)
The Admin panel is the brain of the operation, providing full control over the ecosystem:
- **Application Management:** Review, approve, or reject student and business applications. EmailJS is integrated to send automated approval/rejection emails.
- **Venue & Student Management:** Add, edit, or remove participating businesses and verified students.
- **Dynamic Banners & Marketing:** Upload and manage promotional banners that instantly appear on the students' homepages.
- **Flash Campaigns:** Create time-restricted, high-discount campaigns (e.g., "50% off Coffee for the next 2 hours") to drive immediate foot traffic.
- **System Logs & Analytics:** Monitor real-time system activity, track total scans, and observe the overall health of the platform through detailed charts.

## Technical Stack & Architecture
- **Frontend:** React.js (Vite), Tailwind CSS (for modern, responsive styling), Framer Motion (for micro-animations), Lucide React (for iconography).
- **Backend & Database:** Supabase (PostgreSQL for relational data, Supabase Auth for JWT-based secure authentication, Supabase Storage for secure file uploads like student IDs and banner images).
- **Security:** Strict Row Level Security (RLS) policies implemented on the database to ensure data privacy between roles.
- **Deployment:** Vercel (CI/CD pipeline for instant production deployments).
- **Third-Party Integrations:** EmailJS for transactional emails.
