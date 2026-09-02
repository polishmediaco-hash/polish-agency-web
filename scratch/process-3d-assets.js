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
    input: '/Users/Macbook Pro/.gemini/antigravity/brain/fad06f18-b4fd-4b7f-a36a-68ac5be5729b/serum_dropper_3d_1788341441817.jpg',
    crop: { left: 100, top: 40, width: 824, height: 940 }
  },
  {
    name: 'perfume-3d',
    input: '/Users/Macbook Pro/.gemini/antigravity/brain/fad06f18-b4fd-4b7f-a36a-68ac5be5729b/perfume_flacon_3d_1788341485774.jpg',
    crop: { left: 100, top: 60, width: 824, height: 900 }
  },
  {
    name: 'cream-3d',
    input: '/Users/Macbook Pro/.gemini/antigravity/brain/fad06f18-b4fd-4b7f-a36a-68ac5be5729b/creampot_luxury_3d_1788341513568.jpg',
    crop: { left: 100, top: 120, width: 824, height: 800 }
  },
  {
    name: 'lipglaze-3d',
    input: '/Users/Macbook Pro/.gemini/antigravity/brain/fad06f18-b4fd-4b7f-a36a-68ac5be5729b/lipglaze_wand_3d_1788341533856.jpg',
    crop: { left: 120, top: 50, width: 784, height: 920 }
  }
];

async function processAsset(item) {
  console.log(`Processing ${item.name}...`);
  const image = sharp(item.input);
  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  const width = info.width;
  const height = info.height;
  const rgba = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const outIdx = (y * width + x) * 4;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Luminance / brightness calculation
      const maxVal = Math.max(r, g, b);
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

      // Soft progressive transparency thresholding for dark studio backgrounds
      let alpha = 255;
      if (maxVal < 14) {
        alpha = 0;
      } else if (maxVal < 42) {
        alpha = Math.round(((maxVal - 14) / 28) * 255);
      } else {
        alpha = 255;
      }

      rgba[outIdx] = r;
      rgba[outIdx + 1] = g;
      rgba[outIdx + 2] = b;
      rgba[outIdx + 3] = alpha;
    }
  }

  // Save full-res transparent PNG and WebP
  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .resize(480, 480, { fit: 'inside' })
    .png({ quality: 95 })
    .toFile(path.join(outputDir, `${item.name}.png`));

  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .resize(480, 480, { fit: 'inside' })
    .webp({ quality: 92, alphaQuality: 95 })
    .toFile(path.join(outputDir, `${item.name}.webp`));

  console.log(`Saved ${item.name}.png & ${item.name}.webp`);
}

async function run() {
  for (const item of assets) {
    await processAsset(item);
  }
  console.log('All 3D assets processed successfully!');
}

run().catch(console.error);
