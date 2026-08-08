import pandas as pd
import numpy as np
import pickle
import os
import ast
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler

# =====================================================
# CLOUD BASED SMART MOVIE RECOMMENDATION MODEL
# Updated Version
# Better Accuracy + Personalized Ready + Scalable
# =====================================================

# -----------------------------
# Load Dataset
# -----------------------------
movies = pd.read_csv("dataset/tmdb_5000_movies.csv")
credits = pd.read_csv("dataset/tmdb_5000_credits.csv")

# Merge datasets
movies = movies.merge(credits, on="title")

# -----------------------------
# Keep Important Columns
# -----------------------------
movies = movies[
    [
        "movie_id",
        "title",
        "overview",
        "genres",
        "keywords",
        "cast",
        "crew",
        "vote_average",
        "vote_count",
        "popularity",
        "release_date",
        "original_language"
    ]
]

# Fill missing values
movies.fillna("", inplace=True)

# -----------------------------
# Helper Functions
# -----------------------------
def convert(obj):
    data = []
    try:
        for i in ast.literal_eval(obj):
            data.append(i["name"])
    except:
        pass
    return data


def top_cast(obj):
    data = []
    try:
        for i in ast.literal_eval(obj)[:5]:
            data.append(i["name"])
    except:
        pass
    return data


def fetch_director(obj):
    data = []
    try:
        for i in ast.literal_eval(obj):
            if i["job"] == "Director":
                data.append(i["name"])
                break
    except:
        pass
    return data


def clean_words(lst):
    return [i.replace(" ", "").lower() for i in lst]


def year_extract(date):
    try:
        return int(str(date).split("-")[0])
    except:
        return 2000


# -----------------------------
# Feature Engineering
# -----------------------------
movies["genres"] = movies["genres"].apply(convert)
movies["keywords"] = movies["keywords"].apply(convert)
movies["cast"] = movies["cast"].apply(top_cast)
movies["crew"] = movies["crew"].apply(fetch_director)
movies["overview"] = movies["overview"].apply(lambda x: str(x).split())

movies["genres"] = movies["genres"].apply(clean_words)
movies["keywords"] = movies["keywords"].apply(clean_words)
movies["cast"] = movies["cast"].apply(clean_words)
movies["crew"] = movies["crew"].apply(clean_words)

movies["language"] = movies["original_language"].astype(str).str.lower()
movies["year"] = movies["release_date"].apply(year_extract)

# Weighted Tags
movies["tags"] = (
    movies["overview"] * 1 +
    movies["genres"] * 3 +
    movies["keywords"] * 2 +
    movies["cast"] * 2 +
    movies["crew"] * 3
)

# Convert to text
movies["tags"] = movies["tags"].apply(lambda x: " ".join(x).lower())

# -----------------------------
# Final Dataset
# -----------------------------
new = movies[
    [
        "movie_id",
        "title",
        "tags",
        "vote_average",
        "vote_count",
        "popularity",
        "year",
        "language"
    ]
].copy()

# -----------------------------
# Text Vectorization
# -----------------------------
tfidf = TfidfVectorizer(
    max_features=12000,
    stop_words="english",
    ngram_range=(1, 2)
)

text_vectors = tfidf.fit_transform(new["tags"]).toarray()

# -----------------------------
# Numeric Features Boost
# -----------------------------
num_features = new[["vote_average", "vote_count", "popularity", "year"]].copy()

scaler = MinMaxScaler()
scaled_num = scaler.fit_transform(num_features)

# Merge text + numeric features
final_vectors = np.hstack((text_vectors, scaled_num))

# -----------------------------
# Similarity Matrix
# -----------------------------
similarity = cosine_similarity(final_vectors)

# -----------------------------
# Search Support Columns
# -----------------------------
new["clean_title"] = new["title"].astype(str).str.strip().str.lower()

# -----------------------------
# Save Model Files
# -----------------------------
os.makedirs("model", exist_ok=True)

pickle.dump(new, open("model/movie_list.pkl", "wb"))
pickle.dump(similarity, open("model/similarity.pkl", "wb"))
pickle.dump(tfidf, open("model/vectorizer.pkl", "wb"))
pickle.dump(scaler, open("model/scaler.pkl", "wb"))

print("Smart Cloud Recommendation Model Saved Successfully ✅")