from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), nullable=True)
    password_hash = db.Column(db.String(255))
    liked_movies = db.Column(db.JSON, default=list) # Stores list of movie_ids
    watch_history = db.Column(db.JSON, default=list) # Stores list of {movie_id, timestamp, rating}
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    ratings = db.relationship('Rating', backref='user', lazy=True)

class Movie(db.Model):
    __tablename__ = 'movies'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    genres = db.Column(db.String(255))
    tmdb_id = db.Column(db.Integer, nullable=True)
    poster_url = db.Column(db.String(512), nullable=True)
    release_year = db.Column(db.Integer, nullable=True)
    actors = db.Column(db.JSON, default=list) # List of actor names
    
    ratings = db.relationship('Rating', backref='movie', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'genres': self.genres,
            'poster_url': self.poster_url,
            'release_year': self.release_year,
            'actors': self.actors,
            'tmdb_id': self.tmdb_id
        }

class Rating(db.Model):
    __tablename__ = 'ratings'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id'), nullable=False)
    rating = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.Integer)
