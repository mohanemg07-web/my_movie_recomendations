# Personlized Movie Recommendation Engine

A production-ready movie recommendation system using Collaborative Filtering (SVD) with a Flask backend and React frontend.

## Architecture
- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Flask + SQLAlchemy
- **Database**: PostgreSQL
- **Model**: Scikit-Surprise (SVD)
- **Deployment**: Dockerized on Render

## Setup

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL (optional, defaults to SQLite for local dev)
- Docker (optional)

### Installation

#### 1. Clone the repo
```bash
git clone https://github.com/yourusername/movie-recommendation-engine.git
cd movie-recommendation-engine
```

#### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt

# Download Data
python ../download_data.py

# Seed Database
python load_data.py

# Train Model
python train_model.py

# Run API
python app.py
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## How It Works

### Recommendation Engine
The system uses **Collaborative Filtering** via **Matrix Factorization (SVD)**.
1.  **Data Processing**: Ratings are centered by subtracting the user's mean rating to handle optimism/pessimism bias.
2.  **Training**: `scikit-learn`'s `TruncatedSVD` decomposes the User-Item matrix into latent factors.
3.  **Inference**:
    - **Personalized**: Reconstructs the rating matrix to predict ratings for unseen movies.
    - **Similar Movies**: Calculates Cosine Similarity between item latent vectors.
    - **Search**: Case-insensitive substring matching against movie titles.

### Tech Stack
- **Backend**: Flask, SQLAlchemy, Scikit-Learn
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion
- **Database**: PostgreSQL (Production) / SQLite (Dev)
- **DevOps**: Docker, Docker Compose

## License
MIT

