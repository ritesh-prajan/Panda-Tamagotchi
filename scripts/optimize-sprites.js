// scripts/optimize-sprites.js
// One-time optimization script: resizes all PNGs in src/assets/official-chibi to max 384px
// on the long side with high-quality PNG compression, preserving transparency.
// Outputs to src/assets/official-chibi-opt/ without modifying originals.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC_DIR = path.join(__dirname, '../src/assets/official-chibi');
const DST_DIR = path.join(__dirname, '../src/assets/official-chibi-opt');

async function main() {
  if (!fs.existsSync(DST_DIR)) {
    fs.mkdirSync(DST_DIR, { recursive: true });
  }

  const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.png'));
  console.log(`Optimizing ${files.length} sprite files from ${SRC_DIR}...`);

  let totalSrcBytes = 0;
  let totalDstBytes = 0;

  for (const file of files) {
    const srcPath = path.join(SRC_DIR, file);
    const dstPath = path.join(DST_DIR, file);

    const srcStat = fs.statSync(srcPath);
    totalSrcBytes += srcStat.size;

    await sharp(srcPath)
      .resize(384, 384, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .png({
        compressionLevel: 9,
        effort: 9
      })
      .toFile(dstPath);

    const dstStat = fs.statSync(dstPath);
    totalDstBytes += dstStat.size;

    const meta = await sharp(dstPath).metadata();
    console.log(`  ✓ ${file}: ${meta.width}x${meta.height} (${(srcStat.size/1024).toFixed(1)}KB -> ${(dstStat.size/1024).toFixed(1)}KB)`);
  }

  console.log(`\nOptimization Complete!`);
  console.log(`Original total size: ${(totalSrcBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Optimized total size: ${(totalDstBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Saved: ${(((totalSrcBytes - totalDstBytes) / totalSrcBytes) * 100).toFixed(1)}%`);
}

main().catch(err => {
  console.error('Sprite optimization failed:', err);
  process.exit(1);
});
