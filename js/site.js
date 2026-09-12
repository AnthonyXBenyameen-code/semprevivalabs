/* SempreViva Labs — shared shell, cart, and helpers */

const SVL = {
  phone:'(816) 641-7377',
  email:'support@semprevivalabs.com',
  shipFlat: 9,
  freeShipOver: 200
};

/* ---------- utilities ---------- */
const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const money = n => '$' + Number(n).toFixed(2);
const bySku = s => PRODUCTS.find(p=>p.sku===s);
const lowest = p => Math.min(...p.sizes.map(s=>s.price));
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

/* ---------- cart (localStorage) ---------- */
const Cart = {
  key:'svl.cart.v1',
  read(){
    try{ return JSON.parse(localStorage.getItem(this.key)) || []; }
    catch(e){ return []; }
  },
  write(items){
    try{ localStorage.setItem(this.key, JSON.stringify(items)); }catch(e){}
    this.paint();
    document.dispatchEvent(new CustomEvent('cart:change'));
  },
  add(sku, mg, qty=1){
    const items = this.read();
    const hit = items.find(i=>i.sku===sku && i.mg===mg);
    if(hit) hit.qty += qty; else items.push({sku,mg,qty});
    this.write(items);
    if(typeof Drawer !== 'undefined' && Drawer.built) Drawer.open();
  },
  setQty(sku,mg,qty){
    let items = this.read();
    if(qty<=0) items = items.filter(i=>!(i.sku===sku && i.mg===mg));
    else{ const hit = items.find(i=>i.sku===sku && i.mg===mg); if(hit) hit.qty = qty; }
    this.write(items);
  },
  remove(sku,mg){ this.write(this.read().filter(i=>!(i.sku===sku && i.mg===mg))); },
  clear(){ this.write([]); },
  count(){ return this.read().reduce((n,i)=>n+i.qty,0); },
  detailed(){
    return this.read().map(i=>{
      const p = bySku(i.sku); if(!p) return null;
      const size = p.sizes.find(s=>s.mg===i.mg) || p.sizes[0];
      return {...i, product:p, size, line: size.price * i.qty};
    }).filter(Boolean);
  },
  subtotal(){ return this.detailed().reduce((n,i)=>n+i.line,0); },
  shipping(){ const s=this.subtotal(); return s===0||s>=SVL.freeShipOver ? 0 : SVL.shipFlat; },
  total(){ return this.subtotal() + this.shipping(); },
  paint(){
    const n = this.count();
    $$('[data-cart-count]').forEach(el=>{
      el.textContent = n;
      if(el.classList.contains('badge')) el.hidden = (n === 0);
    });
    const fab = document.getElementById('cartFab');
    if(fab) fab.setAttribute('aria-label', n ? `Open cart, ${n} item${n>1?'s':''}` : 'Open cart');
  }
};

