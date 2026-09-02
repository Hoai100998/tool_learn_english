"""
Audio Synthesizer Script for English Dictation & Vocabulary Practice App
Batch renders high-fidelity MP3 files using Microsoft Edge TTS (edge-tts).
Supports natural neural voices, adjustable rate, and concurrency controls.
"""

import os
import json
import asyncio
import argparse
from typing import List, Dict, Any

try:
    import edge_tts
    HAS_EDGE_TTS = True
except ImportError:
    HAS_EDGE_TTS = False

DEFAULT_VOICE = "en-US-JennyNeural"  # Clear, natural US English
UK_VOICE = "en-GB-SoniaNeural"      # Clear UK English
MALE_VOICE = "en-US-GuyNeural"

async def synthesize_item(
    text: str,
    output_path: str,
    voice: str = DEFAULT_VOICE,
    rate: str = "+0%",
    semaphore: asyncio.Semaphore = None
):
    """Synthesize a single audio file with rate and voice options."""
    if semaphore:
        async with semaphore:
            communicate = edge_tts.Communicate(text, voice, rate=rate)
            await communicate.save(output_path)
    else:
        communicate = edge_tts.Communicate(text, voice, rate=rate)
        await communicate.save(output_path)

async def batch_process_level(
    json_path: str,
    output_dir: str,
    voice: str = DEFAULT_VOICE,
    rate: str = "+0%",
    concurrency: int = 5
):
    """Batch processes a JSON data file to render corresponding audio MP3s."""
    if not os.path.exists(json_path):
        print(f"[-] Data file not found: {json_path}")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    os.makedirs(output_dir, exist_ok=True)
    semaphore = asyncio.Semaphore(concurrency)
    tasks = []

    print(f"[*] Processing {len(data)} items from {os.path.basename(json_path)}...")
    for idx, item in enumerate(data, 1):
        item_id = item.get("id", f"audio_{idx:03d}")
        text = item.get("english", "").strip()
        if not text:
            continue

        out_file = os.path.join(output_dir, f"{item_id}.mp3")
        if os.path.exists(out_file) and os.path.getsize(out_file) > 0:
            continue  # Skip existing

        task = asyncio.create_task(
            synthesize_item(text, out_file, voice=voice, rate=rate, semaphore=semaphore)
        )
        tasks.append((item_id, task))

    total = len(tasks)
    if total == 0:
        print("[+] All audio files already exist!")
        return

    for idx, (item_id, task) in enumerate(tasks, 1):
        try:
            await task
            print(f"[{idx}/{total}] Rendered: {item_id}.mp3")
        except Exception as e:
            print(f"[-] Failed {item_id}: {e}")

    print(f"[+] Finished rendering audio for {os.path.basename(json_path)}")

def main():
    parser = argparse.ArgumentParser(description="Batch synthesize audio MP3s using Edge TTS.")
    parser.add_argument("--data-dir", default="../data", help="Path to data JSON directory")
    parser.add_argument("--output-dir", default="../audio", help="Output directory for MP3 files")
    parser.add_argument("--voice", default=DEFAULT_VOICE, help="Edge-TTS voice name")
    parser.add_argument("--rate", default="+0%", help="Speed rate (e.g. -15%, +0%)")
    parser.add_argument("--concurrency", type=int, default=5, help="Number of concurrent rendering tasks")

    args = parser.parse_args()

    if not HAS_EDGE_TTS:
        print("[-] edge-tts library is not installed. Run: pip install edge-tts")
        return

    data_dir = os.path.abspath(args.data_dir)
    out_dir = os.path.abspath(args.output_dir)

    json_files = [
        os.path.join(data_dir, f)
        for f in os.listdir(data_dir)
        if f.startswith("data_") and f.endswith(".json")
    ]

    if not json_files:
        print(f"[-] No data_*.json files found in {data_dir}")
        return

    async def run_all():
        for jf in sorted(json_files):
            await batch_process_level(
                jf,
                out_dir,
                voice=args.voice,
                rate=args.rate,
                concurrency=args.concurrency
            )

    asyncio.run(run_all())

if __name__ == "__main__":
    main()
