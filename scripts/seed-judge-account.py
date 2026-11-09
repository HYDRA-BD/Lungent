"""
Python script to seed the AI Builders Congress account in Supabase.
Run with: python scripts/seed-judge-account.py
Requirements: pip install supabase
"""

import os
import sys

# Attempt reading .env.local
env_path = os.path.join(os.path.dirname(__file__), "..", "frontend", ".env.local")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip("'\"")
                if k not in os.environ:
                    os.environ[k] = v

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")

if not url or not service_key:
    print("\033[91m[Error] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local\033[0m")
    print("Please ensure credentials are set before running this script.")
    sys.exit(1)

try:
    from supabase import create_client, Client
except ImportError:
    print("\033[93m[Notice] supabase-py not installed. Install with: pip install supabase\033[0m")
    sys.exit(1)

supabase: Client = create_client(url, service_key)

account = {
    "email": "aibuilderscongress@aibc.com",
    "password": "!A1i9n7k1",
    "role": "AI Builders Congress",
    "full_name": "AI Builders Congress Judge"
}

print(f"\033[96m[Seeding]\033[0m Creating account {account['email']}...")

try:
    user = supabase.auth.admin.create_user({
        "email": account["email"],
        "password": account["password"],
        "email_confirm": True,
        "user_metadata": {
            "role": account["role"],
            "full_name": account["full_name"],
            "is_verified": True
        }
    })
    print("\033[92m[Success] Account created successfully!\033[0m")
    print(f"Email:    {account['email']}")
    print(f"Password: {account['password']}")
    print(f"Role:     {account['role']}")
except Exception as e:
    print(f"\033[93m[Notice or Error]\033[0m {e}")
