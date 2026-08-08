# app.py
# Production Ready Movie Recommendation Backend

import os
import pickle
import difflib
import requests
import jwt
import bcrypt
import certifi
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv

# ==========================================
# Load ENV
# ==========================================
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
JWT_SECRET = os.getenv("JWT_SECRET")
TMDB_API_KEY = os.getenv("TMDB_API_KEY")

# ==========================================
# Flask App
# ==========================================
app = Flask(__name__)
CORS(app)

# ==========================================
# MongoDB
# ==========================================
client = None
db = None
users_col = None
history_col = None
likes_col = None
DB_CONNECTED = False

if not MONGO_URI:
    print("[WARNING] MONGO_URI not found in environment variables. Database features will be unavailable.")
else:
    try:
        print("[INFO] Connecting to MongoDB Atlas...")
        print("[INFO] Connection string (redacted): mongodb+srv://***:***@cluster0.uphneya.mongodb.net/...")
        
        # Enhanced MongoDB connection with proper TLS/SSL settings
        client = MongoClient(
            MONGO_URI,
            serverSelectionTimeoutMS=10000,  # 10 second timeout
            connectTimeoutMS=15000,  # 15 second connection timeout
            socketTimeoutMS=30000,  # 30 second socket timeout
            tls=True,
            tlsAllowInvalidCertificates=False,  # Strictly validate certificates
            tlsCAFile=certifi.where(),  # Use certifi CA bundle
            retryWrites=True,
            w='majority',
            maxPoolSize=50,
            minPoolSize=10
        )
        
        # Test the connection with ping
        try:
            client.admin.command('ping')
            print("[SUCCESS] MongoDB connection established!")
            
            # Initialize database collections
            db = client["moviedb"]
            users_col = db["users"]
            history_col = db["history"]
            likes_col = db["likes"]
            DB_CONNECTED = True
            
        except Exception as ping_error:
            print(f"[WARNING] MongoDB ping failed: {type(ping_error).__name__}: {str(ping_error)}")
            print("[WARNING] Database features will be unavailable. Movie recommendation will still work.")
            db = None
            users_col = None
            history_col = None
            likes_col = None
            
    except Exception as e:
        print(f"[ERROR] Failed to create MongoDB connection: {type(e).__name__}")
        print(f"[ERROR] Details: {str(e)}")
        print("[WARNING] Database features will be unavailable. Movie recommendation will still work.")
        print("\n[TROUBLESHOOTING]:")
        print("1. Check MongoDB Atlas cluster is running: https://cloud.mongodb.com")
        print("2. Verify IP is whitelisted in MongoDB Atlas Network Access")
        print("3. Verify credentials are correct: username/password in MONGO_URI")
        print("4. Check internet connection and DNS resolution")
        print("5. Try: python -c 'import certifi; print(certifi.where())'")
        db = None
        users_col = None
        history_col = None
        likes_col = None


def db_available():
    """Check if database connection is available"""
    return db is not None and DB_CONNECTED

# ==========================================
# Load ML Model
# ==========================================
movies = pickle.load(open("model/movie_list.pkl", "rb"))
similarity = pickle.load(open("model/similarity.pkl", "rb"))

movies["clean_title"] = movies["title"].astype(str).str.strip().str.lower()

