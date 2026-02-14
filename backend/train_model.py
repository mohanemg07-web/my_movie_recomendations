import os
import sys
import pickle
import pandas as pd
import numpy as np
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import train_test_split
from app import create_app
from models import Rating, Movie, db

sys.path.append(os.getcwd())

MODEL_PATH = 'model.pkl'

def train_and_evaluate():
    app = create_app()
    with app.app_context():
        # Load ratings from DB
        print("Loading ratings from database...")
        query = Rating.query.statement
        df = pd.read_sql(query, db.engine)
    
    print(f"Loaded {len(df)} ratings.")
    
    # 1. Baseline: Global Mean
    global_mean = df['rating'].mean()
    print(f"\nGlobal Mean Rating: {global_mean:.2f}")
    
    # Split
    train_df, test_df = train_test_split(df, test_size=0.2, random_state=42)
    
    # Evaluate Baseline
    y_true = test_df['rating'].values
    y_pred_baseline = [global_mean] * len(y_true)
    mae_baseline = mean_absolute_error(y_true, y_pred_baseline)
    rmse_baseline = np.sqrt(mean_squared_error(y_true, y_pred_baseline))
    print(f"\nBaseline (Global Mean) MAE: {mae_baseline:.4f}")
    print(f"Baseline (Global Mean) RMSE: {rmse_baseline:.4f}")

    # 2. Collaborative Filtering (SVD with Mean Centering)
    print("\nPreparing data for SVD (Centering ratings)...")
    
    # Calculate user means from training data
    user_means = train_df.groupby('user_id')['rating'].mean()
    
    # Subtract mean
    train_df = train_df.copy()
    train_df['rating_centered'] = train_df.apply(
        lambda row: row['rating'] - user_means.get(row['user_id'], global_mean), axis=1
    )
    
    # Create Matrix
    train_matrix = train_df.pivot_table(index='user_id', columns='movie_id', values='rating_centered').fillna(0)
    
    # SVD
    n_components = 20
    print(f"Training TruncatedSVD with n_components={n_components}...")
    svd = TruncatedSVD(n_components=n_components, random_state=42)
    matrix_reduced = svd.fit_transform(train_matrix) # U * Sigma
    
    # Reconstruct: U * Sigma * Vt
    # Predicted_Centered = U * S * Vt
    matrix_reconstructed = np.dot(matrix_reduced, svd.components_)
    
    # Map back to Dataframe structure
    # We need to map indices back to IDs
    user_ids = train_matrix.index
    movie_ids = train_matrix.columns
    
    user_map = {uid: i for i, uid in enumerate(user_ids)}
    movie_map = {mid: i for i, mid in enumerate(movie_ids)}
    
    y_pred_svd = []
    y_true_svd = []
    
    hits = 0
    misses = 0
    
    for _, row in test_df.iterrows():
        uid = row['user_id']
        mid = row['movie_id']
        
        if uid in user_map and mid in movie_map:
            u_idx = user_map[uid]
            m_idx = movie_map[mid]
            
            # Predict centered rating
            pred_centered = matrix_reconstructed[u_idx, m_idx]
            
            # Add mean back
            user_mean = user_means.get(uid, global_mean)
            pred_rating = pred_centered + user_mean
            
            # Clip to range
            pred_rating = max(0.5, min(5.0, pred_rating))
            
            y_pred_svd.append(pred_rating)
            y_true_svd.append(row['rating'])
            hits += 1
        else:
            misses += 1
    
    print(f"\nSVD Evaluation on {hits} overlapping ratings (skipped {misses})...")
    if y_true_svd:
        mae_svd = mean_absolute_error(y_true_svd, y_pred_svd)
        rmse_svd = np.sqrt(mean_squared_error(y_true_svd, y_pred_svd))
        print(f"SVD MAE: {mae_svd:.4f}")
        print(f"SVD RMSE: {rmse_svd:.4f}")
        print(f"Improvement over Baseline MAE: {mae_baseline - mae_svd:.4f}")
    
    # Train Final Model
    print("\nTraining final model on full dataset...")
    # Calculate means on full data
    full_user_means = df.groupby('user_id')['rating'].mean()
    df['rating_centered'] = df.apply(lambda row: row['rating'] - full_user_means[row['user_id']], axis=1)
    
    full_matrix = df.pivot_table(index='user_id', columns='movie_id', values='rating_centered').fillna(0)
    
    svd_final = TruncatedSVD(n_components=n_components, random_state=42)
    matrix_final = svd_final.fit_transform(full_matrix)
    
    model_data = {
        'svd': svd_final,
        'user_ids': list(full_matrix.index),
        'movie_ids': list(full_matrix.columns),
        'user_means': full_user_means.to_dict(),
        'matrix_reduced': matrix_final,
        'components': svd_final.components_,
        'global_mean': global_mean
    }
    
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model_data, f)
        
    print(f"Final Model saved to {MODEL_PATH}")

if __name__ == "__main__":
    train_and_evaluate()
