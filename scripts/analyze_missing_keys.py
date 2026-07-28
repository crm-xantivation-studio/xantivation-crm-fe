#!/usr/bin/env python3
"""
Extract context for each missing i18n key to help determine appropriate translations.
Outputs a detailed CSV-like report.
"""
import json, os, re
from collections import defaultdict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(BASE_DIR, 'src')
LOCALES_DIR = os.path.join(SRC_DIR, 'locales')

with open(os.path.join(LOCALES_DIR, 'en', 'translation.json')) as f:
    en_data = json.load(f)

def get_all_keys(obj, prefix=''):
    keys = set()
    for k, v in obj.items():
        path = f'{prefix}.{k}' if prefix else k
        if isinstance(v, dict):
            keys.update(get_all_keys(v, path))
        else:
            keys.add(path)
    return keys

en_keys = get_all_keys(en_data)

T_PATTERN = re.compile(r"(?<![a-zA-Z0-9_])t\(\s*['\"`]([a-zA-Z0-9_.]+)['\"`]")
I18N_T_PATTERN = re.compile(r"i18n\.t\(\s*['\"]([a-zA-Z0-9_.]+)['\"]")
TRANSKEY_PATTERN = re.compile(r"(?:transKey|i18nKey)=['\"]([a-zA-Z0-9_.]+)['\"]")

key_contexts = defaultdict(list)

for root, dirs, files in os.walk(SRC_DIR):
    if 'locales' in root or 'node_modules' in root or '.next' in root:
        continue
    for file in files:
        if not file.endswith(('.tsx', '.ts', '.jsx', '.js')):
            continue
        path = os.path.join(root, file)
        relpath = os.path.relpath(path, BASE_DIR)
        try:
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
                content = ''.join(lines)
        except:
            continue

        for pattern in [T_PATTERN, I18N_T_PATTERN, TRANSKEY_PATTERN]:
            for m in pattern.finditer(content):
                key = m.group(1)
                pos = m.start()
                line_num = content[:pos].count('\n') + 1
                specific_line = lines[line_num - 1].strip() if line_num <= len(lines) else ''
                key_contexts[key].append({
                    'file': relpath,
                    'line': line_num,
                    'code': specific_line,
                })

missing_keys = {k: v for k, v in key_contexts.items() if k not in en_keys}

# Group by namespace, then by file
by_ns_file = defaultdict(lambda: defaultdict(list))
for key, contexts in sorted(missing_keys.items()):
    ns = key.split('.')[0] if '.' in key else 'general'
    # Group by the main file
    main_file = contexts[0]['file'] if contexts else 'unknown'
    by_ns_file[ns][main_file].append((key, contexts))

# Print organized context report
print("=" * 120)
print("MISSING I18N KEYS - CONTEXT ANALYSIS")
print("Organized by namespace > file > key")
print("=" * 120)

for ns in sorted(by_ns_file.keys()):
    total_in_ns = sum(len(keys) for keys in by_ns_file[ns].values())
    print(f"\n{'─' * 120}")
    print(f"  Namespace: {ns}  ({total_in_ns} keys)")
    print(f"{'─' * 120}")

    for main_file in sorted(by_ns_file[ns].keys()):
        keys = sorted(by_ns_file[ns][main_file], key=lambda x: x[0])
        print(f"\n  📁 {main_file}")

        for key, contexts in keys:
            # Get the primary context
            ctx = contexts[0]
            print(f"    🔑 {key}")
            print(f"    └─ {ctx['code'][:120]}")

            # If there are other files where this key is used
            if len(contexts) > 1:
                other_files = set(c['file'] for c in contexts[1:])
                print(f"       (also in: {', '.join(sorted(other_files))})")