# ==========================================
# JWT TOKEN
# ==========================================
def generate_token(user_id):
    payload = {
        "user_id": str(user_id),
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")

        if not token:
            return jsonify({"error": "Token missing"}), 401

        try:
            token = token.replace("Bearer ", "")
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            current_user = data["user_id"]
        except:
            return jsonify({"error": "Invalid token"}), 401

        return f(current_user, *args, **kwargs)

    return decorated


# ==========================================
# TMDB HELPERS
# ==========================================
def fetch_movie_details(movie_id):
    try:
        url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={TMDB_API_KEY}&language=en-US"
        # Reduce timeout from 10 to 3 seconds for faster response
        data = requests.get(url, timeout=3).json()

        return {
            "poster": "https://image.tmdb.org/t/p/w500" + data["poster_path"] if data.get("poster_path") else "",
            "overview": data.get("overview", ""),
            "rating": data.get("vote_average", 0),
            "release_date": data.get("release_date", "")
        }
    except Exception as e:
        # Return empty dict on timeout or error, don't block the response
        return {}


def fetch_watch_providers(movie_id):
    try:
        url = f"https://api.themoviedb.org/3/movie/{movie_id}/watch/providers?api_key={TMDB_API_KEY}"
        data = requests.get(url, timeout=10).json()

        providers = data.get("results", {}).get("IN", {})
        flatrate = providers.get("flatrate", [])

        return [x["provider_name"] for x in flatrate]
    except:
        return []


# ==========================================
# RECOMMENDATION ENGINE
# ==========================================
def recommend_movie(movie_name):
    movie_search = movie_name.strip().lower()

    matching = movies[movies["clean_title"] == movie_search]

    if matching.empty:
        matching = movies[movies["clean_title"].str.contains(movie_search, na=False)]

    if matching.empty:
        close = difflib.get_close_matches(
            movie_search,
            movies["clean_title"].tolist(),
            n=1,
            cutoff=0.6
        )
        if close:
            matching = movies[movies["clean_title"] == close[0]]

    if matching.empty:
        return None

    index = matching.index[0]

    distances = sorted(
        list(enumerate(similarity[index])),
        reverse=True,
        key=lambda x: x[1]
    )

    results = []

    for i in distances[1:7]:
        row = movies.iloc[i[0]]
        movie_id = row.movie_id
        title = row.title

        details = fetch_movie_details(movie_id)

        results.append({
            "id": str(movie_id),
            "movie_id": int(movie_id),
            "title": title,
            "poster_path": details.get("poster", ""),
            "poster": details.get("poster", ""),
            "vote_average": details.get("rating", 0),
            "rating": details.get("rating", 0),
            "release_date": details.get("release_date", ""),
            "overview": details.get("overview", "")
        })

    return results


# ==========================================
# AUTH ROUTES
# ==========================================
@app.route("/register", methods=["POST"])
def register():
    if not db_available():
        return jsonify({"error": "Database temporarily unavailable. Please try again later."}), 503
    
    data = request.json

    name = data.get("name")
    email = data.get("email").lower()
    password = data.get("password")

    if users_col.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 400

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    result = users_col.insert_one({
        "name": name,
        "email": email,
        "password": hashed,
        "created_at": datetime.utcnow()
    })

    token = generate_token(result.inserted_id)

    return jsonify({
        "message": "Registered Successfully",
        "token": token,
        "user": {
            "id": str(result.inserted_id),
            "name": name,
            "email": email,
            "joinedDate": datetime.utcnow().strftime("%B %d, %Y")
        }
    })


@app.route("/login", methods=["POST"])
def login():
    if not db_available():
        return jsonify({"error": "Database temporarily unavailable. Please try again later."}), 503
    
    data = request.json

    email = data.get("email").lower()
    password = data.get("password")

    user = users_col.find_one({"email": email})

    if not user:
        return jsonify({"error": "Invalid email"}), 401

    if not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return jsonify({"error": "Wrong password"}), 401

    token = generate_token(user["_id"])

    return jsonify({
        "message": "Login Successful",
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "joinedDate": user.get("created_at", datetime.utcnow()).strftime("%B %d, %Y")
        }
    })


@app.route("/profile", methods=["GET"])
@token_required
def get_profile(current_user):
    if not db_available():
        return jsonify({"error": "Database temporarily unavailable. Please try again later."}), 503
    
    user = users_col.find_one({"_id": ObjectId(current_user)})

    if not user:
        return jsonify({"error": "User not found"}), 404

    total_searches = history_col.count_documents({"user_id": current_user})

    return jsonify({
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "joinedDate": user.get("created_at", datetime.utcnow()).strftime("%B %d, %Y"),
        "totalSearches": total_searches
    })


