import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://vegfyjfvvuhijqzqtxns.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sb_publishable_8ZCuKqtofVJcFOUzg7DS3A_fvVS9ItA")

supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_supabase() -> Client:
    return supabase_client
