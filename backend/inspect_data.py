from app import app
from models import Movie

with app.app_context():
    total = Movie.query.count()
    with_poster = Movie.query.filter(Movie.poster_url != None).count()
    print(f"Total Movies: {total}")
    print(f"With Posters: {with_poster}")
    print(f"Missing: {total - with_poster}")
