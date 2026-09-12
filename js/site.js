/* SempreViva Labs — shared shell, cart, and helpers */

const SVL = {
  phone:'(816) 641-7377',
  email:'support@semprevivalabs.com',
  city:'Kansas City, MO',
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
  paint(){ $$('[data-cart-count]').forEach(el=>{ el.textContent = this.count(); }); }
};

/* ---------- shell ---------- */
function renderShell(active){
  const nav = [
    ['./','Home'],
    ['shop.html','Compounds'],
    ['matcher.html','Find a compound'],
    ['testing.html','Testing'],
    ['notes.html','Notes'],
    ['contact.html','Contact']
  ];

  const header = `
  ${SVL_BUILD_MODE ? `<div class="buildbar">
     <span><b>Build preview.</b> Assay values, lot numbers and COA data are placeholders — replace with real lot records before launch.</span>
   </div>` : ''}
  <header class="masthead">
    <div class="shell masthead-in">
      <a class="wordmark" href="./">
        <span class="inf">&#8734;</span>
        <span class="mark">SempreViva Labs</span>
        <span class="sub">Kansas City, MO</span>
      </a>
      <nav class="nav" id="nav">
        ${nav.map(([h,l])=>`<a href="${h}"${h===active?' aria-current="page"':''}>${l}</a>`).join('')}
      </nav>
      <a class="cartbtn" href="cart.html">Cart <span class="n" data-cart-count>0</span></a>
      <button class="navtoggle" id="navToggle" aria-expanded="false" aria-controls="nav" aria-label="Menu">&#9776;</button>
    </div>
  </header>`;

  const footer = `
  <footer class="foot">
    <div class="shell">
      <div class="foot-grid">
        <div>
          <div class="fmark"><span class="inf">&#8734;</span> SempreViva Labs</div>
          <p class="fblurb">“Sempre viva” means always alive. A research supply company focused on the long game, and on the documentation that makes the long game possible.</p>
        </div>
        <div>
          <h4>Register</h4>
          <ul>
            <li><a href="shop.html">All compounds</a></li>
            <li><a href="matcher.html">Find a compound</a></li>
            <li><a href="shop.html#blends">Blends</a></li>
            <li><a href="cart.html">Cart</a></li>
          </ul>
        </div>
        <div>
          <h4>Documentation</h4>
          <ul>
            <li><a href="testing.html">How we test</a></li>
            <li><a href="testing.html#coa">COA lookup</a></li>
            <li><a href="notes.html">Notes from the lab</a></li>
            <li><a href="testing.html#handling">Storage &amp; handling</a></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li><a href="tel:+18166417377">${SVL.phone}</a></li>
            <li><a href="mailto:${SVL.email}">${SVL.email}</a></li>
            <li><a href="contact.html">Send a message</a></li>
            <li>${SVL.city}</li>
          </ul>
        </div>
      </div>
      <div class="legal">
        <p><strong>Research use only.</strong> All peptide products sold by SempreViva Labs are supplied for laboratory research use only. They are not drugs, dietary supplements, cosmetics, or food, and they are not for human or veterinary use, diagnostic use, or therapeutic use of any kind. Nothing on this site is medical advice, and no product is offered to diagnose, treat, cure, or prevent any disease. Purchasers are responsible for handling these materials in accordance with all applicable laws and institutional requirements.</p>
        <p>These statements have not been evaluated by the Food and Drug Administration.</p>
        <p>&copy; ${new Date().getFullYear()} SempreViva Labs &middot; ${SVL.city} &middot; <a href="testing.html">Testing standards</a></p>
      </div>
    </div>
  </footer>`;

  const h = $('#siteHeader'), f = $('#siteFooter');
  if(h) h.innerHTML = header;
  if(f) f.innerHTML = footer;

  const tog = $('#navToggle');
  if(tog) tog.addEventListener('click', ()=>{
    const n = $('#nav'), open = n.classList.toggle('open');
    tog.setAttribute('aria-expanded', String(open));
  });
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
