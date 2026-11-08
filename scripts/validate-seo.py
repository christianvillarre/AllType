"""Validate canonical URLs, sitemap coverage, breadcrumbs, schema, and local links."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json, re, xml.etree.ElementTree as ET
ROOT = Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[]; self.links=[]; self.breadcrumbs=0
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if 'id' in attrs: self.ids.append(attrs['id'])
        if tag=='a': self.links.append(attrs.get('href',''))
        if tag=='nav' and attrs.get('aria-label')=='Breadcrumb': self.breadcrumbs+=1
files=[p for p in ROOT.glob('*.html') if p.name not in ['index-old.html','contact (1).html']]+list((ROOT/'commercial-construction').glob('*.html'))+list((ROOT/'services').rglob('*.html'))
canonicals=[]
for path in files:
    source=path.read_text(encoding='utf-8'); page=Page(); page.feed(source)
    assert len(page.ids)==len(set(page.ids)), (path,'duplicate IDs')
    canonical=re.findall(r'<link rel="canonical" href="([^"]+)"',source)
    assert len(canonical)==1 and canonical[0].startswith('https://alltyperoofingandconstruction.com/'), path
    canonicals+=canonical
    assert not re.search(r'<meta[^>]+(?:robots|googlebot)[^>]+noindex',source,re.I), path
    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>',source,re.S): json.loads(block)
    if path.parent==ROOT and path.name!='index.html': assert page.breadcrumbs==1, path
    for href in page.links:
        url=urlsplit(href)
        if url.scheme or url.netloc or not url.path.startswith('/'): continue
        target=ROOT/(unquote(url.path).lstrip('/') or 'index.html')
        if not target.is_file(): target=Path(str(target)+'.html')
        assert target.is_file(), (path,href)
        if url.fragment and target.suffix=='.html':
            target_page=Page(); target_page.feed(target.read_text(encoding='utf-8'))
            assert url.fragment in target_page.ids, (path,href)
urls=[node.text for node in ET.parse(ROOT/'sitemap.xml').findall('.//{*}loc')]
assert len(urls)==len(set(urls)) and set(urls)==set(canonicals), 'sitemap mismatch'
rules=(ROOT/'_redirects').read_text()
for path in files:
    if path.name=='index.html': continue
    url='/'+path.relative_to(ROOT).as_posix()[:-5]
    if path.is_relative_to(ROOT/'services'):
        assert f'{url} {url}.html 301!' in rules, url
    else:
        assert f'{url}.html {url} 301!' in rules and f'{url} {url}.html 200' in rules, url
print(f'PASS: {len(files)} pages; metadata, schema, breadcrumbs, local links, section anchors, redirect rules, and sitemap consistency.')
