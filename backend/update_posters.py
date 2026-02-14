import pandas as pd
import requests
import time
import os
from app import app, db
from models import Movie

# 1. Get API Key
TMDB_API_KEY = os.environ.get('TMDB_API_KEY')
if not TMDB_API_KEY:
    try:
        with open('../frontend/.env', 'r') as f:
            for line in f:
                if 'VITE_TMDB_API_KEY' in line:
                    TMDB_API_KEY = line.split('=')[1].strip()
                    break
    except:
        pass

print(f"Using API Key: {TMDB_API_KEY}")

def fetch_tmdb_details(tmdb_id):
    if not tmdb_id: return None, None, []
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
        print(f"Err {tmdb_id}: {e}")
    return None, None, []

def update_movies():
    with app.app_context():
        # Get movies with no poster
        # We process ALL movies effectively, but can filter
        movies_missing = Movie.query.filter(Movie.poster_url == None).all()
        print(f"Found {len(movies_missing)} movies without posters.")
        
        count = 0
        for movie in movies_missing:
            if not movie.tmdb_id: continue
            
            p_url, r_year, c_actors = fetch_tmdb_details(movie.tmdb_id)
            
            if p_url or r_year or c_actors:
                if p_url: movie.poster_url = p_url
                if r_year: movie.release_year = r_year
                if c_actors: movie.actors = c_actors
                
                # Commit every 10 updates
                if count % 10 == 0:
                    db.session.commit()
                    print(f"Updated {count}: {movie.title}")
                
            count += 1
            time.sleep(0.05) # Rate limit safety
            
        db.session.commit()
        print("Done updating posters.")

if __name__ == "__main__":
    update_movies()
