#!/usr/bin/env python3
"""Split messages.json into per-date chunks for lazy loading."""

import hashlib
import json
import subprocess
import os
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
CONVERSATIONS_DIR = DATA_DIR / "conversations"
OUTPUT_DIR = ROOT / "public" / "data"


def slugify(name: str) -> str:
    """Convert a name to a URL-friendly slug."""
    s = name.lower().strip()
    s = re.sub(r"[àáâãäå]", "a", s)
    s = re.sub(r"[èéêë]", "e", s)
    s = re.sub(r"[ìíîï]", "i", s)
    s = re.sub(r"[òóôõö]", "o", s)
    s = re.sub(r"[ùúûü]", "u", s)
    s = re.sub(r"[ç]", "c", s)
    s = re.sub(r"[ñ]", "n", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = s.strip("-")
    return s


def load_source_data():
    """Load messages.json and index.json."""
    messages_path = DATA_DIR / "messages.json"
    index_path = DATA_DIR / "index.json"

    if not messages_path.exists():
        print(f"Error: {messages_path} not found")
        sys.exit(1)
    if not index_path.exists():
        print(f"Error: {index_path} not found")
        sys.exit(1)

    print("Loading messages.json...")
    with open(messages_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    print("Loading index.json...")
    with open(index_path, "r", encoding="utf-8") as f:
        index = json.load(f)

    return data, index


def load_extra_conversations():
    """Load the conversations built from the IPJ report (data/conversations/).

    Each file already carries its own index, built by scripts/build_ipj_data.py.
    Returns a list of (conv_id, data, index) tuples; empty when the directory
    does not exist, so the Martha-only build keeps working unchanged.
    """
    if not CONVERSATIONS_DIR.is_dir():
        return []

    loaded = []
    for path in sorted(CONVERSATIONS_DIR.glob("*.json")):
        with open(path, "r", encoding="utf-8") as f:
            payload = json.load(f)
        loaded.append((path.stem, payload, payload["index"]))
        print(f"Loading conversations/{path.name}...")
    return loaded


def get_conversation_id(metadata):
    """Derive conversation ID from participants (excluding the owner)."""
    participants = metadata["participants"]
    owner = metadata.get("owner", "DV")
    other = [p for p in participants if p != owner]
    if other:
        return slugify(other[0])
    return slugify("-".join(participants))


def group_messages_by_date(messages):
    """Group messages by their date field."""
    by_date = defaultdict(list)
    for msg in messages:
        by_date[msg["date"]].append(msg)
    return by_date


# Martha's 65k messages need the 80-char cap to keep the index at ~5 MB, and her
# messages are short enough that it costs nothing. The IPJ conversations are the
# opposite: a few hundred messages, but each note runs several hundred characters,
# so truncating would make most of their text unsearchable. Index those in full —
# 615 messages of full text is a rounding error next to Martha's index.
FULL_TEXT_INDEX_MAX_MESSAGES = 5000


def build_search_index(messages, max_content_len=80):
    """Build lightweight search index, truncating content only when it pays off."""
    if len(messages) <= FULL_TEXT_INDEX_MAX_MESSAGES:
        max_content_len = None
    entries = []
    for msg in messages:
        if msg["type"] == "system":
            continue
        content = msg.get("content", "") or ""
        if not content.strip():
            continue
        entries.append({
            "id": msg["id"],
            "date": msg["date"],
            "sender": msg["sender"],
            "content": content if max_content_len is None else content[:max_content_len],
        })
    return entries


def write_json(path, data):
    """Write JSON to file, creating directories as needed."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))


REPORT_PDF = "data/source/IPJ-A-3298613-2026.pdf"
REPORT_PAGES_FALLBACK = 218


def describe_report_document():
    """The police report as a document: path, hash and page count.

    Computed here, once, so every consumer (site, export, pre-rendered pages)
    reads the same values from conversations.json instead of recomputing.
    """
    path = ROOT / REPORT_PDF
    if not path.exists():
        return None
    sha = hashlib.sha256(path.read_bytes()).hexdigest()
    pages = REPORT_PAGES_FALLBACK
    try:
        info = subprocess.run(
            ["pdfinfo", str(path)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            timeout=30,
        )
        m = re.search(r"^Pages:\s+(\d+)", info.stdout, re.M)
        if m:
            pages = int(m.group(1))
    except (OSError, subprocess.SubprocessError):
        pass
    # The path is the repository's; the site does not serve the PDF. Say where it is.
    return {
        "file": REPORT_PDF,
        "url": f"https://github.com/rafaelbressan/masterzap/blob/main/{REPORT_PDF}",
        "download": f"https://raw.githubusercontent.com/rafaelbressan/masterzap/main/{REPORT_PDF}",
        "sha256": sha,
        "pages": pages,
    }


CALL_RE_PT = re.compile(r"^Chamada de (voz|v[ií]deo)(?: — duração (\d{1,2}:\d{2}))?( perdida)?", re.I)
CALL_RE_EN = re.compile(r"^(Missed )?(Voice|Video) call(?:, (\d+) (min|sec)|, (No answer)|, (Ended)|, (Tap to call back))?", re.I)


def describe_call(msg):
    """One call as the calls screen needs it: direction, kind, how it ended, how long.

    The Martha export writes calls in English ("Voice call, 3 min", "Missed
    video call, Tap to call back", "Voice call, No answer"); the police report
    in Portuguese ("Chamada de voz — duração 02:49", "Chamada de voz perdida").
    Both become the same record. Returns None for a line that is not a call.
    """
    text = (msg.get("content") or "").strip()
    kind, status, duration = None, None, None
    m = CALL_RE_PT.match(text)
    if m:
        kind = "video" if m.group(1).lower().startswith("v") and "d" in m.group(1).lower() else "voice"
        duration = m.group(2)
        status = "missed" if m.group(3) else ("completed" if duration else "ended")
    else:
        m = CALL_RE_EN.match(text)
        if not m:
            return None
        kind = m.group(2).lower()
        if m.group(1) or m.group(7):
            status = "missed"
        elif m.group(5):
            status = "no_answer"
        elif m.group(3):
            status = "completed"
            duration = f"{m.group(3)} {'min' if m.group(4).lower().startswith('min') else 's'}"
        else:
            status = "ended"
    return {
        "kind": kind,
        "status": status,
        "duration": duration,
        "outgoing": msg.get("sender") == "DV",
    }


def normalise_date_range(date_range):
    """Always {"start": ..., "end": ...}.

    data/messages.json uses that shape; the IPJ builder once emitted a pair.
    Consumers should not have to know which source a conversation came from.
    """
    if isinstance(date_range, dict):
        return {"start": date_range["start"], "end": date_range["end"]}
    start, end = date_range
    return {"start": start, "end": end}


def split_conversation(conv_id, data, index):
    """Write index, search index and per-date chunks for one conversation.

    Returns the entry describing it for conversations.json.
    """
    metadata = data["metadata"]
    messages = data["messages"]
    conv_dir = OUTPUT_DIR / conv_id

    by_date = group_messages_by_date(messages)
    dates = sorted(by_date.keys())

    write_json(conv_dir / "index.json", index)

    search_index = build_search_index(messages)
    write_json(conv_dir / "search-index.json", search_index)
    size_mb = os.path.getsize(conv_dir / "search-index.json") / (1024 * 1024)

    for date in dates:
        write_json(conv_dir / f"{date}.json", {"messages": by_date[date]})

    for msg in messages:
        if msg["type"] != "call":
            continue
        call = describe_call(msg)
        if call:
            CALLS.append({
                "conversation_id": conv_id,
                "message_id": msg["id"],
                "date": msg["date"],
                "timestamp": msg["timestamp"],
                **call,
            })

    print(f"{conv_id}: {len(messages)} messages, {len(dates)} dates, "
          f"search index {size_mb:.1f} MB")

    type_counts = Counter(msg["type"] for msg in messages)

    last_msg = messages[-1] if messages else None
    owner = metadata.get("owner", "DV")
    other = [p for p in metadata["participants"] if p != owner]
    entry = {
        "id": conv_id,
        "participants": metadata["participants"],
        # The other side, by name, so consumers do not need to know the owner.
        "contact": metadata.get("contact") or (other[0] if other else metadata["participants"][0]),
        "owner": owner,
        "date_range": normalise_date_range(metadata["date_range"]),
        "total_messages": metadata["total_messages"],
        # Drives the "Mídias, links e documentos" count in the contact drawer.
        "media_counts": {
            "images": type_counts["image"],
            "videos": type_counts["video"],
            "documents": type_counts["document"],
        },
        "last_message": {
            "content": last_msg["content"][:80],
            "timestamp": last_msg["timestamp"],
            "sender": last_msg["sender"],
        } if last_msg else None,
    }
    for key in ("phone", "saved_as", "source", "note"):
        if metadata.get(key):
            entry[key] = metadata[key]
    if str(metadata.get("source", "")).startswith("IPJ-A") and REPORT_DOCUMENT:
        entry["source_document"] = REPORT_DOCUMENT
    return entry


REPORT_DOCUMENT = None
CALLS = []


def main():
    global REPORT_DOCUMENT
    REPORT_DOCUMENT = describe_report_document()
    data, index = load_source_data()
    sources = [(get_conversation_id(data["metadata"]), data, index)]
    sources.extend(load_extra_conversations())
    print()

    # Two sources sharing an id would overwrite each other's chunks in
    # public/data/<id>/ and produce a duplicate entry in conversations.json.
    seen = set()
    for conv_id, _, _ in sources:
        if conv_id in seen:
            print(f"Error: duplicate conversation id '{conv_id}'")
            sys.exit(1)
        seen.add(conv_id)

    entries = [split_conversation(*source) for source in sources]

    # Most recent conversation first, the way WhatsApp orders the chat list.
    entries.sort(key=lambda e: e["last_message"]["timestamp"] if e["last_message"] else "",
                 reverse=True)
    write_json(OUTPUT_DIR / "conversations.json", {"conversations": entries})

    # Every call, newest first — the calls screen reads this one file.
    CALLS.sort(key=lambda c: c["timestamp"], reverse=True)
    write_json(OUTPUT_DIR / "calls.json", {"calls": CALLS})
    print(f"calls.json: {len(CALLS)} calls")

    total = sum(e["total_messages"] for e in entries)
    print(f"\nDone! {len(entries)} conversations, {total} messages in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
