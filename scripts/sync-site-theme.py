"""Sync the homepage shell and shared theme onto active pages.

Run with Beautiful Soup available (workspace helper: tmp/site-style-tools).
Archived homepage variants and redirect-only documents are left intact.
"""
from pathlib import Path
import sys, re, json
from urllib.parse import urlsplit, urlunsplit, unquote

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tmp/site-style-tools'))
from bs4 import BeautifulSoup

VERSION = '20261115-site-theme'
source = BeautifulSoup((ROOT / 'index.html').read_text(encoding='utf-8'), 'html.parser')
header = str(source.select_one('.site-header'))
utility = str(source.select_one('.utility'))
footer = str(source.select_one('footer'))
footer = footer.replace('<footer>', '<footer class="unified-footer">', 1)
excluded = {'index.html', 'index2.html', 'index-old.html', 'contact (1).html'}
files = [p for p in ROOT.glob('*.html') if p.name not in excluded]
for directory in ['services', 'commercial-construction', 'commercial-roofing', 'campaign']:
    files.extend((ROOT / directory).rglob('*.html'))

manifest = []
for path in files:
    original = path.read_text(encoding='utf-8')
    soup = BeautifulSoup(original, 'html.parser')
    if not soup.body or not soup.head:
        continue  # Canonical redirects have no content shell.
    backup = ROOT / 'tmp/site-style-backup' / path.relative_to(ROOT)
    if not backup.exists():
        backup.parent.mkdir(parents=True, exist_ok=True)
        backup.write_text(original, encoding='utf-8')
    # Preserve page-specific form and metadata definitions byte-for-byte semantically.
    forms_before = [str(f) for f in soup.find_all('form')]
    sections_before = [(x.get('id'), x.get_text(' ', strip=True)) for x in soup.select('section')
                       if not x.find_parent('footer') and not x.find('footer')]
    soup.body['class'] = list(dict.fromkeys(soup.body.get('class', []) + ['site-page']))
    soup.body['data-page'] = path.relative_to(ROOT).as_posix()
    for node in soup.select('#site-navbar, .site-header, body > .utility, nav.navbar, header.site-mark'):
        node.decompose()
    # Replace the old footer only; preceding callouts, contact sections and forms stay.
    for node in soup.find_all('footer'):
        node.decompose()
    mount = soup.select_one('#site-footer')
    if mount:
        mount.unwrap()
    for script in list(soup.find_all('script')):
        src = script.get('src', '')
        code = script.string or script.get_text()
        if '/navbar.js' in src or '/homepage.js' in src or 'lenis' in src.lower():
            script.decompose()
        elif 'footer.fragment' in code or 'new Lenis' in code or 'new window.Lenis' in code:
            script.decompose()
    # Remove old shared shell styles; page-specific layout remains underneath the new theme.
    for link in list(soup.find_all('link', href=True)):
        if any(name in link['href'] for name in ['/navbar.css', '/footer.css', '/homepage.css', '/site-theme.css', '/vendor/lenis.css']):
            link.decompose()
    for node in list(soup.find_all('style', src=True)):
        node.decompose()
    if not soup.select('link[href*="fonts.googleapis.com"]'):
        link = soup.new_tag('link', rel='stylesheet', href='https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;500;600;700&display=swap')
        soup.head.append(link)
    for href in ['/vendor/lenis.css', '/homepage.css?v=' + VERSION, '/site-theme.css?v=' + VERSION]:
        soup.head.append(soup.new_tag('link', rel='stylesheet', href=href))
    shell = BeautifulSoup(utility + header, 'html.parser')
    for node in reversed(list(shell.contents)):
        soup.body.insert(0, node)
    footer_node = BeautifulSoup(footer, 'html.parser').footer
    soup.body.append(footer_node)
    for src in ['/vendor/lenis.min.js', '/homepage.js?v=' + VERSION]:
        tag = soup.new_tag('script', src=src)
        tag['defer'] = ''
        soup.body.append(tag)
    for main in soup.find_all('main'):
        if not main.get('id'):
            main['id'] = 'main-content'
    # Older templates put shared contact sections outside main; keep them in the
    # content flow so the same typography and responsive rules apply.
    main = soup.find('main')
    if main:
        for section in list(soup.select('.work-together-section, .contact-section')):
            if not section.find_parent('main'):
                main.append(section.extract())
    # All legacy hero variants use the same editorial heading/copy/image scale.
    hero = soup.select_one('main .about-hero, main .paint-hero, main .loc-hero, main .hero-services, main .contact-hero, main .hero')
    if hero:
        hero['class'] = list(dict.fromkeys(hero.get('class', []) + ['page-hero']))
    if path.parts[-2] == 'campaign':
        soup.body['class'].append('campaign-page')
    if path.name == 'thank-you.html':
        soup.body['class'].append('thank-you-page')
    for main in soup.find_all('main'):
        for section in main.find_all('section', recursive=False):
            section['class'] = list(dict.fromkeys(section.get('class', []) + ['page-section']))
    # Match homepage .html navigation and repair existing backslashes in breadcrumb URLs.
    for a in soup.find_all('a', href=True):
        href = a['href'].replace('\\', '/')
        u = urlsplit(href)
        if not u.scheme and not u.netloc and u.path.startswith('/'):
            target = ROOT / unquote(u.path).lstrip('/')
            newpath = '/index.html' if u.path == '/' else u.path
            if u.path != '/' and not Path(u.path).suffix and Path(str(target) + '.html').is_file():
                newpath += '.html'
            href = urlunsplit(('', '', newpath, u.query, u.fragment))
        a['href'] = href
    assert [str(f) for f in soup.find_all('form')] == forms_before, (path, 'form changed')
    after = [(x.get('id'), x.get_text(' ', strip=True)) for x in soup.select('section')
             if not x.find_parent('footer') and not x.find('footer')]
    assert sections_before == after, (path, 'section content changed')
    path.write_text(soup.prettify(formatter='minimal'), encoding='utf-8')
    manifest.append(path.relative_to(ROOT).as_posix())
(ROOT / 'tmp/site-theme-pages.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print(f'Synced homepage shell and theme on {len(manifest)} active pages; forms and section content preserved.')
