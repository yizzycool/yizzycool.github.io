const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');

const STRAPI_URL = 'http://127.0.0.1:1337';
const MEDIA_FOLDER = path.join(__dirname, '../../public/uploads');

// Flat map strapi media data to an array
function extractAllMediaData(files) {
  const data = [];
  for (const file of files) {
    const { formats } = file;
    for (const type of ['thumbnail', 'small', 'medium', 'large']) {
      if (!(type in formats)) continue;
      const { hash, ext, url, name } = formats[type];
      data.push({ hash, ext, url, name });
    }
    const { hash, ext, url, name } = file;
    data.push({ hash, ext, url, name });
  }
  return data;
}

async function downloadMedia() {
  try {
    const response = await fetch(`${STRAPI_URL}/api/upload/files`);
    const files = await response.json();
    const medias = extractAllMediaData(files);

    // Make new Directory if MEDIA_FOLDER did not exist
    if (!fs.existsSync(MEDIA_FOLDER)) {
      fs.mkdirSync(MEDIA_FOLDER, { recursive: true });
    }

    for (const media of medias) {
      const { hash, ext, url, name } = media;
      const filePath = path.join(MEDIA_FOLDER, hash + ext);
      const writer = fs.createWriteStream(filePath);

      const fileResponse = await fetch(`${STRAPI_URL}${url}`);
      pipeline(fileResponse.body, writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      console.log(`Downloaded: ${name}`);
    }
  } catch (error) {
    console.error('Error downloading media:', error);
  }
}

downloadMedia();
