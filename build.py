#!/usr/bin/env python3
"""Builds the site into dist/ from content/*.json and src/template.html. No dependencies."""
import json, glob, html, re, shutil, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
e = html.escape
def inline(s):  # escape, then **bold** -> <strong>
    return re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', e(s, quote=False))
def load(p): return json.load(open(p, encoding='utf-8'))
def items(folder): return [load(p) for p in sorted(glob.glob(f'content/{folder}/*.json'))]
def btn(label, url, cls=''):
    return f'<a class="btn {cls}" href="{e(url)}"{" target=_blank rel=noopener" if url.startswith("http") else ""}>{e(label)}</a>' if url else ''

c = load('content/settings.json'); H = c['hero']; Hp = c['help']; Hw = c['how']; G = c['gift']
Sc = c['scholars']; A = c['about']; D = c['donate']; C = c['crisis']; F = c['footer']
sec = {}
sec['hero'] = f'''<section class="hero" id="top">
  <div class="in">
    <div>
      <p class="eyebrow">{inline(H['eyebrow'])}</p>
      <h1><span class="big">{e(H['big'])}</span> {e(H['rest'])}</h1>
      <p class="lede">{e(H['lede'])}</p>
      <div class="cta"><a class="btn y" href="#help">Mutual aid</a><a class="btn" href="#donate">Give</a></div>
    </div>
    <div class="art">
      <svg class="idaho" viewBox="0 0 100 100" role="img" aria-label="Idaho, in trans flag colors"><use href="#m1" width="100" height="100"/></svg>
    </div>
  </div>
</section>
'''
cards = ''.join(f'<article class="card"><p class="tag">{e(k["tag"])}</p><h3>{e(k["title"])}</h3><p>{inline(k["body"])}</p>{btn(k["button"], k.get("url",""))}</article>' for k in Hp['cards'])
sec['help'] = f'''<section class="help" id="help">
  <div class="in">
    <p class="eyebrow">{e(Hp['eyebrow'])}</p>
    <h2>{e(Hp['title'])}</h2>
    <p style="max-width:40em;font-weight:600">{e(Hp['intro'])}</p>
    <div class="cards">{cards}</div>
  </div>
</section>
'''
steps = ''.join(f'<li><h3>{e(s["title"])}</h3><p>{e(s["body"])}</p></li>' for s in Hw['steps'])
sec['how'] = f'''<section class="how" id="how">
  <div class="in">
    <p class="eyebrow">{e(Hw['eyebrow'])}</p>
    <h2>{e(Hw['title'])}</h2>
    <ol class="steps">{steps}</ol>
    <p class="safe">{inline(Hw['privacy'])}</p>
  </div>
</section>
'''
amts = ''.join(f'<div class="amt"><strong>{e(i["amount"])}</strong><span>{e(i["text"])}</span></div>' for i in G['items'])
sec['gift'] = f'''<section class="gift" id="gift">
  <div class="in">
    <p class="eyebrow" style="color:var(--ink)">{e(G['eyebrow'])}</p>
    <h2>{e(G['title'])}</h2>
    <div class="amts">{amts}</div>
  </div>
</section>
'''
def pos(x):  # where a photo is anchored inside its circle
    return f' style="object-position:center {e(x.get("photo_position","center"))}"' if x.get('photo_position') in ('top', 'bottom') else ''
def scholar(s):
    return (f'<article><div class="who"><img{pos(s)} src="{e(s["photo"])}" alt="Photo of {e(s["name"])}" width="64" height="64" loading="lazy"><h4>{e(s["name"])}</h4></div>'
            f'<p>{e(s["bio"])}</p></article>')
by = {}
for s in sorted(items('scholars'), key=lambda s: (s.get('order', 99), s['name'])): by.setdefault(int(s['year']), []).append(s)
years = ''.join(f'\n    <h3 class="yr">{y}</h3>\n    <div class="sgrid">\n      ' + '\n      '.join(scholar(s) for s in by[y]) + '\n    </div>' for y in sorted(by, reverse=True))
sec['scholars'] = f'''<section class="scholars" id="scholars">
  <div class="in">
    <p class="eyebrow">Scholarship</p>
    <h2>{e(Sc['title'])}</h2>
    <p style="max-width:40em;font-weight:600">{e(Sc['intro'])}</p>{years}
  </div>
</section>
'''
board = ''.join(f'<li><div class="av"><img{pos(b)} src="{e(b["photo"])}" alt="Photo of {e(b["name"])}" width="72" height="72" loading="lazy"></div><div><strong>{e(b["name"])}</strong><small>{e(b["role"])}</small><span class="b">{e(b["bio"])}</span></div></li>'
                for b in sorted(items('board'), key=lambda b: b.get('order', 99)))
