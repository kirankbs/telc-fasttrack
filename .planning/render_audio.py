#!/usr/bin/env python3
"""
Renders 45 SSML files to MP3 via Google Cloud TTS.
Handles files over 5000 chars by splitting at complete top-level XML element
boundaries and binary-concatenating the resulting MP3 chunks (valid for MPEG Layer 3).
"""

import json
import os
import re
import subprocess
import sys
import time
import urllib.request
import urllib.error
import base64

SSML_DIR = "/Users/kiran.kumar/kk/worspaces/personal/telc-fasttrack/.planning/audio-prompts"
AUDIO_BASE = "/Users/kiran.kumar/kk/worspaces/personal/telc-fasttrack/apps/mobile/assets/audio"
TTS_URL = "https://texttospeech.googleapis.com/v1/text:synthesize"
CHAR_LIMIT = 4800  # conservative margin under 5000-char sync limit

TARGETS = []
# A1 mocks 06-10
for mock_num in ["06", "07", "08", "09", "10"]:
    for part in [1, 2, 3]:
        TARGETS.append({
            "level": "A1",
            "mock": f"mock{mock_num}",
            "part": part,
            "ssml_file": f"{SSML_DIR}/A1_mock{mock_num}_listening_part{part}.ssml",
            "out_dir": f"{AUDIO_BASE}/A1/mock{mock_num}",
            "out_file": f"{AUDIO_BASE}/A1/mock{mock_num}/listening_part{part}.mp3",
            "speaking_rate": 0.85,
        })
# A2 mocks 01-10
for mock_num in [f"{n:02d}" for n in range(1, 11)]:
    for part in [1, 2, 3]:
        TARGETS.append({
            "level": "A2",
            "mock": f"mock{mock_num}",
            "part": part,
            "ssml_file": f"{SSML_DIR}/A2_mock{mock_num}_listening_part{part}.ssml",
            "out_dir": f"{AUDIO_BASE}/A2/mock{mock_num}",
            "out_file": f"{AUDIO_BASE}/A2/mock{mock_num}/listening_part{part}.mp3",
            "speaking_rate": 0.90,
        })


def get_access_token() -> str:
    result = subprocess.run(
        ["gcloud", "auth", "print-access-token"],
        capture_output=True, text=True, check=True
    )
    return result.stdout.strip()


def strip_xml_comments(ssml: str) -> str:
    return re.sub(r'<!--.*?-->', '', ssml, flags=re.DOTALL)


def tokenize_inner(inner: str) -> list[str]:
    """
    Parse the inner body of a <speak> element into a flat list of
    complete top-level tokens: <voice>...</voice> blocks, self-closing
    tags like <break/>, and non-empty text segments.
    """
    tokens = []
    pos = 0
    n = len(inner)
    while pos < n:
        if inner[pos:pos+4] == '<!--':
            end = inner.find('-->', pos + 4)
            pos = (end + 3) if end != -1 else n
            continue
        if inner[pos] == '<':
            tag_match = re.match(r'<(/?)(\w+)', inner[pos:])
            if not tag_match:
                pos += 1
                continue
            is_close = bool(tag_match.group(1))
            tag_name = tag_match.group(2).lower()
            if is_close:
                # Stray close tag — skip
                end = inner.find('>', pos)
                pos = (end + 1) if end != -1 else n
                continue
            tag_end = inner.find('>', pos)
            if tag_end == -1:
                pos += 1
                continue
            is_self_close = inner[tag_end - 1] == '/'
            if is_self_close:
                tokens.append(inner[pos:tag_end + 1])
                pos = tag_end + 1
            else:
                # Walk forward tracking depth to find matching close tag
                depth = 1
                scan = tag_end + 1
                found_close = False
                while depth > 0 and scan < n:
                    next_open = inner.find(f'<{tag_name}', scan)
                    next_close = inner.find(f'</{tag_name}>', scan)
                    if next_close == -1:
                        scan = n
                        break
                    if next_open != -1 and next_open < next_close:
                        depth += 1
                        scan = next_open + len(tag_name) + 1
                    else:
                        depth -= 1
                        if depth == 0:
                            close_end = next_close + len(tag_name) + 3
                            tokens.append(inner[pos:close_end])
                            pos = close_end
                            found_close = True
                            break
                        else:
                            scan = next_close + 1
                if not found_close:
                    tokens.append(inner[pos:])
                    pos = n
        else:
            next_tag = inner.find('<', pos)
            end = next_tag if next_tag != -1 else n
            text = inner[pos:end]
            if text.strip():
                tokens.append(text)
            pos = end


    return tokens


def split_ssml_chunks(ssml: str, limit: int) -> list[str]:
    """
    Split SSML into complete <speak>...</speak> chunks, each at most `limit` chars.
    Splits only at top-level element boundaries so no XML tags are split mid-element.
    """
    ssml = ssml.strip()
    inner_match = re.match(r'<speak[^>]*>(.*)</speak>', ssml, re.DOTALL)
    if not inner_match:
        return [ssml]
    inner = inner_match.group(1).strip()

    full = f'<speak>{inner}</speak>'
    if len(full) <= limit:
        return [full]

    tokens = tokenize_inner(inner)

    # Group tokens greedily into chunks under limit
    overhead = len('<speak></speak>')
    chunks = []
    current_tokens: list[str] = []
    current_len = overhead

    for tok in tokens:
        tok_len = len(tok)
        if current_len + tok_len > limit and current_tokens:
            chunks.append('<speak>' + ''.join(current_tokens) + '</speak>')
            current_tokens = [tok]
            current_len = overhead + tok_len
        else:
            current_tokens.append(tok)
            current_len += tok_len

    if current_tokens:
        chunks.append('<speak>' + ''.join(current_tokens) + '</speak>')

    return chunks if chunks else [full]


