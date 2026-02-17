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
1.  Go to [Render.com](https://render.com) and create a **New Web Service**.
2.  Connect your GitHub repo.
3.  **Settings**:
    -   **Root Directory**: `backend`
    -   **Runtime**: Python 3
    -   **Build Command**: `pip install -r requirements.txt`
    -   **Start Command**: `gunicorn app:app`
4.  **Environment Variables** (Add these):
    -   `PYTHON_VERSION`: `3.9.0` (or `3.10.0`)
    -   `DATABASE_URL`: *(Paste your Supabase Connection String from Step 1)*
    -   `TMDB_API_KEY`: Your TMDB API Key (See `0d39...`)
    -   `SECRET_KEY`: *(Generate a random string)*
    -   `FRONTEND_URL`: *(Your Vercel URL, set this after deploying frontend)*
5.  Click **Deploy Web Service**.
6.  Once deployed, **copy the Backend URL** (e.g., `https://movie-backend.onrender.com`).

---

## 3️⃣ Frontend Deployment (Vercel)
1.  Go to [Vercel.com](https://vercel.com) and **Add New Project**.
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
Since the **Free Tier** does not have an interactive Shell, you must run the setup scripts as part of the **Start Command**.

1.  Go to your **Render Dashboard** -> **Settings**.
2.  Scroll down to the **Start Command** field.
3.  Change it to:
    ```bash
    python load_data.py; python train_model.py; gunicorn app:app
    ```
4.  **Save Changes**. Render will automatically redeploy.

> **What this does:**
> 1. `python load_data.py`: Loads the movie data into the database (only runs if data is missing).
> 2. `python train_model.py`: Trains the recommendation model and saves `model.pkl`.
> 3. `gunicorn app:app`: Starts the web server.

**Verify Deployment**:
*   Wait for the deployment to finish.
*   Check the **Logs** tab. You should eventually see:
    *   "Final Model saved to model.pkl"
    *   "Starting gunicorn"
    *   "Your service is live"

✅ **Done!** Your full-stack app is now live for free.
