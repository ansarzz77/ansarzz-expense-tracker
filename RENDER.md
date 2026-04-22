# 🚀 Production Deployment Guide: Render.com

This guide provides step-by-step instructions for deploying the **Ansarzz Expense Tracker** modular backend to Render.com and connecting it to your GitHub Pages frontend.

---

## 🏗️ Phase 1: Deploying the Backend to Render

1.  **Sign in**: Log in to [dashboard.render.com](https://dashboard.render.com) using your GitHub account.
2.  **Create Service**: Click **"New"** > **"Web Service"**.
3.  **Connect Repo**: Select your repository: `ansarzz77/ansarzz-expense-tracker`.
4.  **Configure Settings**:
    *   **Name**: `ansarzz-expense-tracker-api`
    *   **Root Directory**: `server` (⚠️ Critical: This ensures Render only deploys the backend)
    *   **Environment**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
    *   **Instance Type**: `Free`

---

## 🔑 Phase 2: Configuring Environment Secrets

Render needs your Gemini API key to process AI requests.

1.  In your Render Dashboard, select your new **`ansarzz-expense-tracker-api`** service.
2.  Navigate to the **"Environment"** tab.
3.  Click **"Add Environment Variable"**:
    *   **Key**: `GEMINI_API_KEY`
    *   **Value**: Paste your Google Gemini API key here.
4.  Click **"Save Changes"**. Render will automatically redeploy your service.

---

## 🔗 Phase 3: Connecting Frontend to Backend

Now, you must tell your GitHub Pages frontend where your new backend is located.

1.  **Get Render URL**: Copy your backend's URL from the Render dashboard (e.g., `https://ansarzz-expense-tracker-api.onrender.com`).
2.  **Go to GitHub**: Navigate to your repository on github.com.
3.  **Add Secret**: Go to **Settings** > **Secrets and variables** > **Actions**.
4.  **Create Secret**: Click **"New repository secret"**:
    *   **Name**: `VITE_BACKEND_URL`
    *   **Value**: Paste your Render backend URL (e.g., `https://ansarzz-expense-tracker-api.onrender.com`).
5.  **Redeploy**: Go to the **Actions** tab in GitHub and click **"Run workflow"** on your latest `deploy.yml` run to rebuild the frontend with the new production URL.

---

## 💡 Important Notes for Production

### 1. Cold Starts (Free Tier)
Because you are using Render's **Free Tier**, your backend will "spin down" after 15 minutes of inactivity. 
*   **Behavior**: The first AI request (e.g., using "Magic" add) after a period of inactivity will take **30–60 seconds** to respond as the server wakes up.
*   **Subsequent Requests**: Once awake, all following requests will be processed instantly.

### 2. Security
*   The `GEMINI_API_KEY` is now **securely hidden** on the server. It is never exposed to the user's browser.
*   The `VITE_BACKEND_URL` is public, but your backend only accepts requests for your specific API endpoints.

---
*Created on Wednesday, April 22, 2026 for Ansarzz Expense Tracker.*
