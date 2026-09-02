"""
Data Generator Script for English Dictation & Vocabulary Practice App
Automatically generates CEFR-aligned vocabulary, phrases, and sentences with IPA, Vietnamese translations, and context.
Uses Google Gemini API or pre-configured Oxford 3000 / 5000 wordlist templates.
"""

import os
import json
import argparse
import asyncio
from typing import List, Dict, Any

try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1"]

SYSTEM_PROMPT = """You are an expert English linguist and ESL curriculum designer.
Your task is to generate high-quality, authentic English vocabulary, common collocations/phrases, and natural sentences for Vietnamese ESL learners according to the CEFR level: {level}.

Output MUST be a valid JSON array of objects conforming to this schema:
[
  {
    "id": "{level}_W_001",
    "level": "{level}",
    "type": "word",
    "english": "apple",
    "ipa": "/ˈæp.əl/",
    "vietnamese": "quả táo",
    "part_of_speech": "noun",
    "hint": "Một loại trái cây quen thuộc",
    "example": "She eats an apple every morning.",
    "example_vi": "Cô ấy ăn một quả táo mỗi buổi sáng."
  },
  {
    "id": "{level}_P_001",
    "level": "{level}",
    "type": "phrase",
    "english": "look forward to",
    "ipa": "/lʊk ˈfɔː.wəd tuː/",
    "vietnamese": "mong đợi, trông chờ",
    "part_of_speech": "phrasal verb",
    "hint": "Cảm giác hào hứng chờ đợi điều gì đó",
    "example": "I look forward to hearing from you.",
    "example_vi": "Tôi rất mong sớm nhận được phản hồi từ bạn."
  },
  {
    "id": "{level}_S_001",
    "level": "{level}",
    "type": "sentence",
    "english": "Could you please tell me where the nearest train station is?",
    "ipa": "/kʊd juː pliːz tel miː weər ðə ˈnɪə.rɪst treɪn ˈsteɪ.ʃən ɪz/",
    "vietnamese": "Bạn có thể chỉ giúp tôi ga tàu gần nhất ở đâu không?",
    "part_of_speech": "sentence",
    "hint": "Hỏi đường đến ga tàu lửa một cách lịch sự",
    "example": "Could you please tell me where the nearest train station is?",
    "example_vi": "Bạn có thể chỉ giúp tôi ga tàu gần nhất ở đâu không?"
  }
]

Requirements:
1. Ensure exact natural English and accurate standard Vietnamese translations.
2. IPA should use standard International Phonetic Alphabet symbols.
3. Mix approximately: 40% words, 30% phrases/collocations, 30% complete sentences.
4. Strictly match the CEFR level: {level}.
5. Return ONLY valid JSON, no markdown code block fences if possible, or standard ```json block.
"""

def generate_with_gemini(level: str, count: int, api_key: str = None) -> List[Dict[str, Any]]:
    """Generates data using Gemini API."""
    if not HAS_GENAI:
        raise RuntimeError("google-genai is not installed. Run: pip install -r requirements.txt")
    key = api_key or os.environ.get("GEMINI_API_KEY")
    if not key:
        raise ValueError("GEMINI_API_KEY is not set in environment or arguments.")

    client = genai.Client(api_key=key)
    prompt = f"Generate {count} items for CEFR Level {level}. Make sure each item has an accurate IPA, Vietnamese translation, and natural example."
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT.format(level=level),
            response_mime_type="application/json"
        )
    )
    
    raw_text = response.text.strip()
    if raw_text.startswith("```"):
        raw_text = raw_text.split("\n", 1)[1]
        if raw_text.endswith("```"):
            raw_text = raw_text.rsplit("\n", 1)[0]
    
    items = json.loads(raw_text)
    if not isinstance(items, list):
        raise ValueError("Model response must be a JSON array.")
    required = {"id", "level", "type", "english", "ipa", "vietnamese", "part_of_speech", "hint", "example", "example_vi"}
    seen_ids = set()
    for index, item in enumerate(items):
        if not isinstance(item, dict) or required - item.keys():
            raise ValueError(f"Item {index} does not match the required schema.")
        if item["level"] != level or item["type"] not in {"word", "phrase", "sentence"}:
            raise ValueError(f"Item {index} has an invalid level or type.")
        if item["id"] in seen_ids:
            raise ValueError(f"Duplicate id: {item['id']}")
        seen_ids.add(item["id"])
    return items

def main():
    parser = argparse.ArgumentParser(description="Generate English dictation and vocabulary datasets.")
    parser.add_argument("--level", choices=CEFR_LEVELS + ["ALL"], default="ALL", help="CEFR Level to generate")
    parser.add_argument("--count", type=int, default=30, help="Number of items per level")
    parser.add_argument("--output-dir", default="../data", help="Output directory for JSON files")
    parser.add_argument("--api-key", default=None, help="Google Gemini API Key")

    args = parser.parse_args()
    output_dir = os.path.abspath(args.output_dir)
    os.makedirs(output_dir, exist_ok=True)

    levels_to_run = CEFR_LEVELS if args.level == "ALL" else [args.level]

    for lvl in levels_to_run:
        print(f"[*] Generating dataset for CEFR Level: {lvl}...")
        try:
            items = generate_with_gemini(lvl, args.count, args.api_key)
            out_file = os.path.join(output_dir, f"data_{lvl}.json")
            with open(out_file, "w", encoding="utf-8") as f:
                json.dump(items, f, ensure_ascii=False, indent=2)
            print(f"[+] Saved {len(items)} items to {out_file}")
        except Exception as e:
            print(f"[-] Error generating {lvl}: {e}")

if __name__ == "__main__":
    main()
