import os
from flask import Flask
from flask_cors import CORS
from models import db

def create_app():
    app = Flask(__name__)
    # CORS Configuration
    frontend_url = os.environ.get('FRONTEND_URL', '*')
    CORS(app, resources={r"/api/*": {"origins": frontend_url}})
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-please-change-in-prod')
    
    # Database Configuration
    # Defaults to SQLite for local development, expects DATABASE_URL for production
    database_url = os.environ.get('DATABASE_URL', 'sqlite:///movielens.db')
    # Fix for SQLAlchemy requiring postgresql:// instead of postgres://
    if database_url and database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)

    from flask_jwt_extended import JWTManager
    jwt = JWTManager(app)
    
    from routes import api
    app.register_blueprint(api, url_prefix='/api')
    
    from recommender import recommender
    # Load model lazily or ensure it doesn't block startup too long
    try:
        recommender.load_model()
    except Exception as e:
        print(f"Warning: Failed to load recommender model: {e}")
    
    return app

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', debug=True, port=port)
