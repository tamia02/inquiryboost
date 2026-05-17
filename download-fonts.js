const fs = require('fs');
const path = require('path');
const https = require('https');

const fontsDir = path.join(__dirname, 'fonts');
if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir);
}

const fontWeights = [300, 400, 500, 600, 700, 800, 900];

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded: ${path.basename(dest)}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

async function run() {
    console.log("Downloading Inter fonts for self-hosting...");
    for (const weight of fontWeights) {
        const filename = `inter-latin-${weight}-normal.woff2`;
        const url = `https://cdn.jsdelivr.net/npm/@fontsource/inter/files/${filename}`;
        const dest = path.join(fontsDir, filename);
        try {
            await downloadFile(url, dest);
        } catch (e) {
            console.error(`Error downloading weight ${weight}:`, e.message);
        }
    }
    console.log("All fonts downloaded successfully!");
}

run();
