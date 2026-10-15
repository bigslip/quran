#!/usr/bin/env python3
"""
Tafsir Nemouneh Data Authenticity & Integrity Audit Suite.
Author: Subagent 3 - Tafsir Nemouneh Data Authenticity & Integrity Auditor
Project: Quran.ir sovereign backend and mobile platforms

Audits:
  1. data/qdc/tafsirs/171.json
  2. public/data/qdc/download/tafsirs/fa-tafsir-nemouneh.db
  3. data/qdc/download/tafsirs/fa-tafsir-nemouneh.db
Against canonical source:
  /Users/reza/Develop/private/tafsir-almizan/data/nemouneh.db
"""

import sys
import os
import json
import sqlite3
import subprocess
import time
from pathlib import Path
from typing import Dict, List, Any, Tuple

ROOT_DIR = Path(__file__).resolve().parent.parent
T171_JSON_PATH = ROOT_DIR / "data/qdc/tafsirs/171.json"
SQLITE_PUBLIC_PATH = ROOT_DIR / "public/data/qdc/download/tafsirs/fa-tafsir-nemouneh.db"
SQLITE_DATA_PATH = ROOT_DIR / "data/qdc/download/tafsirs/fa-tafsir-nemouneh.db"
SOURCE_NEMOUNEH_DB = Path("/Users/reza/Develop/private/tafsir-almizan/data/nemouneh.db")
CHAPTERS_FA_PATH = ROOT_DIR / "data/qdc/chapters_fa.json"
SURAH_MAP_PATH = ROOT_DIR / "scripts/data/nemouneh_surah_map.json"

SPOT_CHECK_VERSES = [
    ("1:1", 1, 1, 1, "Al-Fatihah, Vol 1 start"),
    ("1:7", 1, 7, 1, "Al-Fatihah end, Vol 1"),
    ("2:1", 2, 1, 1, "Al-Baqarah start, Vol 1"),
    ("2:187", 2, 187, 1, "Al-Baqarah Vol 1 end / Vol boundary"),
    ("2:188", 2, 188, 2, "Al-Baqarah Vol 2 start / Vol boundary"),
    ("2:255", 2, 255, 2, "Ayat al-Kursi, Vol 2"),
    ("3:91", 3, 91, 2, "Aal-Imran Vol 2 end / Vol boundary"),
    ("3:92", 3, 92, 3, "Aal-Imran Vol 3 start / Vol boundary"),
    ("18:28", 18, 28, 12, "Al-Kahf, Vol 12"),
    ("36:1", 36, 1, 18, "Ya-Sin, Vol 18"),
    ("55:1", 55, 1, 23, "Ar-Rahman, Vol 23"),
    ("112:1", 112, 1, 27, "Al-Ikhlas, Vol 27"),
    ("114:6", 114, 6, 27, "An-Nas end, Vol 27"),
]

OCR_PATTERNS = ["tarikhema", "pdf.", "www."]
CORRUPT_UNICODE = ["\u06c1", "\u06be", "\u06d2", "\u0679", "\u0688", "\u0691", "\u06ba"]


class AuditLogger:
    def __init__(self):
        self.passes = 0
        self.failures = 0
        self.warnings = 0
        self.records: List[str] = []

    def log_pass(self, title: str, details: str = ""):
        self.passes += 1
        msg = f"[PASS] {title}"
        if details:
            msg += f" -> {details}"
        self.records.append(msg)
        print(f"  \033[92m✓\033[0m {title} {details}")

    def log_fail(self, title: str, reason: str):
        self.failures += 1
        msg = f"[FAIL] {title} -> {reason}"
        self.records.append(msg)
        print(f"  \033[91m✗\033[0m {title}: {reason}")

    def log_warn(self, title: str, warning: str):
        self.warnings += 1
        msg = f"[WARN] {title} -> {warning}"
        self.records.append(msg)
        print(f"  \033[93m⚠\033[0m {title}: {warning}")