# ==========================================
# MOVIE ROUTES
# ==========================================
@app.route("/movies", methods=["GET"])
def movies_list():
    # Return a curated list of popular movies (first 10 for fast response)
    movie_list = []
    try:
        # Only fetch 10 movies to keep response fast
        for idx, row in movies.head(10).iterrows():
            movie_id = row.movie_id
            title = row.title
            
            # Fetch details from TMDB for each movie (with short timeout)
            details = fetch_movie_details(movie_id)
            
            movie_list.append({
                "id": str(movie_id),
                "movie_id": int(movie_id),
                "title": title,
                "poster_path": details.get("poster", ""),
                "poster": details.get("poster", ""),
                "vote_average": details.get("rating", 0),
                "rating": details.get("rating", 0),
                "release_date": details.get("release_date", ""),
                "overview": details.get("overview", "")
            })
    except Exception as e:
        print(f"[ERROR] /movies endpoint: {e}")
        # Return whatever movies we've collected so far
        if not movie_list:
            return jsonify({"error": "Failed to fetch movies", "message": str(e)}), 500
    
    return jsonify(movie_list)


@app.route("/recommend/<path:movie_name>", methods=["GET"])
def get_recommend(movie_name):
    data = recommend_movie(movie_name)

    if data is None:
        return jsonify({"error": "Movie not found"}), 404

    return jsonify(data)


@app.route("/movie/<int:movie_id>", methods=["GET"])
def movie_details(movie_id):
    data = fetch_movie_details(movie_id)
    providers = fetch_watch_providers(movie_id)

    return jsonify({
        "details": data,
        "watch_on": providers
    })


# ==========================================
# USER HISTORY
# ==========================================
@app.route("/search", methods=["POST"])
@token_required
def save_search(current_user):
    if not db_available():
        return jsonify({"error": "Database temporarily unavailable. Please try again later."}), 503
    
    data = request.json

    history_col.insert_one({
        "user_id": current_user,
        "movie": data.get("movie"),
        "time": datetime.utcnow()
    })

    return jsonify({"message": "Saved"})


@app.route("/history", methods=["GET"])
@token_required
def get_history(current_user):
    if not db_available():
        return jsonify({"error": "Database temporarily unavailable. Please try again later."}), 503
    
    searches = list(
        history_col.find(
            {"user_id": current_user}
        ).sort("time", -1).limit(20)
    )

    history_movies = []
    seen = set()
    
    for search in searches:
        movie_name = search["movie"]
        try:
            recommendations = recommend_movie(movie_name)
            if recommendations:
                for rec in recommendations[:1]:  # Just take first recommendation
                    rec_id = rec.get("id") or rec.get("movie_id")
                    if rec_id not in seen:
                        seen.add(rec_id)
                        history_movies.append({
                            "id": str(rec.get("id") or rec.get("movie_id")),
                            "movie_id": rec.get("movie_id"),
                            "title": rec["title"],
                            "poster_path": rec.get("poster_path") or rec.get("poster", ""),
                            "poster": rec.get("poster") or rec.get("poster_path", ""),
                            "vote_average": rec.get("vote_average") or rec.get("rating", 0),
                            "rating": rec.get("rating") or rec.get("vote_average", 0),
                            "release_date": rec.get("release_date", ""),
                            "overview": rec.get("overview", "")
                        })
        except:
            pass

    return jsonify(history_movies)


# ==========================================
# PERSONALIZED RECOMMENDATION
# ==========================================
@app.route("/personalized", methods=["GET"])
@token_required
def personalized(current_user):
    if not db_available():
        return jsonify({"error": "Database temporarily unavailable. Please try again later."}), 503
    
    searches = list(
        history_col.find(
            {"user_id": current_user}
        ).sort("time", -1).limit(5)
    )

    if not searches:
        return jsonify({"error": "No history found"}), 404

    last_movie = searches[0]["movie"]

    rec = recommend_movie(last_movie)

    return jsonify(rec)


# ==========================================
# HEALTH CHECK
# ==========================================
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "database": "connected" if db_available() else "unavailable",
        "recommendation_engine": "working",
        "message": "Backend is running"
    })


# ==========================================
# RUN SERVER
# ==========================================
if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 Movie Recommendation Backend Starting...")
    print("="*60)
    if DB_CONNECTED:
        print("✅ Database: Connected")
    else:
        print("⚠️  Database: Not Connected (Features Limited)")
    print("✅ Recommendation Engine: Ready")
    print("✅ Movie API: Ready")
    print("\nServer running on http://localhost:5000")
    print("Health check: http://localhost:5000/health")
    print("="*60 + "\n")
    
    # Run without debug mode (prevents auto-reloader issues)
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)