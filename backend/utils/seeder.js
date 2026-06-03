const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');

dotenv.config();

// ─── Users ────────────────────────────────────────────────────────────────────
const users = [
  {
    name: 'Admin AgroMart',
    email: 'admin@agromart.com',
    password: 'Admin@123',
    role: 'admin',
    phone: '7019205772',
    avatar: { url: 'https://api.dicebear.com/7.x/initials/svg?seed=Admin', public_id: '' },
    isEmailVerified: true,
  },
  {
    name: 'Rajan Iyer',
    email: 'rajan@example.com',
    password: 'User@123',
    role: 'user',
    phone: '9876543210',
    avatar: { url: 'https://api.dicebear.com/7.x/initials/svg?seed=Rajan', public_id: '' },
    isEmailVerified: true,
  },
  {
    name: 'Srini Kumar',
    email: 'srini@example.com',
    password: 'User@123',
    role: 'user',
    phone: '9900112233',
    avatar: { url: 'https://api.dicebear.com/7.x/initials/svg?seed=Srini', public_id: '' },
    isEmailVerified: true,
  },
];

// ─── Categories ───────────────────────────────────────────────────────────────
const categories = [
  { name: 'Organic Manure', slug: 'organic-manure', icon: '🌱', description: 'Natural organic fertilizers for healthy Karnataka soil', sortOrder: 1 },
  { name: 'Agricultural Pesticides', slug: 'agricultural-pesticides', icon: '🌾', description: 'CIB&RC registered crop protection', sortOrder: 2 },
  { name: 'Govt Schemes', slug: 'govt-schemes', icon: '🏛️', description: 'PM-KISAN, Raita Sahayavani, RKVY — subsidized inputs', sortOrder: 3 },
];

const getSubcategories = (organicId, pesticideId) => [
  { name: 'Vermicompost', slug: 'vermicompost', icon: '🪱', parent: organicId, sortOrder: 1 },
  { name: 'Bio-fertilizers', slug: 'bio-fertilizers', icon: '🦠', parent: organicId, sortOrder: 2 },
  { name: 'Organic Growth Promoters', slug: 'organic-growth-promoters', icon: '🌿', parent: organicId, sortOrder: 3 },
  { name: 'Soil Conditioners', slug: 'soil-conditioners', icon: '🏔️', parent: organicId, sortOrder: 4 },
  { name: 'Insecticides', slug: 'insecticides', icon: '🐛', parent: pesticideId, sortOrder: 1 },
  { name: 'Fungicides', slug: 'fungicides', icon: '🍄', parent: pesticideId, sortOrder: 2 },
  { name: 'Herbicides', slug: 'herbicides', icon: '🌾', parent: pesticideId, sortOrder: 3 },
  { name: 'Bio-pesticides', slug: 'bio-pesticides', icon: '🌺', parent: pesticideId, sortOrder: 4 },
];

// ─── Correct product images — every image matches its product exactly ─────────
// Using AI-generated local images + carefully verified external URLs
const IMG = {
  // 🌱 ORGANIC MANURE — AI generated (run copy-images.js first)
  vermicompost:  '/products/vermicompost.png',
  fym:           '/products/fym.png',
  jeevamrutha:   '/products/jeevamrutha.png',
  panchagavya:   '/products/panchagavya.png',
  neemCake:      '/products/neem-cake.png',
  azospirillum:  '/products/bio-fertilizer.png',
  psb:           '/products/bio-fertilizer.png',     // same type as azospirillum (liquid bio)
  rhizobium:     '/products/bio-fertilizer.png',     // liquid bio-inoculant
  humicAcid:     'https://m.media-amazon.com/images/I/61vMzVQ+xLL._SL1500_.jpg',
  npk191919:     '/products/npk-soluble.png',

  // 🐛 INSECTICIDES — AI generated
  chlorpyrifos:  '/products/insecticide.png',
  imidacloprid:  '/products/imidacloprid.png',
  thiamethoxam:  '/products/thiamethoxam.png',
  emamectin:     '/products/insecticide.png',
  profenofos:    '/products/insecticide.png',
  lambdaCyha:    '/products/insecticide.png',
  spinosad:      '/products/neem-oil.png',            // organic bottle look
  acetamiprid:   '/products/acetamiprid.png',

  // 🍄 FUNGICIDES — AI generated
  carbendazim:   '/products/fungicide.png',
  mancozeb:      '/products/fungicide.png',
  tricyclazole:  '/products/fungicide.png',
  copperOxy:     '/products/fungicide.png',
  propiconazole: '/products/insecticide.png',
  ridomil:       '/products/fungicide.png',
  hexaconazole:  '/products/insecticide.png',

  // 🌿 HERBICIDES — AI generated
  glyphosate:    '/products/herbicide.png',
  butachlor:     '/products/herbicide.png',
  twoFourD:      '/products/herbicide.png',
  atrazine:      '/products/herbicide.png',
  pendimethalin: '/products/herbicide.png',

  // 🌺 BIO-PESTICIDES — AI generated
  neemOil:       '/products/neem-oil.png',
  trichoderma:   '/products/bio-fertilizer.png',
  beauveria:     '/products/bio-fertilizer.png',
  pseudomonas:   '/products/bio-fertilizer.png',
  bt:            '/products/bt-biopesticide.png',

  // 🏛️ GOVT SCHEMES — AI generated
  urea:          '/products/urea-bag.png',
  dap:           '/products/dap-bag.png',
  rkvyKit:       '/products/bt-biopesticide.png',
  soilHealth:    '/products/npk-soluble.png',
  pmfby:         '/products/fungicide.png',
};

const img = (key) => [{ url: IMG[key], public_id: '' }];

