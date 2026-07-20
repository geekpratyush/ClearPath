#!/usr/bin/env python3
"""
Generate narration audio for each scene using Google Text-to-Speech (gTTS).
Then merge all audio segments into one aligned narration track.
Run: python3 generate_audio.py
"""
from gtts import gTTS
from pydub import AudioSegment
import os

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

# Define narration lines and their intended duration in seconds (to pad silence)
SCENES = [
    {"text": "Welcome to ClearPath, your robust orchestration and financial simulation platform.", "hold": 3},
    {"text": "Here you can drag, drop, and connect nodes to create dynamic decision trees and requirement workflows.", "hold": 4},
    {"text": "For complex rules, our integrated code editor gives you the power you need, right where you need it.", "hold": 4},
    {"text": "ClearPath also provides professional documentation right inside the app, so your team is always aligned.", "hold": 4},
    {"text": "Export your pipelines instantly as high-quality visuals or JSON files to share with stakeholders.", "hold": 3},
    {"text": "Run a simulation to validate your logic end to end, and see real-time results for every stage.", "hold": 4},
    {"text": "ClearPath bridges the gap between business requirements and technical execution. Start orchestrating today.", "hold": 4},
]

segments = []

for i, scene in enumerate(SCENES):
    audio_path = os.path.join(OUTPUT_DIR, f"scene_{i+1}.mp3")
    print(f"🔊 Generating audio for Scene {i+1}...")
    tts = gTTS(scene["text"], lang='en', slow=False)
    tts.save(audio_path)
    
    audio = AudioSegment.from_mp3(audio_path)
    # Add silence padding after speech
    silence = AudioSegment.silent(duration=scene["hold"] * 1000)
    segments.append(audio + silence)

# Concatenate all segments into a single narration track
full_narration = sum(segments)
output_path = os.path.join(OUTPUT_DIR, "narration.mp3")
full_narration.export(output_path, format="mp3")
print(f"\n✅ Full narration saved to: {output_path}")
print(f"   Total duration: {len(full_narration) / 1000:.1f} seconds")
