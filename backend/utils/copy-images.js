/**
 * Copies ALL AI-generated product images to frontend/public/products/
 * Usage: node utils/copy-images.js
 */
const fs = require('fs');
const path = require('path');

const srcDir = path.join('C:', 'Users', 'srini', '.gemini', 'antigravity', 'brain',
  '9096b5c8-950d-4d3b-8f30-1f8d8ed83742');

const dstDir = path.join(__dirname, '..', '..', '..', 'frontend', 'public', 'products');

console.log('📁 Source:', srcDir);
console.log('📁 Dest:  ', dstDir);
console.log('');

if (!fs.existsSync(dstDir)) {
  fs.mkdirSync(dstDir, { recursive: true });
  console.log('✅ Created products folder');
}

// All generated images: [source-filename, destination-filename]
const files = [
  // Round 1 — batch 1 (previously generated)
  ['vermicompost_product_1780400264005.png',   'vermicompost.png'],
  ['bio_fertilizer_liquid_1780400287744.png',  'bio-fertilizer.png'],
  ['neem_cake_product_1780400311721.png',       'neem-cake.png'],
  ['insecticide_bottle_1780400334004.png',      'insecticide.png'],
  ['fungicide_powder_packet_1780400356214.png', 'fungicide.png'],
  ['herbicide_spray_field_1780400376702.png',   'herbicide.png'],
  ['neem_oil_bottle_1780400400408.png',         'neem-oil.png'],
  ['urea_fertilizer_bag_1780400425327.png',     'urea-bag.png'],
  ['jeevamrutha_bottle_1780400450328.png',      'jeevamrutha.png'],
  ['npk_water_soluble_1780400469458.png',       'npk-soluble.png'],
  ['dap_fertilizer_bag_1780400492278.png',      'dap-bag.png'],
  ['bio_pesticide_pack_1780400515800.png',      'bt-biopesticide.png'],

  // Round 2 — correct replacements for wrong Unsplash images
  ['fym_compost_bag_1780401521255.png',         'fym.png'],
  ['panchagavya_bottle_1780401551142.png',      'panchagavya.png'],
  ['acetamiprid_insecticide_1780401409943.png', 'acetamiprid.png'],
  ['imidacloprid_bottle_1780401435841.png',     'imidacloprid.png'],
  ['thiamethoxam_packet_1780401463172.png',     'thiamethoxam.png'],
];

let copied = 0;
let missing = 0;

files.forEach(([src, dst]) => {
  const srcPath = path.join(srcDir, src);
  const dstPath = path.join(dstDir, dst);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, dstPath);
    console.log(`✅  ${dst}`);
    copied++;
  } else {
    console.log(`⚠️  Missing: ${src}`);
    missing++;
  }
});

console.log(`\n${copied} images copied   |   ${missing} missing`);
if (missing === 0) {
  console.log('🎉 All product images ready! Refresh the frontend to see correct images.\n');
} else {
  console.log('⚠️  Some images were not found — they may still use fallback images.\n');
}
