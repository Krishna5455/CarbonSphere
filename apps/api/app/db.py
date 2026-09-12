import os
from typing import Optional
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

_supabase_client: Optional[Client] = None

def get_supabase() -> Client:
    """
    Returns an initialized Supabase client instance.
    Lazily loads credentials from environment to prevent import-time crashes.
    """
    global _supabase_client
    if _supabase_client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        if not url or not key:
            raise RuntimeError(
                "Missing required Supabase configuration. Please set SUPABASE_URL and SUPABASE_KEY "
                "in your environment or backend/.env file."
            )
        _supabase_client = create_client(url, key)
    return _supabase_client
