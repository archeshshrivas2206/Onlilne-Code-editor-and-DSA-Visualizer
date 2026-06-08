import os, sys
sys.path.insert(0, r'c:\Users\HP\OneDrive\Desktop\projects\DSA_Visualiser\backend')
from dotenv import load_dotenv
load_dotenv()
from google import genai

api_key = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=api_key)

models = [
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.0-flash-lite',
    'gemini-flash-lite-latest',
]

for model in models:
    try:
        response = client.models.generate_content(
            model=model,
            contents='Say hello in one word.'
        )
        print(f"SUCCESS: {model} -> {response.text.strip()}")
    except Exception as e:
        print(f"FAILED: {model} -> {e}")
