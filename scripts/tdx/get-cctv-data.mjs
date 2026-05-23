import fs from 'fs';
import path from 'path';
import _ from 'lodash';

const DAYS_LIMIT = 10;
const OUTPUT_DIR = 'src/data/tools/everyday-life-tool/taiwan-live-cams/';
const TDX_API_URL = 'https://tdx.transportdata.tw/api/basic';

/**
 * Checks if the existing data file needs to be updated based on the DAYS_LIMIT.
 * @param {string} outputPath - The file path to check.
 * @returns {boolean} - Returns true if the data is expired or missing, false otherwise.
 */
function revalidate(outputPath) {
  // Check if file exists and if the data is still fresh
  if (fs.existsSync(outputPath)) {
    try {
      const oldData = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));

      if (oldData.lastUpdated) {
        const lastDate = new Date(oldData.lastUpdated);
        const now = new Date();
        const diffDays = Math.abs(now - lastDate) / (1000 * 60 * 60 * 24);

        if (diffDays < DAYS_LIMIT) {
          console.log(
            `⏭️ Interval less than ${DAYS_LIMIT} days, skipping update.`
          );
          return false;
        }
      }

      return true;
    } catch (_e) {
      console.log(`⚠️ Failed to parse old data, preparing to refetch.`);
      return true;
    }
  }
  return true;
}

/**
 * Fetches CCTV data from the TDX API and saves it to a local JSON file.
 * @param {string} apiUrl - The TDX API endpoint.
 * @param {string} outputPath - The destination file path.
 */
async function fetchCCTVData(apiUrl, outputPath) {
  const fileName = path.basename(outputPath);
  console.log(`\n[${fileName}]\n🌐 Fetching data from API...`);

  const isExpired = revalidate(outputPath);
  if (!isExpired) return;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const apiData = await response.json();
    const finalData = {
      ...apiData,
      lastUpdated: new Date().toISOString(),
    };
    return finalData;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

/**
 * Writes the fetched JSON data to the specified output path.
 * @param {object} jsonData - The data to be saved.
 * @param {string} outputPath - The destination file path.
 */
function writeData(jsonData, outputPath) {
  try {
    const dir = path.dirname(outputPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));

    console.log(
      `✅ Update data successful! Time: ${new Date().toLocaleString()}`
    );
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

/**
 * Fetches additional URL information for New Taipei City CCTVs.
 * @param {object} data - The CCTV data object to be enriched.
 * @param {string} outputPath - The destination file path to check for existing data.
 */
async function getAdditionalInfoForNewTaipei(data, outputPath) {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  try {
    const oldData = fs.existsSync(outputPath)
      ? JSON.parse(fs.readFileSync(outputPath, 'utf-8'))
      : {};
    const cctvCustomMap = {};
    oldData.CCTVs?.forEach((cctv) => {
      cctvCustomMap[cctv.CCTVID] = cctv.custom;
    });

    const requestUrl =
      'https://apiatis.ntpc.gov.tw/atis-api/device/queryCCTVURL/';

    for (const cctv of data?.CCTVs) {
      if (cctvCustomMap[cctv.CCTVID]) {
        cctv.custom = cctvCustomMap[cctv.CCTVID];
      }
    }

    for (const cctv of data?.CCTVs) {
      if (cctv.custom) continue;

      console.log(`Fetch Additional Data: ${cctv.CCTVID}`);

      const response = await fetch(requestUrl + cctv.CCTVID);
      const json = await response.json();

      if (json?.data?.url) {
        cctv.custom = {
          url: json.data.url,
        };
      }

      await sleep(500);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

/**
 * Fetches CCTV data for all cities.
 */
async function fetchCityCCTVData() {
  const TDX_CITIES = [
    // 'ChanghuaCounty',
    // 'Chiayi',
    // 'Hsinchu',
    // 'HsinchuCounty',
    // 'Kaohsiung',
    // 'Keelung',
    // 'KinmenCounty',
    // 'NantouCounty',
    // 'NewTaipei',
    // 'PingtungCounty',
    // 'Taichung',
    // 'Tainan',
    // 'Taipei',
    // 'TaitungCounty',
    // 'Taoyuan',
    // 'YilanCounty',
    // 'YunlinCounty',
    'NewTaipei',
  ];

  for (const city of TDX_CITIES) {
    const apiUrl = `${TDX_API_URL}/v2/Road/Traffic/CCTV/City/${city}?$count=true&$format=JSON`;

    const outputPath = path.join(
      process.cwd(),
      OUTPUT_DIR,
      `cctv-${_.kebabCase(city)}.json`
    );

    const data = await fetchCCTVData(apiUrl, outputPath);
    if (!data) continue;

    if (city === 'NewTaipei') {
      await getAdditionalInfoForNewTaipei(data, outputPath);
    }

    writeData(data, outputPath);
  }
}

/**
 * Fetches highway-specific CCTV data.
 */
async function fetchHighwayCCTVData() {
  const apiUrl = `${TDX_API_URL}/v2/Road/Traffic/CCTV/Highway?$count=true&$format=JSON`;

  const outputPath = path.join(process.cwd(), OUTPUT_DIR, 'cctv-highway.json');

  const data = await fetchCCTVData(apiUrl, outputPath);
  if (!data) return;

  writeData(data, outputPath);
}

/**
 * Fetches freeway-specific CCTV data.
 */
async function fetchFreewayCCTVData() {
  const apiUrl = `${TDX_API_URL}/v2/Road/Traffic/CCTV/Freeway?$count=true&$format=JSON`;

  const outputPath = path.join(process.cwd(), OUTPUT_DIR, 'cctv-freeway.json');

  const data = await fetchCCTVData(apiUrl, outputPath);
  if (!data) return;

  writeData(data, outputPath);
}

(async function () {
  await fetchCityCCTVData();
  // await fetchHighwayCCTVData();
  // await fetchFreewayCCTVData();
})();