story = ''
if A.get('story_body'):
    paras = ''.join(f'<p>{e(x.strip())}</p>' for x in A['story_body'].split('\n\n') if x.strip())
    link = f'<p><a class="storylink" href="{e(A["story_link_url"])}" target="_blank" rel="noopener">{e(A["story_link_text"])} &rarr;</a></p>' if A.get('story_link_url') else ''
    story = f'<h3 class="story">{e(A["story_title"])}</h3>{paras}{link}'
sec['about'] = f'''<section class="about" id="about">
  <div class="in">
    <div>
      <p class="eyebrow">{e(A['eyebrow'])}</p>
      <h2>{e(A['title'])}</h2>
      <p>{e(A['body'])}</p>
      <p style="font-weight:700">{e(A['pledge'])}</p>{story}
    </div>
    <ul class="board" aria-label="Board of directors">{board}</ul>
  </div>
</section>
'''
zeffy = open('src/zeffy.html', encoding='utf-8').read()
sec['donate'] = f'''<section class="donate" id="donate">
  <div class="in">
    <p class="eyebrow" style="color:var(--ink)">{e(D['eyebrow'])}</p>
    <h2>{e(D['title'])}</h2>
    <p style="font-weight:600;max-width:36em">{e(D['intro'])}</p>
    {zeffy}
    <a class="btn y" href="{e(D['zeffy_url'])}" target="_blank" rel="noopener" style="font-size:18px;padding:14px 26px;margin-top:18px">{e(D['fallback_button'])}</a>
    <p class="fine" style="margin-top:18px">{e(D['fine'])}</p>
  </div>
</section>
'''
sec['crisis'] = f'''<section class="crisis">
  <div class="in">
    <h2>{e(C['title'])}</h2>
    <ul>{''.join(f'<li>{inline(l)}</li>' for l in C['lines'])}</ul>
  </div>
</section>
'''
sec['footer'] = f'''<footer class="foot">
  <div class="in">
    <div><h3>{e(F['org'])}</h3><p>{e(F['address1'])}</p><p>{e(F['address2'])}</p></div>
    <div><h3>Contact</h3><p>{e(F['email'])}</p><p>{e(F['phone'])}</p><p>Instagram <a href="{e(F['instagram'])}" target="_blank" rel="noopener">@evedevittfund</a></p></div>
    <div><h3>Get involved</h3><p><a href="#help">Mutual aid</a></p><p><a href="#donate">Give</a></p></div>
    <p class="legal">{e(F['legal'])}</p>
  </div>
</footer>
'''
t = open('src/template.html', encoding='utf-8').read()
for k, v in sec.items(): t = t.replace(f'<!--@{k}-->', v)
th = c.get('theme', {})
if th:
    t = t.replace('</head>', '<style>:root{' + ''.join(f'--{k}:{v};' for k, v in th.items() if re.fullmatch(r'#[0-9a-fA-F]{3,8}', str(v))) + '}</style>\n</head>', 1)
t = t.replace('{{title}}', e(c['site']['title'])).replace('{{description}}', e(c['site']['description'], quote=True))
shutil.rmtree('dist', ignore_errors=True); os.makedirs('dist')
open('dist/index.html', 'w', encoding='utf-8').write(t)
shutil.copytree('img', 'dist/img'); shutil.copytree('admin', 'dist/admin')
css = re.search(r'<style>(.*?)</style>', t, re.S).group(1)  # the live site's styles, reused by the editor preview
open('dist/admin/preview.css', 'w', encoding='utf-8').write(css)
for f in ('CNAME', 'robots.txt', '404.html'):
    if os.path.exists(f): shutil.copy(f, 'dist/' + f)
# old Google Sites addresses -> homepage sections (GitHub Pages has no server redirects)
OLD = {'about': 'about', 'about/eves-story': 'about', 'about/our-board': 'about', 'donate': 'donate', 'grants': 'help',
       'mutual-aid': 'help', 'scholarship': 'scholars', 'scholarship/past-recipients': 'scholars'}
for old, anchor in OLD.items():
    os.makedirs(f'dist/{old}', exist_ok=True)
    open(f'dist/{old}/index.html', 'w', encoding='utf-8').write(
        f'<!doctype html><html lang="en"><meta charset="utf-8"><title>The Eve Devitt Fund</title><meta name="robots" content="noindex">'
        f'<link rel="canonical" href="/#{anchor}"><meta http-equiv="refresh" content="0;url=/#{anchor}">'
        f'<script>location.replace("/#{anchor}")</script><p><a href="/#{anchor}">Continue to the Eve Devitt Fund homepage</a></p></html>')
print('built dist/index.html', len(t), 'bytes')
