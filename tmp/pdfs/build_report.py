import csv
import os
from datetime import datetime
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics

ROOT = r'D:\Coding\All-Type'
SRC = r'C:\Users\mcvdi\AppData\Local\Temp'
OUT = os.path.join(ROOT, 'output', 'pdf', 'search_performance_report.pdf')
os.makedirs(os.path.dirname(OUT), exist_ok=True)

def rows(name):
    with open(os.path.join(SRC, name), encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f))

chart = rows('Chart.csv')
pages = rows('Pages.csv')
queries = rows('Queries.csv')
devices = rows('Devices.csv')
total_clicks = sum(int(r['Clicks']) for r in chart)
total_impressions = sum(int(r['Impressions']) for r in chart)
ctr = 100 * total_clicks / total_impressions

font_dir = r'C:\Windows\Fonts'
pdfmetrics.registerFont(TTFont('Arial', os.path.join(font_dir, 'arial.ttf')))
pdfmetrics.registerFont(TTFont('ArialBold', os.path.join(font_dir, 'arialbd.ttf')))

W, H = 612, 792
NAVY = HexColor('#142538')
BLUE = HexColor('#2075B6')
PALE = HexColor('#EAF3FA')
GRAY = HexColor('#536374')
LIGHT = HexColor('#E4EAF0')
GREEN = HexColor('#16805D')
ORANGE = HexColor('#C96B25')
c = canvas.Canvas(OUT, pagesize=(W, H))
c.setTitle('All-Type Search Performance: Findings and Action Plan')

def txt(x,y,s,size=10,color=NAVY,bold=False):
    c.setFillColor(color); c.setFont('ArialBold' if bold else 'Arial', size); c.drawString(x,y,s)

def wrap(x,y,s,width,size=9,leading=13,color=NAVY,bold=False):
    words=s.split(); line=''; lines=[]
    for word in words:
        trial=(line+' '+word).strip()
        if pdfmetrics.stringWidth(trial,'ArialBold' if bold else 'Arial',size)>width and line:
            lines.append(line); line=word
        else: line=trial
    if line: lines.append(line)
    for line in lines: txt(x,y,line,size,color,bold); y-=leading
    return y

def header(kicker,title,subtitle,page):
    c.setFillColor(NAVY); c.rect(0,H-112,W,112,fill=1,stroke=0)
    txt(38,H-34,kicker.upper(),9,HexColor('#8CC5EC'),True)
    txt(38,H-66,title,22,HexColor('#FFFFFF'),True)
    txt(38,H-91,subtitle,9,HexColor('#D8E6F1'))
    c.setStrokeColor(LIGHT); c.line(38,42,W-38,42)
    txt(38,27,'ALL-TYPE ROOFING & CONSTRUCTION  |  GOOGLE SEARCH CONSOLE',7,GRAY,True)
    txt(W-66,27,f'{page} / 3',8,GRAY)

def section(y,label):
    txt(38,y,label,12,NAVY,True)
    c.setStrokeColor(LIGHT); c.line(38,y-8,W-38,y-8)

def card(x,y,w,h,value,label,note,color=BLUE):
    c.setFillColor(PALE); c.roundRect(x,y,w,h,8,fill=1,stroke=0)
    txt(x+14,y+h-31,value,21,color,True)
    txt(x+14,y+h-50,label,9,NAVY,True)
    txt(x+14,y+13,note,7,GRAY)

header('Performance snapshot','Impressions are rising. Clicks lag.','Web search | July 29 - October 28, 2026 | Last 3 months export',1)
card(38,564,166,83,f'{total_impressions:,}','Impressions','Google showed a site result')
card(218,564,166,83,f'{total_clicks:,}','Clicks','Visits from search results',GREEN)
card(398,564,176,83,f'{ctr:.2f}%','Click-through rate','Clicks / impressions',ORANGE)
section(537,'What changed over the period')

# Daily line chart with seven-day rolling averages.
vals=[(int(r['Impressions']),int(r['Clicks'])) for r in chart]
rolling=[sum(v[0] for v in vals[max(0,i-6):i+1])/len(vals[max(0,i-6):i+1]) for i in range(len(vals))]
left,bottom,width,height=50,343,505,158
for frac in (0,.25,.5,.75,1):
    yy=bottom+frac*height
    c.setStrokeColor(LIGHT); c.line(left,yy,left+width,yy)
    txt(39,yy-3,str(int(500*frac)),7,GRAY)
c.setStrokeColor(BLUE); c.setLineWidth(2.2)
for i in range(1,len(rolling)):
    c.line(left+(i-1)*width/(len(rolling)-1),bottom+min(rolling[i-1],500)/500*height,
           left+i*width/(len(rolling)-1),bottom+min(rolling[i],500)/500*height)
txt(left,bottom-18,'Jul 29',8,GRAY)
txt(left+width/2-18,bottom-18,'Aug / Sep',8,GRAY)
txt(left+width-27,bottom-18,'Oct 28',8,GRAY)
txt(38,319,'Seven-day average daily impressions',8,BLUE,True)

