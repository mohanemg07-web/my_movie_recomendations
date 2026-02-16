
import os
import requests

# New Key
TMDB_API_KEY = "0d39651a78f8eee66ed6c67a96f641fd"

def test_tmdb_key():
    print(f"Testing TMDB Key: {TMDB_API_KEY[:4]}...{TMDB_API_KEY[-4:]}")
    url = f"https://api.themoviedb.org/3/movie/550?api_key={TMDB_API_KEY}"
    try:
        r = requests.get(url, timeout=5)
        if r.status_code == 200:
            print("Success! TMDB Key is valid.")
            print(f"Movie: {r.json().get('title')}")
        else:
            print(f"Failed: {r.status_code} - {r.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_tmdb_key()