logger = AuditLogger()


def section(name: str):
    print(f"\n\033[1;36m=== {name} ===\033[0m")


def audit_json_dataset():
    section("1. JSON Dataset Verification (data/qdc/tafsirs/171.json)")

    if not T171_JSON_PATH.exists():
        logger.log_fail("File Exists", f"Path not found: {T171_JSON_PATH}")
        return

    file_size_mb = T171_JSON_PATH.stat().st_size / (1024 * 1024)
    logger.log_pass("File Exists", f"Size: {file_size_mb:.2f} MB ({T171_JSON_PATH})")

    try:
        with open(T171_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        logger.log_fail("JSON Parsing", str(e))
        return

    logger.log_pass("JSON Parse", "Valid JSON structure")

    # Header metadata checks
    if data.get("tafsirId") == 171 and data.get("slug") == "fa-tafsir-nemouneh":
        logger.log_pass("Metadata Header", f"ID={data.get('tafsirId')}, Slug='{data.get('slug')}', Name='{data.get('name')}'")
    else:
        logger.log_fail("Metadata Header", f"Unexpected metadata: {data.get('tafsirId')}, {data.get('slug')}")

    by_verse = data.get("byVerseKey", {})
    total_verses = len(by_verse)
    if total_verses == 6236:
        logger.log_pass("Total Verse Count", "Exactly 6,236 verses present")
    else:
        logger.log_fail("Total Verse Count", f"Expected 6236, got {total_verses}")

    # Load canonical chapter metadata
    with open(CHAPTERS_FA_PATH, "r", encoding="utf-8") as f:
        chapters = json.load(f)["chapters"]

    missing_keys = []
    for ch in chapters:
        cid = ch["id"]
        vcount = ch["verses_count"]
        for v in range(1, vcount + 1):
            key = f"{cid}:{v}"
            if key not in by_verse:
                missing_keys.append(key)

    if not missing_keys:
        logger.log_pass("Key Continuity", "No gaps from '1:1' to '114:6' (all 6,236 keys exist)")
    else:
        logger.log_fail("Key Continuity", f"{len(missing_keys)} missing keys: {missing_keys[:10]}")

    # Validate individual verse contents
    short_texts = []
    empty_points = []
    corrupt_unicode_hits = []
    ocr_artifact_hits = []
    min_len = 1000000
    max_len = 0
    total_chars = 0

    for vk, item in by_verse.items():
        text = item.get("text", "")
        points = item.get("points", [])

        if not isinstance(text, str) or len(text.strip()) < 50:
            short_texts.append((vk, len(text) if isinstance(text, str) else -1))
        else:
            tlen = len(text.strip())
            min_len = min(min_len, tlen)
            max_len = max(max_len, tlen)
            total_chars += tlen

        if not isinstance(points, list) or len(points) == 0:
            empty_points.append(vk)
        else:
            for p in points:
                if not isinstance(p, str) or not p.strip():
                    empty_points.append((vk, "empty_point_string"))

        full_content = text + " " + " ".join(points if isinstance(points, list) else [])

        # OCR Artifact residues
        for pat in OCR_PATTERNS:
            if pat in full_content.lower():
                ocr_artifact_hits.append((vk, pat))

        # Corrupt unicode residues
        for cu in CORRUPT_UNICODE:
            if cu in full_content:
                corrupt_unicode_hits.append((vk, cu, hex(ord(cu))))

    if not short_texts:
        avg_len = total_chars / total_verses
        logger.log_pass("Verse Text Length", f"All texts valid: min={min_len}, max={max_len}, avg={avg_len:.1f} chars (>= 50 chars)")
    else:
        logger.log_fail("Verse Text Length", f"{len(short_texts)} verses with length < 50: {short_texts[:5]}")

    if not empty_points:
        total_pts = sum(len(v.get("points", [])) for v in by_verse.values())
        avg_pts = total_pts / total_verses
        logger.log_pass("Points Array Quality", f"All verses have >= 1 point (total points={total_pts:,}, avg={avg_pts:.2f}/verse)")
    else:
        logger.log_fail("Points Array Quality", f"{len(empty_points)} verses with empty/invalid points: {empty_points[:5]}")

    if not ocr_artifact_hits:
        logger.log_pass("OCR Residue Scan", "0 occurrences of 'tarikhema', 'pdf.', or 'www.'")
    else:
        logger.log_fail("OCR Residue Scan", f"Found {len(ocr_artifact_hits)} occurrences: {ocr_artifact_hits[:5]}")

    if not corrupt_unicode_hits:
        logger.log_pass("Corrupted Unicode Scan", "0 occurrences of Urdu Heh / Do-Chashmi / Bari Ye / Urdu letters")
    else:
        logger.log_fail("Corrupted Unicode Scan", f"Found {len(corrupt_unicode_hits)} occurrences: {corrupt_unicode_hits[:5]}")


def audit_sqlite_database(db_path: Path, label: str):
    section(f"2. SQLite Database Verification: {label} ({db_path})")

    if not db_path.exists():
        logger.log_fail(f"{label} File Exists", f"Path not found: {db_path}")
        return

    size_mb = db_path.stat().st_size / (1024 * 1024)
    logger.log_pass(f"{label} File Exists", f"File size: {size_mb:.2f} MB")

    conn = sqlite3.connect(str(db_path))
    cur = conn.cursor()

    # Integrity check
    cur.execute("PRAGMA integrity_check;")
    ic = cur.fetchall()
    if len(ic) == 1 and ic[0][0] == "ok":
        logger.log_pass(f"{label} PRAGMA integrity_check", "Result is 'ok'")
    else:
        logger.log_fail(f"{label} PRAGMA integrity_check", f"Integrity check failed: {ic}")

    # Foreign key check
    cur.execute("PRAGMA foreign_key_check;")
    fk = cur.fetchall()
    if len(fk) == 0:
        logger.log_pass(f"{label} PRAGMA foreign_key_check", "0 violations")
    else:
        logger.log_fail(f"{label} PRAGMA foreign_key_check", f"FK violations: {fk}")

    # Row count in tafsir_verses
    try:
        cur.execute("SELECT COUNT(*) FROM tafsir_verses;")
        rc = cur.fetchone()[0]
        if rc == 6236:
            logger.log_pass(f"{label} Row Count", "Table 'tafsir_verses' has exactly 6,236 rows")
        else:
            logger.log_fail(f"{label} Row Count", f"Expected 6236, found {rc}")
    except Exception as e:
        logger.log_fail(f"{label} Row Count", str(e))
        conn.close()
        return

    # Index validation
    cur.execute("PRAGMA index_list('tafsir_verses');")
    indexes = [idx[1] for idx in cur.fetchall()]
    if "idx_tafsir_verses_key" in indexes and "idx_tafsir_chapter" in indexes:
        logger.log_pass(f"{label} Index Verification", f"Indices present: {indexes}")
    else:
        logger.log_warn(f"{label} Index Verification", f"Indices found: {indexes}")

    # Query verification: SELECT text, points FROM tafsir_verses WHERE verse_key = ?
    test_keys = ["1:1", "2:255", "18:28", "112:1", "114:6"]
    query_ok = True
    for tk in test_keys:
        cur.execute("SELECT text, points FROM tafsir_verses WHERE verse_key = ?", (tk,))
        row = cur.fetchone()
        if not row or not row[0] or not row[1]:
            query_ok = False
            break
    if query_ok:
        logger.log_pass(f"{label} Parameterized Query", "SELECT text, points WHERE verse_key = ? works seamlessly")
    else:
        logger.log_fail(f"{label} Parameterized Query", "Failed to retrieve expected test verse keys")

    # Full data validation across all 6,236 rows
    cur.execute("SELECT verse_key, text, points FROM tafsir_verses;")
    all_rows = cur.fetchall()

    invalid_json_points = 0
    short_texts = 0
    corrupt_unicode_sqlite = 0
    ocr_residue_sqlite = 0

    for vk, text, points_str in all_rows:
        if not text or len(text.strip()) < 50:
            short_texts += 1

        try:
            pts = json.loads(points_str)
            if not isinstance(pts, list) or len(pts) == 0:
                invalid_json_points += 1
        except Exception:
            invalid_json_points += 1

        comb = text + " " + (points_str or "")
        for cu in CORRUPT_UNICODE:
            if cu in comb:
                corrupt_unicode_sqlite += 1
                break
        for pat in OCR_PATTERNS:
            if pat in comb.lower():
                ocr_residue_sqlite += 1
                break

    if invalid_json_points == 0:
        logger.log_pass(f"{label} Points JSON Validity", "100% of rows parse cleanly as non-empty JSON arrays")
    else:
        logger.log_fail(f"{label} Points JSON Validity", f"{invalid_json_points} rows have invalid points JSON")

    if short_texts == 0:
        logger.log_pass(f"{label} Text Integrity", "100% of rows have non-empty text (len >= 50)")
    else:
        logger.log_fail(f"{label} Text Integrity", f"{short_texts} rows have text len < 50")

    if corrupt_unicode_sqlite == 0 and ocr_residue_sqlite == 0:
        logger.log_pass(f"{label} Cleanliness", "0 corrupt unicode or OCR artifacts in database")
    else:
        logger.log_fail(f"{label} Cleanliness", f"corrupt_unicode={corrupt_unicode_sqlite}, ocr_residue={ocr_residue_sqlite}")

    conn.close()


def audit_authenticity_spot_checks():
    section("3. Authenticity Spot-Checks Against nemouneh.db (27 Volumes)")

    if not SOURCE_NEMOUNEH_DB.exists():
        logger.log_fail("Source DB", f"Not found at {SOURCE_NEMOUNEH_DB}")
        return

    logger.log_pass("Source DB Connection", f"Source nemouneh.db found ({SOURCE_NEMOUNEH_DB.stat().st_size / (1024*1024):.1f} MB)")

    with open(T171_JSON_PATH, "r", encoding="utf-8") as f:
        t171 = json.load(f)["byVerseKey"]

    conn_src = sqlite3.connect(str(SOURCE_NEMOUNEH_DB))
    cur_src = conn_src.cursor()

    spot_results = []
    all_matched = True

    for vk, surah_id, ayah_num, expected_vol, desc in SPOT_CHECK_VERSES:
        verse_data = t171.get(vk)
        if not verse_data:
            logger.log_fail(f"Verse {vk}", "Missing in 171.json")
            all_matched = False
            continue

        text = verse_data.get("text", "")
        points = verse_data.get("points", [])

        # Extract representative search phrases from the commentary text
        paragraphs = [p.strip() for p in text.split("\n") if len(p.strip()) >= 35]
        matched_vol = None
        matched_page = None

        for p in paragraphs[:5]:
            snippet = p[:35].replace("'", "''")
            cur_src.execute(
                "SELECT volume_id, page_number FROM paragraphs WHERE volume_id = ? AND text LIKE ? LIMIT 1",
                (expected_vol, f"%{snippet[:28]}%")
            )
            row = cur_src.fetchone()
            if row:
                matched_vol, matched_page = row
                break

        if not matched_vol:
            # Fallback search without volume constraint to see if matched in another volume
            for p in paragraphs[:5]:
                snippet = p[:35].replace("'", "''")
                cur_src.execute(
                    "SELECT volume_id, page_number FROM paragraphs WHERE text LIKE ? LIMIT 1",
                    (f"%{snippet[:28]}%",)
                )
                row = cur_src.fetchone()
                if row:
                    matched_vol, matched_page = row
                    break

        if matched_vol == expected_vol:
            logger.log_pass(
                f"Verse {vk:6s} ({desc})",
                f"Authentic commentary matched -> Vol {matched_vol}, Page {matched_page} (len={len(text)}, points={len(points)})"
            )
            spot_results.append({
                "verse_key": vk,
                "description": desc,
                "expected_vol": expected_vol,
                "found_vol": matched_vol,
                "page": matched_page,
                "text_snippet": text[:80].replace("\n", " "),
                "points_sample": points[0] if points else ""
            })
        else:
            all_matched = False
            logger.log_fail(
                f"Verse {vk:6s} ({desc})",
                f"Expected Vol {expected_vol}, matched {matched_vol} (Page {matched_page})"
            )

    conn_src.close()

    if all_matched:
        logger.log_pass("Spot-Check Verdict", f"All {len(SPOT_CHECK_VERSES)} benchmark verses authenticated against source")
    else:
        logger.log_fail("Spot-Check Verdict", "One or more spot checks failed volume/content authenticity match")

    return spot_results


def run_automated_tests():
    section("4. Automated Test Verification")

    tests = [
        ("Web: local-data-engine-tafsir", ["yarn", "test", "--run", "tests/unit/local-data-engine-tafsir.test.ts"]),
        ("Web: tafsir-ingestion", ["yarn", "test", "--run", "tests/unit/tafsir-ingestion.test.ts"]),
        ("Mobile: test suite", ["yarn", "--cwd", "mobile", "test"]),
        ("Mobile: typecheck", ["yarn", "--cwd", "mobile", "typecheck"]),
    ]

    results = {}
    for name, cmd in tests:
        start_t = time.time()
        res = subprocess.run(cmd, cwd=str(ROOT_DIR), capture_output=True, text=True)
        dur = time.time() - start_t
        passed = (res.returncode == 0)
        results[name] = {"passed": passed, "duration": dur, "stdout": res.stdout, "stderr": res.stderr}

        if passed:
            logger.log_pass(f"{name} ({dur:.1f}s)", "Tests Passed Successfully (Exit 0)")
        else:
            logger.log_fail(f"{name} ({dur:.1f}s)", f"Tests Failed (Exit {res.returncode}):\n{res.stdout[-400:]}")

    return results


def main():
    print("=" * 80)
    print("🔍 TAFSIR NEMOUNEH DATA AUTHENTICITY & INTEGRITY AUDIT")
    print("=" * 80)

    start_all = time.time()

    audit_json_dataset()
    audit_sqlite_database(SQLITE_PUBLIC_PATH, "public/data/qdc SQLite")
    audit_sqlite_database(SQLITE_DATA_PATH, "data/qdc SQLite")
    audit_authenticity_spot_checks()
    test_results = run_automated_tests()

    total_time = time.time() - start_all

    section("5. Final Audit Summary & Verdict")
    print(f"Total Checks Executed: Passes = {logger.passes}, Failures = {logger.failures}, Warnings = {logger.warnings}")
    print(f"Audit Elapsed Time: {total_time:.1f} seconds")

    if logger.failures == 0:
        verdict = "APPROVED"
        print(f"\n\033[1;32m══════════════════════════════════════════════════════════════════\033[0m")
        print(f"\033[1;32m🎉 AUDIT VERDICT: {verdict}\033[0m")
        print(f"\033[1;32mThe Tafsir Nemouneh datasets meet all authenticity, integrity, and\033[0m")
        print(f"\033[1;32mcleanliness standards with 100% test suite verification.\033[0m")
        print(f"\033[1;32m══════════════════════════════════════════════════════════════════\033[0m")
        sys.exit(0)
    else:
        verdict = "NEEDS FIXES"
        print(f"\n\033[1;31m══════════════════════════════════════════════════════════════════\033[0m")
        print(f"\033[1;31m❌ AUDIT VERDICT: {verdict} ({logger.failures} failures detected)\033[0m")
        print(f"\033[1;31m══════════════════════════════════════════════════════════════════\033[0m")
        sys.exit(1)


if __name__ == "__main__":
    main()
