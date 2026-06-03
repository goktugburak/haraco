const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const IMAGE_DIR = path.join(__dirname, 'resimler');
const QUALITY = 75;

async function optimize() {
  const entries = fs.readdirSync(IMAGE_DIR, { withFileTypes: true });
  const imageFiles = entries.filter(e =>
    e.isFile() && /\.(jpe?g|png)$/i.test(e.name)
  );

  if (imageFiles.length === 0) {
    console.log('Dönüştürülecek resim bulunamadı.');
    return [];
  }

  const converted = [];

  for (const file of imageFiles) {
    const inputPath = path.join(IMAGE_DIR, file.name);
    const webpName = file.name.replace(/\.(jpe?g|png)$/i, '.webp');
    const outputPath = path.join(IMAGE_DIR, webpName);

    const inputSize = fs.statSync(inputPath).size;

    await sharp(inputPath)
      .webp({ quality: QUALITY })
      .toFile(outputPath);

    const outputSize = fs.statSync(outputPath).size;
    const saved = ((1 - outputSize / inputSize) * 100).toFixed(1);

    console.log(`✓ ${file.name} → ${webpName}`);
    console.log(`  Boyut: ${(inputSize / 1024).toFixed(1)}KB → ${(outputSize / 1024).toFixed(1)}KB (${saved}% küçüldü)`);

    fs.unlinkSync(inputPath);
    console.log(`  ✗ Orijinal silindi: ${file.name}`);

    converted.push({ original: file.name, webp: webpName });
  }

  return converted;
}

optimize()
  .then(converted => {
    if (converted.length > 0) {
      console.log('\nDönüştürülen dosyalar:');
      converted.forEach(c => console.log(`  ${c.original} → ${c.webp}`));
    }
    console.log('İşlem tamamlandı.');
  })
  .catch(err => {
    console.error('Hata:', err);
    process.exit(1);
  });
