#!/usr/bin/env python3
"""Import an Obsidian vault into this starter without touching the source vault."""

from __future__ import annotations

import argparse
import datetime as dt
import re
import shutil
from pathlib import Path

import yaml


PROJECT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = Path("/Users/neo/workspace/mine/quartz/content")
CONTENT_DIR = PROJECT / "MyMind"
LEGACY_ASSETS_DIR = PROJECT / "assets" / "obsidian"
SKIP_TOP_LEVEL = {".agents", ".claude", ".obsidian", "skills"}
SKIP_FILENAMES = {".DS_Store", "skills-lock.json"}
MARKDOWN_SUFFIXES = {".md", ".markdown", ".mkd", ".mkdn", ".mdown"}


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", nargs="?", type=Path, default=DEFAULT_SOURCE, help="Obsidian vault to import")
    parser.add_argument("--clean", action="store_true", help="Replace previously generated posts and copied vault assets")
    return parser.parse_args()


def should_skip(relative: Path) -> bool:
    return not relative.parts or relative.parts[0] in SKIP_TOP_LEVEL or any(part.startswith(".") for part in relative.parts)


def split_front_matter(text: str) -> tuple[dict, str]:
    match = re.match(r"\A---\s*\n(.*?)\n---\s*\n?", text, flags=re.DOTALL)
    if not match:
        return {}, text
    try:
        data = yaml.safe_load(match.group(1)) or {}
    except yaml.YAMLError:
        data = {}
    return data if isinstance(data, dict) else {}, text[match.end() :]


def date_for(metadata: dict, path: Path) -> str:
    for key in ("date", "created", "clipped_at", "updated"):
        value = metadata.get(key)
        if isinstance(value, (dt.date, dt.datetime)):
            if isinstance(value, dt.datetime):
                return value.astimezone().strftime("%Y-%m-%d %H:%M:%S %z") if value.tzinfo else value.strftime("%Y-%m-%d 12:00:00 +0800")
            return f"{value.isoformat()} 12:00:00 +0800"
        if value:
            try:
                parsed = dt.datetime.fromisoformat(str(value).replace("Z", "+00:00"))
                return parsed.astimezone(dt.timezone(dt.timedelta(hours=8))).strftime("%Y-%m-%d %H:%M:%S %z") if parsed.tzinfo else parsed.strftime("%Y-%m-%d 12:00:00 +0800")
            except ValueError:
                pass
    modified = dt.datetime.fromtimestamp(path.stat().st_mtime, tz=dt.timezone(dt.timedelta(hours=8)))
    return modified.strftime("%Y-%m-%d %H:%M:%S %z")


def title_for(metadata: dict, path: Path) -> str:
    title = str(metadata.get("title") or "").strip()
    return title or path.stem


def filename_for(relative: Path) -> str:
    readable = re.sub(r"[^\w\u4e00-\u9fff-]+", "-", relative.stem, flags=re.UNICODE)
    return re.sub(r"-+", "-", readable).strip("-_") or "note"


def slug_for(relative: Path) -> str:
    return filename_for(relative)


def output_relative_path(relative: Path) -> Path:
    if relative == Path("index.md"):
        return Path("index.md")
    relative_dir = relative.parent if relative.parent != Path(".") else Path("思维")
    return relative_dir / f"{filename_for(relative)}.md"


def yaml_list(value: object) -> list[str]:
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if value is None:
        return []
    item = str(value).strip()
    return [item] if item else []


def post_metadata(metadata: dict, source: Path, relative: Path) -> dict:
    parents = list(relative.parts[:-1])
    category = parents[0] if parents else "思维"
    existing_tags = yaml_list(metadata.get("tags"))
    tags = list(dict.fromkeys([*existing_tags, *parents[1:]]))
    output = {
        "layout": "post",
        "title": title_for(metadata, source),
        "date": date_for(metadata, source),
        "slug": slug_for(relative),
        "category": category,
        "categories": [category],
        "tags": tags,
        "source_path": relative.as_posix(),
    }
    for key in ("description", "excerpt", "author", "source", "type", "aliases"):
        if metadata.get(key) not in (None, "", []):
            output[key] = metadata[key]
    if metadata.get("url"):
        output["source_url"] = str(metadata["url"])
    if relative == Path("index.md"):
        output.update(
            {
                "layout": "home",
                "slug": "index",
                "permalink": "/",
                "homepage": True,
            }
        )
        output.pop("category", None)
        output.pop("categories", None)
    return output


def write_post(source: Path, relative: Path) -> None:
    text = source.read_text(encoding="utf-8")
    metadata, body = split_front_matter(text)
    data = post_metadata(metadata, source, relative)
    # Keep the vault hierarchy browsable under MyMind while using the source
    # filename as the readable URL slug.
    output_path = CONTENT_DIR / output_relative_path(relative)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    front_matter = yaml.safe_dump(data, allow_unicode=True, sort_keys=False, default_flow_style=False).strip()
    output_path.write_text(f"---\n{front_matter}\n---\n\n{body.lstrip()}", encoding="utf-8")


def copy_assets(source_root: Path) -> int:
    copied = 0
    for source in source_root.rglob("*"):
        if not source.is_file():
            continue
        relative = source.relative_to(source_root)
        if should_skip(relative) or source.suffix.lower() in MARKDOWN_SUFFIXES or source.name in SKIP_FILENAMES:
            continue
        target = CONTENT_DIR / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        copied += 1
    return copied


def main() -> None:
    args = parse_arguments()
    source_root = args.source.expanduser().resolve()
    if not source_root.is_dir():
        raise SystemExit(f"Source vault not found: {source_root}")

    post_ignore = CONTENT_DIR / ".gitignore"
    post_ignore_content = post_ignore.read_bytes() if post_ignore.is_file() else None
    if args.clean:
        shutil.rmtree(CONTENT_DIR, ignore_errors=True)
        shutil.rmtree(LEGACY_ASSETS_DIR, ignore_errors=True)
    CONTENT_DIR.mkdir(parents=True, exist_ok=True)
    if post_ignore_content is not None:
        post_ignore.write_bytes(post_ignore_content)

    notes = []
    for source in source_root.rglob("*"):
        if not source.is_file() or source.suffix.lower() not in MARKDOWN_SUFFIXES:
            continue
        relative = source.relative_to(source_root)
        if should_skip(relative):
            continue
        notes.append((source, relative))

    sorted_notes = sorted(notes, key=lambda item: item[1].as_posix().casefold())
    output_paths: dict[Path, Path] = {}
    output_slugs: dict[str, Path] = {}
    for _, relative in sorted_notes:
        target = output_relative_path(relative)
        previous = output_paths.get(target)
        if previous is not None:
            raise SystemExit(
                "Filename collision after normalization: "
                f"{previous.as_posix()} and {relative.as_posix()} -> {target.as_posix()}"
            )
        output_paths[target] = relative

        slug = slug_for(relative)
        previous_slug = output_slugs.get(slug)
        if previous_slug is not None:
            raise SystemExit(
                "Slug collision after normalization: "
                f"{previous_slug.as_posix()} and {relative.as_posix()} -> {slug}"
            )
        output_slugs[slug] = relative

    for source, relative in sorted_notes:
        write_post(source, relative)
    copied_assets = copy_assets(source_root)
    print(f"Imported {len(notes)} notes and copied {copied_assets} vault resources into MyMind.")


if __name__ == "__main__":
    main()
