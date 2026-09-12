/* SempreViva Labs — compound register
   Descriptions are structural/mechanistic only. No therapeutic claims anywhere.
   Assay values are PLACEHOLDER until replaced with real lot data (see README). */

const SVL_BUILD_MODE = true; // set false once real COA data is wired

const CATEGORIES = [
  { id:'metabolic',     label:'Metabolic & growth axis' },
  { id:'tissue',        label:'Tissue & structural' },
  { id:'dermal',        label:'Dermal & pigment' },
  { id:'cellular',      label:'Cellular & mitochondrial' },
  { id:'neuroendocrine',label:'Neuroendocrine' }
];

const PRODUCTS = [
  {
    sku:'RETA', name:'Retatrutide', cat:'metabolic', blend:false,
    klass:'Triple receptor agonist — GLP-1 / GIP / glucagon',
    sizes:[{mg:10,price:50},{mg:20,price:75},{mg:40,price:100}],
    seq:null, mass:'≈4731 Da', form:'Lyophilised powder',
    about:'A single-chain synthetic agonist with activity at three incretin and glucagon receptors. Appears in metabolic and energy-expenditure research. Supplied lyophilised under vacuum; reconstitute with bacteriostatic water.',
    tags:['triple agonist','incretin'],
    areas:['metabolic'], depth:'advanced', route:'reconstituted', window:'extended'
  },
  {
    sku:'TESA', name:'Tesamorelin', cat:'metabolic', blend:false,
    klass:'Stabilised GHRH(1–44) analogue',
    sizes:[{mg:10,price:50}],
    seq:'trans-3-hexenoyl-GRF(1–44)-NH₂', mass:'≈5136 Da', form:'Lyophilised powder',
    about:'A growth-hormone-releasing hormone analogue modified at the N-terminus to resist DPP-4 cleavage, giving it a longer plasma half-life than native GHRH. Used in growth-axis and body-composition research.',
    tags:['GHRH','secretagogue'],
    areas:['metabolic'], depth:'advanced', route:'reconstituted', window:'extended'
  },
  {
    sku:'SERM', name:'Sermorelin', cat:'metabolic', blend:false,
    klass:'GHRH(1–29) fragment',
    sizes:[{mg:10,price:45}],
    seq:'YADAIFTNSYRKVLGQLSARKLLQDIMSR', mass:'≈3358 Da', form:'Lyophilised powder',
    about:'The shortest fragment of growth-hormone-releasing hormone that retains full receptor activity. Shorter-acting than tesamorelin. A common entry point in growth-axis study design.',
    tags:['GHRH','secretagogue'],
    areas:['metabolic'], depth:'entry', route:'reconstituted', window:'standard'
  },
  {
    sku:'BPC', name:'BPC-157', cat:'tissue', blend:false,
    klass:'Synthetic pentadecapeptide',
    sizes:[{mg:10,price:30}],
    seq:'GEPPPGKPADDAGLV', mass:'1419.5 Da', form:'Lyophilised powder',
    about:'A fifteen-residue sequence derived from a protein found in gastric juice. Stable in aqueous solution, which is unusual for a peptide of its length. Widely used in structural and connective-tissue research models.',
    tags:['pentadecapeptide'],
    areas:['tissue'], depth:'entry', route:'reconstituted', window:'standard'
  },
  {
    sku:'WOLV', name:'Wolverine', cat:'tissue', blend:true,
    klass:'Two-part blend — BPC-157 + TB-500, 10 mg each',
    sizes:[{mg:20,price:55,label:'10 mg / 10 mg'}],
    seq:'GEPPPGKPADDAGLV + Ac-LKKTETQ', mass:'Blend', form:'Co-lyophilised powder',
    about:'Two structural-research peptides co-lyophilised in a single vial at a verified 1:1 ratio. Blend ratio is confirmed by HPLC on every lot, not assumed from the fill weight.',
    tags:['blend','ratio verified'],
    areas:['tissue'], depth:'standard', route:'reconstituted', window:'standard'
  },
  {
    sku:'DEAD', name:'Deadpool', cat:'tissue', blend:true,
    klass:'Three-part blend — BPC-157 + TB-500 + GHK-Cu, 10 mg each',
    sizes:[{mg:30,price:65,label:'10 / 10 / 10 mg'}],
    seq:'Multi-component', mass:'Blend', form:'Co-lyophilised powder',
    about:'A three-component blend combining two structural peptides with a copper-binding tripeptide. Each lot carries a ratio verification alongside the purity assay.',
    tags:['blend','ratio verified','copper'],
    areas:['tissue','dermal'], depth:'standard', route:'reconstituted', window:'standard'
  },
  {
    sku:'GHK', name:'GHK-Cu', cat:'dermal', blend:false,
    klass:'Copper-binding tripeptide',
    sizes:[{mg:50,price:30}],
    seq:'Gly-His-Lys · Cu²⁺', mass:'340.8 Da (complex)', form:'Lyophilised powder, blue',
    about:'A three-residue sequence with high affinity for copper(II). The characteristic blue colour of the powder comes from the bound copper ion — a useful visual identity check before assay. Common in dermal and matrix research.',
    tags:['tripeptide','copper'],
    areas:['dermal','tissue'], depth:'entry', route:'topical-or-reconstituted', window:'standard'
  },
  {
    sku:'AHK', name:'AHK-Cu', cat:'dermal', blend:false,
    klass:'Copper-binding tripeptide',
    sizes:[{mg:50,price:30}],
    seq:'Ala-His-Lys · Cu²⁺', mass:'≈354.8 Da (complex)', form:'Lyophilised powder, blue',
    about:'A close structural analogue of GHK-Cu with alanine substituted at the first position. Studied alongside GHK in follicular and dermal matrix work.',
    tags:['tripeptide','copper'],
    areas:['dermal'], depth:'entry', route:'topical-or-reconstituted', window:'standard'
  },
  {
    sku:'GLOW', name:'Glow', cat:'dermal', blend:true,
    klass:'Three-part dermal blend — GHK-Cu + BPC-157 + TB-500',
    sizes:[{mg:70,price:75,label:'70 mg total'}],
    seq:'Multi-component', mass:'Blend', form:'Co-lyophilised powder',
    about:'A dermal-research blend weighted toward the copper tripeptide, with two structural peptides in support. Ratio verified by HPLC per lot.',
    tags:['blend','ratio verified','copper'],
    areas:['dermal'], depth:'standard', route:'reconstituted', window:'standard'
  },
  {
    sku:'KLOW', name:'Klow', cat:'dermal', blend:true,
    klass:'Four-part dermal blend — KPV + GHK-Cu + BPC-157 + TB-500',
    sizes:[{mg:80,price:85,label:'80 mg total'}],
    seq:'Multi-component', mass:'Blend', form:'Co-lyophilised powder',
    about:'Adds the tripeptide KPV — the C-terminal fragment of α-MSH — to the Glow formulation. The most complex blend in the register; ratio verification covers all four components.',
    tags:['blend','4-part','ratio verified'],
    areas:['dermal'], depth:'advanced', route:'reconstituted', window:'extended'
  },
  {
    sku:'MOTS', name:'MOTS-c', cat:'cellular', blend:false,
    klass:'Mitochondrial-derived peptide, 16 residues',
    sizes:[{mg:20,price:40}],
    seq:'MRWQEMGYIFYPRKLR', mass:'2174.6 Da', form:'Lyophilised powder',
    about:'Encoded in mitochondrial DNA rather than the nuclear genome — one of a small number of peptides with that origin. Studied in metabolic and mitochondrial signalling research.',
    tags:['mitochondrial','16-mer'],
    areas:['cellular','metabolic'], depth:'standard', route:'reconstituted', window:'standard'
  },
  {
    sku:'NAD', name:'NAD+', cat:'cellular', blend:false,
    klass:'Dinucleotide cofactor (not a peptide)',
    sizes:[{mg:500,price:30}],
    seq:'Nicotinamide adenine dinucleotide', mass:'663.4 Da', form:'Lyophilised powder',
    about:'A redox cofactor present in every cell, central to electron transport and to the sirtuin and PARP enzyme families. Listed here as a research cofactor; it is a nucleotide, not a peptide, and is assayed by a different method.',
    tags:['cofactor','non-peptide'],
    areas:['cellular'], depth:'entry', route:'reconstituted', window:'extended'
  },
  {
    sku:'KISS', name:'Kisspeptin-10', cat:'neuroendocrine', blend:false,
    klass:'KISS1R (GPR54) agonist decapeptide',
    sizes:[{mg:10,price:25}],
    seq:'YNWNSFGLRF-NH₂', mass:'1302.5 Da', form:'Lyophilised powder',
    about:'The ten-residue C-terminal fragment of kisspeptin, the endogenous ligand for KISS1R. Studied in hypothalamic–pituitary signalling research.',
    tags:['decapeptide','GPCR'],
    areas:['neuroendocrine'], depth:'standard', route:'reconstituted', window:'short'
  },
  {
    sku:'PT141', name:'PT-141', cat:'neuroendocrine', blend:false,
    klass:'Melanocortin receptor agonist (bremelanotide)',
    sizes:[{mg:10,price:25}],
    seq:'Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-OH', mass:'1025.2 Da', form:'Lyophilised powder',
    about:'A cyclic heptapeptide and a metabolite of melanotan II, with activity at MC3R and MC4R but not at the pigment receptor MC1R. Cyclisation gives it markedly better stability than a linear sequence.',
    tags:['cyclic','melanocortin'],
    areas:['neuroendocrine'], depth:'standard', route:'reconstituted', window:'short'
  },
  {
    sku:'ARA', name:'ARA-290', cat:'cellular', blend:false,
    klass:'Erythropoietin-derived 11-residue peptide (cibinetide)',
    sizes:[{mg:10,price:35}],
    seq:'pyroGlu-EQLERALNSS', mass:'1257.4 Da', form:'Lyophilised powder',
    about:'An eleven-residue sequence taken from the helix-B domain of erythropoietin. It binds the innate repair receptor without the haematopoietic activity of the full protein — which is the point of using the fragment rather than EPO itself.',
    tags:['11-mer','EPO-derived'],
    areas:['cellular','tissue'], depth:'advanced', route:'reconstituted', window:'standard'
  },
  {
    sku:'MT1', name:'Melanotan I', cat:'dermal', blend:false,
    klass:'MC1R agonist (afamelanotide)',
    sizes:[{mg:10,price:30}],
    seq:'Ac-SYSNle-EHdF-RWGKPV-NH₂', mass:'1646.9 Da', form:'Lyophilised powder',
    about:'A linear thirteen-residue α-MSH analogue, selective for MC1R. Nle and D-Phe substitutions at positions 4 and 7 resist enzymatic breakdown. Studied in pigmentation research.',
    tags:['α-MSH analogue','13-mer'],
    areas:['dermal'], depth:'standard', route:'reconstituted', window:'standard'
  }
];

