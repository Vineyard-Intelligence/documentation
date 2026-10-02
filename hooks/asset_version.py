"""Append a content hash to the site's own extra CSS/JS URLs.

The site sits behind a CDN that caches static files for hours, and these file names never change,
so without this a deploy keeps serving the previous script and stylesheet until the cache expires.
"""
import hashlib
import pathlib


def _versioned(path, docs):
    bare = path.split("?")[0]
    f = docs / bare
    if not f.is_file():
        return path
    return f"{bare}?v={hashlib.sha256(f.read_bytes()).hexdigest()[:10]}"


def on_config(config):
    docs = pathlib.Path(config["docs_dir"])
    config["extra_css"] = [_versioned(p, docs) for p in config["extra_css"]]
    scripts = []
    for s in config["extra_javascript"]:
        if isinstance(s, str):
            scripts.append(_versioned(s, docs))
        else:
            s.path = _versioned(s.path, docs)
            scripts.append(s)
    config["extra_javascript"] = scripts
    return config
