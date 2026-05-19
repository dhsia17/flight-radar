export interface AirportInfo {
  cityEn: string;
  countryEn: string;
  cityZh: string;
  countryZh: string;
}

const AIRPORT_NAMES: Readonly<Record<string, AirportInfo>> = {
  SIN: { cityEn: "Singapore",         countryEn: "Singapore",    cityZh: "新加坡",   countryZh: "新加坡" },
  BKK: { cityEn: "Bangkok",           countryEn: "Thailand",     cityZh: "曼谷",     countryZh: "泰國" },
  DMK: { cityEn: "Bangkok",           countryEn: "Thailand",     cityZh: "曼谷",     countryZh: "泰國" },
  HKT: { cityEn: "Phuket",            countryEn: "Thailand",     cityZh: "普吉島",   countryZh: "泰國" },
  CNX: { cityEn: "Chiang Mai",        countryEn: "Thailand",     cityZh: "清邁",     countryZh: "泰國" },
  USM: { cityEn: "Koh Samui",         countryEn: "Thailand",     cityZh: "蘇梅島",   countryZh: "泰國" },
  KBV: { cityEn: "Krabi",             countryEn: "Thailand",     cityZh: "甲米",     countryZh: "泰國" },
  DPS: { cityEn: "Bali",              countryEn: "Indonesia",    cityZh: "峇里島",   countryZh: "印尼" },
  CGK: { cityEn: "Jakarta",           countryEn: "Indonesia",    cityZh: "雅加達",   countryZh: "印尼" },
  SGN: { cityEn: "Ho Chi Minh City",  countryEn: "Vietnam",      cityZh: "胡志明市", countryZh: "越南" },
  HAN: { cityEn: "Hanoi",             countryEn: "Vietnam",      cityZh: "河內",     countryZh: "越南" },
  DAD: { cityEn: "Da Nang",           countryEn: "Vietnam",      cityZh: "峴港",     countryZh: "越南" },
  TPE: { cityEn: "Taipei",            countryEn: "Taiwan",       cityZh: "台北",     countryZh: "台灣" },
  KUL: { cityEn: "Kuala Lumpur",      countryEn: "Malaysia",     cityZh: "吉隆坡",   countryZh: "馬來西亞" },
  PEN: { cityEn: "Penang",            countryEn: "Malaysia",     cityZh: "檳城",     countryZh: "馬來西亞" },
  LGK: { cityEn: "Langkawi",          countryEn: "Malaysia",     cityZh: "蘭卡威",   countryZh: "馬來西亞" },
  HKG: { cityEn: "Hong Kong",         countryEn: "Hong Kong",    cityZh: "香港",     countryZh: "香港" },
  NRT: { cityEn: "Tokyo",             countryEn: "Japan",        cityZh: "東京",     countryZh: "日本" },
  HND: { cityEn: "Tokyo",             countryEn: "Japan",        cityZh: "東京",     countryZh: "日本" },
  ICN: { cityEn: "Seoul",             countryEn: "South Korea",  cityZh: "首爾",     countryZh: "韓國" },
  GMP: { cityEn: "Seoul",             countryEn: "South Korea",  cityZh: "首爾",     countryZh: "韓國" },
  MNL: { cityEn: "Manila",            countryEn: "Philippines",  cityZh: "馬尼拉",   countryZh: "菲律賓" },
  RGN: { cityEn: "Yangon",            countryEn: "Myanmar",      cityZh: "仰光",     countryZh: "緬甸" },
  CMB: { cityEn: "Colombo",           countryEn: "Sri Lanka",    cityZh: "可倫坡",   countryZh: "斯里蘭卡" },
  DEL: { cityEn: "New Delhi",         countryEn: "India",        cityZh: "新德里",   countryZh: "印度" },
  DXB: { cityEn: "Dubai",             countryEn: "UAE",          cityZh: "杜拜",     countryZh: "阿聯" },
  LHR: { cityEn: "London",            countryEn: "UK",           cityZh: "倫敦",     countryZh: "英國" },
  LGW: { cityEn: "London",            countryEn: "UK",           cityZh: "倫敦",     countryZh: "英國" },
  CDG: { cityEn: "Paris",             countryEn: "France",       cityZh: "巴黎",     countryZh: "法國" },
  SYD: { cityEn: "Sydney",            countryEn: "Australia",    cityZh: "雪梨",     countryZh: "澳洲" },
  MEL: { cityEn: "Melbourne",         countryEn: "Australia",    cityZh: "墨爾本",   countryZh: "澳洲" },
  LAX: { cityEn: "Los Angeles",       countryEn: "USA",          cityZh: "洛杉磯",   countryZh: "美國" },
  JFK: { cityEn: "New York",          countryEn: "USA",          cityZh: "紐約",     countryZh: "美國" },
};

export function getAirportInfo(iata: string): AirportInfo {
  return AIRPORT_NAMES[iata.toUpperCase()] ?? {
    cityEn: iata,
    countryEn: "",
    cityZh: iata,
    countryZh: "",
  };
}
