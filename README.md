# SempreViva Labs — website

Static multi-page site. No build step, no framework, no dependencies.
Open `index.html` or serve the folder and it runs.

```
index.html      Home — chromatogram hero, testing story, register preview, notes
shop.html       Compound register, filterable by class / blends
product.html    Product detail (?sku=BPC) — description, assay record,
                reconstitution calculator, handling
matcher.html    Six-question compound finder
testing.html    Testing standards + COA lookup
notes.html      Notes from the lab (blog index)
cart.html       Cart + checkout
contact.html    Contact

build-artifact.py  Builds dist-single.html (below)
dist-single.html   Single-file build of the whole site, hash-routed.
                   For sharing/pitching where a multi-page site can't be
                   hosted — embedded viewers block page-to-page navigation.
                   Generated; don't hand-edit. Rebuild with:
                       python3 build-artifact.py dist-single.html

css/site.css    Everything visual
js/catalog.js   PRODUCTS, CATEGORIES, NOTES, assay template  ← edit content here
js/site.js      Header/footer, cart, register rows, chromatogram
js/product.js   Product page
js/matcher.js   Matcher scoring engine
js/checkout.js  Checkout + payment adapter
```

## Run it locally

```bash
cd ~/Sites/semprevivalabs && python3 -m http.server 5180
```

Then open http://localhost:5180

## Deploy

It is static files, so anything works. Cheapest good option is Cloudflare Pages
(free, custom domain, HTTPS): create a project, upload this folder, point
semprevivalabs.com at it.

---

## BEFORE LAUNCH — four things

### 1. Replace the placeholder assay data

Every product currently shows a placeholder COA with `—` / `Pending` values and a
lot number of `SV-XXXX-0000`. This is deliberate: no assay numbers were invented.

Edit `assayFor()` in `js/catalog.js` to pull real per-lot values, then in the same
file set:

```js
const SVL_BUILD_MODE = false;
```

That removes the red warning bar sitewide.

### 2. Wire the COA lookup

`testing.html` has a working lot-number form that currently returns "not
connected". Point it at wherever the lot records live.

### 3. Connect a payment processor

The cart, totals, shipping form, validation and order summary are all live. Only
the authorisation step is unwired. Everything you need is in `js/checkout.js` —
set `Processor.connected = true` and fill in the marked integration point.

**Read this before choosing one.** Stripe, PayPal, Square and Shopify Payments all
prohibit peptides and research chemicals in their acceptable use policies. They
will approve an account, let it run a few weeks, then freeze it and hold the
balance for 180 days. This is the single most common way stores in this category
die. A high-risk merchant account is required — Easy Pay Direct, Soar Payments and
Durango all write this category. Budget roughly $500 setup and 4–6% rates.

Until a processor is live, the checkout collects the full order and tells the buyer
to email or call it in, with a copy-to-clipboard summary. That is a functioning
order path, not a dead end.

### 4. Have a lawyer read the copy

The site carries research-use-only language in the footer, on every product page,
and as a required checkout acknowledgement. No product description makes a
therapeutic claim — nothing on the site says any compound treats, prevents, or
improves anything, which is what draws FDA warning letters in this category. Keep
it that way when adding content.

---

## The entry gate

First visit shows a blur-backed dialog with two required confirmations — 21+, and
research-use-only acknowledgement. Enter stays disabled until both are ticked;
Leave shows a dead end. The choice is remembered per browser in `localStorage`
under `svl.gate.v1`.

Code is `Gate` in `js/site.js`, styles at the bottom of `css/site.css`. To reset
it while testing, run this in the browser console:

    localStorage.removeItem('svl.gate.v1'); location.reload();

A gate like this is a deterrent and a record of acknowledgement, not an identity
check. It does not verify anyone's age.

## Editing content

**Products** — `PRODUCTS` in `js/catalog.js`. Each entry:

```js
{
  sku:'BPC',                 // catalogue code, also the ?sku= URL
  name:'BPC-157',
  cat:'tissue',              // one of CATEGORIES
  blend:false,
  klass:'Synthetic pentadecapeptide',
  sizes:[{mg:10, price:30}], // add {mg, price, label} for blends
  seq:'GEPPPGKPADDAGLV',     // null if none
  mass:'1419.5 Da',
  form:'Lyophilised powder',
  about:'...',               // description — no therapeutic claims
  tags:['pentadecapeptide'],
  areas:['tissue'],          // drives the matcher
  depth:'entry',             // entry | standard | advanced
  route:'reconstituted',     // reconstituted | topical-or-reconstituted
  window:'standard'          // short | standard | extended
}
```

The last four fields only affect matcher scoring. Get them roughly right and the
shortlist behaves.

**Blog posts** — `NOTES` in `js/catalog.js`. Currently index entries with
summaries; give each one a `body` and render it on `notes.html` when the full
articles are written.

**Prices / shipping** — prices live on each product's `sizes`. Flat shipping and
the free-shipping threshold are at the top of `js/site.js` (`SVL.shipFlat`,
`SVL.freeShipOver`).

## Design notes

The concept is *sempreviva* — the everlasting flower, which keeps its colour
after it is dried. Lyophilisation is the same operation on a peptide. That is why
the palette is botanical rather than the black-and-neon every other peptide site
uses, and why the hero is an HPLC trace rather than a vial render: the
differentiator here is documentation, so the documentation is the hero.

Typefaces are Fraunces (display) and IBM Plex Sans (body), with IBM Plex Mono
reserved for actual assay data. Products render as entries in a register rather
than as cards.
