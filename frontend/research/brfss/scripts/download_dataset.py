#!/usr/bin/env python3
"""
Phase 2.1: CDC BRFSS 2022 Dataset Acquisition & Verification Script

This script downloads the official CDC Behavioral Risk Factor Surveillance System
(BRFSS) 2022 Public Use Data File (LLCP2022XPT.zip), verifies its cryptographic SHA-256
hash, extracts the SAS Transport format dataset (LLCP2022.XPT) to data/raw/, and retrieves
official CDC survey codebooks and documentation.
"""

import os
import sys
import hashlib
import zipfile
import requests
from pathlib import Path

# Paths relative to script root
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_RAW_DIR = BASE_DIR / "data" / "raw"
DOCS_DIR = BASE_DIR / "documentation"

# Official CDC URLs
BRFSS_2022_ZIP_URL = "https://www.cdc.gov/brfss/annual_data/2022/files/LLCP2022XPT.zip"
BRFSS_2022_CODEBOOK_ZIP_URL = "https://www.cdc.gov/brfss/annual_data/2022/zip/codebook22_llcp-v2-508.zip"
BRFSS_2022_OVERVIEW_URL = "https://www.cdc.gov/brfss/annual_data/2022/pdf/Overview_2022-508.pdf"
BRFSS_2022_QUESTIONNAIRE_URL = "https://www.cdc.gov/brfss/questionnaires/pdf-ques/2022-BRFSS-Questionnaire-508.pdf"

ZIP_FILENAME = "LLCP2022XPT.zip"
XPT_FILENAME = "LLCP2022.XPT"

def compute_sha256(filepath: Path) -> str:
    """Compute the SHA-256 hash of a file in streaming chunks."""
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            sha256.update(chunk)
    return sha256.hexdigest()

def download_file(url: str, dest_path: Path, description: str):
    """Download a file with streaming progress."""
    if dest_path.exists() and dest_path.stat().st_size > 0:
        print(f"[EXISTS] {description} already present at {dest_path} ({dest_path.stat().st_size / (1024*1024):.2f} MB)")
        return

    print(f"[DOWNLOAD] Downloading {description} from {url}...")
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = dest_path.with_suffix(dest_path.suffix + ".part")

    with requests.get(url, stream=True, timeout=120) as r:
        r.raise_for_status()
        total_size = int(r.headers.get("content-length", 0))
        downloaded = 0
        with open(temp_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=1048576): # 1MB chunks
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total_size > 0:
                        pct = (downloaded / total_size) * 100
                        print(f"  Downloaded: {downloaded / (1024*1024):.1f}/{total_size / (1024*1024):.1f} MB ({pct:.1f}%)", end="\r")
                    else:
                        print(f"  Downloaded: {downloaded / (1024*1024):.1f} MB", end="\r")

    print()
    temp_path.rename(dest_path)
    print(f"[SUCCESS] Saved {description} to {dest_path}")

def extract_zip(zip_path: Path, target_dir: Path, expected_filename: str) -> Path:
    """Extract expected file from zip archive."""
    target_file = target_dir / expected_filename
    if target_file.exists() and target_file.stat().st_size > 0:
        print(f"[EXISTS] Extracted dataset already present at {target_file} ({target_file.stat().st_size / (1024*1024):.2f} MB)")
        return target_file

    print(f"[EXTRACT] Extracting {zip_path.name} to {target_dir}...")
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(target_dir)

    # Check for extracted candidates, stripping any trailing whitespace
    clean_target = target_dir / expected_filename
    for f in target_dir.iterdir():
        if f.name.strip().upper() == expected_filename.upper():
            if f.name != expected_filename:
                f.rename(clean_target)
            return clean_target

    raise FileNotFoundError(f"No {expected_filename} found in {target_dir} after extraction.")

def main():
    DATA_RAW_DIR.mkdir(parents=True, exist_ok=True)
    DOCS_DIR.mkdir(parents=True, exist_ok=True)

    zip_path = DATA_RAW_DIR / ZIP_FILENAME
    
    # 1. Download BRFSS 2022 ZIP
    download_file(BRFSS_2022_ZIP_URL, zip_path, "CDC BRFSS 2022 Dataset Archive")
    
    # 2. Checksum verification
    zip_sha256 = compute_sha256(zip_path)
    print(f"[VERIFY] SHA-256 ({ZIP_FILENAME}): {zip_sha256}")

    # 3. Extract SAS Transport format (.XPT)
    xpt_path = extract_zip(zip_path, DATA_RAW_DIR, XPT_FILENAME)
    xpt_sha256 = compute_sha256(xpt_path)
    print(f"[VERIFY] SHA-256 ({xpt_path.name}): {xpt_sha256}")
    print(f"[VERIFY] Size: {xpt_path.stat().st_size / (1024*1024):.2f} MB")

    # 4. Download official CDC documentation
    try:
        download_file(BRFSS_2022_QUESTIONNAIRE_URL, DOCS_DIR / "2022-BRFSS-Questionnaire.pdf", "2022 BRFSS Questionnaire")
        download_file(BRFSS_2022_OVERVIEW_URL, DOCS_DIR / "Overview_2022-508.pdf", "2022 BRFSS Overview")
        codebook_zip = DOCS_DIR / "codebook22_llcp-v2-508.zip"
        download_file(BRFSS_2022_CODEBOOK_ZIP_URL, codebook_zip, "2022 BRFSS Codebook ZIP")
        if codebook_zip.exists():
            with zipfile.ZipFile(codebook_zip, "r") as zf:
                zf.extractall(DOCS_DIR)
            print(f"[SUCCESS] Extracted codebook to {DOCS_DIR}")
    except Exception as e:
        print(f"[WARN] CDC Documentation download encountered notice: {e}")

    # Write dataset provenance record
    provenance_path = BASE_DIR / "data" / "processed" / "dataset_provenance.json"
    provenance_path.parent.mkdir(parents=True, exist_ok=True)
    import json
    provenance = {
        "dataset_name": "Behavioral Risk Factor Surveillance System (BRFSS) 2022",
        "official_source": "Centers for Disease Control and Prevention (CDC)",
        "survey_year": 2022,
        "archive_file": ZIP_FILENAME,
        "archive_sha256": zip_sha256,
        "archive_size_bytes": zip_path.stat().st_size,
        "extracted_file": xpt_path.name,
        "extracted_sha256": xpt_sha256,
        "extracted_size_bytes": xpt_path.stat().st_size,
        "format": "SAS Transport Format (V5 .XPT)",
        "download_url": BRFSS_2022_ZIP_URL,
    }
    with open(provenance_path, "w", encoding="utf-8") as f:
        json.dump(provenance, f, indent=2)
    print(f"[PROVENANCE] Written metadata to {provenance_path}")

if __name__ == "__main__":
    main()
