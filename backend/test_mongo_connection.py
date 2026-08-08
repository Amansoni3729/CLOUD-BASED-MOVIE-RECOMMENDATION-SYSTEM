#!/usr/bin/env python3
"""
MongoDB Connection Diagnostic Script
Helps troubleshoot MongoDB Atlas connectivity issues
"""

import os
import sys
import socket
import dns.resolver
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

def test_dns_resolution():
    """Test DNS resolution for MongoDB cluster"""
    print("\n[1] Testing DNS Resolution...")
    print("-" * 50)
    
    if not MONGO_URI:
        print("❌ MONGO_URI not found in .env file")
        return False
    
    # Extract the cluster domain from the connection string
    # mongodb+srv://user:pass@cluster0.uphneya.mongodb.net/...
    try:
        domain = MONGO_URI.split("@")[1].split("/")[0]
        print(f"Cluster domain: {domain}")
        
        # Try standard DNS resolution
        print(f"Attempting to resolve: {domain}")
        result = socket.gethostbyname(domain)
        print(f"✅ DNS resolution successful: {domain} -> {result}")
        return True
    except socket.gaierror as e:
        print(f"❌ DNS resolution failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_mongodb_connection():
    """Test MongoDB connection"""
    print("\n[2] Testing MongoDB Connection...")
    print("-" * 50)
    
    if not MONGO_URI:
        print("❌ MONGO_URI not found in .env file")
        return False
    
    try:
        from pymongo import MongoClient
        
        print(f"Connection string (redacted): mongodb+srv://***:***@cluster0.uphneya.mongodb.net/...")
        
        # Try to connect with timeout
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        
        # Test the connection with ping
        client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        
        # List databases
        databases = client.list_database_names()
        print(f"Available databases: {databases}")
        return True
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print(f"Error type: {type(e).__name__}")
        return False

def test_network_connectivity():
    """Test basic network connectivity"""
    print("\n[3] Testing Network Connectivity...")
    print("-" * 50)
    
    try:
        # Try to resolve MongoDB cluster domain
        socket.gethostbyname("cluster0.uphneya.mongodb.net")
        print("✅ Can resolve MongoDB cluster domain")
        return True
    except Exception as e:
        print(f"❌ Cannot reach MongoDB cluster: {e}")
        return False

def check_firewall():
    """Check if MongoDB ports are accessible"""
    print("\n[4] Checking Firewall/Port Access...")
    print("-" * 50)
    
    try:
        # MongoDB Atlas uses port 27017
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        
        # Try to connect to MongoDB Atlas
        result = sock.connect_ex(("cluster0.uphneya.mongodb.net", 27017))
        sock.close()
        
        if result == 0:
            print("✅ Port 27017 is accessible")
            return True
        else:
            print("⚠️ Port 27017 may be blocked by firewall")
            return False
    except Exception as e:
        print(f"⚠️ Error checking port: {e}")
        return False

def main():
    """Run all diagnostic tests"""
    print("\n" + "=" * 50)
    print("MongoDB Connection Diagnostics")
    print("=" * 50)
    
    results = {
        "DNS Resolution": test_dns_resolution(),
        "Network Connectivity": test_network_connectivity(),
        "Firewall/Port Access": check_firewall(),
        "MongoDB Connection": test_mongodb_connection(),
    }
    
    print("\n" + "=" * 50)
    print("Diagnostic Summary")
    print("=" * 50)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    print("\n[TROUBLESHOOTING GUIDE]:")
    print("-" * 50)
    
    if not results["DNS Resolution"]:
        print("• DNS Resolution failed:")
        print("  - Check your internet connection")
        print("  - Try using a different DNS server (8.8.8.8)")
        print("  - Contact your network administrator if on corporate network")
    
    if not results["MongoDB Connection"]:
        print("• MongoDB Connection failed:")
        print("  - Verify MONGO_URI in .env is correct")
        print("  - Check MongoDB Atlas cluster status: https://cloud.mongodb.com")
        print("  - Whitelist your IP address in MongoDB Atlas")
        print("  - Try regenerating credentials in MongoDB Atlas")
    
    print("\n[ALTERNATIVE SOLUTIONS]:")
    print("-" * 50)
    print("1. Use MongoDB Atlas 'Data Access' to regenerate credentials")
    print("2. Create a new cluster if the current one is unreachable")
    print("3. Use MongoDB local instance instead for development:")
    print("   MONGO_URI=mongodb://localhost:27017/moviedb")
    print("4. Check MongoDB Atlas Network Access settings")
    print("=" * 50 + "\n")

if __name__ == "__main__":
    main()