/* Placeholder assay template — REPLACE with real per-lot values before launch */
function assayFor(p){
  return {
    lot: 'SV-' + p.sku + '-0000',
    date: 'pending',
    rows: [
      ['Identity confirmation','Mass spectrometry', p.mass, 'Conforms'],
      ['Purity (HPLC, 214 nm)','RP-HPLC','—','Pending'],
      ['Net peptide content','Nitrogen determination','—','Pending'],
      ['Water content','Karl Fischer','—','Pending'],
      ...(p.blend ? [['Blend ratio verification','RP-HPLC','—','Pending']] : []),
      ['Appearance','Visual', p.form, 'Conforms']
    ]
  };
}

const NOTES = [
  { cat:'Fundamentals', mins:4, featured:true,
    title:'Peptides are not like steroids and here is why',
    dek:'The two get grouped together constantly, but they are separate classes of molecule with nothing structural in common. Steroids are built on a four-ring carbon skeleton derived from cholesterol; peptides are chains of amino acids. A look at what each class actually is, how they act on cells differently, and where the confusion comes from.' },

  { cat:'Documentation', mins:2,
    title:'What a Certificate of Analysis actually tells you',
    dek:'A COA is only as useful as your ability to read it. We walk through each section of a typical certificate — identity confirmation, purity percentage, mass verification, and residual solvent screening — and explain what a well-formed result looks like versus one that leaves questions open.' },

  { cat:'Methods', mins:2,
    title:'HPLC, plainly explained',
    dek:'High-performance liquid chromatography is the backbone of purity verification. Here\'s how the technique separates a sample into its components, and what the resulting chromatogram is really showing you.' },

  { cat:'Standards', mins:2,
    title:'Purity percentage is not one number',
    dek:'A single purity figure can be calculated several different ways depending on the method used. We look at why two labs can report different values for the same vial, and which figure is worth anchoring to.' },

  { cat:'Methods', mins:2,
    title:'Mass spectrometry and identity confirmation',
    dek:'Purity tells you how much of the sample is the intended compound. Mass spec tells you whether it\'s the right compound at all. A look at why both measurements belong on every certificate.' },

  { cat:'Handling', mins:2,
    title:'Lyophilization, and why it matters for storage',
    dek:'Freeze-drying isn\'t just a packaging choice — it directly affects long-term stability. What the process does at a structural level, and how storage conditions carry that forward.' },

  { cat:'Standards', mins:2,
    title:'Reading a blend ratio verification',
    dek:'When a product combines multiple compounds, verifying the ratio is a separate measurement from verifying each component. Here\'s what that testing looks like and how it\'s reported.' }
];
