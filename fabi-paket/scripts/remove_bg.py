#!/usr/bin/env python3
"""
Background Removal für Videos — nutzt rembg (MPS/Apple Silicon) + imageio_ffmpeg
Output: WebM mit Alpha-Channel (transparent background)
"""
import sys
import os
import tempfile
import subprocess
import shutil
from pathlib import Path

import imageio
import imageio_ffmpeg
import numpy as np
from PIL import Image
from rembg import remove, new_session

def remove_bg_video(input_path: str, output_path: str, model: str = "u2net_human_seg"):
    FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
    input_path = os.path.abspath(input_path)
    output_path = os.path.abspath(output_path)

    print(f"Input:  {input_path}")
    print(f"Output: {output_path}")
    print(f"Model:  {model}")
    print("Lade rembg-Session (erster Start lädt Modell ~170MB)...")

    session = new_session(model)

    print("Lese Video-Frames...")
    reader = imageio.get_reader(input_path)
    meta = reader.get_meta_data()
    fps = meta.get("fps", 30)
    total = meta.get("nframes", None)
    print(f"FPS: {fps}, Frames gesamt: {total or 'unbekannt'}")

    tmpdir = tempfile.mkdtemp(prefix="rembg_frames_")
    print(f"Temp-Ordner: {tmpdir}")

    try:
        frame_paths = []
        for i, frame in enumerate(reader):
            pil = Image.fromarray(frame)
            # RGBA-Ausgabe (Alpha = Person-Maske)
            rgba = remove(pil, session=session, post_process_mask=True)
            frame_path = os.path.join(tmpdir, f"frame_{i:06d}.png")
            rgba.save(frame_path, "PNG")
            frame_paths.append(frame_path)

            if i % 30 == 0:
                pct = f"{(i/(total or 380)*100):.0f}%" if total else f"Frame {i}"
                print(f"  {pct} — Frame {i} verarbeitet")

        reader.close()
        print(f"\n{len(frame_paths)} Frames verarbeitet. Erstelle WebM mit Alpha...")

        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

        # ProRes 4444 — zuverlässiger Alpha-Kanal, Remotion-kompatibel
        output_path = output_path.rsplit(".", 1)[0] + ".mov"
        cmd = [
            FFMPEG, "-y",
            "-framerate", str(fps),
            "-i", os.path.join(tmpdir, "frame_%06d.png"),
            "-c:v", "prores_ks",
            "-profile:v", "4444",
            "-pix_fmt", "yuva444p10le",
            "-threads", "4",
            output_path
        ]
        print("ffmpeg-Befehl:", " ".join(cmd))
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print("ffmpeg Fehler:", result.stderr[-500:])
            sys.exit(1)

        print(f"\nFertig! Output: {output_path}")
        size_mb = os.path.getsize(output_path) / (1024 * 1024)
        print(f"Dateigröße: {size_mb:.1f} MB")

    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)
        print("Temp-Dateien bereinigt.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Aufruf: python3 remove_bg.py <input.mp4> <output.webm> [modell]")
        print("Modelle: u2net_human_seg (Standard), u2net, isnet-general-use")
        sys.exit(1)

    remove_bg_video(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "u2net_human_seg")
