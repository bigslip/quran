#!/usr/bin/env python3
"""
Tafsir Noor Authentic Ingestion & Processing Pipeline.
Extracts authentic scholarly commentary and educational points from:
  /Users/reza/Develop/private/tafsir-almizan/data/noor.db (10 volumes, Hojjat al-Islam Mohsen Qara'ati)
into:
  1. data/qdc/tafsirs/172.json (Sovereign backend JSON dataset)
  2. public/data/qdc/download/tafsirs/fa-tafsir-noor.db (Downloadable SQLite database for mobile/offline)
  3. data/qdc/download/tafsirs/fa-tafsir-noor.db (Symlink to public/data/qdc/download/tafsirs/fa-tafsir-noor.db)
"""

import os
import sys
import json
import re
import sqlite3
import time
from pathlib import Path
from typing import Dict, List, Tuple, Any

ROOT_DIR = Path(__file__).resolve().parent.parent
NOOR_DB_PATH = Path("/Users/reza/Develop/private/tafsir-almizan/data/noor.db")

OUTPUT_JSON_PATH = ROOT_DIR / "data/qdc/tafsirs/172.json"
OUTPUT_SQLITE_PUBLIC = ROOT_DIR / "public/data/qdc/download/tafsirs/fa-tafsir-noor.db"
OUTPUT_SQLITE_DATA_DIR = ROOT_DIR / "data/qdc/download/tafsirs"
OUTPUT_SQLITE_SYMLINK = OUTPUT_SQLITE_DATA_DIR / "fa-tafsir-noor.db"


def clean_persian_text(text: str) -> str:
    """Normalize Arabic/Persian characters, clean footnote citations, and normalize whitespace."""
    if not text:
        return ""
    t = text.strip()
    # Normalize common character variants
    t = t.replace("ي", "ی").replace("ك", "ک").replace("ة", "ه")
    # Normalize Urdu OCR artifacts if present
    t = t.replace("\u06c1", "\u0647").replace("\u06be", "\u0647")
    t = t.replace("\u06d2", "\u06cc").replace("\u06ba", "\u0646")
    # Strip footnote citations (e.g. (۵۸۹), [۱۴۷], (۱))
    t = re.sub(r"[\(\[]\s*[۰-۹0-9]+\s*[\)\]]", "", t)
    # Remove markdown backslash escaping
    t = t.replace("\\", "")
    # Remove zero-width spaces or directional marks
    t = re.sub(r"[\u200e\u200f\u200b]", "", t)
    # Ensure surah overview heading is neatly formatted
    t = re.sub(r"^(سیما[یى]\s+سوره(?:\s*[یى])?\s+\S+)\s+", r"\1\n\n", t)
    # Normalize whitespace
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r"\n\s+", "\n", t)
    return t.strip()


def extract_points_from_list(raw_list: List[str]) -> List[str]:
    """
    Extract points from a list of paragraphs (from 'پيام ها' or 'نکته ها').
    Strips leading number prefixes (e.g. '1-', '۱.', '۵ -') and joins unnumbered continuation lines.
    """
    points: List[str] = []
    num_pattern = re.compile(r"^[۰-۹0-9]+(?:\s*[\.\-\)\]\:]\s*|\s+)")
    for raw in raw_list:
        t = raw.strip()
        if not t:
            continue
        m = num_pattern.match(t)
        if m:
            clean_t = t[m.end():].strip()
            if clean_t:
                points.append(clean_t)
        else:
            if points:
                points[-1] = points[-1] + " " + t
            else:
                points.append(t)
    return points


def classify_page(cursor: sqlite3.Cursor, volume_id: int, page_number: int) -> Dict[str, List[str]]:
    """Retrieve and classify all body paragraphs on a page by their preceding heading."""
    cursor.execute("""
        SELECT paragraph_type, text
        FROM paragraphs
        WHERE volume_id = ? AND page_number = ?
        ORDER BY paragraph_index
    """, (volume_id, page_number))
    rows = cursor.fetchall()

    sections: Dict[str, List[str]] = {
        "ترجمه": [],
        "نکته ها": [],
        "پيام ها": [],
        "توضيحات": []
    }
    current_sec = None
    for p_type, text in rows:
        if p_type == "heading":
            current_sec = text.strip()
            continue
        if p_type == "body" and current_sec in sections:
            clean_t = clean_persian_text(text)
            if clean_t:
                sections[current_sec].append(clean_t)

    return sections


