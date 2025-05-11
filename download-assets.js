const https = require('https');
const fs = require('fs');
const path = require('path');

const assets = [
  {
    url: 'https://github.com/expo/expo/raw/main/templates/expo-template-blank/assets/icon.png',
    filename: 'icon.png'
  },
  {
    url: 'https://github.com/expo/expo/raw/main/templates/expo-template-blank/assets/adaptive-icon.png',
    filename: 'adaptive-icon.png'
  },
  {
    url: 'https://github.com/expo/expo/raw/main/templates/expo-template-blank/assets/splash.png',
    filename: 'splash.png'
  },
  {
    url: 'https://github.com/expo/expo/raw/main/templates/expo-template-blank/assets/favicon.png',
    filename: 'favicon.png'
  }
];

const downloadFile = (url, filename) => {
  const filepath = path.join(__dirname, 'assets', filename);
  const file = fs.createWriteStream(filepath);

  https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${filename}`);
    });
  }).on('error', (err) => {
    fs.unlink(filepath, () => {});
    console.error(`Error downloading ${filename}: ${err.message}`);
  });
};

if (!fs.existsSync(path.join(__dirname, 'assets'))) {
  fs.mkdirSync(path.join(__dirname, 'assets'));
}

assets.forEach(asset => downloadFile(asset.url, asset.filename)); 