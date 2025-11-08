// Simple PWA icon generator - creates placeholder icons
// Run with: node scripts/generate-icons.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create SVG template for placeholder icons
const createSVG = (size, isMaskable = false) => {
  const padding = isMaskable ? size * 0.15 : 0; // 15% padding for maskable icons
  const iconSize = size - (padding * 2);
  const iconPos = padding;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#000000"/>

  <!-- Shield shape -->
  <path d="M ${size/2} ${iconPos + 20}
           L ${iconPos + iconSize - 20} ${iconPos + iconSize/3}
           L ${iconPos + iconSize - 20} ${iconPos + iconSize - 40}
           Q ${iconPos + iconSize - 20} ${iconPos + iconSize - 20} ${iconPos + iconSize - 40} ${iconPos + iconSize - 20}
           L ${size/2 + 20} ${iconPos + iconSize - 20}
           L ${size/2} ${iconPos + iconSize}
           L ${size/2 - 20} ${iconPos + iconSize - 20}
           L ${iconPos + 40} ${iconPos + iconSize - 20}
           Q ${iconPos + 20} ${iconPos + iconSize - 20} ${iconPos + 20} ${iconPos + iconSize - 40}
           L ${iconPos + 20} ${iconPos + iconSize/3}
           Z"
           fill="#FFD700" stroke="#FFA500" stroke-width="3"/>

  <!-- Inner decoration -->
  <circle cx="${size/2}" cy="${iconPos + iconSize/2}" r="${iconSize/6}" fill="#000000" opacity="0.3"/>

  <!-- Text: RD -->
  <text x="${size/2}" y="${iconPos + iconSize/2 + 8}"
        font-family="Arial, sans-serif"
        font-size="${iconSize/5}"
        font-weight="bold"
        text-anchor="middle"
        fill="#000000">RD</text>
</svg>`;
};

// Generate PNG files from SVG (we'll create SVG placeholders for now)
// Note: For production, you should replace these with actual PNG files
console.log('🎨 Generating placeholder PWA icons...\n');

sizes.forEach(size => {
  const svgContent = createSVG(size, false);
  const filename = `icon-${size}.svg`;
  const filepath = path.join(iconsDir, filename);

  fs.writeFileSync(filepath, svgContent);
  console.log(`✅ Created ${filename} (${size}x${size})`);
});

// Generate maskable icon
const maskableSVG = createSVG(512, true);
fs.writeFileSync(path.join(iconsDir, 'icon-512-maskable.svg'), maskableSVG);
console.log(`✅ Created icon-512-maskable.svg (512x512) with safe zone`);

console.log('\n⚠️  IMPORTANT: These are SVG placeholders!');
console.log('For production, please replace with proper PNG icons:');
console.log('1. Create a 512x512 PNG master icon');
console.log('2. Use a tool like https://realfavicongenerator.net/ or');
console.log('   https://www.pwabuilder.com/imageGenerator to generate all sizes');
console.log('3. Replace the SVG files in public/icons/ with PNG files\n');
