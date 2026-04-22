# 🚀 Ansarzz Expense Tracker: Full-Stack AI Implementation

A professional, high-performance expense tracking application built with a modular, decoupled architecture.

## 🏗️ The Professional Stack
*   **🎨 Frontend:** React 19 (TypeScript) + Vite, hosted on **GitHub Pages**.
*   **🧠 Backend:** Modular Node.js (Express), hosted on **Render.com**.
*   **☁️ Database/Sync:** Supabase (PostgreSQL), with real-time browser-to-cloud sync.
*   **🤖 AI Engine:** Google Gemini AI Integration for natural language transaction parsing.
*   **🚢 CI/CD:** GitHub Actions for automated building and secure secret injection.

## 🧱 Modular Architecture
The application is designed for scalability and security:
*   **Secure API Layer:** AI requests are handled by a dedicated Express backend, keeping sensitive API keys hidden from the client side.
*   **Concurrently Driven Dev:** Local development runs both the frontend and backend with a single `npm run dev` command.
*   **Vite Proxying:** Dev server uses a proxy to route `/api` requests to the backend, preventing CORS and connection issues.
*   **Absolute Env Loading:** Backend uses robust, path-based environment loading to ensure stability across different deployment environments.

## 🛠️ Development & Deployment
*   **Dev:** `npm run dev` (Frontend on port 5173, Backend on port 3001).
*   **Prod Frontend:** GitHub Pages (via GitHub Actions).
*   **Prod Backend:** Render.com (via GitHub connect).

---
*Maintained by Ansarzz.*
