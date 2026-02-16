# 🚀 Deployment Guide: Split Free Tier Architecture

This guide explains how to deploy your Movie Recommendation System using free tiers of:
-   **Frontend**: Vercel
-   **Backend**: Render
-   **Database**: Supabase

## 📂 Project Structure
-   `/backend`: Flask API + ML Engine (Deploy to Render)
-   `/frontend`: React + Vite UI (Deploy to Vercel)

---

## 1️⃣ Database Setup (Supabase)
1.  Go to [Supabase.com](https://supabase.com) and create a free account.
2.  Create a new project.
3.  Go to **Project Settings** -> **Database**.
4.  Copy the **Connection String (URI Mode)**.
    -   It looks like: `postgresql://postgres.[ref]:[password]@aws-0-region.pooler.supabase.com:6543/postgres`
    -   Replace `[password]` with your actual DB password.
5.  **Save this URL**, you will need it for the Render Backend.

---

## 2️⃣ Backend Deployment (Render)
1.  Push your code to **GitHub**.
2.  Go to [Render.com](https://render.com) and create a **New Web Service**.
3.  Connect your GitHub repo.
4.  **Settings**:
    -   **Root Directory**: `backend`
    -   **Runtime**: Python 3
    -   **Build Command**: `pip install -r requirements.txt`
    -   **Start Command**: `gunicorn app:app`
5.  **Environment Variables** (Add these):
    -   `PYTHON_VERSION`: `3.9.0`
    -   `DATABASE_URL`: *(Paste your Supabase Connection String from Step 1)*
    -   `TMDB_API_KEY`: `259ce8e6ef8a88ab367725c097372b3e`
    -   `SECRET_KEY`: *(Generate a random string)*
    -   `JWT_SECRET_KEY`: *(Generate a random string)*
6.  Click **Deploy Web Service**.
7.  Once deployed, **copy the Backend URL** (e.g., `https://movie-backend.onrender.com`).

---

## 3️⃣ Frontend Deployment (Vercel)
1.  Go to [Vercel.com](https://vercel.com) and **Add New Project**.
2.  Import your GitHub repo.
3.  **Project Settings**:
    -   **Framework Preset**: Vite
    -   **Root Directory**: `frontend`
4.  **Environment Variables**:
    -   `VITE_API_URL`: *(Paste your Render Backend URL from Step 2, e.g. `https://movie-backend.onrender.com/api`)*
    -   `VITE_TMDB_API_KEY`: `259ce8e6ef8a88ab367725c097372b3e`
5.  Click **Deploy**.

---

## 4️⃣ Data Seeding
After deployment, the database will be empty. To fill it:
1.  Go to your **Render Dashboard** -> **Backend Service**.
2.  Click on **Shell** (or **Connect** -> **SSH**).
3.  Run the seed script:
    ```bash
    python load_data.py
    ```
    *(This may take a few minutes)*

✅ **Done!** Your full-stack app is now live for free.
