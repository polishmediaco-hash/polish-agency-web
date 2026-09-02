const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '../public/assets/3d');

const assets = [
  {
    name: 'serum-3d',
    input: '/Users/Macbook Pro/.gemini/antigravity/brain/fad06f18-b4fd-4b7f-a36a-68ac5be5729b/ref_serum_holo_1788386026037.jpg',
    lumMin: 32,
    lumMax: 85
  },
  {
    name: 'perfume-3d',
    input: '/Users/Macbook Pro/.gemini/antigravity/brain/fad06f18-b4fd-4b7f-a36a-68ac5be5729b/ref_perfume_holo_1788386048671.jpg',
    lumMin: 30,
    lumMax: 80
  },
  {
    name: 'lipstick-3d',
    input: '/Users/Macbook Pro/.gemini/antigravity/brain/fad06f18-b4fd-4b7f-a36a-68ac5be5729b/ref_lipstick_holo_1788386072097.jpg',
    lumMin: 28,
    lumMax: 78
  },
  {
    name: 'powder-3d',
    input: '/Users/Macbook Pro/.gemini/antigravity/brain/fad06f18-b4fd-4b7f-a36a-68ac5be5729b/ref_powder_holo_1788386094304.jpg',
    lumMin: 28,
    lumMax: 78
  }
];

function smoothstep(min, max, value) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

async function processCleanAsset(item) {
  console.log(`Processing pristine isolated asset: ${item.name}...`);
  // First resize input with margin
  const resizedBuffer = await sharp(item.input)
    .resize(520, 520, { fit: 'inside' })
    .extend({
      top: 40,
      bottom: 40,
      left: 40,
      right: 40,
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = resizedBuffer;
  const channels = info.channels;
  const width = info.width;
  const height = info.height;
  const rgba = Buffer.alloc(width * height * 4);
  const cx = width / 2;
  const cy = height / 2;
  
  const rx = width * 0.46;
  const ry = height * 0.46;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const outIdx = (y * width + x) * 4;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Elliptical falloff from center
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      const normalizedDist = Math.hypot(dx, dy);

      let boundaryAlpha = 1;
      if (normalizedDist >= 1.0) {
        boundaryAlpha = 0;
      } else if (normalizedDist > 0.85) {
        boundaryAlpha = 1 - smoothstep(0.85, 1.0, normalizedDist);
      }

      // Strict edge margin safety: outer 30px is ALWAYS 0 alpha
      if (x < 30 || x > width - 30 || y < 30 || y > height - 30) {
        boundaryAlpha = 0;
      }

      let lumAlpha = 0;
      if (lum < item.lumMin) {
        lumAlpha = 0;
      } else if (lum < item.lumMax) {
        lumAlpha = smoothstep(item.lumMin, item.lumMax, lum);
      } else {
        lumAlpha = 1;
      }

      const combinedAlpha = lumAlpha * boundaryAlpha;

      if (combinedAlpha <= 0.001) {
        rgba[outIdx] = 0;
        rgba[outIdx + 1] = 0;
        rgba[outIdx + 2] = 0;
        rgba[outIdx + 3] = 0;
      } else {
        const boost = 1 + (1 - combinedAlpha) * 0.45;
        rgba[outIdx] = Math.min(255, Math.round(r * boost));
        rgba[outIdx + 1] = Math.min(255, Math.round(g * boost));
        rgba[outIdx + 2] = Math.min(255, Math.round(b * boost));
        rgba[outIdx + 3] = Math.round(combinedAlpha * 255);
      }
    }
  }

  // Save 2x Retina transparent WebP & PNG
  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .webp({ quality: 96, alphaQuality: 100, effort: 6 })
    .toFile(path.join(outputDir, `${item.name}.webp`));

  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .png({ quality: 96 })
    .toFile(path.join(outputDir, `${item.name}.png`));

  console.log(`✓ Generated pristine ${item.name}.webp and ${item.name}.png`);
}

async function run() {
  for (const item of assets) {
    await processCleanAsset(item);
  }
  fs.copyFileSync(path.join(outputDir, 'lipstick-3d.webp'), path.join(outputDir, 'lipglaze-3d.webp'));
  fs.copyFileSync(path.join(outputDir, 'lipstick-3d.png'), path.join(outputDir, 'lipglaze-3d.png'));
  fs.copyFileSync(path.join(outputDir, 'powder-3d.webp'), path.join(outputDir, 'cream-3d.webp'));
  fs.copyFileSync(path.join(outputDir, 'powder-3d.png'), path.join(outputDir, 'cream-3d.png'));
  console.log('✨ All 4 pristine assets guaranteed 100% boundary-free!');
}

run().catch(console.error);
