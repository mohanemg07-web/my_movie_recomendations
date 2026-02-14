import os
import requests
import zipfile
import io

URL = "https://files.grouplens.org/datasets/movielens/ml-latest-small.zip"
DATA_DIR = "data"

def download_and_extract():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    
    print(f"Downloading {URL}...")
    response = requests.get(URL)
    response.raise_for_status()
    
    print("Extracting...")
    with zipfile.ZipFile(io.BytesIO(response.content)) as z:
        z.extractall(DATA_DIR)
    
    print("Done!")
    # Move files from subdirectory to data root if needed, or just keep as is
    # The zip contains a folder 'ml-latest-small'
    
if __name__ == "__main__":
    download_and_extract()