def run_pipeline():
    start_time = time.time()
    print("=" * 70)
    print(" Tafsir Noor Ingestion Pipeline (Mohsen Qara'ati - 10 Volumes)")
    print("=" * 70)
    print(f"Source Database: {NOOR_DB_PATH}")

    if not NOOR_DB_PATH.exists():
        raise FileNotFoundError(f"Database not found: {NOOR_DB_PATH}")

    conn = sqlite3.connect(str(NOOR_DB_PATH))
    cursor = conn.cursor()

    # Pre-cache all 3,908 pages
    print("Caching all pages and classifying sections...")
    cursor.execute("SELECT volume_id, page_number FROM pages ORDER BY volume_id, page_number;")
    all_pages = cursor.fetchall()
    page_cache: Dict[Tuple[int, int], Dict[str, List[str]]] = {}
    for v, p in all_pages:
        page_cache[(v, p)] = classify_page(cursor, v, p)
    print(f"Cached {len(page_cache):,} pages across 10 volumes.")

    # Fetch mapping for all 6,236 verses
    print("Fetching verse references...")
    cursor.execute("""
        SELECT vr.surah_number, vr.ayah_number, vr.volume_id, vr.page_number
        FROM verse_references vr
        JOIN paragraphs p ON vr.paragraph_id = p.id
        WHERE p.paragraph_type = 'page_header'
        ORDER BY vr.surah_number, vr.ayah_number;
    """)
    verse_rows = cursor.fetchall()
    print(f"Found {len(verse_rows):,} verse references.")

    num_pattern = re.compile(r"^[۰-۹0-9]+(?:\s*[\.\-\)\]\:]\s*|\s+)")
    by_verse_key: Dict[str, Dict[str, Any]] = {}

    for s_num, a_num, v_num, p_num in verse_rows:
        vkey = f"{s_num}:{a_num}"
        pdata = page_cache[(v_num, p_num)]

        # Check if the mapped page has commentary or is an introductory verse in a multi-verse group
        has_commentary = bool(pdata["نکته ها"] or pdata["توضيحات"] or pdata["پيام ها"])
        source_pdata = pdata
        if not has_commentary:
            # Look ahead to the subsequent page in the group containing commentary
            cur_p = p_num + 1
            while (v_num, cur_p) in page_cache and not (
                page_cache[(v_num, cur_p)]["نکته ها"] or
                page_cache[(v_num, cur_p)]["توضيحات"] or
                page_cache[(v_num, cur_p)]["پيام ها"]
            ):
                cur_p += 1
            if (v_num, cur_p) in page_cache:
                source_pdata = page_cache[(v_num, cur_p)]
            else:
                print(f"Warning: No forward commentary page found for {vkey}")

        # Extract Points & Commentary Prose
        points: List[str] = []
        prose_parts: List[str] = []

        if source_pdata["توضيحات"]:
            prose_parts.extend(source_pdata["توضيحات"])

        if source_pdata["پيام ها"]:
            points = extract_points_from_list(source_pdata["پيام ها"])
            if source_pdata["نکته ها"]:
                prose_parts.extend(source_pdata["نکته ها"])
        elif source_pdata["نکته ها"]:
            has_numbered = any(num_pattern.match(t) for t in source_pdata["نکته ها"])
            if has_numbered:
                for t in source_pdata["نکته ها"]:
                    m = num_pattern.match(t)
                    if m:
                        clean_t = t[m.end():].strip()
                        if clean_t:
                            points.append(clean_t)
                    elif points:
                        points[-1] = points[-1] + " " + t
                    else:
                        prose_parts.append(t)
            else:
                # When non-numbered, individual nokteh paragraphs serve as discrete points
                points = [t for t in source_pdata["نکته ها"] if len(t) > 5]

        # Combine commentary prose
        combined_prose = "\n\n".join(prose_parts).strip()

        # Ensure text is >= 50 characters by including verse translation/explanation when needed
        if len(combined_prose) < 50:
            trans_text = " ".join(pdata["ترجمه"]).strip()
            if combined_prose:
                combined_prose = f"ترجمه آیه: {trans_text}\n\nتوضیحات: {combined_prose}"
            else:
                combined_prose = f"ترجمه و پیام آیه: {trans_text}"
                if len(combined_prose) < 50 and points:
                    combined_prose = f"ترجمه و پیام آیه: {trans_text}. پیام کلیدی: {points[0]}"

        # Assertions to ensure 100% adherence to quality rules
        assert len(combined_prose) >= 50, f"Text length < 50 for {vkey}: {len(combined_prose)}"
        assert len(points) >= 1, f"Zero points for {vkey}"

        by_verse_key[vkey] = {
            "verse_key": vkey,
            "verse_number": a_num,
            "chapter_id": s_num,
            "text": combined_prose,
            "points": points
        }

    conn.close()

    assert len(by_verse_key) == 6236, f"Expected 6236 verses, got {len(by_verse_key)}"
    print(f"Successfully processed all {len(by_verse_key):,} verses.")

    # 1. Generate data/qdc/tafsirs/172.json
    print(f"\nWriting backend JSON dataset: {OUTPUT_JSON_PATH}")
    OUTPUT_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    json_dataset = {
        "tafsirId": 172,
        "slug": "fa-tafsir-noor",
        "name": "تفسیر نور",
        "author_name": "حجت‌الاسلام محسن قرائتی",
        "language_name": "persian",
        "totalVerses": 6236,
        "byVerseKey": by_verse_key
    }
    with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(json_dataset, f, ensure_ascii=False, indent=2)
    json_size_mb = OUTPUT_JSON_PATH.stat().st_size / (1024 * 1024)
    print(f"Generated {OUTPUT_JSON_PATH.name} ({json_size_mb:.2f} MB)")

    # 2. Generate public/data/qdc/download/tafsirs/fa-tafsir-noor.db
    print(f"\nWriting mobile SQLite database: {OUTPUT_SQLITE_PUBLIC}")
    OUTPUT_SQLITE_PUBLIC.parent.mkdir(parents=True, exist_ok=True)
    if OUTPUT_SQLITE_PUBLIC.exists():
        OUTPUT_SQLITE_PUBLIC.unlink()

    sqlite_conn = sqlite3.connect(str(OUTPUT_SQLITE_PUBLIC))
    sqlite_cur = sqlite_conn.cursor()

    sqlite_cur.execute("""
        CREATE TABLE tafsir_verses (
            verse_key TEXT PRIMARY KEY,
            verse_number INTEGER NOT NULL,
            chapter_id INTEGER NOT NULL,
            text TEXT NOT NULL,
            points TEXT
        );
    """)
    sqlite_cur.execute("CREATE UNIQUE INDEX idx_tafsir_verses_key ON tafsir_verses(verse_key);")
    sqlite_cur.execute("CREATE INDEX idx_tafsir_chapter ON tafsir_verses(chapter_id);")

    insert_rows = []
    for vk, vdata in by_verse_key.items():
        insert_rows.append((
            vdata["verse_key"],
            vdata["verse_number"],
            vdata["chapter_id"],
            vdata["text"],
            json.dumps(vdata["points"], ensure_ascii=False)
        ))

    sqlite_cur.executemany("""
        INSERT INTO tafsir_verses (verse_key, verse_number, chapter_id, text, points)
        VALUES (?, ?, ?, ?, ?)
    """, insert_rows)

    sqlite_conn.commit()

    # Optimization & Integrity check
    print("Running PRAGMA optimize & integrity check...")
    sqlite_cur.execute("PRAGMA integrity_check;")
    integrity_result = sqlite_cur.fetchone()[0]
    print(f"SQLite integrity check: {integrity_result}")
    assert integrity_result == "ok", f"Integrity check failed: {integrity_result}"

    sqlite_cur.execute("ANALYZE;")
    sqlite_conn.commit()
    sqlite_conn.close()

    db_size_mb = OUTPUT_SQLITE_PUBLIC.stat().st_size / (1024 * 1024)
    print(f"Generated {OUTPUT_SQLITE_PUBLIC.name} ({db_size_mb:.2f} MB)")

    # 3. Create Symlink in data/qdc/download/tafsirs/
    OUTPUT_SQLITE_DATA_DIR.mkdir(parents=True, exist_ok=True)
    if OUTPUT_SQLITE_SYMLINK.is_symlink() or OUTPUT_SQLITE_SYMLINK.exists():
        OUTPUT_SQLITE_SYMLINK.unlink()

    # Relative target: ../../../../public/data/qdc/download/tafsirs/fa-tafsir-noor.db
    symlink_target = Path("../../../../public/data/qdc/download/tafsirs/fa-tafsir-noor.db")
    OUTPUT_SQLITE_SYMLINK.symlink_to(symlink_target)
    print(f"Created symlink: {OUTPUT_SQLITE_SYMLINK} -> {symlink_target}")

    # Statistics & Verification
    elapsed = time.time() - start_time
    text_lengths = [len(v["text"]) for v in by_verse_key.values()]
    point_counts = [len(v["points"]) for v in by_verse_key.values()]

    print("\n" + "=" * 70)
    print(" INGESTION PIPELINE REPORT")
    print("=" * 70)
    print(f"Total Verses Processed: {len(by_verse_key):,}")
    print(f"Execution Time:         {elapsed:.2f} seconds")
    print("\nText Length Statistics (characters):")
    print(f"  Min:     {min(text_lengths):,}")
    print(f"  Max:     {max(text_lengths):,}")
    print(f"  Average: {sum(text_lengths)/len(text_lengths):,.1f}")
    print("\nPoints Count Statistics:")
    print(f"  Min:     {min(point_counts):,}")
    print(f"  Max:     {max(point_counts):,}")
    print(f"  Average: {sum(point_counts)/len(point_counts):,.1f}")

    print("\nVerification of Verse 36:1 (Surah Ya-Sin):")
    v36_1 = by_verse_key["36:1"]
    print(f"  Verse Key:     {v36_1['verse_key']}")
    print(f"  Text Length:   {len(v36_1['text']):,} chars")
    print(f"  Text Preview:  {v36_1['text'][:150]}...")
    print(f"  Points Count:  {len(v36_1['points'])}")
    for i, pt in enumerate(v36_1['points'], 1):
        print(f"    Point {i}: {pt[:80]}...")
    print("=" * 70)


if __name__ == "__main__":
    run_pipeline()
