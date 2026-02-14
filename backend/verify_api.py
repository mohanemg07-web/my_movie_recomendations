import requests
import sys

BASE_URL = "http://127.0.0.1:5000/api"

def test_endpoints():
    print("Testing API Endpoints...")
    
    # 1. Popular
    try:
        print("\nGET /popular")
        r = requests.get(f"{BASE_URL}/popular")
        if r.status_code == 200:
            print("Success!")
            data = r.json()
            print(f"Received {len(data)} popular movies.")
            print(f"Top 1: {data[0]['title']}")
        else:
            print(f"Failed: {r.status_code} - {r.text}")
    except Exception as e:
        print(f"Error: {e}")

    # 2. Recommendations (User 1)
    try:
        print("\nGET /recommend/1")
        r = requests.get(f"{BASE_URL}/recommend/1")
        if r.status_code == 200:
            print("Success!")
            data = r.json()
            recs = data['recommendations']
            print(f"Received {len(recs)} recommendations for user 1.")
            if recs:
                print(f"Top 1: {recs[0]['title']} (Pred: {recs[0]['predicted_rating']:.2f})")
        else:
            print(f"Failed: {r.status_code} - {r.text}")
    except Exception as e:
        print(f"Error: {e}")

    # 3. Similar (Movie 1 - Toy Story)
    try:
        print("\nGET /similar/1")
        r = requests.get(f"{BASE_URL}/similar/1")
        if r.status_code == 200:
            print("Success!")
            data = r.json()
            sims = data['similar']
            print(f"Received {len(sims)} similar movies to Toy Story.")
            if sims:
                print(f"Top 1: {sims[0]['title']} (Score: {sims[0]['score']:.2f})")
        else:
            print(f"Failed: {r.status_code} - {r.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_endpoints()