// ─── Products ─────────────────────────────────────────────────────────────────
const getProducts = (categoryIds) => [

  // ══════ 🌱 ORGANIC MANURE — 10 Products ══════

  {
    name: 'Karnataka Premium Vermicompost (5 kg)',
    slug: 'karnataka-premium-vermicompost',
    description: 'Certified vermicompost from Eisenia fetida earthworm castings. Rich in humus, NPK, and beneficial microbes. Widely used for ragi, sugarcane, and vegetables across Karnataka. KSDA-approved.',
    shortDescription: 'KSDA-approved vermicompost — ideal for Karnataka ragi & sugarcane',
    price: 450, discountedPrice: 360,
    category: categoryIds['organic-manure'],
    images: img('vermicompost'),
    stock: 500, unit: 'kg', weight: 5,
    brand: 'Karnataka Organics',
    tags: ['vermicompost', 'organic', 'karnataka', 'KSDA', 'earthworm'],
    specifications: [
      { key: 'Pack Size', value: '5 kg' }, { key: 'NPK', value: '1.5:1:0.5' },
      { key: 'Organic Content', value: '>25%' }, { key: 'pH', value: '6.5-7.5' },
      { key: 'Approved By', value: 'KSDA Karnataka' },
    ],
    isFeatured: true, isOrganic: true, deliveryTime: '2-3 hours',
  },

  {
    name: 'Farm Yard Manure (FYM) Composted (10 kg)',
    slug: 'farm-yard-manure-fym',
    description: 'Well-composted farm yard manure from Karnataka dairy farms. Enriched with Trichoderma viride for disease suppression. Slow-release NPK for all crops — paddy, wheat, cotton, vegetables.',
    shortDescription: 'Trichoderma-enriched FYM for all Karnataka crops',
    price: 280, discountedPrice: 210,
    category: categoryIds['organic-manure'],
    images: img('fym'),
    stock: 800, unit: 'kg', weight: 10,
    brand: 'GauKrishi Naturals',
    tags: ['FYM', 'cow dung', 'farm yard manure', 'composted', 'organic'],
    specifications: [
      { key: 'Pack Size', value: '10 kg' }, { key: 'N Content', value: '0.5%' },
      { key: 'P Content', value: '0.25%' }, { key: 'K Content', value: '0.5%' },
    ],
    isFeatured: false, isOrganic: true, deliveryTime: '2-3 hours',
  },

  {
    name: 'Jeevamrutha Liquid Bio-stimulant (5 liter)',
    slug: 'jeevamrutha-liquid-bio-stimulant',
    description: 'Traditional Subhash Palekar Natural Farming (SPNF) input. Made from cow dung, cow urine, jaggery, pulse flour, and soil. Activates soil microbial life instantly. Karnataka ZBNF program approved.',
    shortDescription: 'SPNF/ZBNF Jeevamrutha — activates soil microbes for Karnataka farmers',
    price: 299, discountedPrice: 220,
    category: categoryIds['organic-manure'],
    images: img('jeevamrutha'),
    stock: 300, unit: 'liter', weight: 5,
    brand: 'Namma Krishi',
    tags: ['jeevamrutha', 'ZBNF', 'natural farming', 'subhash palekar', 'karnataka'],
    specifications: [
      { key: 'Volume', value: '5 liter' }, { key: 'Microbial Count', value: '>10^8 CFU/ml' },
      { key: 'Application', value: 'Drip / soil drench' }, { key: 'Program', value: 'Karnataka ZBNF' },
    ],
    isFeatured: true, isOrganic: true, deliveryTime: '2-3 hours',
  },

  {
    name: 'Panchagavya Organic Growth Promoter (3 liter)',
    slug: 'panchagavya-organic-growth-promoter',
    description: 'Traditional formulation of 5 cow products: milk, curd, ghee, cow dung, cow urine. Stimulates plant immunity and growth. Popular in Mandya, Mysuru sugarcane belt. Foliar at 3%. NPOP certified.',
    shortDescription: 'Traditional Panchagavya — immunity booster for Karnataka sugarcane',
    price: 349, discountedPrice: 275,
    category: categoryIds['organic-manure'],
    images: img('panchagavya'),
    stock: 250, unit: 'liter', weight: 3,
    brand: 'Gau Krishi',
    tags: ['panchagavya', 'organic', 'growth promoter', 'traditional', 'sugarcane'],
    specifications: [
      { key: 'Volume', value: '3 liter' }, { key: 'Dose', value: '3% foliar spray' },
      { key: 'Certification', value: 'NPOP India' }, { key: 'Best For', value: 'Sugarcane, Vegetable' },
    ],
    isFeatured: false, isOrganic: true, deliveryTime: '2-3 hours',
  },

  {
    name: 'Neem Cake Organic Fertilizer (5 kg)',
    slug: 'neem-cake-organic-fertilizer',
    description: 'Cold-pressed neem cake residue after oil extraction. Rich in nitrogen (4-6% N). Acts as natural nematicide and soil insecticide. Prevents root grubs, termites, and nematodes in cotton, tomato, and sugarcane.',
    shortDescription: 'N-rich neem cake — kills nematodes in Karnataka cotton & tomato',
    price: 320, discountedPrice: 245,
    category: categoryIds['organic-manure'],
    images: img('neemCake'),
    stock: 400, unit: 'kg', weight: 5,
    brand: 'Dharwad Agri Products',
    tags: ['neem cake', 'organic fertilizer', 'nematicide', 'cotton', 'karnataka'],
    specifications: [
      { key: 'Pack Size', value: '5 kg' }, { key: 'N Content', value: '4-6%' },
      { key: 'P2O5', value: '0.5-1%' }, { key: 'K2O', value: '1-2%' },
    ],
    isFeatured: false, isOrganic: true, deliveryTime: '2-3 hours',
  },

  {
    name: 'Azospirillum Bio-fertilizer Liquid (1 liter)',
    slug: 'azospirillum-bio-fertilizer',
    description: 'Nitrogen-fixing bacteria (Azospirillum brasilense) — 2x10^8 CFU/ml. Fixes 25-30 kg N/ha. Reduces urea requirement by 25-30%. KSDA approved for rice, wheat, maize, sugarcane.',
    shortDescription: 'N-fixing bacteria — reduces urea by 25-30% for Karnataka crops',
    price: 220, discountedPrice: 180,
    category: categoryIds['organic-manure'],
    images: img('azospirillum'),
    stock: 350, unit: 'liter', weight: 1,
    brand: 'BioFarm India',
    tags: ['azospirillum', 'bio-fertilizer', 'nitrogen fixing', 'rice', 'maize', 'KSDA'],
    specifications: [
      { key: 'CFU Count', value: '2x10^8 CFU/ml' }, { key: 'Volume', value: '1 liter' },
      { key: 'N Fixing', value: '25-30 kg/ha' }, { key: 'Approval', value: 'KSDA / KAU' },
    ],
    isFeatured: true, isOrganic: true, deliveryTime: '2-3 hours',
  },

  {
    name: 'Phosphobacteria (PSB) Bio-fertilizer (1 liter)',
    slug: 'phosphobacteria-psb-biofertilizer',
    description: 'Phosphate Solubilizing Bacteria (Bacillus megaterium) inoculant. Saves 20-25 kg DAP/ha. For cotton, sunflower, groundnut in Haveri, Dharwad, Raichur.',
    shortDescription: 'PSB — saves 20-25 kg DAP per hectare for Karnataka groundnut farmers',
    price: 195, discountedPrice: 155,
    category: categoryIds['organic-manure'],
    images: img('psb'),
    stock: 300, unit: 'liter', weight: 1,
    brand: 'AgriMicrobe Labs',
    tags: ['PSB', 'phosphobacteria', 'bio-fertilizer', 'DAP saving', 'cotton', 'groundnut'],
    specifications: [
      { key: 'CFU Count', value: '2x10^8 CFU/ml' }, { key: 'P Saving', value: '20-25 kg DAP/ha' },
      { key: 'Crops', value: 'Cotton, Sunflower, Groundnut' },
    ],
    isFeatured: false, isOrganic: true, deliveryTime: '2-3 hours',
  },

  {
    name: 'Rhizobium Bio-inoculant for Pulses (500 ml)',
    slug: 'rhizobium-bio-inoculant-pulses',
    description: 'Rhizobium japonicum liquid inoculant. Fixes 80-100 kg N/ha. ICAR-recommended for Kalaburagi, Bidar, Yadgiri pulse belt. For soybean, tur, bengal gram, green gram.',
    shortDescription: 'Root nodule bacteria — replaces urea for Karnataka pulse crops',
    price: 175, discountedPrice: 140,
    category: categoryIds['organic-manure'],
    images: img('rhizobium'),
    stock: 280, unit: 'ml', weight: 0.5,
    brand: 'ICAR-IIPR Certified',
    tags: ['rhizobium', 'pulse crops', 'tur', 'soybean', 'N-fixation'],
    specifications: [
      { key: 'Volume', value: '500 ml' }, { key: 'N Fixed', value: '80-100 kg N/ha' },
      { key: 'Crops', value: 'Soybean, Tur, Bengal Gram, Green Gram' },
    ],
    isFeatured: false, isOrganic: true, deliveryTime: '2-3 hours',
  },

  {
    name: 'Humic Acid + Fulvic Acid Soil Conditioner (1 kg)',
    slug: 'humic-acid-fulvic-soil-conditioner',
    description: 'Humic Acid (70%) + Fulvic Acid (15%) from Leonardite. Improves CEC of Karnataka laterite and red soils. Increases fertilizer efficiency by 30-40%. Recommended by UAS Dharwad.',
    shortDescription: 'Humic 70% + Fulvic 15% — improves Karnataka laterite soil productivity',
    price: 680, discountedPrice: 540,
    category: categoryIds['organic-manure'],
    images: img('humicAcid'),
    stock: 200, unit: 'kg', weight: 1,
    brand: 'SoilTech India',
    tags: ['humic acid', 'fulvic acid', 'soil conditioner', 'laterite soil', 'karnataka'],
    specifications: [
      { key: 'Humic Acid', value: '70%' }, { key: 'Fulvic Acid', value: '15%' },
      { key: 'Pack Size', value: '1 kg' }, { key: 'Recommendation', value: 'UAS Dharwad' },
    ],
    isFeatured: true, isOrganic: true, deliveryTime: '2-3 hours',
  },

  {
    name: 'NPK 19:19:19 Water Soluble Fertilizer (5 kg)',
    slug: '19-19-19-water-soluble-fertilizer',
    description: '100% water-soluble balanced NPK for drip irrigation and foliar spray. Ideal for Karnataka horticulture — tomato, grapes, pomegranate, potato, onion. IFFCO WSF series.',
    shortDescription: 'Balanced NPK 19:19:19 crystals for drip irrigation & foliar spray',
    price: 850, discountedPrice: 720,
    category: categoryIds['organic-manure'],
    images: img('npk191919'),
    stock: 400, unit: 'kg', weight: 5,
    brand: 'IFFCO WSF Series',
    tags: ['NPK 19-19-19', 'water soluble', 'drip irrigation', 'grapes', 'tomato'],
    specifications: [
      { key: 'NPK Ratio', value: '19:19:19' }, { key: 'Pack Size', value: '5 kg' },
      { key: 'Solubility', value: '100%' }, { key: 'Application', value: 'Drip + Foliar' },
    ],
    isFeatured: false, isOrganic: false, deliveryTime: '2-3 hours',
  },

  // ══════ 🐛 INSECTICIDES — 8 Products ══════

  {
    name: 'Chlorpyrifos 20% EC Insecticide (1 liter)',
    slug: 'chlorpyrifos-20-ec-insecticide',
    description: 'Broad-spectrum organophosphate (CIB&RC registered). Controls stem borers, leaf folder, aphids, termites in rice, cotton, sugarcane. Top-selling insecticide in Karnataka — Mandya, Mysuru, Shivamogga.',
    shortDescription: 'CIB&RC organophosphate — #1 for Karnataka paddy stem borer',
    price: 420, discountedPrice: 340,
    category: categoryIds['agricultural-pesticides'],
    images: img('chlorpyrifos'),
    stock: 300, unit: 'liter', weight: 1,
    brand: 'Coromandel Agri',
    tags: ['chlorpyrifos', 'insecticide', 'paddy', 'cotton', 'stem borer'],
    specifications: [
      { key: 'Active Ingredient', value: 'Chlorpyrifos 20% EC' }, { key: 'Dose', value: '2.5 ml/liter' },
      { key: 'PHI', value: '15 days' }, { key: 'Target', value: 'Stem borer, Leaf folder, Aphids' },
    ],
    isFeatured: true, isOrganic: false, deliveryTime: '2-3 hours',
  },

  {
    name: 'Imidacloprid 17.8% SL Systemic Insecticide (250 ml)',
    slug: 'imidacloprid-17-8-sl',
    description: 'Systemic neonicotinoid (CIB&RC registered). Controls sucking pests: whitefly, thrips, jassids, aphids on cotton, paddy, tomato. One spray protects 2-3 weeks.',
    shortDescription: 'Bayer systemic neonicotinoid — 3-week whitefly & thrips control',
    price: 550, discountedPrice: 440,
    category: categoryIds['agricultural-pesticides'],
    images: img('imidacloprid'),
    stock: 250, unit: 'ml', weight: 0.25,
    brand: 'Bayer CropScience',
    tags: ['imidacloprid', 'systemic', 'whitefly', 'thrips', 'cotton', 'neonicotinoid'],
    specifications: [
      { key: 'Active Ingredient', value: 'Imidacloprid 17.8% SL' }, { key: 'Pack Size', value: '250 ml' },
      { key: 'Dose', value: '0.5 ml/liter' }, { key: 'Duration', value: '2-3 weeks' },
    ],
    isFeatured: true, isOrganic: false, deliveryTime: '2-3 hours',
  },

  {
    name: 'Thiamethoxam 25% WG Actara Insecticide (100 g)',
    slug: 'thiamethoxam-25-wg-actara',
    description: 'Second-generation neonicotinoid — faster systemic action. Controls BPH, whitefly, aphids, thrips in Karnataka Mandya paddy and Dharwad cotton zone.',
    shortDescription: 'Syngenta Actara — next-gen neonicotinoid for BPH & whitefly control',
    price: 780, discountedPrice: 620,
    category: categoryIds['agricultural-pesticides'],
    images: img('thiamethoxam'),
    stock: 200, unit: 'g', weight: 0.1,
    brand: 'Syngenta India',
    tags: ['thiamethoxam', 'actara', 'BPH', 'paddy', 'whitefly', 'cotton'],
    specifications: [
      { key: 'Active Ingredient', value: 'Thiamethoxam 25% WG' }, { key: 'Pack Size', value: '100 g' },
      { key: 'Dose', value: '0.3 g/liter' }, { key: 'Target', value: 'BPH, Whitefly, Aphids' },
    ],
    isFeatured: false, isOrganic: false, deliveryTime: '2-3 hours',
  },

  {
    name: 'Emamectin Benzoate 5% SG Insecticide (100 g)',
    slug: 'emamectin-benzoate-5-sg',
    description: 'Avermectin-group insecticide for caterpillar/lepidopteran larvae. Controls DBM in cabbage, bollworm in cotton, fruit borer in tomato and brinjal. PHI only 5 days — safe for vegetable growers.',
    shortDescription: 'BASF Emamectin — bollworm & DBM with 5-day PHI for Karnataka vegetables',
    price: 680, discountedPrice: 545,
    category: categoryIds['agricultural-pesticides'],
    images: img('emamectin'),
    stock: 220, unit: 'g', weight: 0.1,
    brand: 'BASF India',
    tags: ['emamectin benzoate', 'bollworm', 'DBM', 'vegetable', 'tomato', 'brinjal'],
    specifications: [
      { key: 'Active Ingredient', value: 'Emamectin Benzoate 5% SG' }, { key: 'Pack Size', value: '100 g' },
      { key: 'Dose', value: '0.4 g/liter' }, { key: 'PHI', value: '5 days' },
    ],
    isFeatured: false, isOrganic: false, deliveryTime: '2-3 hours',
  },

  {
    name: 'Profenofos 50% EC Insecticide (1 liter)',
    slug: 'profenofos-50-ec-insecticide',
    description: 'Organophosphate for resistant pest populations. Controls American Bollworm, Spodoptera, aphids, whitefly in cotton. Popular in North Karnataka — Dharwad, Gadag, Koppal, Haveri belt.',
    shortDescription: 'FMC organophosphate — resistant bollworm in North Karnataka cotton',
    price: 580, discountedPrice: 460,
    category: categoryIds['agricultural-pesticides'],
    images: img('profenofos'),
    stock: 180, unit: 'liter', weight: 1,
    brand: 'FMC India',
    tags: ['profenofos', 'organophosphate', 'bollworm', 'cotton', 'north karnataka'],
    specifications: [
      { key: 'Active Ingredient', value: 'Profenofos 50% EC' }, { key: 'Volume', value: '1 liter' },
      { key: 'Dose', value: '2 ml/liter' }, { key: 'PHI', value: '12 days' },
    ],
    isFeatured: false, isOrganic: false, deliveryTime: '2-3 hours',
  },

  {
    name: 'Lambda-cyhalothrin 5% EC Pyrethroid (1 liter)',
    slug: 'lambda-cyhalothrin-5-ec',
    description: 'Fast-acting pyrethroid — knock-down in minutes. Controls bollworm, Helicoverpa, thrips, pod borers in cotton and pulses. Dharwad, Gadag, Haveri cotton belt of North Karnataka.',
    shortDescription: 'Syngenta pyrethroid — fast knock-down bollworm & Helicoverpa in cotton',
    price: 390, discountedPrice: 315,
    category: categoryIds['agricultural-pesticides'],
    images: img('lambdaCyha'),
    stock: 250, unit: 'liter', weight: 1,
    brand: 'Syngenta India',
    tags: ['lambda cyhalothrin', 'pyrethroid', 'bollworm', 'cotton', 'north karnataka'],
    specifications: [
      { key: 'Active Ingredient', value: 'Lambda-cyhalothrin 5% EC' }, { key: 'Volume', value: '1 liter' },
      { key: 'Dose', value: '1 ml/liter' }, { key: 'PHI', value: '7 days' },
    ],
    isFeatured: false, isOrganic: false, deliveryTime: '2-3 hours',
  },

  {
    name: 'Spinosad 45% SC Organic Insecticide (100 ml)',
    slug: 'spinosad-45-sc-insecticide',
    description: 'OMRI+NPOP certified organic spinosyn from Saccharopolyspora spinosa. Controls thrips, DBM, Spodoptera. PHI only 1 day — safe for Karnataka export crops. Organic farmers favourite.',
    shortDescription: 'OMRI/NPOP organic — 1-day PHI for export vegetable crops in Karnataka',
    price: 1200, discountedPrice: 960,
    category: categoryIds['agricultural-pesticides'],
    images: img('spinosad'),
    stock: 150, unit: 'ml', weight: 0.1,
    brand: 'Dow AgroSciences',
    tags: ['spinosad', 'organic certified', 'OMRI', 'NPOP', 'DBM', 'thrips', 'export crops'],
    specifications: [
      { key: 'Active Ingredient', value: 'Spinosad 45% SC' }, { key: 'Pack Size', value: '100 ml' },
      { key: 'Dose', value: '0.3 ml/liter' }, { key: 'PHI', value: '1 day' },
    ],
    isFeatured: true, isOrganic: true, deliveryTime: '2-3 hours',
  },

  {
    name: 'Acetamiprid 20% SP Insecticide (100 g)',
    slug: 'acetamiprid-20-sp-insecticide',
    description: 'Chloronicotinyl systemic insecticide. Controls aphids, whitefly, mealybug, leaf miner on cotton, okra, tomato, grapes. Essential for Karnataka grape mealybug in Vijayapura and Bagalkot.',
    shortDescription: 'PI Industries systemic — mealybug in Karnataka Vijayapura grapes & okra',
    price: 490, discountedPrice: 390,
    category: categoryIds['agricultural-pesticides'],
    images: img('acetamiprid'),
    stock: 200, unit: 'g', weight: 0.1,
    brand: 'PI Industries',
    tags: ['acetamiprid', 'mealybug', 'grapes', 'okra', 'cotton', 'vijayapura'],
    specifications: [
      { key: 'Active Ingredient', value: 'Acetamiprid 20% SP' }, { key: 'Pack Size', value: '100 g' },
      { key: 'Dose', value: '0.2 g/liter' }, { key: 'PHI', value: '10 days' },
    ],
    isFeatured: false, isOrganic: false, deliveryTime: '2-3 hours',
  },

  // ══════ 🍄 FUNGICIDES — 7 Products ══════

  {
    name: 'Carbendazim 50% WP Systemic Fungicide (500 g)',
    slug: 'carbendazim-50-wp-fungicide',
    description: 'Systemic benzimidazole fungicide. Controls powdery mildew, leaf spot, anthracnose, blast in rice, wheat, vegetables. For rice blast (Shivamogga), coffee rust (Chikkamagaluru), mango anthracnose (Kolar).',
    shortDescription: 'UPL systemic fungicide — rice blast, coffee rust & mango anthracnose in Karnataka',
    price: 320, discountedPrice: 260,
    category: categoryIds['agricultural-pesticides'],
    images: img('carbendazim'),
    stock: 300, unit: 'g', weight: 0.5,
    brand: 'UPL Limited',
    tags: ['carbendazim', 'fungicide', 'rice blast', 'coffee rust', 'mango'],
    specifications: [
      { key: 'Active Ingredient', value: 'Carbendazim 50% WP' }, { key: 'Pack Size', value: '500 g' },
      { key: 'Dose', value: '1 g/liter' }, { key: 'Diseases', value: 'Blast, Mildew, Anthracnose, Rust' },
    ],
    isFeatured: false, isOrganic: false, deliveryTime: '2-3 hours',
  },

  {
    name: 'Mancozeb 75% WP Protective Fungicide (500 g)',
    slug: 'mancozeb-75-wp-fungicide',
    description: 'Multi-site contact fungicide (dithiocarbamate). Prevents early/late blight, downy mildew in potato, tomato, grapes, onion. Karnataka potato farmers in Hassan, Kolar, Chikkaballapur. Zero resistance risk.',
    shortDescription: 'Indofil multi-site protective fungicide — potato blight & grape downy mildew',
    price: 295, discountedPrice: 235,
    category: categoryIds['agricultural-pesticides'],
    images: img('mancozeb'),
    stock: 350, unit: 'g', weight: 0.5,
    brand: 'Indofil Industries',
    tags: ['mancozeb', 'fungicide', 'potato blight', 'tomato', 'grapes', 'hassan', 'kolar'],
    specifications: [
      { key: 'Active Ingredient', value: 'Mancozeb 75% WP' }, { key: 'Pack Size', value: '500 g' },
      { key: 'Dose', value: '2.5 g/liter' }, { key: 'Action', value: 'Protective (contact), 7-site' },
    ],
    isFeatured: false, isOrganic: false, deliveryTime: '2-3 hours',
  },

  {
    name: 'Tricyclazole 75% WP Rice Blast Fungicide (100 g)',
    slug: 'tricyclazole-75-wp-rice-blast',
    description: 'Highly specific systemic fungicide for rice blast. Used in Shivamogga, Dakshina Kannada, Udupi coastal paddy belt. Curative + protective at boot leaf stage.',
    shortDescription: 'Bayer rice blast specific — Shivamogga & coastal Karnataka paddy',
    price: 420, discountedPrice: 340,
    category: categoryIds['agricultural-pesticides'],
    images: img('tricyclazole'),
    stock: 200, unit: 'g', weight: 0.1,
    brand: 'Bayer CropScience',
    tags: ['tricyclazole', 'rice blast', 'paddy', 'shivamogga', 'coastal karnataka'],
    specifications: [
      { key: 'Active Ingredient', value: 'Tricyclazole 75% WP' }, { key: 'Pack Size', value: '100 g' },
      { key: 'Target Disease', value: 'Rice Blast (Pyricularia oryzae)' }, { key: 'Dose', value: '0.6 g/liter' },
    ],
    isFeatured: true, isOrganic: false, deliveryTime: '2-3 hours',
  },

  {
    name: 'Copper Oxychloride 50% WP Fungicide (500 g)',
    slug: 'copper-oxychloride-50-wp',
    description: 'Classical copper-based multi-disease fungicide + bactericide. Controls downy mildew, early blight, bacterial leaf blight. Popular with Karnataka coffee growers in Kodagu, Hassan, Chikkamagaluru.',
    shortDescription: 'Dhanuka copper fungicide+bactericide — coffee rust & die-back in Kodagu',
    price: 260, discountedPrice: 205,
    category: categoryIds['agricultural-pesticides'],
    images: img('copperOxy'),
    stock: 400, unit: 'g', weight: 0.5,
    brand: 'Dhanuka Agritech',
    tags: ['copper oxychloride', 'fungicide', 'coffee', 'kodagu', 'chikkamagaluru'],
    specifications: [
      { key: 'Active Ingredient', value: 'Copper Oxychloride 50% WP' }, { key: 'Pack Size', value: '500 g' },
      { key: 'Dose', value: '3 g/liter' }, { key: 'Action', value: 'Fungicide + Bactericide' },
    ],
    isFeatured: false, isOrganic: false, deliveryTime: '2-3 hours',
  },

  {
    name: 'Propiconazole 25% EC Systemic Fungicide (250 ml)',
    slug: 'propiconazole-25-ec-fungicide',
    description: 'Triazole systemic — curative and protective. Controls sheath blight, rust, smut in paddy/wheat. Karnataka paddy sheath blight in Mandya and Mysuru. Also for powdery mildew in grapes and rose.',
    shortDescription: 'Syngenta triazole — sheath blight cure in Mandya & Mysuru paddy',
    price: 480, discountedPrice: 385,
    category: categoryIds['agricultural-pesticides'],
    images: img('propiconazole'),
    stock: 220, unit: 'ml', weight: 0.25,
    brand: 'Syngenta India',
    tags: ['propiconazole', 'sheath blight', 'paddy', 'mandya', 'mysuru', 'triazole'],
    specifications: [
      { key: 'Active Ingredient', value: 'Propiconazole 25% EC' }, { key: 'Pack Size', value: '250 ml' },
      { key: 'Dose', value: '1 ml/liter' }, { key: 'Diseases', value: 'Sheath Blight, Rust, Smut' },
    ],
    isFeatured: false, isOrganic: false, deliveryTime: '2-3 hours',
  },

  {
    name: 'Metalaxyl 8% + Mancozeb 64% WP Ridomil Gold (250 g)',
    slug: 'metalaxyl-mancozeb-ridomil-gold',
    description: 'Systemic + contact combination fungicide. Metalaxyl moves inside plant; Mancozeb protects surface. For late blight in potato and downy mildew in grapes. Essential for Hassan potato and Vijayapura grape growers.',
    shortDescription: 'Ridomil Gold — systemic+contact for potato blight & grape downy mildew',
    price: 680, discountedPrice: 545,
    category: categoryIds['agricultural-pesticides'],
    images: img('ridomil'),
    stock: 180, unit: 'g', weight: 0.25,
    brand: 'Syngenta India',
    tags: ['metalaxyl', 'mancozeb', 'ridomil', 'potato blight', 'grape', 'downy mildew'],
    specifications: [
      { key: 'Active Ingredients', value: 'Metalaxyl 8% + Mancozeb 64% WP' }, { key: 'Pack Size', value: '250 g' },
      { key: 'Dose', value: '2 g/liter' }, { key: 'Best For', value: 'Late Blight, Downy Mildew' },
    ],
    isFeatured: true, isOrganic: false, deliveryTime: '2-3 hours',
  },

  {
    name: 'Hexaconazole 5% SC Fungicide (250 ml)',
    slug: 'hexaconazole-5-sc-fungicide',
    description: 'Triazole systemic for sheath blight in paddy and powdery mildew in mango, grapes, vegetables. Popular across Mandya, Mysuru paddy farmers. Also used by Ramanagara mulberry farmers.',
    shortDescription: 'Rallis triazole — paddy sheath blight & mulberry mildew in Karnataka',
    price: 350, discountedPrice: 280,
    category: categoryIds['agricultural-pesticides'],
    images: img('hexaconazole'),
    stock: 250, unit: 'ml', weight: 0.25,
    brand: 'Rallis India',
    tags: ['hexaconazole', 'sheath blight', 'mulberry', 'ramanagara', 'paddy'],
    specifications: [
      { key: 'Active Ingredient', value: 'Hexaconazole 5% SC' }, { key: 'Pack Size', value: '250 ml' },
      { key: 'Dose', value: '2 ml/liter' }, { key: 'Special Use', value: 'Mulberry mildew — Ramanagara silk belt' },
    ],
    isFeatured: false, isOrganic: false, deliveryTime: '2-3 hours',
  },

  // ══════ 🌿 HERBICIDES — 5 Products ══════

  {
    name: 'Glyphosate 41% SL Total Weedkiller (1 liter)',
    slug: 'glyphosate-41-sl-herbicide',
    description: 'Non-selective systemic herbicide for total weed control in plantation crops. For Karnataka coffee, rubber, areca nut plantations in Kodagu, Hassan, Chikkamagaluru.',
    shortDescription: 'Total weedkiller for Karnataka coffee, rubber & areca nut plantation',
    price: 380, discountedPrice: 299,
    category: categoryIds['agricultural-pesticides'],
    images: img('glyphosate'),
    stock: 300, unit: 'liter', weight: 1,
    brand: 'Nufarm India',
    tags: ['glyphosate', 'herbicide', 'weedkiller', 'coffee', 'areca', 'kodagu'],
    specifications: [
      { key: 'Active Ingredient', value: 'Glyphosate 41% SL' }, { key: 'Dose', value: '10 ml/liter' },
      { key: 'Warning', value: 'Non-selective — plantation only' },
    ],
    isFeatured: false, isOrganic: false, deliveryTime: '2-3 hours',
  },

  {
    name: 'Butachlor 50% EC Paddy Herbicide (1 liter)',
    slug: 'butachlor-50-ec-paddy-herbicide',
    description: 'Pre-emergence herbicide for transplanted paddy. Controls Echinochloa, sedges, broad-leaf weeds. Most widely used paddy herbicide across Karnataka — Mandya, Mysuru, Shivamogga, Dakshina Kannada.',
    shortDescription: 'Pre-emergence paddy herbicide — #1 weed control for transplanted paddy in Karnataka',
    price: 340, discountedPrice: 270,
    category: categoryIds['agricultural-pesticides'],
    images: img('butachlor'),
    stock: 350, unit: 'liter', weight: 1,
    brand: 'Mahindra Agri',
    tags: ['butachlor', 'paddy herbicide', 'weed control', 'mandya', 'shivamogga'],
    specifications: [
      { key: 'Active Ingredient', value: 'Butachlor 50% EC' }, { key: 'Dose', value: '2 liter/acre' },
      { key: 'Apply', value: '3-5 DAS with standing water' },
    ],
    isFeatured: true, isOrganic: false, deliveryTime: '2-3 hours',
  },

  {
    name: '2,4-D Ethyl Ester 38% EC Herbicide (1 liter)',
    slug: '2-4-d-ethyl-ester-38-herbicide',
    description: 'Selective systemic herbicide for broad-leaf weed control in paddy, wheat, maize. Controls parthenium, congress grass in Karnataka Kalaburagi, Bidar, Raichur wheat and sorghum districts.',
    shortDescription: 'Selective broad-leaf weed control — Kalaburagi, Raichur wheat & sorghum',
    price: 310, discountedPrice: 248,
    category: categoryIds['agricultural-pesticides'],
    images: img('twoFourD'),
    stock: 280, unit: 'liter', weight: 1,
    brand: 'Atul Limited',
    tags: ['2-4-D', 'broad-leaf herbicide', 'wheat', 'sorghum', 'kalaburagi', 'raichur'],
    specifications: [
      { key: 'Active Ingredient', value: '2,4-D Ethyl Ester 38% EC' }, { key: 'Dose', value: '2 ml/liter' },
      { key: 'Target', value: 'Parthenium, Congress grass, Broad-leaf weeds' },
    ],
    isFeatured: false, isOrganic: false, deliveryTime: '2-3 hours',
  },

  {
    name: 'Atrazine 50% WP Maize Herbicide (500 g)',
    slug: 'atrazine-50-wp-herbicide',
    description: 'Pre and post-emergence herbicide for maize and sugarcane. Karnataka maize farmers in Davangere, Chitradurga, Tumkur, Belagavi districts. Apply within 3 days of sowing or up to 3-leaf stage.',
    shortDescription: 'Pre+post maize herbicide — Davangere, Chitradurga maize zones',
    price: 285, discountedPrice: 228,
    category: categoryIds['agricultural-pesticides'],
    images: img('atrazine'),
    stock: 300, unit: 'g', weight: 0.5,
    brand: 'Adama India',
    tags: ['atrazine', 'maize herbicide', 'sugarcane', 'davangere', 'chitradurga'],
    specifications: [
      { key: 'Active Ingredient', value: 'Atrazine 50% WP' }, { key: 'Pack Size', value: '500 g' },
      { key: 'Dose', value: '2.5 kg/ha' }, { key: 'Crops', value: 'Maize, Sugarcane' },
    ],
    isFeatured: false, isOrganic: false, deliveryTime: '2-3 hours',
  },

  {
    name: 'Pendimethalin 30% EC Pre-emergence Herbicide (1 liter)',
    slug: 'pendimethalin-30-ec-herbicide',
    description: 'Pre-emergence dinitroaniline herbicide for cotton, groundnut, soybean, onion, garlic, sunflower. North Karnataka cotton belt (Dharwad, Haveri, Gadag) and groundnut zone (Kalaburagi, Raichur).',
    shortDescription: 'BASF pre-emergence — cotton, groundnut & onion weed control in North Karnataka',
    price: 360, discountedPrice: 288,
    category: categoryIds['agricultural-pesticides'],
    images: img('pendimethalin'),
    stock: 280, unit: 'liter', weight: 1,
    brand: 'BASF India',
    tags: ['pendimethalin', 'cotton', 'groundnut', 'onion', 'north karnataka'],
    specifications: [
      { key: 'Active Ingredient', value: 'Pendimethalin 30% EC' }, { key: 'Dose', value: '3.5 liter/ha' },
      { key: 'Best Crops', value: 'Cotton, Groundnut, Onion' },
    ],
    isFeatured: false, isOrganic: false, deliveryTime: '2-3 hours',
  },

  // ══════ 🌺 BIO-PESTICIDES — 5 Products ══════

  {
    name: 'Neem Oil 1500 ppm Azadirachtin Bio-pesticide (1 liter)',
    slug: 'neem-oil-1500-ppm-bio-pesticide',
    description: 'Cold-pressed neem oil with 1500+ ppm azadirachtin. NPOP and OMRI certified. Controls mites, aphids, whitefly, mealybug. Karnataka coffee and spice growers in Kodagu use as primary pest control.',
    shortDescription: 'NPOP certified organic neem oil — safe for bees & Karnataka export crops',
    price: 480, discountedPrice: 390,
    category: categoryIds['agricultural-pesticides'],
    images: img('neemOil'),
    stock: 300, unit: 'liter', weight: 1,
    brand: 'EcoGreen Organics',
    tags: ['neem oil', 'bio-pesticide', 'organic', 'NPOP', 'mites', 'aphids', 'coffee'],
    specifications: [
      { key: 'Azadirachtin', value: '>=1500 ppm' }, { key: 'Dose', value: '5 ml/liter + emulsifier' },
      { key: 'Certification', value: 'NPOP + OMRI' },
    ],
    isFeatured: true, isOrganic: true, deliveryTime: '2-3 hours',
  },

  {
    name: 'Trichoderma viride Bio-fungicide (1 kg)',
    slug: 'trichoderma-viride-bio-fungicide',
    description: 'Trichoderma viride biocontrol agent (1x10^6 spores/g). Controls Fusarium wilt, Pythium damping-off, Rhizoctonia. Ideal for Karnataka tomato, brinjal, chilli nursery. KSDA recommended.',
    shortDescription: 'KSDA-recommended bio-fungicide — wilt & damping-off in Karnataka nurseries',
    price: 260, discountedPrice: 199,
    category: categoryIds['agricultural-pesticides'],
    images: img('trichoderma'),
    stock: 350, unit: 'kg', weight: 1,
    brand: 'BioDefend',
    tags: ['trichoderma', 'bio-fungicide', 'fusarium', 'wilt', 'nursery', 'KSDA'],
    specifications: [
      { key: 'Organism', value: 'Trichoderma viride' }, { key: 'Spore Count', value: '1x10^6/g' },
      { key: 'Diseases', value: 'Fusarium Wilt, Pythium, Rhizoctonia' },
    ],
    isFeatured: false, isOrganic: true, deliveryTime: '2-3 hours',
  },

  {
    name: 'Beauveria bassiana Bio-insecticide (1 kg)',
    slug: 'beauveria-bassiana-bio-insecticide',
    description: 'Entomopathogenic fungus bio-insecticide (2x10^8 conidia/g). Controls whitefly, thrips, aphids, BPH. NPOP certified. Karnataka organic vegetable growers in Kolar, Chikkaballapur. Safe for honeybees.',
    shortDescription: 'NPOP organic bio-insecticide — whitefly & BPH on Karnataka organic farms',
    price: 450, discountedPrice: 360,
    category: categoryIds['agricultural-pesticides'],
    images: img('beauveria'),
    stock: 200, unit: 'kg', weight: 1,
    brand: 'AgBio India',
    tags: ['beauveria', 'bio-insecticide', 'organic', 'NPOP', 'whitefly', 'BPH', 'kolar'],
    specifications: [
      { key: 'Organism', value: 'Beauveria bassiana' }, { key: 'Conidia Count', value: '2x10^8/g' },
      { key: 'Pests', value: 'Whitefly, Thrips, BPH, Aphids' },
    ],
    isFeatured: false, isOrganic: true, deliveryTime: '2-3 hours',
  },

  {
    name: 'Pseudomonas fluorescens Bio-control Agent (1 liter)',
    slug: 'pseudomonas-fluorescens-biocontrol',
    description: 'Pseudomonas fluorescens PGPR — dual-action bio-agent. Controls Xanthomonas, Alternaria AND promotes plant growth. KSDA approved. Popular with Karnataka organic vegetable farmers.',
    shortDescription: 'Dual-action PGPR — disease control + growth promotion for Karnataka vegetables',
    price: 280, discountedPrice: 220,
    category: categoryIds['agricultural-pesticides'],
    images: img('pseudomonas'),
    stock: 250, unit: 'liter', weight: 1,
    brand: 'BioFarm India',
    tags: ['pseudomonas', 'PGPR', 'bio-control', 'organic', 'KSDA', 'vegetable'],
    specifications: [
      { key: 'Organism', value: 'Pseudomonas fluorescens' }, { key: 'CFU Count', value: '1x10^8/ml' },
      { key: 'Dual Action', value: 'Disease control + Plant growth' },
    ],
    isFeatured: false, isOrganic: true, deliveryTime: '2-3 hours',
  },

  {
    name: 'Bacillus thuringiensis (Bt) WP Bio-insecticide (500 g)',
    slug: 'bacillus-thuringiensis-bt-wp',
    description: 'Bt var. kurstaki — crystal protein toxins that kill only caterpillars. Controls bollworm, DBM, fruit borer, gram pod borer. Zero residue. NPOP certified. Karnataka organic farmers first choice.',
    shortDescription: 'Bt bio-insecticide — zero residue caterpillar control for Karnataka organic farms',
    price: 380, discountedPrice: 300,
    category: categoryIds['agricultural-pesticides'],
    images: img('bt'),
    stock: 280, unit: 'g', weight: 0.5,
    brand: 'Biostadt India',
    tags: ['Bt', 'bacillus thuringiensis', 'bollworm', 'DBM', 'organic', 'NPOP', 'zero residue'],
    specifications: [
      { key: 'Organism', value: 'Bt var. kurstaki' }, { key: 'Potency', value: '16000 IU/mg' },
      { key: 'Target Pests', value: 'Caterpillars only' }, { key: 'Certification', value: 'NPOP + OMRI' },
    ],
    isFeatured: true, isOrganic: true, deliveryTime: '2-3 hours',
  },

  // ══════ 🏛️ GOVT SCHEMES — 5 Products ══════

  {
    name: 'PM-KISAN Subsidized Neem-Coated Urea 46% N (50 kg)',
    slug: 'pm-kisan-subsidized-urea-46n',
    description: 'Government of India subsidized Urea under PM-KISAN. Neem-coated — reduces N losses by 10-15%. Karnataka farmers get subsidized rate Rs.266.50/bag vs market rate Rs.600+. Available through PACS.',
    shortDescription: 'GOI subsidized neem-coated urea at Rs.267/bag — PM-KISAN scheme',
    price: 600, discountedPrice: 267,
    category: categoryIds['govt-schemes'],
    images: img('urea'),
    stock: 1000, unit: 'bag', weight: 50,
    brand: 'IFFCO / KRIBHCO',
    tags: ['urea', 'subsidized', 'PM-KISAN', 'neem coated', 'nitrogen', 'karnataka'],
    specifications: [
      { key: 'N Content', value: '46% (Urea)' }, { key: 'Pack Size', value: '50 kg bag' },
      { key: 'Govt Price', value: 'Rs.266.50/bag (subsidized)' }, { key: 'Scheme', value: 'PM-KISAN' },
    ],
    isFeatured: true, isOrganic: false, deliveryTime: '2-3 hours',
  },

  {
    name: 'Raita Sahayavani DAP 18-46-0 (50 kg bag)',
    slug: 'karnataka-raita-sahayavani-dap',
    description: 'Diammonium Phosphate (DAP) at subsidized rate under Karnataka Raita Sahayavani. 18% N + 46% P2O5. Most important basal fertilizer for Karnataka paddy, wheat, cotton, pulses and vegetables.',
    shortDescription: 'Karnataka subsidized DAP 18:46:0 — basal for all Karnataka crops',
    price: 1350, discountedPrice: 1350,
    category: categoryIds['govt-schemes'],
    images: img('dap'),
    stock: 800, unit: 'bag', weight: 50,
    brand: 'IFFCO / NFL',
    tags: ['DAP', 'subsidy', 'Raita Sahayavani', 'phosphorus', 'karnataka', 'PACS'],
    specifications: [
      { key: 'Grade', value: 'DAP 18:46:0' }, { key: 'N Content', value: '18%' },
      { key: 'P2O5 Content', value: '46%' }, { key: 'Scheme', value: 'Karnataka Raita Sahayavani' },
    ],
    isFeatured: false, isOrganic: false, deliveryTime: '2-3 hours',
  },

  {
    name: 'RKVY Bio-pesticide IPM Combo Kit',
    slug: 'rkvy-bio-pesticide-combo-kit',
    description: 'RKVY subsidized IPM kit for organic transition farmers. Includes Bt WP 500g + Neem Oil 1L + Trichoderma 1kg + Beauveria 500g. Distributed by Karnataka Dept of Agriculture through KVK offices.',
    shortDescription: 'RKVY subsidized IPM kit — Bt + Neem Oil + Trichoderma + Beauveria combo',
    price: 1250, discountedPrice: 699,
    category: categoryIds['govt-schemes'],
    images: img('rkvyKit'),
    stock: 300, unit: 'pack',
    brand: 'RKVY Approved',
    tags: ['RKVY', 'bio-pesticide', 'IPM', 'combo kit', 'subsidy', 'karnataka'],
    specifications: [
      { key: 'Scheme', value: 'RKVY — Rashtriya Krishi Vikas Yojana' },
      { key: 'Contents', value: 'Bt 500g + Neem Oil 1L + Trichoderma 1kg + Beauveria 500g' },
    ],
    isFeatured: false, isOrganic: true, deliveryTime: '2-3 hours',
  },

  {
    name: 'Soil Health Card Micronutrient Mix (10 kg)',
    slug: 'soil-health-card-npk-micronutrient-mix',
    description: 'Custom NPK + micronutrient blend based on Soil Health Card (SHC) for Karnataka soils. Contains Zinc Sulphate, Ferrous Sulphate, Manganese, Boron + NPK. Corrects Zinc and Boron deficiency in Karnataka red and laterite soils.',
    shortDescription: 'SHC-based NPK + Zinc + Boron mix for Karnataka red & laterite soils',
    price: 780, discountedPrice: 580,
    category: categoryIds['govt-schemes'],
    images: img('soilHealth'),
    stock: 400, unit: 'kg', weight: 10,
    brand: 'KSDA / GOI SHC',
    tags: ['soil health card', 'micronutrient', 'zinc', 'boron', 'karnataka', 'laterite soil'],
    specifications: [
      { key: 'Pack Size', value: '10 kg' }, { key: 'Micronutrients', value: 'Zn, Fe, Mn, B, Cu' },
      { key: 'Scheme', value: 'Soil Health Card — Government of India' },
    ],
    isFeatured: false, isOrganic: false, deliveryTime: '2-3 hours',
  },

  {
    name: 'PMFBY Crop Protection Fungicide Pack',
    slug: 'pmfby-fungicide-protection-pack',
    description: 'PM Fasal Bima Yojana approved disease protection pack for insured Karnataka farmers. Contains Mancozeb 500g + Carbendazim 250g + Copper Oxychloride 250g. Using this qualifies for faster insurance claim processing.',
    shortDescription: 'PMFBY insurance-linked fungicide pack — Mancozeb + Carbendazim + Copper Oxy',
    price: 620, discountedPrice: 450,
    category: categoryIds['govt-schemes'],
    images: img('pmfby'),
    stock: 350, unit: 'pack',
    brand: 'PMFBY Approved',
    tags: ['PMFBY', 'crop insurance', 'fungicide', 'disease control', 'karnataka', 'paddy'],
    specifications: [
      { key: 'Scheme', value: 'PM Fasal Bima Yojana (PMFBY)' },
      { key: 'Contents', value: 'Mancozeb 500g + Carbendazim 250g + Copper Oxy 250g' },
    ],
    isFeatured: false, isOrganic: false, deliveryTime: '2-3 hours',
  },
];

