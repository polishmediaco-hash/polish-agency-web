const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = '/Users/Macbook Pro/.gemini/antigravity/brain/fad06f18-b4fd-4b7f-a36a-68ac5be5729b/.user_uploaded/media_1788385802463.jpg';
const outputDir = path.join(__dirname, '../public/assets/3d');

// Bounding boxes based on 1024 x 571
// 1. Serum: left approx x: 170, y: 170, width: 200, height: 300
// 2. Perfume: center-left x: 270, y: 70, width: 260, height: 300
// 3. Lipstick: center-right x: 490, y: 120, width: 180, height: 260
// 4. Compact Powder: bottom-right x: 570, y: 260, width: 250, height: 220

const crops = [
  { name: 'serum-holo', left: 175, top: 175, width: 195, height: 295 },
  { name: 'perfume-holo', left: 275, top: 75, width: 250, height: 290 },
  { name: 'lipstick-holo', left: 495, top: 125, width: 175, height: 250 },
  { name: 'powder-holo', left: 575, top: 260, width: 245, height: 215 }
];

async function extractItem(crop) {
  console.log(`Extracting ${crop.name}...`);
  const cropped = await sharp(inputPath)
    .extract({ left: crop.left, top: crop.top, width: crop.width, height: crop.height })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = cropped;
  const width = info.width;
  const height = info.height;
  const channels = info.channels;
  const rgba = Buffer.alloc(width * height * 4);

  // Background sample in dark area: R: 28, G: 32, B: 42
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const outIdx = (y * width + x) * 4;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Luminance / brightness
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Distance from dark navy background (approx rgb(25, 30, 42))
      const bgDist = Math.hypot(r - 25, g - 30, b - 42);

      let alpha = 0;
      if (lum > 40) {
        alpha = Math.min(255, (lum - 32) * 1.6);
      } else if (bgDist > 18) {
        alpha = Math.min(255, (bgDist - 12) * 3);
      }

      // Boost neon glow
      rgba[outIdx] = Math.min(255, Math.round(r * 1.15));
      rgba[outIdx + 1] = Math.min(255, Math.round(g * 1.18));
      rgba[outIdx + 2] = Math.min(255, Math.round(b * 1.25));
      rgba[outIdx + 3] = Math.round(alpha);
    }
  }

  // Save as WebP and PNG
  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .resize(width * 2, height * 2, { kernel: 'lanczos3' })
    .webp({ quality: 98, alphaQuality: 100 })
    .toFile(path.join(outputDir, `${crop.name}.webp`));

  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .resize(width * 2, height * 2, { kernel: 'lanczos3' })
    .png({ quality: 98 })
    .toFile(path.join(outputDir, `${crop.name}.png`));

  console.log(`✓ Saved ${crop.name}.webp and ${crop.name}.png`);
}

async function run() {
  for (const crop of crops) {
    await extractItem(crop);
  }
}

run().catch(console.error);
