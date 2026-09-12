import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "Missing required Supabase configuration. Please set SUPABASE_URL and SUPABASE_KEY "
        "in your environment or backend/.env file."
    )

supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_supabase() -> Client:
    return supabase_client