// ─── Seeder Functions ─────────────────────────────────────────────────────────

const importData = async () => {
  try {
    await connectDB();

    try {
      await Product.collection.dropIndexes();
      await User.collection.dropIndexes();
      await Category.collection.dropIndexes();
      console.log('🗑️  Old indexes dropped');
    } catch (e) { }

    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    console.log('🗑️  Existing data cleared');

    for (const u of users) {
      await User.create(u);
    }
    console.log(`✅ ${users.length} users seeded (passwords hashed)`);

    const [organicCat, pesticideCat, govtCat] = await Category.insertMany(categories);
    console.log('✅ Root categories seeded');

    await Category.insertMany(getSubcategories(organicCat._id, pesticideCat._id));
    console.log('✅ Subcategories seeded');

    const categoryIds = {
      'organic-manure': organicCat._id,
      'agricultural-pesticides': pesticideCat._id,
      'govt-schemes': govtCat._id,
    };

    const createdProducts = await Product.insertMany(getProducts(categoryIds));
    console.log(`✅ ${createdProducts.length} products seeded with correct matching images`);

    console.log('\n🌿 AgroMart database seeded successfully!\n');
    console.log('📧 Admin: admin@agromart.com / Admin@123');
    console.log('📧 User:  rajan@example.com / User@123');
    console.log('📧 User:  srini@example.com / User@123\n');
    console.log('⚡ Run: node utils/copy-images.js  — to copy all product images to frontend\n');

    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeder error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    console.log('🗑️  All data destroyed');
    process.exit(0);
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
