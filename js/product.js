/* Product detail — reads ?sku= */

document.addEventListener('DOMContentLoaded', ()=>{
  const sku = new URLSearchParams(location.search).get('sku');
  const p = bySku(sku) || PRODUCTS[0];
  const host = document.getElementById('pd');
  document.title = p.name + ' — SempreViva Labs';

  let size = p.sizes[0];
  const a = assayFor(p);

  const sizeBtns = p.sizes.map((s,i)=>`
    <button class="size" data-mg="${s.mg}" aria-pressed="${i===0}">
      <span class="mg">${s.label || s.mg + ' mg'}</span>
      <span class="pr">${money(s.price)}</span>
    </button>`).join('');

  host.innerHTML = `
  <nav style="padding:22px 0;font-size:13.5px;color:var(--ink-mute)">
    <a href="shop.html" style="color:inherit">Register</a> &nbsp;/&nbsp;
    <a href="shop.html" style="color:inherit">${CATEGORIES.find(c=>c.id===p.cat).label}</a> &nbsp;/&nbsp;
    <span style="color:var(--ink)">${p.name}</span>
  </nav>

  <div class="pd">
    <div>
      <div class="pd-head">
        <h1>${p.name}</h1>
        <p class="pd-class">${p.klass}</p>
        <div class="spec-tags" style="margin-top:14px">
          ${p.tags.map(t=>`<span class="tag${p.blend?' tag-blend':''}">${t}</span>`).join('')}
        </div>
      </div>

      <div class="tabs" role="tablist">
        <button class="tab" role="tab" aria-selected="true"  data-p="about">Description</button>
        <button class="tab" role="tab" aria-selected="false" data-p="assay">Assay record</button>
        <button class="tab" role="tab" aria-selected="false" data-p="calc">Reconstitution</button>
        <button class="tab" role="tab" aria-selected="false" data-p="hand">Handling</button>
      </div>

      <div class="panel" id="p-about">
        <p style="font-size:1.05rem">${p.about}</p>
        <div class="rail" style="margin-top:30px;max-width:520px">
          <dl>
            <dt>Class</dt><dd>${p.klass.split('—')[0].trim()}</dd>
            ${p.seq ? `<dt>Sequence</dt><dd style="font-size:11.5px;text-align:right;word-break:break-all">${p.seq}</dd>` : ''}
            <dt>Molecular mass</dt><dd>${p.mass}</dd>
            <dt>Physical form</dt><dd>${p.form}</dd>
            <dt>Catalogue no.</dt><dd>SV-${p.sku}</dd>
          </dl>
        </div>
      </div>

      <div class="panel" id="p-assay" hidden>
        <table class="assay">
          <caption>Lot ${a.lot} &middot; released ${a.date}</caption>
          <thead><tr><th>Test</th><th>Method</th><th>Result</th><th>Status</th></tr></thead>
          <tbody>
            ${a.rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td>
              <td class="${r[3]==='Conforms'?'pass':''}">${r[3]}</td></tr>`).join('')}
          </tbody>
        </table>
        <div class="notice notice-hard" style="margin-top:24px">
          <p style="margin:0"><strong>Placeholder record.</strong> Assay values for this lot have not been published to the site yet. Replace this table with the real certificate of analysis before launch — see <a href="testing.html#coa" style="color:inherit">COA lookup</a>.</p>
        </div>
      </div>

      <div class="panel" id="p-calc" hidden>
        <p>Working volumes for a given vial and diluent. Arithmetic only — it converts between mass, volume, and syringe graduations.</p>
        <div class="calc" style="margin-top:20px;max-width:560px">
          <div class="calc-row">
            <label for="cVial">Vial content</label>
            <input id="cVial" type="number" min="0.1" step="0.1" value="${size.mg}"> 
          </div>
          <div class="calc-row">
            <label for="cDil">Bacteriostatic water added (mL)</label>
            <input id="cDil" type="number" min="0.1" step="0.1" value="2">
          </div>
          <div class="calc-row">
            <label for="cAli">Target aliquot (mcg)</label>
            <input id="cAli" type="number" min="1" step="1" value="250">
          </div>
          <div class="calc-out">
            <div class="line"><span class="k">Concentration</span><span class="v v-lead num" id="oConc">—</span></div>
            <div class="line"><span class="k">Volume per aliquot</span><span class="v num" id="oVol">—</span></div>
            <div class="line"><span class="k">On a U-100 syringe</span><span class="v num" id="oUnits">—</span></div>
            <div class="line"><span class="k">Aliquots per vial</span><span class="v num" id="oCount">—</span></div>
          </div>
        </div>
      </div>

      <div class="panel" id="p-hand" hidden>
        <div class="stack" style="--sp:22px">
          <div><h3 style="margin-bottom:7px">Before reconstitution</h3>
            <p>Sealed and lyophilised, the vial is stable at room temperature in transit and keeps longest at &minus;20&nbsp;°C. Freeze-drying removed the water, and water is what drives hydrolysis and most degradation pathways — which is the whole reason the powder form exists.</p></div>
          <div><h3 style="margin-bottom:7px">After reconstitution</h3>
            <p>Once diluent goes in, the clock starts. Refrigerate at 2–8&nbsp;°C, keep it out of light, and avoid repeated freeze–thaw cycles — each one costs you material. Add diluent slowly down the inside wall of the vial rather than directly onto the cake; peptides are shear-sensitive and foaming denatures them.</p></div>
          <div><h3 style="margin-bottom:7px">Do not shake</h3>
            <p>Swirl or let it dissolve on its own. If the solution goes cloudy or you see particulate that will not clear, stop using it — that is aggregation, and it does not reverse.</p></div>
        </div>
      </div>
    </div>

    <aside class="vial">
      <div class="vial-price" id="vPrice">${money(size.price)}</div>
      <p style="font-size:13px;color:var(--ink-mute);margin-top:6px">${p.form}</p>
      <div class="sizes">${sizeBtns}</div>
      <div class="qty">
        <button type="button" data-q="-1" aria-label="Decrease quantity">&minus;</button>
        <input id="qty" type="number" value="1" min="1" max="99" aria-label="Quantity">
        <button type="button" data-q="1" aria-label="Increase quantity">+</button>
      </div>
      <button class="btn btn-gold" id="addBtn" style="width:100%">Add to cart</button>
      <p id="added" class="hide" style="font-size:13px;color:var(--sage);margin-top:12px">Added. <a href="cart.html" style="color:var(--ink)">View cart</a></p>
      <div class="rail" style="margin-top:24px">
        <dl>
          <dt>Catalogue</dt><dd>SV-${p.sku}</dd>
          <dt>Form</dt><dd>Lyophilised</dd>
          <dt>Tested</dt><dd>United States</dd>
          <dt>Shipping</dt><dd>Free over ${money(SVL.freeShipOver)}</dd>
        </dl>
      </div>
      <p style="font-size:12px;color:var(--ink-mute);margin-top:18px;line-height:1.55">
        Sold for laboratory research use only. Not a drug, supplement, or cosmetic. Not for human or veterinary use.
      </p>
    </aside>
  </div>

  <section class="sec" style="border-top:1px solid var(--rule)">
    <div class="sec-head"><h2>Also in ${CATEGORIES.find(c=>c.id===p.cat).label.toLowerCase()}</h2></div>
    <div class="pgrid">
      ${PRODUCTS.filter(x=>x.cat===p.cat && x.sku!==p.sku).slice(0,4).map(gridCard).join('') || '<p style="padding:20px 0;color:var(--ink-mute)">Nothing else in this class yet.</p>'}
    </div>
  </section>`;

  /* tabs */
  host.querySelector('.tabs').addEventListener('click', e=>{
    const t = e.target.closest('.tab'); if(!t) return;
    host.querySelectorAll('.tab').forEach(x=>x.setAttribute('aria-selected', String(x===t)));
    host.querySelectorAll('.panel').forEach(x=>{ x.hidden = (x.id !== 'p-'+t.dataset.p); });
  });

  /* size */
  host.querySelector('.sizes').addEventListener('click', e=>{
    const b = e.target.closest('.size'); if(!b) return;
    size = p.sizes.find(s=>String(s.mg)===b.dataset.mg);
    host.querySelectorAll('.size').forEach(x=>x.setAttribute('aria-pressed', String(x===b)));
    host.querySelector('#vPrice').textContent = money(size.price);
    const cv = host.querySelector('#cVial'); if(cv){ cv.value = size.mg; calc(); }
  });

  /* qty */
  const qty = host.querySelector('#qty');
  host.querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click', ()=>{
    qty.value = Math.max(1, Math.min(99, (+qty.value||1) + (+b.dataset.q)));
  }));

  /* add */
  host.querySelector('#addBtn').addEventListener('click', ()=>{
    Cart.add(p.sku, size.mg, Math.max(1, +qty.value||1));
    const msg = host.querySelector('#added');
    msg.classList.remove('hide');
    clearTimeout(window._addT);
    window._addT = setTimeout(()=>msg.classList.add('hide'), 4000);
  });

  /* calculator */
  function calc(){
    const mg  = +host.querySelector('#cVial').value || 0;
    const mL  = +host.querySelector('#cDil').value  || 0;
    const mcg = +host.querySelector('#cAli').value  || 0;
    const out = (id,v)=>host.querySelector(id).textContent = v;
    if(mg<=0 || mL<=0){ ['#oConc','#oVol','#oUnits','#oCount'].forEach(i=>out(i,'—')); return; }
    const concMgMl = mg/mL;
    out('#oConc', concMgMl.toFixed(2) + ' mg/mL');
    if(mcg<=0){ ['#oVol','#oUnits','#oCount'].forEach(i=>out(i,'—')); return; }
    const vol = (mcg/1000) / concMgMl;           // mL per aliquot
    out('#oVol', vol < 0.1 ? (vol*1000).toFixed(0)+' µL' : vol.toFixed(3)+' mL');
    out('#oUnits', (vol*100).toFixed(1) + ' units');
    out('#oCount', Math.floor((mg*1000)/mcg) + ' aliquots');
  }
  ['#cVial','#cDil','#cAli'].forEach(id=>{
    const el = host.querySelector(id);
    if(el) el.addEventListener('input', calc);
  });
  calc();
});
