const fs = require('fs');
const path = require('path');

// A simple 512x512 transparent PNG in base64
const transparentPNG = 'iVBORw0KGgoAAAANSUhEUgAAAgAAAAIAAQMAAADOtka5AAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAADZJREFUeJztwQEBAAAAgiD/r25IQAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfBuCAAAB0niJ8AAAAABJRU5ErkJggg==';

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

['icon.png', 'adaptive-icon.png', 'splash.png', 'favicon.png'].forEach(filename => {
  fs.writeFileSync(
    path.join(assetsDir, filename),
    Buffer.from(transparentPNG, 'base64')
  );
  console.log(`Created ${filename}`);
}); 