def synthesize_chunk(ssml_chunk: str, speaking_rate: float, token: str) -> bytes:
    """Call TTS API, return raw MP3 bytes."""
    body = {
        "input": {"ssml": ssml_chunk},
        "voice": {"languageCode": "de-DE", "name": "de-DE-Wavenet-B"},
        "audioConfig": {
            "audioEncoding": "MP3",
            "sampleRateHertz": 24000,
            "speakingRate": speaking_rate,
        }
    }
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        TTS_URL,
        data=data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "x-goog-user-project": "telc-fasttrack-tts",
        },
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=90) as resp:
        response_body = resp.read()

    result = json.loads(response_body)
    if "audioContent" not in result:
        raise ValueError(f"No audioContent in response: {json.dumps(result)[:300]}")
    return base64.b64decode(result["audioContent"])


def render_file(target: dict, token: str) -> tuple[bool, str, int, str]:
    """
    Render one SSML file to MP3.
    Returns (success, message, chars_synthesized, current_token).
    Token may be refreshed on retry — caller should use returned token.
    """
    ssml_path = target["ssml_file"]
    out_file = target["out_file"]
    out_dir = target["out_dir"]
    speaking_rate = target["speaking_rate"]

    if not os.path.exists(ssml_path):
        return False, f"SSML file not found: {ssml_path}", 0, token

    os.makedirs(out_dir, exist_ok=True)

    with open(ssml_path, "r", encoding="utf-8") as f:
        raw = f.read()

    ssml = strip_xml_comments(raw).strip()
    chunks = split_ssml_chunks(ssml, CHAR_LIMIT)
    total_chars = sum(len(c) for c in chunks)

    mp3_parts = []
    for i, chunk in enumerate(chunks):
        for attempt in range(2):
            try:
                mp3_bytes = synthesize_chunk(chunk, speaking_rate, token)
                if len(mp3_bytes) < 1000:
                    raise ValueError(f"Response too small ({len(mp3_bytes)} bytes)")
                mp3_parts.append(mp3_bytes)
                break
            except (urllib.error.HTTPError, urllib.error.URLError, ValueError) as e:
                if attempt == 0:
                    print(f"\n    chunk {i+1}/{len(chunks)} failed ({e}), retrying after 5s...")
                    time.sleep(5)
                    try:
                        token = get_access_token()
                    except Exception:
                        pass
                else:
                    return False, f"Chunk {i+1}/{len(chunks)} failed after retry: {e}", total_chars, token

        if len(chunks) > 1 and i < len(chunks) - 1:
            time.sleep(0.4)

    combined = b"".join(mp3_parts)
    with open(out_file, "wb") as f:
        f.write(combined)

    file_size = os.path.getsize(out_file)
    if file_size < 100_000:
        return False, f"Output too small ({file_size} bytes) — suspect bad audio", total_chars, token

    return True, f"{file_size // 1024}KB, {len(chunks)} chunk(s), {total_chars} chars", total_chars, token


def main():
    print("Fetching GCP access token...")
    try:
        token = get_access_token()
        print(f"Token acquired (length {len(token)})\n")
    except subprocess.CalledProcessError as e:
        print(f"ERROR: gcloud auth failed: {e}")
        sys.exit(1)

    successes = []
    failures = []
    total_chars_synthesized = 0

    for i, target in enumerate(TARGETS):
        label = f"{target['level']}/{target['mock']}/part{target['part']}"
        print(f"[{i+1:02d}/{len(TARGETS)}] {label} ...", end=" ", flush=True)

        # Refresh token every 15 files (tokens typically last ~60min)
        if i > 0 and i % 15 == 0:
            try:
                token = get_access_token()
            except Exception:
                pass

        ok, msg, chars, token = render_file(target, token)
        total_chars_synthesized += chars

        if ok:
            print(f"OK  [{msg}]")
            successes.append((label, target["out_file"]))
        else:
            print(f"FAILED  [{msg}]")
            failures.append((label, msg))

        time.sleep(0.3)

    print("\n" + "=" * 60)
    print(f"RESULTS: {len(successes)}/{len(TARGETS)} succeeded, {len(failures)} failed")
    print(f"Total chars synthesized: {total_chars_synthesized:,}")
    cost = (total_chars_synthesized / 1_000_000) * 16
    print(f"Estimated API cost: ${cost:.4f}  (WaveNet @ $16/1M chars)")

    if failures:
        print(f"\nFAILED ({len(failures)}):")
        for label, msg in failures:
            print(f"  FAIL  {label}: {msg}")

    print(f"\nSUCCEEDED ({len(successes)}):")
    for label, path in successes:
        print(f"  OK  {label}  ->  {path}")


if __name__ == "__main__":
    main()
