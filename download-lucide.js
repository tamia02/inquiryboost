const fs = require('fs');
const path = require('path');
const https = require('https');

const jsDir = path.join(__dirname, 'js');
if (!fs.existsSync(jsDir)) {
    fs.mkdirSync(jsDir);
}

const dest = path.join(jsDir, 'lucide.min.js');
const url = 'https://cdn.jsdelivr.net/npm/lucide@0.321.0/dist/umd/lucide.min.js';

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
                console.log(`Downloaded: lucide.min.js`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

downloadFile(url, dest)
    .then(() => console.log("Lucide downloaded successfully!"))
    .catch((e) => console.error("Error downloading Lucide:", e.message));
