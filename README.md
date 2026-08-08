# 🎬 Cloud-Based Movie Recommendation System

A full-stack **Cloud-Based Movie Recommendation System** that recommends movies based on movie similarity using Machine Learning. The project combines a Python backend, machine-learning recommendation engine, database integration, and a modern web frontend to provide an interactive movie discovery experience.

---

## 📌 Project Overview

Finding a suitable movie from thousands of available options can be difficult. This project solves that problem by providing personalized movie recommendations based on the characteristics of a selected movie.

The system processes movie metadata, transforms textual features into numerical representations using **TF-IDF**, and calculates similarity between movies using **Cosine Similarity**.

Users can select/search for a movie through the frontend and receive a list of similar movies through the backend API.

---

## ✨ Key Features

- 🎥 Movie search and selection
- 🤖 Machine Learning-based movie recommendations
- 🔍 Content-based recommendation system
- 📊 TF-IDF feature extraction
- 📐 Cosine Similarity-based recommendations
- 🌐 REST API backend
- 💻 Interactive frontend interface
- 🗄️ MongoDB database integration
- ⚡ Fast recommendation generation using pre-trained model files
- ☁️ Cloud-ready architecture
- 🔐 Environment variable support for sensitive credentials

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      Frontend       │
                    │   Web Application   │
                    └──────────┬──────────┘
                               │
                               │ HTTP / REST API
                               ▼
                    ┌─────────────────────┐
                    │      Backend        │
                    │   Python / Flask    │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
      ┌──────────────────┐          ┌──────────────────┐
      │ Recommendation   │          │    MongoDB       │
      │     Engine       │          │    Database      │
      └────────┬─────────┘          └──────────────────┘
               │
               ▼
      ┌──────────────────┐
      │ ML Model Files   │
      │ TF-IDF +         │
      │ Similarity       │
      └──────────────────┘
