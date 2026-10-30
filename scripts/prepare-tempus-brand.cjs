// Preserve the source pixels of the supplied navy-background logo.
// Usage: node scripts/prepare-tempus-brand.cjs
const sharp = require('sharp');
const path = require('node:path');
const root = path.join(__dirname, '..', 'public', 'brand');

async function main() {
  const { data, info } = await sharp(path.join(root, 'tempus-logo.png'))
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const clamp = value => Math.min(1, Math.max(0, value));
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    // Navy is blue-dominant; gold is warm, while ivory is bright.
    const foreground = Math.max(clamp((r - b - 3) / 18), clamp((Math.min(r, g, b) - 90) / 35));
    data[i + 3] = Math.round(data[i + 3] * foreground * clamp((r - 20) / 20));
  }
  const rawImage = await sharp(data, { raw: info }).png().toBuffer();
  const cutout = await sharp(rawImage).trim({ threshold: 8 })
    .extend({ top: 12, bottom: 12, left: 12, right: 12, background: '#00000000' }).png().toBuffer();
  await sharp(cutout).toFile(path.join(root, 'tempus-logo-transparent.png'));
  // Horizontal lockup uses the original symbol and original wordmark, not a substitute font.
  const symbolCrop = await sharp(rawImage).extract({ left: 340, top: 240, width: 600, height: 580 }).png().toBuffer();
  const wordmarkCrop = await sharp(rawImage).extract({ left: 190, top: 850, width: 885, height: 140 }).png().toBuffer();
  const symbol = await sharp(symbolCrop).trim({ threshold: 8 }).resize({ height: 112 }).png().toBuffer();
  const wordmark = await sharp(wordmarkCrop).trim({ threshold: 8 }).resize({ width: 340 }).png().toBuffer();
  const mark = await sharp(symbol).metadata();
  const word = await sharp(wordmark).metadata();
  await sharp({ create: { width: mark.width + 24 + word.width, height: 112, channels: 4, background: '#00000000' } })
    .composite([{ input: symbol, left: 0, top: 0 }, { input: wordmark, left: mark.width + 24, top: Math.round((112 - word.height) / 2) }])
    .webp({ lossless: true }).toFile(path.join(root, 'tempus-logo-horizontal.webp'));
  await sharp(symbol).resize(96, 96, { fit: 'contain', background: '#00000000' }).png()
    .toFile(path.join(root, 'tempus-icon.png'));
  console.log('Prepared transparent logo, horizontal logo and icon from original artwork.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
