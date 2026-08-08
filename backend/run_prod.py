#!/usr/bin/env python3
"""
Production start script for Movie Recommendation Backend
Runs without debug mode for stable execution
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from app import app

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 Movie Recommendation Backend Starting (Production Mode)...")
    print("="*60)
    print("✅ Recommendation Engine: Ready")
    print("✅ Movie API: Ready")
    print("\nServer running on http://localhost:5000")
    print("Health check: http://localhost:5000/health")
    print("="*60 + "\n")
    
    # Run without debug mode (production)
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)
