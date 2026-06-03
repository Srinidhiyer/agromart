/**
 * Downloads real agriculture product images from Unsplash into frontend/public/products/
 * Usage: node utils/download-images.js
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const destDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'products');
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

// Real agriculture product images — verified Unsplash photo IDs
const images = [
  // Organic / Compost
  { file: 'vermicompost.png',   url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80' },
  { file: 'fym.png',            url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80' },
  { file: 'jeevamrutha.png',    url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80' },
  { file: 'panchagavya.png',    url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&q=80' },
  { file: 'neem-cake.png',      url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80' },
  { file: 'bio-fertilizer.png', url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&q=80' },
  { file: 'npk-soluble.png',    url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&q=80' },
  { file: 'humic-acid.png',     url: 'https://images.unsplash.com/photo-1574943320219-9f9b04b7b8e0?w=600&q=80' },

  // Insecticides
  { file: 'insecticide.png',    url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80' },
  { file: 'imidacloprid.png',   url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&q=80' },
  { file: 'thiamethoxam.png',   url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80' },
  { file: 'acetamiprid.png',    url: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600&q=80' },

  // Fungicides  
  { file: 'fungicide.png',      url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80' },

  // Herbicides
  { file: 'herbicide.png',      url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80' },

  // Neem oil
  { file: 'neem-oil.png',       url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80' },

  // Fertilizer bags
  { file: 'urea-bag.png',       url: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=600&q=80' },
  { file: 'dap-bag.png',        url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80' },

  // Bio-pesticides / Govt
  { file: 'bt-biopesticide.png', url: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&q=80' },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const mod = url.startsWith('https') ? https : http;

    const req = mod.get(url, (res) => {
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlink(dest, () => {});
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });

    req.on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });

    req.setTimeout(15000, () => {
      req.abort();
      reject(new Error('Timeout'));
    });
  });
}

async function main() {
  console.log(`📁 Saving to: ${destDir}\n`);
  let ok = 0, fail = 0;

  for (const img of images) {
    const dest = path.join(destDir, img.file);
    try {
      process.stdout.write(`⬇️  Downloading ${img.file}... `);
      await download(img.url, dest);
      console.log('✅');
      ok++;
    } catch (e) {
      console.log(`❌ ${e.message}`);
      fail++;
    }
  }

  console.log(`\n${ok} downloaded  |  ${fail} failed`);
  if (ok > 0) console.log('🎉 Refresh your browser to see real product images!\n');
}

main();
