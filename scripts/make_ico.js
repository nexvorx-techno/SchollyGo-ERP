const sharp = require('sharp');
const pngToIco = require('png-to-ico');
const fs = require('fs');

async function processLogo() {
  try {
    // Read the logo, make it square by adding transparent padding
    const inputPath = 'public/logo.png';
    const squarePngPath = 'public/logo_square.png';
    const icoPath = 'public/logo.ico';

    const metadata = await sharp(inputPath).metadata();
    const size = Math.max(metadata.width, metadata.height);

    await sharp(inputPath)
      .resize({
        width: size,
        height: size,
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent
      })
      .toFile(squarePngPath);

    console.log('Square PNG created at', squarePngPath);

    // Convert the square PNG to ICO
    const buf = await pngToIco(squarePngPath);
    fs.writeFileSync(icoPath, buf);
    
    console.log('ICO created successfully at', icoPath);
  } catch (error) {
    console.error('Error processing logo:', error);
  }
}

processLogo();