/* ---------- shell ---------- */
function renderShell(active){
  const nav = [
    ['shop.html','Research compounds'],
    ['matcher.html','Find a compound'],
    ['testing.html','Testing'],
    ['notes.html','Notes'],
    ['index.html#about','About'],
    ['contact.html','Contact us now!']
  ];

  const header = `
  ${SVL_BUILD_MODE ? `<div class="buildbar">
     <span><b>Build preview.</b> Assay values, lot numbers and COA data are placeholders — replace with real lot records before launch.</span>
   </div>` : ''}
  <div class="brandhead">
    <a href="./" aria-label="SempreViva Labs — home">
      <div class="brandlock">SempreViva Labs</div>
      <div class="brandinf">&#8734;</div>
    </a>
  </div>
  <nav class="navbar">
    <div class="shell navbar-in">
      <button class="navtoggle2" id="navToggle" aria-expanded="false" aria-controls="navLinks">Menu</button>
      <div class="navbar-links" id="navLinks">
        ${nav.map(([h,l])=>`<a href="${h}"${h===active?' aria-current="page"':''}>${l}</a>`).join('')}
      </div>
    </div>
  </nav>`;

  const footer = `
  <footer class="foot">
    <div class="shell">
      <div class="foot-grid">
        <div>
          <div class="fmark">SempreViva Labs</div>
          <p class="fblurb">Research peptides and supplements.</p>
        </div>
        <div>
          <h4>Sections</h4>
          <ul>
            <li><a href="shop.html">Research compound information</a></li>
            <li><a href="matcher.html">Find a compound</a></li>
            <li><a href="notes.html">Recent notes</a></li>
            <li><a href="cart.html">Cart</a></li>
          </ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><a href="index.html#about">About</a></li>
            <li><a href="contact.html">Contact</a></li>
            <li><a href="testing.html#coa">COA lookup</a></li>
            <li><a href="testing.html">Testing standards</a></li>
          </ul>
        </div>
        <div>
          <h4>Reach us</h4>
          <ul>
            <li><a href="tel:+18166417377">${SVL.phone}</a></li>
            <li><a href="mailto:${SVL.email}">${SVL.email}</a></li>
          </ul>
        </div>
      </div>
      <div class="legal">
        <p>&copy; ${new Date().getFullYear()} SempreViva Labs. All rights reserved.</p>
        <p><strong>Peptides:</strong> All peptide products are sold for laboratory research use only. They are not drugs, dietary supplements, or cosmetics, and are not intended or approved for human or veterinary use, consumption, diagnosis, treatment, cure, or prevention of any disease. Not for internal or external use in humans or animals.</p>
        <p><strong>Supplements:</strong> These statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure, or prevent any disease.</p>
      </div>
    </div>
  </footer>`;

  const h = $('#siteHeader'), f = $('#siteFooter');
  if(h) h.innerHTML = header;
  if(f) f.innerHTML = footer;

  const tog = $('#navToggle');
  if(tog) tog.addEventListener('click', ()=>{
    const n = $('#navLinks'), open = n.classList.toggle('open');
    tog.setAttribute('aria-expanded', String(open));
  });
  Drawer.build();
  Cart.paint();
  Gate.mount();
}

/* ---------- entry gate ----------------------------------------------
   Age + research-use acknowledgement. Shown once per browser, then
   remembered. Both boxes must be ticked before Enter unlocks.          */
