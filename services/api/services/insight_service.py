import httpx
import os
import json
from typing import Dict

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

async def generate_peak_insights(density_data: Dict) -> str:
    """
    Generate natural language insights using Groq (Llama-3)
    """
    if not GROQ_API_KEY:
        return "Insight generation unavailable (API Key missing)."

    prompt = f"""
    You are an AI Smart Canteen Assistant. Analyze this canteen density data and provide a 2-sentence summary in Thai for the manager and users.
    Data: {json.dumps(density_data)}
    - Heatmap data shows seat occupancy levels.
    - Queue density shows how busy each stall is (Low, Medium, High).
    Be helpful and recommend what users should do.
    """

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama3-70b-8192",
        "messages": [
            {"role": "system", "content": "You are a helpful canteen management assistant. Speak in Thai."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 150
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(GROQ_API_URL, headers=headers, json=payload, timeout=10.0)
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"]
        except Exception as e:
            return f"Error generating insights: {str(e)}"
