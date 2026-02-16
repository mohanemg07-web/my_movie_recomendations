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

2.  Import your GitHub repo.
3.  **Project Settings**:
    -   **Framework Preset**: Vite
    -   **Root Directory**: `frontend`
4.  **Environment Variables**:
    -   `VITE_API_URL`: *(Paste your Render Backend URL from Step 2, e.g. `https://movie-backend.onrender.com/api`)*
    -   `VITE_TMDB_API_KEY`: Your TMDB API Key
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
