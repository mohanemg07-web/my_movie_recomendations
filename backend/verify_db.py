
import os
import sys
from sqlalchemy import create_engine, text

def verify_connection():
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("Error: DATABASE_URL environment variable not set.")
        print("Usage: set DATABASE_URL=postgresql://... && python verify_db.py")
        sys.exit(1)

    # Fix for SQLAlchemy if needed
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    print(f"Connecting to: {database_url.split('@')[-1]}") # Hide credentials
    
    try:
        engine = create_engine(database_url)
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print("✅ Connection Successful!")
            print(f"Database Version: {version}")
    except Exception as e:
        print("❌ Connection Failed")
        print(f"Error: {e}")

if __name__ == "__main__":
    verify_connection()
