#!/usr/bin/env python3
"""
Script to find i18n keys used in source code but missing from translation files.
Optimized: single-pass file scan, then compare.
"""

import json
import os
import re
from collections import defaultdict
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(BASE_DIR, 'src')
LOCALES_DIR = os.path.join(SRC_DIR, 'locales')
LANGUAGES = ['en', 'ja', 'vi', 'zh']

# ============================================================
# STEP 1: Load translation keys
# ============================================================
def get_all_keys(obj, prefix=''):
    keys = set()
    for k, v in obj.items():
        path = f'{prefix}.{k}' if prefix else k
        if isinstance(v, dict):
            keys.update(get_all_keys(v, path))
        else:
            keys.add(path)
    return keys

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

print("Loading translation keys...")
all_keys = {}
all_data = {}
for lang in LANGUAGES:
    path = os.path.join(LOCALES_DIR, lang, 'translation.json')
    data = load_json(path)
    all_data[lang] = data
    all_keys[lang] = get_all_keys(data)
    print(f"  {lang}: {len(all_keys[lang])} keys")

# ============================================================
# STEP 2: Single-pass scan all source files
# ============================================================
T_PATTERN = re.compile(r"(?<![a-zA-Z0-9_])t\(\s*['\"`]([a-zA-Z0-9_.]+)['\"`]")
I18N_T_PATTERN = re.compile(r"i18n\.t\(\s*['\"`]([a-zA-Z0-9_.]+)['\"`]")
TRANSKEY_PATTERN = re.compile(r"(?:transKey|i18nKey)=['\"]([a-zA-Z0-9_.]+)['\"]")

key_usages = defaultdict(set)
source_keys = set()

print("\nScanning source files for t() calls...")

for root, dirs, files in os.walk(SRC_DIR):
    if 'locales' in root or 'node_modules' in root or '.next' in root:
        continue
    for file in files:
        if not file.endswith(('.tsx', '.ts', '.jsx', '.js')):
            continue
        filepath = os.path.join(root, file)
        relpath = os.path.relpath(filepath, BASE_DIR)
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except:
            continue

        for m in T_PATTERN.finditer(content):
            key = m.group(1); source_keys.add(key); key_usages[key].add(relpath)
        for m in I18N_T_PATTERN.finditer(content):
            key = m.group(1); source_keys.add(key); key_usages[key].add(relpath)
        for m in TRANSKEY_PATTERN.finditer(content):
            key = m.group(1); source_keys.add(key); key_usages[key].add(relpath)

print(f"  Found {len(source_keys)} unique keys used in source")
# Exclude keys from source that are actually from locales directory being scanned
# (the locales files may have t() calls too with string values)
# But we already skip locales dir, so this should be fine.

# ============================================================
# STEP 3: Compare
# ============================================================
en_keys = all_keys['en']
en_data = all_data['en']

# Keys in source but missing from English
missing_from_en = source_keys - en_keys

# Keys in en but missing from other languages
missing_by_lang = {}
for lang in ['ja', 'vi', 'zh']:
    missing_by_lang[lang] = all_keys['en'] - all_keys[lang]

# ============================================================
# PRINT REPORT
# ============================================================
print("\n" + "=" * 80)
print("RESULTS")
print("=" * 80)
print(f"\n  Source keys found:          {len(source_keys)}")
print(f"  EN translation keys:        {len(en_keys)}")
print(f"  Keys in source, missing EN: {len(missing_from_en)}")
print(f"  EN→JA missing translations: {len(missing_by_lang['ja'])}")
print(f"  EN→VI missing translations: {len(missing_by_lang['vi'])}")
print(f"  EN→ZH missing translations: {len(missing_by_lang['zh'])}")

# --- A) Keys missing from ALL translations ---
print(f"\n{'=' * 80}")
print(f"A) KEYS IN SOURCE BUT MISSING FROM ALL TRANSLATIONS: {len(missing_from_en)}")
print(f"{'=' * 80}")

