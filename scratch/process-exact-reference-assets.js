const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '../public/assets/3d');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const assets = [
  {
    name: 'serum-3d',
    input: '/Users/Macbook Pro/.gemini/antigravity/brain/fad06f18-b4fd-4b7f-a36a-68ac5be5729b/ref_serum_holo_1788386026037.jpg'
  },
  {
    name: 'perfume-3d',
    input: '/Users/Macbook Pro/.gemini/antigravity/brain/fad06f18-b4fd-4b7f-a36a-68ac5be5729b/ref_perfume_holo_1788386048671.jpg'
  },
  {
    name: 'lipstick-3d',
    input: '/Users/Macbook Pro/.gemini/antigravity/brain/fad06f18-b4fd-4b7f-a36a-68ac5be5729b/ref_lipstick_holo_1788386072097.jpg'
  },
  {
    name: 'powder-3d',
    input: '/Users/Macbook Pro/.gemini/antigravity/brain/fad06f18-b4fd-4b7f-a36a-68ac5be5729b/ref_powder_holo_1788386094304.jpg'
  }
];

function smoothstep(min, max, value) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

async function processExactAsset(item) {
  console.log(`Processing exact holographic asset: ${item.name}...`);
  const image = sharp(item.input);
  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  const width = info.width;
  const height = info.height;
  const rgba = Buffer.alloc(width * height * 4);
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.min(width, height) * 0.49;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const outIdx = (y * width + x) * 4;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const maxVal = Math.max(r, g, b);

      // Distance from center for perimeter feathering
      const dist = Math.hypot(x - cx, y - cy);
      const boundaryFactor = 1 - smoothstep(maxRadius * 0.88, maxRadius, dist);

      // Luminescent X-ray glass alpha curve
      let alphaVal = 0;
      if (maxVal < 6) {
        alphaVal = 0;
      } else if (maxVal < 30) {
        alphaVal = smoothstep(6, 30, maxVal);
      } else {
        alphaVal = 1;
      }

      const finalAlpha = Math.round(alphaVal * boundaryFactor * 255);

      rgba[outIdx] = r;
      rgba[outIdx + 1] = g;
      rgba[outIdx + 2] = b;
      rgba[outIdx + 3] = finalAlpha;
    }
  }

  // Save 2x Retina transparent WebP & PNG
  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .resize(640, 640, { fit: 'inside' })
    .webp({ quality: 96, alphaQuality: 100, effort: 6 })
    .toFile(path.join(outputDir, `${item.name}.webp`));

  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .resize(640, 640, { fit: 'inside' })
    .png({ quality: 96 })
    .toFile(path.join(outputDir, `${item.name}.png`));

  console.log(`✓ Generated ${item.name}.webp and ${item.name}.png`);
}

async function run() {
  for (const item of assets) {
    await processExactAsset(item);
  }
  // Also create backward-compatible aliases
  fs.copyFileSync(path.join(outputDir, 'lipstick-3d.webp'), path.join(outputDir, 'lipglaze-3d.webp'));
  fs.copyFileSync(path.join(outputDir, 'lipstick-3d.png'), path.join(outputDir, 'lipglaze-3d.png'));
  fs.copyFileSync(path.join(outputDir, 'powder-3d.webp'), path.join(outputDir, 'cream-3d.webp'));
  fs.copyFileSync(path.join(outputDir, 'powder-3d.png'), path.join(outputDir, 'cream-3d.png'));
  console.log('✨ All 4 exact reference holographic assets deployed successfully!');
}

run().catch(console.error);
