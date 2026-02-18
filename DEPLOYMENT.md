# 🚀 Deployment Guide — Movie Recommendation System

> **Stack**: React + Vite (Vercel) · Flask + Gunicorn (Render) · PostgreSQL (Supabase)

---

## 📋 Prerequisites

| Item | Where to get it |
|---|---|
| **GitHub account** with this repo pushed | [github.com](https://github.com) |
| **TMDB API key** | [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) |
| **Supabase account** (free tier) | [supabase.com](https://supabase.com) |
| **Render account** (free tier) | [render.com](https://render.com) |
| **Vercel account** (free tier) | [vercel.com](https://vercel.com) |

---

## 0️⃣ Push Code to GitHub

Make sure your latest code is committed and pushed **before** deploying.

```bash
git add -A
git commit -m "Prepare for deployment"
git push origin main
```

> [!IMPORTANT]
> The `data/` directory is in `.gitignore`. Render needs the CSV files to seed the database.
> You must either **un-ignore** `data/ml-latest-small/` or add a download step in the start command (see Step 2).

### Option A — Include the data in the repo (simplest)

Add this line **temporarily** to `.gitignore` or remove the `data/` rule:

```diff
- data/
+ # data/   ← commented out so CSV files are included
```

Then commit and push again.

### Option B — Download data at build time

Keep `data/` ignored and update the Render **Start Command** to download first (see Step 2).

---

## 1️⃣ Database Setup (Supabase)

1. Sign in to [Supabase](https://supabase.com) → **New Project**.
2. Choose a name, set a **database password** (save it), pick the closest region.
3. Once the project is created, go to **Project Settings → Database**.
4. Copy the **Connection String (URI / Mode: Transaction)**.
   ```
   postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with the password you set. **Save this URL — you'll need it for Render.**

> [!NOTE]
> If Supabase shows `postgres://…` (without `ql`), no worries — the backend auto-converts it to `postgresql://…`.

---

## 2️⃣ Backend Deployment (Render)

1. Go to [Render.com](https://render.com) → **New → Web Service**.
2. Connect your **GitHub repo**.
3. Configure the service:

| Setting | Value |
|---|---|
| **Name** | `my-movie-recommendations` (or any name you like) |
| **Root Directory** | `backend` |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | *(see below)* |

### Start Command

Choose based on whether data files are in the repo or not:

**If data files are committed (Option A):**
```bash
python load_data.py && python train_model.py && gunicorn app:app
```

**If data files are NOT committed (Option B):**
```bash
cd .. && python download_data.py && cd backend && python load_data.py && python train_model.py && gunicorn app:app
```

> [!IMPORTANT]
> `load_data.py` reads CSVs from `../data/ml-latest-small/`. Make sure the path is correct for your setup.

### 4. Environment Variables

Add these under **Environment → Environment Variables**:

| Key | Value |
|---|---|
| `PYTHON_VERSION` | `3.9.0` |
| `DATABASE_URL` | *(Supabase connection string from Step 1)* |
| `TMDB_API_KEY` | *(Your TMDB API key)* |
| `SECRET_KEY` | *(Any random secret string for JWT signing)* |
| `FRONTEND_URL` | *(Your Vercel URL — set after Step 3, e.g. `https://my-movie-app.vercel.app`)* |

5. Click **Deploy Web Service**.
6. **Copy your Backend URL** once live (e.g. `https://my-movie-recommendations.onrender.com`).

### Verify Backend Health

Open in your browser:
```
https://my-movie-recommendations.onrender.com/
```
You should see: *"Movie Recommendation API is running. Access endpoints at /api/"*

Check the **Render Logs** tab — you should eventually see:
```
Data already exists. Skipping data loading.     (after first run)
Final Model saved to model.pkl
Starting gunicorn
Your service is live 🎉
```

---

## 3️⃣ Update Frontend Backend URL

The file `frontend/src/api.js` has the production backend URL **hardcoded**. Update it to match your Render URL:

```js
// frontend/src/api.js
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://YOUR-RENDER-SERVICE-NAME.onrender.com/api';  // ← update this
```

After changing, commit and push:
```bash
git add frontend/src/api.js
git commit -m "Update production API URL"
git push origin main
```

---

## 4️⃣ Frontend Deployment (Vercel)

1. Go to [Vercel.com](https://vercel.com) → **Add New Project**.
2. **Import** your GitHub repo.
3. Configure:

| Setting | Value |
|---|---|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |

4. **Environment Variables**:

| Key | Value |
|---|---|
| `VITE_TMDB_API_KEY` | *(Your TMDB API key)* |
| `VITE_API_URL` | *(Your Render backend URL, e.g. `https://my-movie-recommendations.onrender.com/api`)* |

> [!NOTE]
> The current `api.js` auto-detects the environment, so `VITE_API_URL` is only needed if you refactor `api.js` to use `import.meta.env.VITE_API_URL` instead of the hardcoded URL.

5. Click **Deploy**.

### SPA Routing

The `frontend/vercel.json` already handles client-side routing:

```json
{
    "rewrites": [
        { "source": "/(.*)", "destination": "/index.html" }
    ]
}
```

No extra configuration is needed.

---

## 5️⃣ Post-Deployment: Connect Frontend ↔ Backend

After both services are live:

1. **Copy your Vercel URL** (e.g. `https://my-movie-app.vercel.app`).
2. Go to your **Render Dashboard → Environment → Environment Variables**.
3. Set `FRONTEND_URL` to your Vercel URL.
4. Click **Save Changes** → Render will auto-redeploy.

This step ensures CORS is properly configured (though the current backend allows all origins).

---

## ✅ Post-Deployment Checklist

Test these in order after both services are live:

| # | Test | URL / Action | Expected Result |
|---|---|---|---|
| 1 | Backend health | `https://YOUR-BACKEND.onrender.com/` | `"Movie Recommendation API is running…"` |
| 2 | API test | `https://YOUR-BACKEND.onrender.com/api/health` | `{"status": "ok"}` |
| 3 | Popular movies | `https://YOUR-BACKEND.onrender.com/api/popular` | JSON list of movies |
| 4 | Frontend loads | `https://YOUR-FRONTEND.vercel.app` | Home page with movie cards |
| 5 | Sign up | Create a new account | Success message / redirect |
| 6 | Log in | Log in with credentials | JWT token issued, redirected |
| 7 | Search | Search for a movie | Results appear with posters |
| 8 | Recommendations | Click on a movie for similar | Related movies displayed |

---

## 🔄 Maintenance & Redeployment

### When You Push Code Changes

Both Vercel and Render auto-deploy on `git push` to `main`.

### Manual Redeploy

**Render (Backend):**
1. Go to Dashboard → your Web Service.
2. Click **Manual Deploy → Deploy latest commit**.
3. If issues persist, choose **Clear build cache & deploy**.

**Vercel (Frontend):**
1. Go to Dashboard → **Deployments**.
2. Click the **⋮** menu on the latest deployment.
3. Select **Redeploy**.
4. ⚠️ **Uncheck** "Use existing Build Cache" to pick up new env vars.
5. Click **Redeploy**.

### When You Change Environment Variables

- **Render**: Saving env vars triggers an automatic redeploy.
- **Vercel**: You must **manually redeploy** (without cache) for env var changes to take effect.

---

## 🐛 Troubleshooting

### Backend won't start / crashes on Render

| Symptom | Fix |
|---|---|
| `ModuleNotFoundError` | Check `requirements.txt` has all packages |
| `FileNotFoundError: ../data/…` | Data CSVs are missing — see Step 0 about `data/` in `.gitignore` |
| `psycopg2` errors | Ensure `psycopg2-binary` is in `requirements.txt` |
| `Connection refused` (DB) | Verify `DATABASE_URL` env var matches Supabase URI |
| Model training hangs | Free tier has limited RAM — this may take a few minutes |

### Frontend shows "Network Error" / API calls fail

| Symptom | Fix |
|---|---|
| CORS errors in console | Backend already allows all origins — check the URL is correct |
| `ERR_CONNECTION_REFUSED` | Backend may be sleeping (free tier) — wait ~30s for cold start |
| Wrong API URL | Update the hardcoded URL in `frontend/src/api.js` line 6 |
| Blank page on routes | Verify `vercel.json` rewrites are in place |

### Render Free Tier Caveats

- **Cold starts**: The backend spins down after 15 min of inactivity. First request may take 30–60s.
- **Ephemeral disk**: `model.pkl` is retrained on every deploy. This is expected behavior.
- **512 MB RAM limit**: Data loading + model training must complete within memory limits.

### Supabase Free Tier Caveats

- **Pauses after 1 week of inactivity**: Go to Supabase Dashboard and resume the project.
- **500 MB database limit**: The MovieLens small dataset fits well within this.

---

## 📂 Key Files Reference

| File | Purpose |
|---|---|
| `backend/app.py` | Flask app factory, CORS, DB, JWT setup |
| `backend/routes.py` | All API endpoints (`/api/…`) |
| `backend/models.py` | SQLAlchemy models (User, Movie, Rating) |
| `backend/load_data.py` | Seeds DB from MovieLens CSVs + TMDB posters |
| `backend/train_model.py` | Trains SVD recommender → saves `model.pkl` |
| `backend/recommender.py` | Loads model and generates recommendations |
| `backend/requirements.txt` | Python dependencies |
| `backend/Procfile` | Heroku-style process file (also used by Render) |
| `frontend/src/api.js` | Axios instance with backend URL |
| `frontend/vercel.json` | SPA rewrite rules for Vercel |
| `frontend/.env.production` | Production env vars (Vite build) |
| `docker-compose.yml` | Local development with Docker (optional) |

---

✅ **Done!** Your full-stack Movie Recommendation System is now live. 🎬
