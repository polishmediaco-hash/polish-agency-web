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
    input: '/Users/Macbook Pro/.gemini/antigravity/brain/fad06f18-b4fd-4b7f-a36a-68ac5be5729b/serum_3d_clean_1788342143784.jpg'
  },
  {
    name: 'perfume-3d',
    input: '/Users/Macbook Pro/.gemini/antigravity/brain/fad06f18-b4fd-4b7f-a36a-68ac5be5729b/perfume_3d_clean_1788342166653.jpg'
  },
  {
    name: 'cream-3d',
    input: '/Users/Macbook Pro/.gemini/antigravity/brain/fad06f18-b4fd-4b7f-a36a-68ac5be5729b/cream_3d_clean_1788342184880.jpg'
  },
  {
    name: 'lipglaze-3d',
    input: '/Users/Macbook Pro/.gemini/antigravity/brain/fad06f18-b4fd-4b7f-a36a-68ac5be5729b/lipglaze_3d_clean_1788342313969.jpg'
  }
];

function smoothstep(min, max, value) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

async function processCleanAsset(item) {
  console.log(`Processing clean asset: ${item.name}...`);
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
  const maxRadius = Math.min(width, height) * 0.48;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const outIdx = (y * width + x) * 4;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const maxVal = Math.max(r, g, b);

      // Distance from center for soft boundary fade
      const dist = Math.hypot(x - cx, y - cy);
      const boundaryFactor = 1 - smoothstep(maxRadius * 0.82, maxRadius, dist);

      // Soft alpha thresholding
      let alphaVal = 0;
      if (maxVal < 6) {
        alphaVal = 0;
      } else if (maxVal < 32) {
        alphaVal = smoothstep(6, 32, maxVal);
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
    .resize(520, 520, { fit: 'inside' })
    .webp({ quality: 95, alphaQuality: 98, effort: 6 })
    .toFile(path.join(outputDir, `${item.name}.webp`));

  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .resize(520, 520, { fit: 'inside' })
    .png({ quality: 95 })
    .toFile(path.join(outputDir, `${item.name}.png`));

  console.log(`✓ Generated ${item.name}.webp and ${item.name}.png`);
}

async function run() {
  for (const item of assets) {
    await processCleanAsset(item);
  }
  console.log('All clean 3D assets processed with seamless alpha blending!');
}

run().catch(console.error);
