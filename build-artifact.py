#!/usr/bin/env python3
"""
Builds a single-file, hash-routed version of the site for sharing as a link.

The multi-page site in this folder stays the real deliverable (separate HTML
files, better for SEO). This build exists only because embedded/sandboxed
viewers block page-to-page navigation, so a pitch link has to be one document.

Single source of truth: it reads the real pages and reuses their markup and
their init scripts verbatim. Edit the site, re-run this, the link updates.
"""
import re, sys, os

PAGES = ['index','shop','product','matcher','testing','notes','cart','contact']

def read(p):
    return open(p, encoding='utf-8').read()

def main_of(html):
    m = re.search(r'(<main[^>]*>.*?</main>)', html, re.S)
    return m.group(1) if m else ''

def init_of(html):
    """Pull the page's inline init script and unwrap its DOMContentLoaded."""
    scripts = re.findall(r'<script>(.*?)</script>', html, re.S)
    if not scripts:
        return ''
    body = scripts[-1]
    m = re.search(r"document\.addEventListener\(\s*'DOMContentLoaded'\s*,\s*\(\)\s*=>\s*\{(.*)\}\s*\)\s*;?\s*$",
                  body.strip(), re.S)
    return m.group(1) if m else body

def route_links(s):
    """Rewrite inter-page links to hash routes."""
    # anchored links first — a second '#' cannot survive hash routing
    for p in PAGES:
        s = re.sub(r'%s\.html#[a-z0-9-]+' % p, '#/%s' % p, s)
    s = s.replace('product.html?sku=', '#/product/')
    for p in PAGES:
        s = s.replace('"%s.html"' % p, '"#/%s"' % p)
        s = s.replace("'%s.html'" % p, "'#/%s'" % p)
    s = s.replace("['./','Home']", "['#/','Home']")
    s = s.replace('href="./"', 'href="#/"')
    return s

root = os.path.dirname(os.path.abspath(__file__))
os.chdir(root)

css     = read('css/site.css')
catalog = read('js/catalog.js')
site    = read('js/site.js')
matcher = read('js/matcher.js')
checkout= read('js/checkout.js')
product = read('js/product.js')

# site.js: drop its DOMContentLoaded bootstrap, the router calls renderShell
site = re.sub(r"document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{\s*renderShell\([^)]*\);\s*\}\);", '', site)

# product.js: take the sku from the route instead of the query string
product = re.sub(r"const sku = new URLSearchParams\(location\.search\)\.get\('sku'\);",
                 "const sku = window.__ROUTE_PARAM;", product)
product = re.sub(r"^\s*document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{",
                 "function initProduct(){", product, flags=re.M)
product = re.sub(r"\}\);\s*$", "}\n", product)

views = {}
inits = {}
for p in PAGES:
    html = read('%s.html' % p)
    views[p] = main_of(html)
    inits[p] = init_of(html)

# the fonts import must sit in its own <style> ahead of the rest
font_import = re.search(r"@import url\([^)]*\);", css).group(0)
css_body = css.replace(font_import, '')

parts = []
parts.append('<meta charset="utf-8">')
parts.append('<meta name="viewport" content="width=device-width,initial-scale=1">')
parts.append('<meta name="robots" content="noindex,nofollow">')
parts.append('<title>SempreViva Labs</title>')
parts.append('<style>%s</style>' % font_import)
parts.append('<style>%s</style>' % css_body)
parts.append('<div id="siteHeader"></div><div id="app"></div><div id="siteFooter"></div>')

js = []
js.append(catalog)
js.append(route_links(site))
js.append(matcher)
js.append(checkout)
js.append(route_links(product))

js.append('const VIEWS = {')
for p in PAGES:
    js.append('  %s: %s,' % (p, repr(route_links(views[p]))))
js.append('};')

js.append('const INITS = {')
for p in PAGES:
    if p == 'product':
        js.append('  product: function(){ initProduct(); },')
    else:
        js.append('  %s: function(){\n%s\n  },' % (p, route_links(inits[p])))
js.append('};')

js.append(r'''
/* ---- hash router ---------------------------------------------------- */
function route(){
  const raw = (location.hash || '#/').replace(/^#\/?/, '');
  const [name, param] = raw.split('/');
  const page = name && VIEWS[name] ? name : 'index';
  window.__ROUTE_PARAM = param || null;

  document.getElementById('app').innerHTML = VIEWS[page];
  const navKey = page === 'product' ? 'shop' : page;   // product pages sit under Compounds
  renderShell(navKey === 'index' ? '#/' : '#/' + navKey);
  try { INITS[page](); } catch(e){ console.error('view init failed:', page, e); }
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
document.addEventListener('DOMContentLoaded', route);
if(document.readyState !== 'loading') route();
''')

parts.append('<script>\n%s\n</script>' % '\n'.join(js))

out = '\n'.join(parts)
dest = sys.argv[1] if len(sys.argv) > 1 else 'dist-single.html'
open(dest, 'w', encoding='utf-8').write(out)
print('built %s — %.1f KB' % (dest, len(out)/1024))
