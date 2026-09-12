#!/usr/bin/env python3
"""
Stamps a version onto every css/js reference so a deploy can't serve a
visitor a stale stylesheet or script out of their browser cache.

GitHub Pages sends cache-control: max-age=600 on assets, so without this a
returning visitor sees up to ten minutes of mismatched CSS/JS after a push.

Run before committing:  python3 bump-version.py
"""
import glob, re, subprocess, time

try:
    ver = subprocess.check_output(
        ['git', 'rev-parse', '--short', 'HEAD'], text=True).strip()
except Exception:
    ver = str(int(time.time()))
ver += '-' + str(int(time.time()))[-5:]   # also move when files change, not just on commit

changed = 0
for f in glob.glob('*.html'):
    if f == 'dist-single.html':
        continue                          # single-file build inlines everything
    s = open(f, encoding='utf-8').read()
    orig = s
    s = re.sub(r'(href="css/site\.css)(\?v=[^"]*)?"',  r'\1?v=%s"' % ver, s)
    s = re.sub(r'(src="js/([a-z]+)\.js)(\?v=[^"]*)?"', r'\1?v=%s"' % ver, s)
    if s != orig:
        open(f, 'w', encoding='utf-8').write(s)
        changed += 1

print('stamped v=%s onto %d pages' % (ver, changed))
