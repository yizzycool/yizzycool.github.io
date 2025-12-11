const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
};

const SOURCE_FOLDER = path.join(
  __dirname,
  '../../../yizzycool.github.io-strapi/public/uploads'
);
const TARGET_FOLDER = path.join(__dirname, '../../public/strapi/uploads');

function syncDirectory(src, dest) {
  // make sure destination directory exists
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const srcItems = new Set(fs.readdirSync(src));
  const destItems = new Set(fs.readdirSync(dest));

  // process src items (new or updated files/directories)
  for (const item of srcItems) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      // recursive directory sync
      syncDirectory(srcPath, destPath);
    } else {
      // file: copy if not exist or newer
      if (
        !fs.existsSync(destPath) ||
        fs.statSync(srcPath).mtimeMs > fs.statSync(destPath).mtimeMs
      ) {
        fs.copyFileSync(srcPath, destPath);
        console.log(
          `${colors.green}[Copied]${colors.reset} ${srcPath} → ${destPath}`
        );
      }
    }
  }

  // process dest items (remove extraneous files/directories)
  for (const item of destItems) {
    if (!srcItems.has(item)) {
      const destPath = path.join(dest, item);
      fs.rmSync(destPath, { recursive: true, force: true });
      console.log(`${colors.red}[Deleted]${colors.reset} ${destPath}`);
    }
  }
}

// - Make sure yizzycool.github.io-strapi is cloned locally before running this script
// - Make sure yizzycool.github.io and yizzycool.github.io-strapi are located in the same parent directory.
// - Change these paths as needed
syncDirectory(SOURCE_FOLDER, TARGET_FOLDER);
console.log(`${colors.green}[DONE] Strapi Media Synced!${colors.reset}`);