if missing_from_en:
    by_ns = defaultdict(list)
    for key in sorted(missing_from_en):
        ns = key.split('.')[0] if '.' in key else '(no ns)'
        by_ns[ns].append(key)
    for ns in sorted(by_ns):
        print(f"\n  [{ns}]")
        for key in sorted(by_ns[ns]):
            files = sorted(key_usages.get(key, set()))
            fstr = ', '.join(files[:5])
            if len(files) > 5: fstr += f' (+{len(files)-5})'
            print(f"    ❌ {key}")
            print(f"       → {fstr}")
else:
    print("  ✅ None found!")

# --- B) Per-language missing ---
for lang in ['ja', 'vi', 'zh']:
    missing = missing_by_lang[lang]
    if not missing:
        continue
    print(f"\n{'=' * 80}")
    print(f"B) KEYS IN EN BUT MISSING FROM {lang.upper()}: {len(missing)}")
    print(f"{'=' * 80}")
    by_ns = defaultdict(list)
    for key in sorted(missing):
        ns = key.split('.')[0] if '.' in key else '(no ns)'
        by_ns[ns].append(key)
    for ns in sorted(by_ns):
        print(f"\n  [{ns}]")
        for k in sorted(by_ns[ns]):
            print(f"    ⚠️  {k}")

# ============================================================
# WRITE DETAILED REPORT
# ============================================================
def get_en_value(key):
    parts = key.split('.')
    val = en_data
    try:
        for p in parts:
            val = val[p]
        return str(val)
    except:
        return '?'

lines = []
lines.append("# I18n Missing Keys Report")
lines.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

lines.append("## Overview")
lines.append(f"| Metric | Count |")
lines.append(f"|---|---|")
lines.append(f"| Source keys found | {len(source_keys)} |")
lines.append(f"| EN translation keys | {len(en_keys)} |")
lines.append(f"| Missing from ALL translations | {len(missing_from_en)} |")
lines.append(f"| EN→JA missing | {len(missing_by_lang['ja'])} |")
lines.append(f"| EN→VI missing | {len(missing_by_lang['vi'])} |")
lines.append(f"| EN→ZH missing | {len(missing_by_lang['zh'])} |\n")

# A) Missing from all
lines.append("## A) Keys Used in Source But Missing from ALL Translations\n")
if not missing_from_en:
    lines.append("✅ None found!\n")
else:
    by_ns = defaultdict(list)
    for key in sorted(missing_from_en):
        ns = key.split('.')[0] if '.' in key else '(no ns)'
        by_ns[ns].append(key)
    for ns in sorted(by_ns):
        lines.append(f"### `{ns}`")
        lines.append("| Key | Source Files |")
        lines.append("|---|---|")
        for key in sorted(by_ns[ns]):
            files = sorted(key_usages.get(key, set()))
            fstr = ', '.join(files[:5])
            if len(files) > 5: fstr += f' (+{len(files)-5})'
            lines.append(f"| `{key}` | {fstr} |")
        lines.append("")

# B) Per-language
for lang in ['ja', 'vi', 'zh']:
    missing = missing_by_lang[lang]
    if not missing:
        lines.append(f"\n## B) Keys in EN but Missing from {lang.upper()}\n✅ All EN keys present!\n")
        continue
    lines.append(f"\n## B) Keys in EN but Missing from {lang.upper()} ({len(missing)} keys)\n")
    by_ns = defaultdict(list)
    for key in sorted(missing):
        ns = key.split('.')[0] if '.' in key else '(no ns)'
        by_ns[ns].append(key)
    for ns in sorted(by_ns):
        lines.append(f"### `{ns}`")
        lines.append("| Key | EN Value |")
        lines.append("|---|---|")
        for key in sorted(by_ns[ns]):
            lines.append(f"| `{key}` | {get_en_value(key)} |")
        lines.append("")

report_path = os.path.join(BASE_DIR, 'I18N_MISSING_KEYS_REPORT.md')
with open(report_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f"\n✅ Report saved to: {report_path}")
