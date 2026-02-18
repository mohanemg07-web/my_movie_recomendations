from flask import Blueprint, jsonify, request
from models import db, User, Movie, Rating
from recommender import recommender
import time
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt
import os

# Ensure API Key is available
if not os.environ.get('TMDB_API_KEY'):
    # Try to load from .env file directly if not set
    try:
        with open('../frontend/.env', 'r') as f:
            for line in f:
                if 'VITE_TMDB_API_KEY' in line:
                    os.environ['TMDB_API_KEY'] = line.split('=')[1].strip()
                    break
    except:
        pass

import requests
import os

# Helper to fetch full details from TMDB
def fetch_tmdb_movie_details(tmdb_id):
    api_key = os.environ.get('TMDB_API_KEY')
    if not api_key:
        # Fallback to hardcoded or shared env if not in os.environ
        # For now, let's assume it's loaded or use the one from config
        # In a real app config is better.
        pass
    
    if not tmdb_id:
        return None

    try:
        url = f"https://api.themoviedb.org/3/movie/{tmdb_id}?api_key={api_key}&append_to_response=videos,release_dates"
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            return res.json()
    except Exception as e:
        print(f"Error fetching TMDB details: {e}")
    return None

def ensure_posters(movies_data):
    """
    Checks a list of movie dictionaries for missing poster_urls.
    If missing, fetches from TMDB, updates the DB, and updates the dictionary in-place.
    """
    if not movies_data:
        return

    # Identify movies needing updates
    missing_indices = []
    missing_ids = []
    
    for i, m in enumerate(movies_data):
        if not m.get('poster_url') and m.get('tmdb_id'):
            missing_indices.append(i)
            missing_ids.append(m.get('movie_id') or m.get('id')) 

    if not missing_ids:
        return

    # Query DB objects to update
    movies_to_update = Movie.query.filter(Movie.id.in_(missing_ids)).all()
    
    updated_count = 0
    for mov in movies_to_update:
        print(f"Fetching missing poster for: {mov.title}")
        tmdb_info = fetch_tmdb_movie_details(mov.tmdb_id)
        
        if tmdb_info:
            poster_path = tmdb_info.get('poster_path')
            if poster_path:
                full_poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}"
                mov.poster_url = full_poster_url
                
                # Update the dictionaries in our list
                for idx in missing_indices:
                    item = movies_data[idx]
                    item_id = item.get('movie_id') or item.get('id')
                    if item_id == mov.id:
                        item['poster_url'] = full_poster_url
                
                updated_count += 1
                
    if updated_count > 0:
        try:
            db.session.commit()
            print(f"Updated posters for {updated_count} movies.")
        except Exception as e:
            print(f"Failed to commit poster updates: {e}")
            db.session.rollback()

api = Blueprint('api', __name__)

@api.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

@api.route('/movies/details/<int:movie_id>', methods=['GET'])
def get_movie_details(movie_id):
    try:
        movie = Movie.query.get(movie_id)
        if not movie:
            return jsonify({'error': 'Movie not found'}), 404
            
        # Basic info from DB
        data = movie.to_dict()
        
        # Fetch rich info from TMDB if available
        if movie.tmdb_id:
            tmdb_data = fetch_tmdb_movie_details(movie.tmdb_id)
            if tmdb_data:
                data['overview'] = tmdb_data.get('overview')
                data['tagline'] = tmdb_data.get('tagline')
                data['runtime'] = tmdb_data.get('runtime')
                data['backdrop_path'] = tmdb_data.get('backdrop_path')
                if data['backdrop_path']:
                    data['backdrop_url'] = f"https://image.tmdb.org/t/p/original{data['backdrop_path']}"
                
                # Get Trailer
                videos = tmdb_data.get('videos', {}).get('results', [])
                trailer = next((v for v in videos if v['type'] == 'Trailer' and v['site'] == 'YouTube'), None)
                if trailer:
                    data['trailer_url'] = f"https://www.youtube.com/watch?v={trailer['key']}"
                
                # Get Certification (US)
                dates = tmdb_data.get('release_dates', {}).get('results', [])
                us_release = next((d for d in dates if d['iso_3166_1'] == 'US'), None)
                if us_release:
                    cert = next((r['certification'] for r in us_release['release_dates'] if r['certification']), None)
                    data['certification'] = cert
        
            # Save details to DB for future speedup
            if tmdb_data.get('poster_path') and not movie.poster_url:
                 movie.poster_url = f"https://image.tmdb.org/t/p/w500{tmdb_data.get('poster_path')}"
                 db.session.commit()

        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/auth/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    email = data.get('email') # Optional
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
        
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400
        
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    new_user = User(
        username=username,
        email=email,
        password_hash=hashed
    )
    db.session.add(new_user)
    db.session.commit()
    
    access_token = create_access_token(identity=new_user.id)
    return jsonify({
        'message': 'User created',
        'token': access_token,
        'user': {'id': new_user.id, 'username': new_user.username}
    }), 201

@api.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
        return jsonify({'error': 'Invalid credentials'}), 401
        
    access_token = create_access_token(identity=user.id)
    return jsonify({
        'token': access_token,
        'user': {'id': user.id, 'username': user.username}
    })

@api.route('/movies/actors', methods=['GET'])
def get_top_actors():
    # Return a curated list of top actors (fetched from loaded movies)
    # Since we store actors as JSON list in Movie, we need to aggregate.
    # Postgres specific: SELECT unnest(actors) as actor, count(*) ...
    # Or just fetch all movies and aggregate in python (easier for small dataset).
    try:
        movies = Movie.query.all()
        actor_counts = {}
        for m in movies:
            if m.actors:
                for actor in m.actors:
                    actor_counts[actor] = actor_counts.get(actor, 0) + 1
        
        # Sort by count
        sorted_actors = sorted(actor_counts.items(), key=lambda x: x[1], reverse=True)[:20]
        return jsonify([{'name': name, 'count': count} for name, count in sorted_actors])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/movies/actor/<string:actor_name>', methods=['GET'])
