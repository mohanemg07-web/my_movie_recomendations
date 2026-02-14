import pickle
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from models import Movie, Rating, db

class Recommender:
    def __init__(self, model_path='model.pkl'):
        self.model_path = model_path
        self.loaded = False
        self.svd = None
        self.user_ids = []
        self.movie_ids = []
        self.user_map = {}
        self.movie_map = {}
        self.user_means = {}
        self.matrix_reduced = None
        self.components = None
        self.global_mean = 3.5
        
    def load_model(self):
        try:
            with open(self.model_path, 'rb') as f:
                data = pickle.load(f)
                self.svd = data['svd']
                self.user_ids = data['user_ids']
                self.movie_ids = data['movie_ids']
                self.user_means = data['user_means']
                self.matrix_reduced = data['matrix_reduced']
                self.components = data['components']
                self.global_mean = data.get('global_mean', 3.5)
                
                self.user_map = {uid: i for i, uid in enumerate(self.user_ids)}
                self.movie_map = {mid: i for i, mid in enumerate(self.movie_ids)}
                self.loaded = True
                print("Model loaded successfully.")
        except FileNotFoundError:
            print(f"Model file {self.model_path} not found. Recommendations will be fallback only.")
        except Exception as e:
            print(f"Error loading model: {e}")

    def get_recommendations(self, user_id, n=5):
        if not self.loaded:
            return self.get_popular_movies(n)
        
        # Cold start for new user
        if user_id not in self.user_map:
            print(f"User {user_id} not in model. Returning popular movies.")
            return self.get_popular_movies(n)
        
        user_idx = self.user_map[user_id]
        user_vec = self.matrix_reduced[user_idx]
        user_mean = self.user_means.get(user_id, self.global_mean)
        
        # Predict all: dot(user_vec, item_vecs) + mean
        # item_vecs are in self.components (shape: n_components x n_movies)
        pred_ratings = np.dot(user_vec, self.components) + user_mean
        
        # We need to filter out movies user has already seen.
        # Ideally we should have a quick lookup set.
        # Since we don't have the matrix loaded as sparse/dataframe here (to save memory/time?)
        # Actually pickle had user_item_matrix dataframe, but `train_model` put it in `data`.
        # Wait, I didn't save `user_item_matrix` in final pickle in `train_model.py`'s last edit?
        # Let me check `train_model.py`. 
        # `full_matrix = df.pivot_table...`
        # `model_data = { ... 'user_ids': list(full_matrix.index), ... }`
        # I did not save `full_matrix` itself to save space?
        # No, I didn't. So I can't check what user has seen from the model file efficiently strictly speaking,
        # unless I query DB or use cached list.
        # But querying DB for a single user is fast.
        
        rated_movies = pd.read_sql(Rating.query.filter_by(user_id=user_id).statement, db.engine)
        rated_movie_ids = set(rated_movies['movie_id'].tolist())
        
        recommendations = []
        
        # pred_ratings is an array of size n_movies, corresponding to self.movie_ids
        # We want indices that sort this array descending
        
        # Get top indices (more than n, to filter rated)
        # Using argpartition is faster than full sort
        # But simple argsort is fine for 10k items
        sorted_indices = np.argsort(pred_ratings)[::-1]
        
        count = 0
        for idx in sorted_indices:
            movie_id = self.movie_ids[idx]
            if movie_id not in rated_movie_ids:
                recommendations.append({
                    'movie_id': int(movie_id),
                    'predicted_rating': float(pred_ratings[idx])
                })
                count += 1
                if count >= n:
                    break
        
        # Resolve Movie Titles
        return self._resolve_movie_details(recommendations)

    def get_similar_movies(self, movie_id, n=5):
        if not self.loaded or movie_id not in self.movie_map:
            return []
            
        movie_idx = self.movie_map[movie_id]
        # Item embedding: column of components matrix?
        # svd.components_ shape is (n_components, n_features/movies)
        # So item vec is column movie_idx
        item_vec = self.components[:, movie_idx].reshape(1, -1) # Shape (1, n_components)
        
        # Similarity with all items (columns of components)
        # components is (n_components, n_movies). transposing to (n_movies, n_components)
        item_matrix = self.components.T
        
        # Compute cosine similarity
        sim_scores = cosine_similarity(item_vec, item_matrix).flatten()
        
        # Sort
        sorted_indices = np.argsort(sim_scores)[::-1]
        
        similar_movies = []
        # Skip the first one (itself)
        for idx in sorted_indices[1:n+1]:
             similar_movies.append({
                 'movie_id': int(self.movie_ids[idx]),
                 'score': float(sim_scores[idx])
             })
             
        return self._resolve_movie_details(similar_movies)

    def get_popular_movies(self, n=5):
        # Query: Top n most rated movies
        query = db.session.query(
            Movie, 
            db.func.count(Rating.id).label('count')
        ).join(Rating).group_by(Movie.id).order_by(db.desc('count')).limit(n)
        
        results = query.all()
        # Row is (Movie, count)
        return [{
            'movie_id': m[0].id, 
            'title': m[0].title, 
            'genres': m[0].genres, 
            'tmdb_id': m[0].tmdb_id,
            'poster_url': m[0].poster_url,
            'release_year': m[0].release_year,
            'actors': m[0].actors
        } for m in results]

    def _resolve_movie_details(self, items):
        if not items:
            return []
        
        ids = [item['movie_id'] for item in items]
        movies = Movie.query.filter(Movie.id.in_(ids)).all()
        movie_map = {m.id: m for m in movies}
        
        resolved = []
        for item in items:
            mid = item['movie_id']
            if mid in movie_map:
                m = movie_map[mid]
                item['title'] = m.title
                item['genres'] = m.genres
                item['tmdb_id'] = m.tmdb_id
                item['poster_url'] = m.poster_url
                item['release_year'] = m.release_year
                item['actors'] = m.actors
                resolved.append(item)
        return resolved

recommender = Recommender()
