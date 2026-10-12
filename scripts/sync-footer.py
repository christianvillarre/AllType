"""Copy the shared footer into static pages so Netlify can process its CAPTCHA.

Run after editing footer.fragment: python scripts/sync-footer.py
"""

from pathlib import Path
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
PAGES = (
    "about.html",
    "commercial-construction.html",
    "commercial-roofing.html",
    "commercial-storm-damage-repair.html",
    "contact (1).html",
    "emergency-commercial-building-repair.html",
    "emergency-roofing.html",
    "index.html",
    "locations.html",
    "painting.html",
    "roof-repair-leak-detection.html",
    "roof-replacement.html",
    "roof-restoration.html",
    "services.html",
    "extra/about2.html",
)

DYNAMIC_FOOTER = re.compile(
    rb'<div id="site-footer"(?: role="contentinfo")?></div>\s*<script>\s*fetch\([\'"]\/footer\.fragment[\'"]\).*?</script>',
    re.DOTALL,
)
STATIC_FOOTER = re.compile(
    rb'<div id="site-footer">\s*<!-- BEGIN SHARED FOOTER -->.*?<!-- END SHARED FOOTER -->\s*</div>',
    re.DOTALL,
)
HIDDEN_CONTACT_FORM = re.compile(
    rb'\s*<form\s+name="contact"\s+method="POST"\s+data-netlify="true"\s+'
    rb'data-netlify-recaptcha="true"\s+netlify-honeypot="bot-field"\s+hidden\s*>.*?</form>',
    re.DOTALL,
)


def main() -> int:
    check_only = sys.argv[1:] == ["--check"]
    if sys.argv[1:] and not check_only:
        raise SystemExit("Usage: python scripts/sync-footer.py [--check]")

    fragment = (ROOT / "footer.fragment").read_bytes().replace(b"\r\n", b"\n").strip()
    if fragment.count(b'data-netlify-recaptcha="true"') != 2:
        raise SystemExit("The shared footer needs CAPTCHA on both the form and its widget div.")

    updates = {}
    for name in PAGES:
        path = ROOT / name
        original = path.read_bytes()
        newline = b"\r\n" if b"\r\n" in original else b"\n"
        footer = fragment.replace(b"\n", newline)
        replacement = newline.join((
            b'<div id="site-footer">',
            b'<!-- BEGIN SHARED FOOTER -->',
            footer,
            b'<!-- END SHARED FOOTER -->',
            b'</div>',
        ))

        pattern = STATIC_FOOTER if STATIC_FOOTER.search(original) else DYNAMIC_FOOTER
        updated, count = pattern.subn(lambda _: replacement, original, count=1)
        if count != 1:
            raise SystemExit(f"Could not find one shared footer in {name}")
        updated = HIDDEN_CONTACT_FORM.sub(b"", updated)
        if updated.count(b'name="contact"') != 1:
            raise SystemExit(f"Expected one visible contact form in {name}")
        updates[path] = (original, updated)

    stale = [path for path, (original, updated) in updates.items() if original != updated]
    if check_only:
        print(f"{len(stale)} footer pages need syncing" if stale else "All footer pages are in sync")
        return 1 if stale else 0

    for path in stale:
        path.write_bytes(updates[path][1])
    print(f"Synced {len(stale)} footer pages")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
