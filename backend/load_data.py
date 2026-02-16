import pandas as pd
import requests
import time
import os
from app import app, db
from models import Movie, User, Rating
from datetime import datetime
import sys
import bcrypt

# TMDB API Key
TMDB_API_KEY = os.environ.get('TMDB_API_KEY')
if not TMDB_API_KEY:
    print("WARNING: TMDB_API_KEY not found in environment variables. Data loading may be incomplete.")

def fetch_tmdb_details(tmdb_id):
    if not tmdb_id or pd.isna(tmdb_id):
        return None, None, []
    
    try:
        url = f"https://api.themoviedb.org/3/movie/{int(tmdb_id)}?api_key={TMDB_API_KEY}&append_to_response=credits"
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            data = res.json()
            poster = data.get('poster_path')
            poster_url = f"https://image.tmdb.org/t/p/w500{poster}" if poster else None
            year = int(data.get('release_date', '')[:4]) if data.get('release_date') else None
            
            actors = []
            if 'credits' in data and 'cast' in data['credits']:
                actors = [actor['name'] for actor in data['credits']['cast'][:5]]
            
            return poster_url, year, actors
    except Exception as e:
        print(f"Error fetching TMDB {tmdb_id}: {e}")
    return None, None, []

def load_data():
    with app.app_context():
        # Drop and recreate tables
        # db.drop_all() # Optional: keep data if schema is compatible, but we changed schema so likely need drop
        # Actually let's try to just create_all, but if schema changed significantly we might need to drop.
        # Given we added columns, let's drop to be safe and clean.
        db.drop_all()
        db.create_all()

        print("Reading CSV files...")
        movies_df = pd.read_csv('../data/ml-latest-small/movies.csv')
        links_df = pd.read_csv('../data/ml-latest-small/links.csv')
        ratings_df = pd.read_csv('../data/ml-latest-small/ratings.csv')

        movies_df = pd.merge(movies_df, links_df, on='movieId', how='left')

        print(f"Processing {len(movies_df)} movies...")
        
        popular_ids = ratings_df['movieId'].value_counts().head(100).index.tolist()
        
        movies_to_insert = []
        
        # We need to commit in batches or all at once? SQLAlchemy objects.
        # Let's simple iterate and add.
        
        count = 0
        for _, row in movies_df.iterrows():
            movie_id = int(row['movieId'])
            title = row['title']
            genres = row['genres'] # Keep as string for now, or split? Model expects String
            # Model definition: genres = db.Column(db.String(255))
            # Just keep original string "Action|Comedy"
            
            tmdb_id = row['tmdbId']
            
            poster_url = None
            release_year = None
            actors = []
            
            # Simple heuristic for year
            try:
                if '(' in title and ')' in title:
                   part = title.split('(')[-1].split(')')[0]
                   if part.isdigit():
                       release_year = int(part)
            except:
                pass

            if movie_id in popular_ids and TMDB_API_KEY and not pd.isna(tmdb_id):
                print(f"Fetching details for: {title}")
                p_url, r_year, c_actors = fetch_tmdb_details(tmdb_id)
                if p_url: poster_url = p_url
                if r_year: release_year = r_year
                if c_actors: actors = c_actors
                time.sleep(0.1)

            movie = Movie(
                id=movie_id,
                title=title,
                genres=genres,
                tmdb_id=int(tmdb_id) if not pd.isna(tmdb_id) else None,
                poster_url=poster_url,
                release_year=release_year,
                actors=actors # SQLAlchemy will handle JSON serialization if using correct type? 
                              # Wait, SQLite doesn't support JSON type natively in all versions, 
                              # but Postgres does. We are using Postgres.
            )
            db.session.add(movie)
            count += 1
            if count % 1000 == 0:
                print(f"Processed {count} movies...")
        
        db.session.commit()
        print(f"Committed {count} movies.")

        print("Processing Users...")
        # Create users based on ratings
        user_ids = ratings_df['userId'].unique()
        
        # Pre-hash password
        default_pw = "password"
        # bcrypt.hashpw returns bytes. store as string.
        default_hash = bcrypt.hashpw(default_pw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        for uid in user_ids:
            # We can aggregate likes for each user
            user_ratings = ratings_df[ratings_df['userId'] == uid]
            liked = user_ratings[user_ratings['rating'] >= 4.0]['movieId'].tolist()
            
            # Watch history: list of {movie_id, rating, timestamp}
            history = []
            for _, r in user_ratings.iterrows():
                history.append({
                    "movie_id": int(r['movieId']),
                    "rating": float(r['rating']),
                    "timestamp": int(r['timestamp'])
                })

            user = User(
                id=int(uid),
                username=f"user{uid}",
                email=f"user{uid}@example.com",
                password_hash=default_hash,
                liked_movies=liked,
                watch_history=history
            )
            db.session.add(user)
        
        db.session.commit()
        print("Users created.")
        
        print("Loading Ratings...")
        # Since we stored history in User, do we need Rating table?
        # Yes, for collaborative filtering or easier SQL queries.
        # But for huge datasets it's slow. Small is fine.
        
        # Speed up: Bulk insert mappings
        # ratings_df.to_sql? No, simple loop for now
        
        ratings_batch = []
        for _, row in ratings_df.iterrows():
            r = Rating(
                user_id=int(row['userId']),
                movie_id=int(row['movieId']),
                rating=float(row['rating']),
                timestamp=int(row['timestamp'])
            )
            ratings_batch.append(r)
            if len(ratings_batch) > 5000:
                db.session.bulk_save_objects(ratings_batch)
                ratings_batch = []
                db.session.commit()
        
        if ratings_batch:
            db.session.bulk_save_objects(ratings_batch)
            db.session.commit()
            
        print("Ratings loaded.")

if __name__ == "__main__":
    load_data()