const Gate = {
  key:'svl.gate.v1',

  passed(){
    try { return !!localStorage.getItem(this.key); } catch(e){ return false; }
  },

  mount(){
    if(this.passed()) return;
    if(document.querySelector('.gate')) return;   // router may re-render the shell

    const el = document.createElement('div');
    el.className = 'gate';
    el.setAttribute('role','dialog');
    el.setAttribute('aria-modal','true');
    el.setAttribute('aria-labelledby','gateTitle');
    el.innerHTML = `
      <div class="gate-panel">
        <div class="gate-mark"><span class="inf">&#8734;</span><span class="nm">SempreViva Labs</span></div>
        <h2 id="gateTitle">Before you enter</h2>
        <p class="lede">Two things to confirm. Both are required.</p>
        <div class="gate-checks">
          <label class="gate-check">
            <input type="checkbox" id="gAge">
            <span>I am 21 years of age or older.</span>
          </label>
          <label class="gate-check">
            <input type="checkbox" id="gUse">
            <span>I understand these products are sold for laboratory research use only &mdash; they are not drugs, supplements or cosmetics, and they are not for human or veterinary use.</span>
          </label>
        </div>
        <div class="gate-acts">
          <button class="btn btn-gold" id="gEnter" disabled>Enter</button>
          <button class="btn btn-ghost" id="gLeave">Leave</button>
        </div>
        <p class="gate-foot">Nothing on this site is medical advice, and no product is offered to diagnose, treat, cure or prevent any disease. Purchasers are responsible for handling these materials under applicable law.</p>
      </div>`;
    document.body.appendChild(el);

    const age = el.querySelector('#gAge'),
          use = el.querySelector('#gUse'),
          go  = el.querySelector('#gEnter');

    const sync = () => { go.disabled = !(age.checked && use.checked); };
    age.addEventListener('change', sync);
    use.addEventListener('change', sync);

    go.addEventListener('click', ()=>{
      if(go.disabled) return;
      try { localStorage.setItem(Gate.key, new Date().toISOString()); } catch(e){}
      el.remove();
    });

    el.querySelector('#gLeave').addEventListener('click', ()=>{
      el.querySelector('.gate-panel').outerHTML = `
        <div class="gate-panel gate-declined">
          <div class="gate-mark" style="justify-content:center"><span class="inf">&#8734;</span><span class="nm">SempreViva Labs</span></div>
          <h2>Thanks for stopping by</h2>
          <p class="lede" style="margin:0">This site is limited to research buyers aged 21 and over. You can close this tab.</p>
        </div>`;
    });

    // keep focus inside the dialog while it is up
    el.addEventListener('keydown', e=>{
      if(e.key !== 'Tab') return;
      const f = [...el.querySelectorAll('input,button')].filter(x=>!x.disabled);
      if(!f.length) return;
      const first = f[0], last = f[f.length-1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    });
    setTimeout(()=>age.focus(), 60);
  }
};

/* ---------- cart drawer ----------------------------------------------
   Floating button, top right, always visible. Click slides a panel in
   from the right with quantity controls, recommendations and checkout. */
const Drawer = {
  built:false,

  /* compounds worth suggesting: same research area as what is already in
     the cart, singles before blends, cheapest first. */
  recommended(n=3){
    const inCart = new Set(Cart.read().map(i=>i.sku));
    const cats   = new Set(Cart.detailed().map(i=>i.product.cat));
    return PRODUCTS
      .filter(p => !inCart.has(p.sku))
      .map(p => ({p, s:(cats.has(p.cat)?2:0) + (p.blend?0:1)}))
      .sort((a,b) => b.s - a.s || lowest(a.p) - lowest(b.p))
      .slice(0, n)
      .map(x => x.p);
  },

  build(){
    if(this.built) return;
    this.built = true;

    const fab = document.createElement('button');
    fab.className = 'cartfab';
    fab.id = 'cartFab';
    fab.setAttribute('aria-label','Open cart');
    fab.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M2.5 3h2.2l2.2 11.2a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.3L20.5 7H6"/>
        <circle cx="9.5" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/>
      </svg>
      <span class="badge" data-cart-count hidden>0</span>`;

    const scrim = document.createElement('div');
    scrim.className = 'cartscrim';
    scrim.id = 'cartScrim';

    const panel = document.createElement('aside');
    panel.className = 'cartdrawer';
    panel.id = 'cartDrawer';
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-modal','true');
    panel.setAttribute('aria-label','Cart');
    panel.innerHTML = `
      <div class="cd-head">
        <span class="cd-title">Cart</span>
        <button class="cd-close" id="cdClose" aria-label="Close cart">&times;</button>
      </div>
      <div class="cd-body" id="cdBody"></div>
      <div class="cd-foot" id="cdFoot"></div>`;

    document.body.append(fab, scrim, panel);

    fab.addEventListener('click', ()=>this.open());
    scrim.addEventListener('click', ()=>this.close());
    panel.querySelector('#cdClose').addEventListener('click', ()=>this.close());

    document.addEventListener('keydown', e=>{
      if(e.key === 'Escape' && panel.classList.contains('open')) this.close();
    });

    // quantity, remove and quick-add all live inside the panel
    panel.addEventListener('click', e=>{
      const b = e.target.closest('button'); if(!b) return;
      const {sku, mg, d} = b.dataset;
      if(b.classList.contains('cd-add')) return Cart.add(sku, +mg, 1);
      if(b.classList.contains('cd-rm'))  return Cart.remove(sku, +mg);
      if(d){
        const cur = Cart.read().find(i=>i.sku===sku && i.mg===+mg);
        Cart.setQty(sku, +mg, (cur ? cur.qty : 0) + (+d));
      }
    });

    this.render();
  },

  render(){
    const body = document.getElementById('cdBody');
    const foot = document.getElementById('cdFoot');
    if(!body || !foot) return;

    const items = Cart.detailed();

    const lines = items.length ? items.map(i=>`
      <div class="cd-line">
        <a class="nm" href="product.html?sku=${i.sku}">${i.product.name}</a>
        <div class="mg">${i.size.label || i.mg + ' mg'} &middot; ${money(i.size.price)} each</div>
        <div class="cd-row">
          <span class="cd-qty">
            <button data-sku="${i.sku}" data-mg="${i.mg}" data-d="-1" aria-label="One fewer ${i.product.name}">&minus;</button>
            <span class="n">${i.qty}</span>
            <button data-sku="${i.sku}" data-mg="${i.mg}" data-d="1" aria-label="One more ${i.product.name}">+</button>
          </span>
          <span class="amt">${money(i.line)}</span>
        </div>
        <button class="cd-rm" data-sku="${i.sku}" data-mg="${i.mg}">Remove</button>
      </div>`).join('')
      : `<p class="cd-empty">Nothing in the cart yet.</p>`;

    const recs = this.recommended(3);
    const recBlock = recs.length ? `
      <div class="cd-recs">
        <div class="lbl">${items.length ? 'Often studied alongside' : 'Start here'}</div>
        ${recs.map(p=>`
          <div class="cd-rec">
            <span class="t">
              <a href="product.html?sku=${p.sku}">${p.name}</a>
              <span class="p">${p.sizes[0].label || p.sizes[0].mg + ' mg'} &middot; ${money(lowest(p))}</span>
            </span>
            <button class="cd-add" data-sku="${p.sku}" data-mg="${p.sizes[0].mg}">Add</button>
          </div>`).join('')}
      </div>` : '';

    body.innerHTML = lines + recBlock;

    const sub = Cart.subtotal();
    const gap = SVL.freeShipOver - sub;
    foot.innerHTML = `
      <div class="cd-sub"><span class="k">Subtotal</span><span class="v">${money(sub)}</span></div>
      <div class="cd-ship">${
        items.length === 0 ? 'Shipping calculated at checkout'
        : gap > 0 ? money(gap) + ' more for free shipping'
        : 'Shipping is free on this order'}</div>
      <a class="cd-checkout" href="cart.html"${items.length ? '' : ' aria-disabled="true" tabindex="-1"'}>Checkout</a>`;
  },

  open(){
    const p = document.getElementById('cartDrawer');
    const s = document.getElementById('cartScrim');
    if(!p) return;
    this.render();
    p.classList.add('open');
    s.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(()=>{ const c = document.getElementById('cdClose'); if(c) c.focus(); }, 60);
  },

  close(){
    const p = document.getElementById('cartDrawer');
    const s = document.getElementById('cartScrim');
    if(!p) return;
    p.classList.remove('open');
    s.classList.remove('open');
    document.body.style.overflow = '';
    const f = document.getElementById('cartFab'); if(f) f.focus();
  }
};

document.addEventListener('cart:change', ()=>Drawer.render());

/* ---------- specimen register row ---------- */
function specRow(p){
  const sizes = p.sizes.map(s=>`<span class="row"><span class="mg">${s.label || s.mg+' mg'}</span><span>${money(s.price)}</span></span>`).join('');
  const tags = p.tags.map(t=>`<span class="tag${p.blend?' tag-blend':''}">${t}</span>`).join('');
  return `
  <article class="spec" data-cat="${p.cat}" data-blend="${p.blend}">
    <div class="spec-idx">SV-${p.sku}</div>
    <div class="spec-body">
      <a class="spec-name" href="product.html?sku=${p.sku}">${p.name}</a>
      <div class="spec-class">${p.klass}</div>
      <div class="spec-tags">${tags}</div>
    </div>
    <div class="spec-sizes">${sizes}</div>
    <div class="spec-buy">
      <div class="spec-price">${money(lowest(p))}${p.sizes.length>1?'<span class="from">from</span>':''}</div>
      <a class="btn btn-ghost btn-sm" href="product.html?sku=${p.sku}">View</a>
    </div>
  </article>`;
}

/* ---------- product grid card ---------- */
function gridCard(p){
  const sizes = p.sizes.map(s=>
    `<span><b>${s.label || s.mg + ' mg'}</b>${money(s.price)}</span>`).join('');
  const tags = p.tags.map(t=>`<span class="tag${p.blend?' tag-blend':''}">${t}</span>`).join('');
  return `
  <article class="pcard" data-cat="${p.cat}" data-blend="${p.blend}">
    <div class="pcard-sku">SV-${p.sku}</div>
    <a class="pcard-name" href="product.html?sku=${p.sku}">${p.name}</a>
    <p class="pcard-class">${p.klass}</p>
    <div class="spec-tags">${tags}</div>
    <div class="pcard-sizes">${sizes}</div>
    <div class="pcard-foot">
      <span class="pcard-price">${money(lowest(p))}${p.sizes.length>1?'<small>from</small>':''}</span>
      <span class="pcard-acts">
        <a class="pcard-view" href="product.html?sku=${p.sku}">View</a>
        <button class="pcard-add" data-sku="${p.sku}" data-mg="${p.sizes[0].mg}">Add</button>
      </span>
    </div>
  </article>`;
}

/* quick-add works anywhere a grid card is rendered */
document.addEventListener('click', e=>{
  const b = e.target.closest('.pcard-add');
  if(b) Cart.add(b.dataset.sku, +b.dataset.mg, 1);
});

/* ---------- chromatogram (hero) ---------- */
function drawChromatogram(host, opts={}){
  const W=560, H=210, base=H-26;
  const peaks = opts.peaks || [
    {x:118,h:14,w:11},{x:168,h:9,w:9},{x:286,h:152,w:23},{x:352,h:11,w:9},{x:430,h:7,w:8}
  ];
  const main = peaks.reduce((a,b)=>b.h>a.h?b:a);

  // build the trace as a sum of gaussians
  let d='';
  for(let x=28;x<=W-14;x+=1.6){
    let y=base;
    peaks.forEach(p=>{ y -= p.h * Math.exp(-Math.pow(x-p.x,2)/(2*p.w*p.w)); });
    y -= Math.sin(x/9)*0.5; // faint baseline noise
    d += (d?'L':'M') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
  }
  let fill = 'M'+(main.x-main.w*2.6)+' '+base+' ';
  for(let x=main.x-main.w*2.6;x<=main.x+main.w*2.6;x+=1.4){
    let y=base; peaks.forEach(p=>{ y -= p.h*Math.exp(-Math.pow(x-p.x,2)/(2*p.w*p.w)); });
    fill += 'L'+x.toFixed(1)+' '+y.toFixed(1)+' ';
  }
  fill += 'L'+(main.x+main.w*2.6)+' '+base+' Z';

  const grid = [0,1,2,3].map(i=>`<line class="grid" x1="28" y1="${34+i*38}" x2="${W-14}" y2="${34+i*38}"/>`).join('');

  host.innerHTML = `
    <div class="chroma-head">
      <span class="t">RP-HPLC &middot; 214 nm</span>
      <span class="t">${opts.lot || 'lot SV-0000'}</span>
    </div>
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Chromatogram showing a single dominant peak at 99.2 percent of total area">
      ${grid}
      <path class="peakfill" d="${fill}" opacity="0"/>
      <path class="trace" d="${d}"/>
      <line class="axis" x1="28" y1="${base}" x2="${W-14}" y2="${base}"/>
      <line class="axis" x1="28" y1="18" x2="28" y2="${base}"/>
      <line class="callout" x1="${main.x}" y1="${base-main.h-8}" x2="${main.x}" y2="24" opacity="0"/>
    </svg>
    <div class="chroma-read">
      <span class="big" id="chromaPct">0.0%</span>
      <span class="lbl">of total peak area &middot; single dominant species</span>
    </div>
    <div class="chroma-foot"><span>0.0 min</span><span>retention &rarr;</span><span>24.0 min</span></div>`;

  const path = host.querySelector('.trace');
  const pct  = host.querySelector('#chromaPct');
  const fillEl = host.querySelector('.peakfill');
  const call = host.querySelector('.callout');
  const target = opts.purity ?? 99.2;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){
    pct.textContent = target.toFixed(1)+'%';
    fillEl.setAttribute('opacity','1'); call.setAttribute('opacity','1');
    return;
  }

  const len = path.getTotalLength();
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;
  path.animate([{strokeDashoffset:len},{strokeDashoffset:0}],
    {duration:2100, easing:'cubic-bezier(.25,.6,.2,1)', fill:'forwards'});

  setTimeout(()=>{
    fillEl.animate([{opacity:0},{opacity:1}],{duration:620,fill:'forwards'});
    call.animate([{opacity:0},{opacity:1}],{duration:620,fill:'forwards'});
    const t0 = performance.now(), dur = 900;
    (function tick(now){
      const k = Math.min(1,(now-t0)/dur), e = 1-Math.pow(1-k,3);
      pct.textContent = (target*e).toFixed(1)+'%';
      if(k<1) requestAnimationFrame(tick);
    })(t0);
  }, 1500);
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderShell(document.body.dataset.page || '');
});
