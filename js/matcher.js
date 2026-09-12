/* Compound matcher — deterministic scoring over the register.
   Asks about research design only. Never about symptoms or health status. */

const QUESTIONS = [
  { id:'area', q:'What is the research area?',
    hint:'This carries the most weight in the scoring.',
    opts:[
      ['metabolic','Metabolic and growth axis','Incretin signalling, energy expenditure, growth-hormone release'],
      ['tissue','Tissue and structural','Connective tissue, matrix, structural repair models'],
      ['dermal','Dermal and pigment','Skin, follicle, matrix proteins, melanocortin pigment pathways'],
      ['cellular','Cellular and mitochondrial','Mitochondrial signalling, redox cofactors, innate repair receptor'],
      ['neuroendocrine','Neuroendocrine','Hypothalamic–pituitary signalling, melanocortin receptors']
    ]},
  { id:'form', q:'Single compound, or a blend?',
    hint:'Blends need a ratio verification on top of the purity assay.',
    opts:[
      ['single','A single compound','One molecule, one assay, cleanest attribution'],
      ['blend','A verified blend','Several compounds co-lyophilised at a measured ratio'],
      ['either','No preference','Score both and let the other answers decide']
    ]},
  { id:'window', q:'How long is the study window?',
    hint:'Shorter-acting compounds suit shorter windows.',
    opts:[
      ['short','Short — under four weeks','Fast-clearing compounds, tight observation window'],
      ['standard','Standard — eight to twelve weeks','The usual planning horizon'],
      ['extended','Extended — beyond twelve weeks','Longer half-life or larger vial sizes preferred']
    ]},
  { id:'depth', q:'How familiar are you with this class?',
    hint:'Affects how much handling complexity the shortlist assumes.',
    opts:[
      ['entry','First protocol with it','Favour simple, well-characterised, single-component entries'],
      ['standard','Some prior work','Comfortable with reconstitution and standard handling'],
      ['advanced','Extensive','Multi-component blends and complex handling are fine']
    ]},
  { id:'budget', q:'Budget per vial?',
    hint:'Filters on the lowest available size for each entry.',
    opts:[
      ['30','Up to $30',''],
      ['50','Up to $50',''],
      ['75','Up to $75',''],
      ['999','No constraint','']
    ]},
  { id:'route', q:'Any handling constraint?',
    hint:'Everything in the register ships lyophilised and is reconstituted before use.',
    opts:[
      ['any','None','Standard reconstitution is fine'],
      ['topical','Prefer topical-compatible','Favour compounds also used in topical preparations'],
      ['simple','Simplest possible','Single component, one step, no ratio to track']
    ]}
];

const ADJ = { short:['standard'], standard:['short','extended'], extended:['standard'] };
const DEPTH_ORDER = ['entry','standard','advanced'];

function score(p, ans){
  let pts = 0; const why = [];

  // research area — heaviest weight
  if(p.areas[0] === ans.area){ pts += 42; why.push(`Primary fit for ${CATEGORIES.find(c=>c.id===ans.area).label.toLowerCase()}`); }
  else if(p.areas.includes(ans.area)){ pts += 24; why.push(`Secondary activity in ${CATEGORIES.find(c=>c.id===ans.area).label.toLowerCase()}`); }

  // single vs blend
  if(ans.form === 'either'){ pts += 10; }
  else if((ans.form==='blend') === p.blend){
    pts += 20;
    why.push(p.blend ? 'Blend, with per-lot ratio verification' : 'Single component — one assay, clean attribution');
  }
  else { pts -= 12; }   // stated a preference and this is the other kind

  // study window
  if(p.window === ans.window){ pts += 13; why.push(`Suits a ${ans.window==='short'?'short':ans.window} study window`); }
  else if((ADJ[ans.window]||[]).includes(p.window)){ pts += 6; }

  // familiarity
  const gap = Math.abs(DEPTH_ORDER.indexOf(p.depth) - DEPTH_ORDER.indexOf(ans.depth));
  if(gap===0){ pts += 15; why.push('Handling complexity matches your stated experience'); }
  else if(gap===1){ pts += 7; }

  // budget
  const low = lowest(p), cap = +ans.budget;
  if(low <= cap){ pts += 18; if(cap!==999) why.push(`${money(low)} — inside your ${money(cap)} ceiling`); }
  else { pts -= 14; }

  // handling
  if(ans.route === 'any'){ pts += 8; }
  else if(ans.route === 'topical' && p.route === 'topical-or-reconstituted'){ pts += 16; why.push('Also used in topical preparations'); }
  else if(ans.route === 'simple' && !p.blend){ pts += 14; why.push('Single-step handling, no ratio to track'); }
  else if(ans.route === 'simple' && p.blend){ pts -= 10; }

  return { p, pts, why: why.slice(0,4) };
}

function rank(ans){
  const all = PRODUCTS.map(p=>score(p,ans)).sort((a,b)=>b.pts-a.pts);
  const max = all[0].pts || 1;
  return all.map(r=>({...r, norm: Math.max(0, Math.round((r.pts/max)*100))}));
}