section(290,'The good and the weak')
txt(38,265,'POSITIVE',9,GREEN,True)
wrap(38,248,'Average position improved from about 62 in the first 30 days to about 39 in the last 32 days. The homepage earned 21 of 27 clicks.',245,9,13)
txt(320,265,'LIMITING FACTOR',9,ORANGE,True)
wrap(320,248,'Most service-page impressions are for results far down the rankings. At those positions, a low click rate is expected.',250,9,13)
txt(38,151,'Interpretation',10,NAVY,True)
wrap(38,135,'Visibility is growing, but broad service searches have not yet turned into traffic. The priority is improving the ranking and usefulness of the pages that already earn impressions.',530,9,13)
txt(38,69,'Source: Chart.csv, Pages.csv, Filters.csv. Positions are averages, not a fixed rank.',7,GRAY)
c.showPage()

header('Where clicks are lost','Two pages dominate exposure.','Page-level impressions and clicks from the same export',2)
section(648,'Highest-impression pages')
selected=[('Roof replacement','/roof-replacement'),('Emergency roofing','/emergency-roofing'),('Homepage','/'),('Commercial roofing','/commercial-roofing')]
page_map={r['Top pages'].split('.com')[-1]:r for r in pages if r['Top pages'].startswith('https://alltyperoofingandconstruction.com')}
maxv=8000
for i,(label,path) in enumerate(selected):
    r=page_map[path]; y=603-i*61; imp=int(r['Impressions']); clicks=int(r['Clicks'])
    txt(38,y,label,9,NAVY,True)
    txt(410,y,f'{imp:,} impressions',8,GRAY)
    txt(510,y,f'{clicks} clicks',8,GRAY)
    c.setFillColor(LIGHT); c.roundRect(38,y-19,510,8,4,fill=1,stroke=0)
    c.setFillColor(BLUE); c.roundRect(38,y-19,510*imp/maxv,8,4,fill=1,stroke=0)
    txt(38,y-32,f'Avg position {float(r["Position"]):.1f}  |  CTR {r["CTR"]}',8,GRAY)

section(333,'Queries explain the gap')
qmap={r['Top queries']:r for r in queries}
for i,key in enumerate(['commercial roof replacement','industrial roof replacement','emergency roof repair commercial']):
    r=qmap[key]; y=305-i*30
    txt(38,y,key,9,NAVY)
    txt(351,y,f'{int(r["Impressions"]):,} impr.',8,GRAY)
    txt(445,y,f'Pos. {float(r["Position"]):.1f}',8,GRAY)
    txt(525,y,f'{r["Clicks"]} clicks',8,GRAY)

c.setFillColor(PALE); c.roundRect(38,114,536,75,8,fill=1,stroke=0)
txt(52,168,'Technical check: URL versions',10,NAVY,True)
wrap(52,151,'The export lists both extensionless and .html versions of several services. Inspect Google-selected canonicals, redirects, sitemap entries and internal links. The export alone does not prove duplicate indexing.',506,8.5,12)
txt(38,69,'Source: Pages.csv and Queries.csv. Query rows are not a complete site total.',7,GRAY)
c.showPage()

header('Priority plan','Turn exposure into qualified clicks.','Practical actions, ordered by likely value and dependency',3)
actions=[
('1','Confirm one URL per service','Use Search Console URL Inspection on each URL pair. Choose one canonical URL, redirect the alternate version, and align sitemap and internal links.','Technical clarity; verify before changing.'),
('2','Strengthen roof replacement','Add original Houston project photos and details: building type, system, size, challenge, work completed and result. Explain cost drivers, repair vs. replacement, timeline and disruption.','Targets 7,410 page impressions and the 5,265-impression query.'),
('3','Strengthen emergency roofing','Show real emergency jobs and service-area evidence. State how to request help, what happens after the call, and realistic response expectations.','Targets 2,542 page impressions.'),
('4','Link and substantiate','Link to these pages from homepage, commercial roofing, project and relevant location pages. Add genuine supplier, partner, trade and local citations where relationships exist.','Helps discovery and demonstrates credibility.'),
('5','Improve snippets after rankings rise','Write distinct, accurate title and description text for each service page. Compare CTR for queries that reach positions 1-10; do not judge snippets by position-50 CTR.','Converts stronger rankings into clicks.'),
]
y=632
for num,title,body,note in actions:
    c.setFillColor(PALE); c.circle(52,y+2,13,fill=1,stroke=0)
    txt(48,y-2,num,10,BLUE,True)
    txt(76,y+2,title,11,NAVY,True)
    y2=wrap(76,y-17,body,480,8.7,12)
    y2=wrap(76,y2-1,note,480,7.8,11,GRAY)
    y=y2-25

section(183,'How to measure progress')
wrap(38,163,'Every two weeks, filter Search Console to United States and compare each target query + page: impressions, clicks, average position and CTR. Watch for movement toward top-20 positions first, then improve titles if top-10 CTR remains weak.',536,9,13)
txt(38,97,'Method and limitations',9,NAVY,True)
wrap(38,81,'This is Search Console web-search data, not sales or lead data. Average positions mix locations and devices. No conversion tracking, backlink audit or live URL Inspection results were supplied.',536,7.5,10,GRAY)
txt(38,55,'Sources: supplied CSV exports; Google Search Central guidance on canonicals and helpful content.',7,GRAY)
c.showPage()
c.save()
print(OUT)
