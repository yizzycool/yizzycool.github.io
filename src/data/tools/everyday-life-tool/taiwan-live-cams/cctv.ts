// import cctvChanghuaCounty from './cctv-changhua-county.json';
// import cctvChiayi from './cctv-chiayi.json';
// import cctvHsinchu from './cctv-hsinchu.json';
// import cctvHsinchuCounty from './cctv-hsinchu-county.json';
// import cctvKaohsiung from './cctv-kaohsiung.json';
// import cctvKeelung from './cctv-keelung.json';
// import cctvKinmenCounty from './cctv-kinmen-county.json';
// import cctvNantouCounty from './cctv-nantou-county.json';
import cctvNewTaipei from './cctv-new-taipei.json';
// import cctvPingtungCounty from './cctv-pingtung-county.json';
// import cctvTaichung from './cctv-taichung.json';
// import cctvTainan from './cctv-tainan.json';
// import cctvTaipei from './cctv-taipei.json';
// import cctvTaitungCounty from './cctv-taitung-county.json';
// import cctvTaoyuan from './cctv-taoyuan.json';
// import cctvYilanCounty from './cctv-yilan-county.json';
// import cctvYunlinCounty from './cctv-yunlin-county.json';

// import cctvFreeway from './cctv-freeway.json';
// import cctvHighway from './cctv-highway.json';

export interface TdxCctvValue {
  UpdateTime: string;
  UpdateInterval: number;
  SrcUpdateTime: string;
  SrcUpdateInterval: number;
  AuthorityCode: string;
  LinkVersion?: string;
  CCTVs: TdxCctvInfo[];
  Count: number;
  lastUpdated: string;
}

export interface TdxCctvInfo {
  CCTVID: string;
  SubAuthorityCode?: string;
  LinkID: string;
  VideoImageURL?: string;
  ImageRefreshRate?: number;
  VideoStreamURL?: string;
  LocationType: number;
  PositionLon: number;
  PositionLat: number;
  SurveillanceType?: number;
  SurveillanceDescription?: string;
  RoadID?: string;
  RoadName?: string;
  RoadClass?: number;
  RoadDirection?: string;
  RoadSection?: {
    Start: string;
    End: string;
  };
  LocationMile?: string;
  LayoutMapURL?: string;
  custom?: {
    url?: string;
  };
}

export const TDX_CCTV_CITIES = [
  // 'ChanghuaCounty',
  // 'Chiayi',
  // 'Hsinchu',
  // 'HsinchuCounty',
  // 'Kaohsiung',
  // 'Keelung',
  // 'KinmenCounty',
  // 'NantouCounty',
  'NewTaipei',
  // 'PingtungCounty',
  // 'Taichung',
  // 'Tainan',
  // 'Taipei',
  // 'TaitungCounty',
  // 'Taoyuan',
  // 'YilanCounty',
  // 'YunlinCounty',
] as const;

export type TdxCctvKey = (typeof TDX_CCTV_CITIES)[number];
// | 'Freeway'
// | 'HighWay';

const cctvData: TdxCctvData = {
  // ChanghuaCounty: cctvChanghuaCounty,
  // Chiayi: cctvChiayi,
  // Hsinchu: cctvHsinchu,
  // HsinchuCounty: cctvHsinchuCounty,
  // Kaohsiung: cctvKaohsiung,
  // Keelung: cctvKeelung,
  // KinmenCounty: cctvKinmenCounty,
  // NantouCounty: cctvNantouCounty,
  NewTaipei: cctvNewTaipei,
  // PingtungCounty: cctvPingtungCounty,
  // Taichung: cctvTaichung,
  // Tainan: cctvTainan,
  // Taipei: cctvTaipei,
  // TaitungCounty: cctvTaitungCounty,
  // Taoyuan: cctvTaoyuan,
  // YilanCounty: cctvYilanCounty,
  // YunlinCounty: cctvYunlinCounty,

  // Freeway: cctvFreeway,
  // HighWay: cctvHighway,
};

export type TdxCctvData = Record<TdxCctvKey, TdxCctvValue>;

// Translation TdxCctvKey from English to Chinese(Traditional) string
export const tdxCctvKeyEnToZhTw: Record<TdxCctvKey, string> = {
  // ChanghuaCounty: '彰化縣',
  // Chiayi: '嘉義市',
  // Hsinchu: '新竹市',
  // HsinchuCounty: '新竹縣',
  // Kaohsiung: '高雄市',
  // Keelung: '基隆市',
  // KinmenCounty: '金門縣',
  // NantouCounty: '南投縣',
  NewTaipei: '新北市',
  // PingtungCounty: '屏東縣',
  // Taichung: '臺中市',
  // Tainan: '臺南市',
  // Taipei: '臺北市',
  // TaitungCounty: '臺東縣',
  // Taoyuan: '桃園市',
  // YilanCounty: '宜蘭縣',
  // YunlinCounty: '雲林縣',
  // Freeway: '高速公路',
  // HighWay: '省道',
};

export default cctvData;