def get_movies_by_actor(actor_name):
    # Filter movies where actor in actors list
    try:
        movies = Movie.query.all()
        matching = [m for m in movies if m.actors and actor_name in m.actors]
        
        matching_dicts = [{
            'movie_id': m.id, 
            'title': m.title, 
            'genres': m.genres, 
            'poster_url': m.poster_url,
            'release_year': m.release_year,
            'actors': m.actors,
            'tmdb_id': m.tmdb_id
        } for m in matching[:10]]
        
        ensure_posters(matching_dicts)
        return jsonify(matching_dicts)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api.route('/movies/genre/<string:genre_name>', methods=['GET'])
def get_movies_by_genre(genre_name):
    try:
        # Use LIKE query on genres field (pipe-separated)
        movies = Movie.query.filter(Movie.genres.ilike(f'%{genre_name}%')).all()
        # Sort by rating count (proxy for popularity)
        movies_with_ratings = []
        for m in movies:
            count = Rating.query.filter_by(movie_id=m.id).count()
            movies_with_ratings.append((m, count))
        movies_with_ratings.sort(key=lambda x: x[1], reverse=True)
        top = movies_with_ratings[:15]

        result = [{
            'movie_id': m.id,
            'title': m.title,
            'genres': m.genres,
            'poster_url': m.poster_url,
            'release_year': m.release_year,
            'actors': m.actors,
            'tmdb_id': m.tmdb_id
        } for m, _ in top]

        ensure_posters(result)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api.route('/recommend/<int:user_id>', methods=['GET'])
def recommend(user_id):
    start = time.time()
    try:
        user = User.query.get(user_id)
        if not user:
            pass
            
        result = recommender.get_recommendations(user_id, n=10)
        # result is now {'type': ..., 'movies': [...]}
        movies = result.get('movies', []) if isinstance(result, dict) else result
        rec_type = result.get('type', 'popular') if isinstance(result, dict) else 'popular'
        ensure_posters(movies)
        
        return jsonify({
            'user_id': user_id,
            'recommendations': movies,
            'type': rec_type,
            'latency_ms': int((time.time() - start) * 1000)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/similar/<int:movie_id>', methods=['GET'])
def similar(movie_id):
    start = time.time()
    try:
        movie = Movie.query.get(movie_id)
        if not movie:
            return jsonify({'error': 'Movie not found'}), 404
            
        similar_movies = recommender.get_similar_movies(movie_id, n=10)
        ensure_posters(similar_movies)
        
        return jsonify({
            'movie_id': movie_id,
            'title': movie.title,
            'similar': similar_movies,
            'latency_ms': int((time.time() - start) * 1000)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

from sqlalchemy import or_

@api.route('/popular', methods=['GET'])
def popular():
    try:
        # Increase limit to 10 as requested
        movies = recommender.get_popular_movies(n=10)
        ensure_posters(movies)
        return jsonify(movies)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/search')
def search_movies():
    query = request.args.get('q', '').strip()
    if not query or len(query) < 2:
        return jsonify([])

    limit = min(int(request.args.get('limit', 20)), 50)

    # Fast DB-only search — no TMDB calls
    results = Movie.query.filter(
        or_(
            Movie.title.ilike(f'%{query}%'),
            Movie.genres.ilike(f'%{query}%')
        )
    ).limit(limit).all()

    results_dicts = [{
        'movie_id': m.id,
        'title': m.title,
        'genres': m.genres,
        'poster_url': m.poster_url,   # use whatever is already in DB
        'release_year': m.release_year,
        'actors': m.actors,
        'tmdb_id': m.tmdb_id
    } for m in results]

    return jsonify(results_dicts)

@api.route('/rate', methods=['POST'])
def rate_movie():
    data = request.json
    user_id = data.get('user_id')
    movie_id = data.get('movie_id')
    rating_val = data.get('rating')
    
    if not all([user_id, movie_id, rating_val]):
        return jsonify({'error': 'Missing data'}), 400
        
    try:
        # Check if user exists, create if not
        user = User.query.get(user_id)
        if not user:
            # Create a legacy user placeholder
            user = User(
                id=user_id,
                username=f"user{user_id}",
                email=f"user{user_id}@example.com",
                password_hash="legacy_user"
            )
            db.session.add(user)
            
        # Update or Create Rating
        existing = Rating.query.filter_by(user_id=user_id, movie_id=movie_id).first()
        if existing:
            existing.rating = float(rating_val)
            existing.timestamp = int(time.time())
        else:
            new_rating = Rating(
                user_id=user_id, 
                movie_id=movie_id, 
                rating=float(rating_val),
                timestamp=int(time.time())
            )
            db.session.add(new_rating)
            
        db.session.commit()
        
        return jsonify({'message': 'Rating saved'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@api.route('/ratings/<int:user_id>', methods=['GET'])
def get_user_ratings(user_id):
    try:
        ratings = Rating.query.filter_by(user_id=user_id).all()
        if not ratings:
            return jsonify([])

        result = []
        for r in ratings:
            movie = Movie.query.get(r.movie_id)
            if movie:
                result.append({
                    'movie_id': movie.id,
                    'title': movie.title,
                    'genres': movie.genres,
                    'poster_url': movie.poster_url,
                    'tmdb_id': movie.tmdb_id,
                    'release_year': movie.release_year,
                    'actors': movie.actors,
                    'rating': r.rating,
                    'timestamp': r.timestamp
                })

        ensure_posters(result)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

