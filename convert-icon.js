import pngToIco from 'png-to-ico';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, 'public', 'logo-corteva.png');
const outputPath = path.join(__dirname, 'public', 'logo-corteva.ico');

console.log('Converting', inputPath, 'to', outputPath);

pngToIco(inputPath)
    .then(buf => {
        fs.writeFileSync(outputPath, buf);
        console.log('Icon generated successfully!');
    })
    .catch(err => {
        console.error('Error generating icon:', err);
        process.exit(1);
    });
