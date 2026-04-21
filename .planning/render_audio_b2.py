#!/usr/bin/env python3
"""Render 30 B2 SSML files (mocks 01-10, 3 parts each) to MP3 via GCP WaveNet.
Reuses logic from render_audio.py but targets B2 only with fastrack-deutsch paths."""

import base64, json, os, re, subprocess, sys, time, urllib.request, urllib.error

REPO = "/Users/kiran.kumar/kk/worspaces/personal/fastrack-deutsch"
SSML_DIR = f"{REPO}/.planning/audio-prompts"
AUDIO_BASE = f"{REPO}/apps/mobile/assets/audio"
TTS_URL = "https://texttospeech.googleapis.com/v1/text:synthesize"
PROJECT = "telc-fasttrack-tts"
CHAR_LIMIT = 4800

TARGETS = []
for n in range(1, 11):
    mm = f"{n:02d}"
    for part in [1, 2, 3]:
        TARGETS.append({
            "level": "B2",
            "mock": f"mock{mm}",
            "part": part,
            "ssml_file": f"{SSML_DIR}/B2_mock{mm}_listening_part{part}.ssml",
            "out_dir": f"{AUDIO_BASE}/B2/mock{mm}",
            "out_file": f"{AUDIO_BASE}/B2/mock{mm}/listening_part{part}.mp3",
            "speaking_rate": 1.0,
        })


def get_access_token() -> str:
    r = subprocess.run(["gcloud", "auth", "print-access-token"],
                       capture_output=True, text=True, check=True)
    return r.stdout.strip()


def strip_xml_comments(s: str) -> str:
    return re.sub(r'<!--.*?-->', '', s, flags=re.DOTALL)


def tokenize_inner(inner: str) -> list[str]:
    tokens, pos, n = [], 0, len(inner)
    while pos < n:
        if inner[pos:pos+4] == '<!--':
            end = inner.find('-->', pos + 4)
            pos = (end + 3) if end != -1 else n
            continue
        if inner[pos] == '<':
            tm = re.match(r'<(/?)(\w+)', inner[pos:])
            if not tm:
                pos += 1; continue
            is_close = bool(tm.group(1))
            tag = tm.group(2).lower()
            if is_close:
                end = inner.find('>', pos)
                pos = (end + 1) if end != -1 else n
                continue
            tag_end = inner.find('>', pos)
            if tag_end == -1:
                pos += 1; continue
            if inner[tag_end - 1] == '/':
                tokens.append(inner[pos:tag_end + 1]); pos = tag_end + 1
            else:
                depth, scan, found = 1, tag_end + 1, False
                while depth > 0 and scan < n:
                    nxt_open = inner.find(f'<{tag}', scan)
                    nxt_close = inner.find(f'</{tag}>', scan)
                    if nxt_close == -1:
                        scan = n; break
                    if nxt_open != -1 and nxt_open < nxt_close:
                        depth += 1; scan = nxt_open + len(tag) + 1
                    else:
                        depth -= 1
                        if depth == 0:
                            ce = nxt_close + len(tag) + 3
                            tokens.append(inner[pos:ce]); pos = ce; found = True; break
                        scan = nxt_close + 1
                if not found:
                    tokens.append(inner[pos:]); pos = n
        else:
            nt = inner.find('<', pos)
            end = nt if nt != -1 else n
            t = inner[pos:end]
            if t.strip(): tokens.append(t)
            pos = end
    return tokens


def split_ssml_chunks(ssml: str, limit: int) -> list[str]:
    ssml = ssml.strip()
    m = re.match(r'<speak[^>]*>(.*)</speak>', ssml, re.DOTALL)
    if not m: return [ssml]
    inner = m.group(1).strip()
    full = f'<speak>{inner}</speak>'
    if len(full) <= limit: return [full]
    tokens = tokenize_inner(inner)
    overhead = len('<speak></speak>')
    chunks, cur, cur_len = [], [], overhead
    for tok in tokens:
        if cur_len + len(tok) > limit and cur:
            chunks.append('<speak>' + ''.join(cur) + '</speak>')
            cur, cur_len = [tok], overhead + len(tok)
        else:
            cur.append(tok); cur_len += len(tok)
    if cur:
        chunks.append('<speak>' + ''.join(cur) + '</speak>')
    return chunks if chunks else [full]


