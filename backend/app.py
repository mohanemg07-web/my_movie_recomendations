import os
from flask import Flask
from flask_cors import CORS
from models import db

def create_app():
    app = Flask(__name__)

    # ---------------- CORS ----------------
    frontend_url = os.environ.get('FRONTEND_URL', '*')
    CORS(app, resources={r"/api/*": {"origins": frontend_url}})

    # ---------------- SECRET ----------------
    app.config['SECRET_KEY'] = os.environ.get(
        'SECRET_KEY',
        'dev-key-please-change-in-prod'
    )

    # ---------------- DATABASE ----------------
    database_url = os.environ.get(
        'DATABASE_URL',
        'sqlite:///movielens.db'
    )

    # Fix postgres:// issue
    if database_url.startswith("postgres://"):
        database_url = database_url.replace(
            "postgres://",
            "postgresql://",
            1
        )

    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    # ✅ CREATE TABLES AUTOMATICALLY
    with app.app_context():
        db.create_all()

    # ---------------- JWT ----------------
    from flask_jwt_extended import JWTManager
    JWTManager(app)

    # ---------------- ROUTES ----------------
    from routes import api
    app.register_blueprint(api, url_prefix='/api')

    # ---------------- MODEL LOAD ----------------
    from recommender import recommender
    try:
        recommender.load_model()
    except Exception as e:
        print(f"Warning: Failed to load recommender model: {e}")

    return app



app = create_app()

@app.route('/')
def home():
    return "Movie Recommendation API is running. Access endpoints at /api/", 200

# ---------------- RUN ----------------
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