def synthesize(chunk: str, rate: float, token: str) -> bytes:
    body = {
        "input": {"ssml": chunk},
        "voice": {"languageCode": "de-DE", "name": "de-DE-Wavenet-B"},
        "audioConfig": {"audioEncoding": "MP3", "sampleRateHertz": 24000, "speakingRate": rate},
    }
    req = urllib.request.Request(
        TTS_URL, data=json.dumps(body).encode("utf-8"),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json",
                 "x-goog-user-project": PROJECT},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=90) as resp:
        data = json.loads(resp.read())
    if "audioContent" not in data:
        raise ValueError(f"no audioContent: {json.dumps(data)[:300]}")
    return base64.b64decode(data["audioContent"])


def render_file(t: dict, token: str):
    if not os.path.exists(t["ssml_file"]):
        return False, f"SSML missing: {t['ssml_file']}", 0, token
    os.makedirs(t["out_dir"], exist_ok=True)
    with open(t["ssml_file"], "r", encoding="utf-8") as f:
        raw = f.read()
    ssml = strip_xml_comments(raw).strip()
    chunks = split_ssml_chunks(ssml, CHAR_LIMIT)
    total = sum(len(c) for c in chunks)
    parts = []
    for i, ch in enumerate(chunks):
        for attempt in range(2):
            try:
                mp3 = synthesize(ch, t["speaking_rate"], token)
                if len(mp3) < 1000:
                    raise ValueError(f"too small ({len(mp3)}B)")
                parts.append(mp3); break
            except (urllib.error.HTTPError, urllib.error.URLError, ValueError) as e:
                if attempt == 0:
                    print(f"\n    chunk {i+1}/{len(chunks)} {e}, retry...")
                    time.sleep(5)
                    try: token = get_access_token()
                    except Exception: pass
                else:
                    return False, f"chunk {i+1}/{len(chunks)}: {e}", total, token
        if len(chunks) > 1 and i < len(chunks) - 1:
            time.sleep(0.4)
    combined = b"".join(parts)
    with open(t["out_file"], "wb") as f: f.write(combined)
    sz = os.path.getsize(t["out_file"])
    if sz < 100_000:
        return False, f"output small ({sz}B)", total, token
    return True, f"{sz // 1024}KB, {len(chunks)} chunk(s), {total} chars", total, token


def main():
    print(f"Rendering {len(TARGETS)} B2 listening MP3s...")
    try:
        token = get_access_token()
    except subprocess.CalledProcessError as e:
        print(f"gcloud auth failed: {e}"); sys.exit(1)
    succ, fail, total = [], [], 0
    for i, t in enumerate(TARGETS):
        label = f"{t['level']}/{t['mock']}/part{t['part']}"
        print(f"[{i+1:02d}/{len(TARGETS)}] {label} ...", end=" ", flush=True)
        if i > 0 and i % 15 == 0:
            try: token = get_access_token()
            except Exception: pass
        ok, msg, chars, token = render_file(t, token)
        total += chars
        if ok:
            print(f"OK [{msg}]"); succ.append(label)
        else:
            print(f"FAIL [{msg}]"); fail.append((label, msg))
        time.sleep(0.3)
    print("\n" + "=" * 60)
    print(f"{len(succ)}/{len(TARGETS)} OK, {len(fail)} failed")
    print(f"chars: {total:,}  |  est cost: ${(total/1_000_000)*16:.4f} (WaveNet @ $16/1M)")
    if fail:
        print("\nFAILED:")
        for l, m in fail: print(f"  {l}: {m}")
        sys.exit(1)


if __name__ == "__main__":
    main()
