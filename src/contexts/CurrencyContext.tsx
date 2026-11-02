import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchExchangeRate, getCachedRate } from '../lib/currency';

// ---------------------------------------------------------------------------
// Maps
// ---------------------------------------------------------------------------

const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  // Chile
  'America/Santiago': 'CL', 'America/Punta_Arenas': 'CL',
  // Mexico
  'America/Mexico_City': 'MX', 'America/Cancun': 'MX', 'America/Monterrey': 'MX',
  'America/Merida': 'MX', 'America/Mazatlan': 'MX', 'America/Chihuahua': 'MX',
  'America/Ojinaga': 'MX', 'America/Hermosillo': 'MX', 'America/Tijuana': 'MX',
  'America/Bahia_Banderas': 'MX',
  // Colombia
  'America/Bogota': 'CO',
  // Brazil
  'America/Sao_Paulo': 'BR', 'America/Recife': 'BR', 'America/Belem': 'BR',
  'America/Fortaleza': 'BR', 'America/Maceio': 'BR', 'America/Manaus': 'BR',
  'America/Cuiaba': 'BR', 'America/Porto_Velho': 'BR', 'America/Rio_Branco': 'BR',
  'America/Santarem': 'BR', 'America/Noronha': 'BR', 'America/Eirunepe': 'BR',
  // Argentina
  'America/Argentina/Buenos_Aires': 'AR', 'America/Argentina/Cordoba': 'AR',
  'America/Argentina/Salta': 'AR', 'America/Argentina/Jujuy': 'AR',
  'America/Argentina/Tucuman': 'AR', 'America/Argentina/Catamarca': 'AR',
  'America/Argentina/La_Rioja': 'AR', 'America/Argentina/San_Juan': 'AR',
  'America/Argentina/Mendoza': 'AR', 'America/Argentina/San_Luis': 'AR',
  'America/Argentina/Rio_Gallegos': 'AR', 'America/Argentina/Ushuaia': 'AR',
  // Argentina — deprecated IANA aliases (some browsers still return these)
  'America/Buenos_Aires': 'AR', 'America/Cordoba': 'AR', 'America/Rosario': 'AR',
  'America/Catamarca': 'AR', 'America/Jujuy': 'AR', 'America/Mendoza': 'AR',
  // Peru
  'America/Lima': 'PE',
  // Venezuela
  'America/Caracas': 'VE',
  // Bolivia
  'America/La_Paz': 'BO',
  // Paraguay
  'America/Asuncion': 'PY',
  // Uruguay
  'America/Montevideo': 'UY',
  // Ecuador
  'America/Guayaquil': 'EC', 'Pacific/Galapagos': 'EC',
  // Costa Rica
  'America/Costa_Rica': 'CR',
  // Guatemala
  'America/Guatemala': 'GT',
  // Honduras
  'America/Tegucigalpa': 'HN',
  // Nicaragua
  'America/Managua': 'NI',
  // Dominican Republic
  'America/Santo_Domingo': 'DO',
  // Cuba
  'America/Havana': 'CU',
  // Jamaica
  'America/Jamaica': 'JM',
  // United States
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
  'America/Los_Angeles': 'US', 'America/Phoenix': 'US', 'America/Anchorage': 'US',
  'America/Adak': 'US', 'Pacific/Honolulu': 'US', 'America/Indiana/Indianapolis': 'US',
  'America/Indiana/Knox': 'US', 'America/Indiana/Marengo': 'US',
  'America/Indiana/Petersburg': 'US', 'America/Indiana/Tell_City': 'US',
  'America/Indiana/Vevay': 'US', 'America/Indiana/Vincennes': 'US',
  'America/Indiana/Winamac': 'US', 'America/Kentucky/Louisville': 'US',
  'America/Kentucky/Monticello': 'US', 'America/North_Dakota/Beulah': 'US',
  'America/North_Dakota/Center': 'US', 'America/North_Dakota/New_Salem': 'US',
  'America/Boise': 'US', 'America/Detroit': 'US', 'America/Menominee': 'US',
  // Canada
  'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Winnipeg': 'CA',
  'America/Edmonton': 'CA', 'America/Halifax': 'CA', 'America/St_Johns': 'CA',
  'America/Regina': 'CA', 'America/Moncton': 'CA', 'America/Glace_Bay': 'CA',
  'America/Goose_Bay': 'CA', 'America/Blanc-Sablon': 'CA', 'America/Nipigon': 'CA',
  'America/Thunder_Bay': 'CA', 'America/Iqaluit': 'CA', 'America/Pangnirtung': 'CA',
  'America/Rankin_Inlet': 'CA', 'America/Resolute': 'CA', 'America/Rainy_River': 'CA',
  'America/Cambridge_Bay': 'CA', 'America/Inuvik': 'CA', 'America/Whitehorse': 'CA',
  'America/Dawson': 'CA', 'America/Dawson_Creek': 'CA', 'America/Fort_Nelson': 'CA',
  'America/Creston': 'CA',
  // United Kingdom
  'Europe/London': 'GB',
  // Europe (EUR zone) — one entry per country, all map to same currency
  'Europe/Berlin': 'DE', 'Europe/Paris': 'FR', 'Europe/Madrid': 'ES',
  'Europe/Rome': 'IT', 'Europe/Amsterdam': 'NL', 'Europe/Brussels': 'BE',
  'Europe/Vienna': 'AT', 'Europe/Helsinki': 'FI', 'Europe/Dublin': 'IE',
  'Europe/Athens': 'GR', 'Europe/Bratislava': 'SK', 'Europe/Ljubljana': 'SI',
  'Europe/Tallinn': 'EE', 'Europe/Riga': 'LV', 'Europe/Vilnius': 'LT',
  'Europe/Luxembourg': 'LU', 'Europe/Valletta': 'MT', 'Asia/Nicosia': 'CY',
  'Europe/Lisbon': 'PT', 'Atlantic/Azores': 'PT', 'Atlantic/Madeira': 'PT',
  // Europe (non-EUR)
  'Europe/Zurich': 'CH', 'Europe/Oslo': 'NO', 'Europe/Stockholm': 'SE',
  'Europe/Copenhagen': 'DK', 'Europe/Warsaw': 'PL', 'Europe/Prague': 'CZ',
  'Europe/Budapest': 'HU', 'Europe/Bucharest': 'RO', 'Europe/Sofia': 'BG',
  'Europe/Moscow': 'RU', 'Europe/Kaliningrad': 'RU', 'Europe/Samara': 'RU',
  'Europe/Saratov': 'RU', 'Europe/Ulyanovsk': 'RU', 'Europe/Volgograd': 'RU',
  'Asia/Yekaterinburg': 'RU', 'Asia/Omsk': 'RU', 'Asia/Novosibirsk': 'RU',
  'Asia/Barnaul': 'RU', 'Asia/Tomsk': 'RU', 'Asia/Novokuznetsk': 'RU',
  'Asia/Krasnoyarsk': 'RU', 'Asia/Irkutsk': 'RU', 'Asia/Chita': 'RU',
  'Asia/Yakutsk': 'RU', 'Asia/Khandyga': 'RU', 'Asia/Vladivostok': 'RU',
  'Asia/Ust-Nera': 'RU', 'Asia/Magadan': 'RU', 'Asia/Sakhalin': 'RU',
  'Asia/Srednekolymsk': 'RU', 'Asia/Kamchatka': 'RU', 'Asia/Anadyr': 'RU',
  'Europe/Kiev': 'UA', 'Europe/Uzhgorod': 'UA', 'Europe/Zaporozhye': 'UA',
  'Europe/Istanbul': 'TR', 'Asia/Istanbul': 'TR',
  'Europe/Jerusalem': 'IL', 'Asia/Jerusalem': 'IL',
  // Asia-Pacific
  'Asia/Tokyo': 'JP',
  'Asia/Shanghai': 'CN', 'Asia/Chongqing': 'CN', 'Asia/Harbin': 'CN',
  'Asia/Kashgar': 'CN', 'Asia/Urumqi': 'CN',
  'Asia/Seoul': 'KR',
  'Asia/Hong_Kong': 'HK',
  'Asia/Taipei': 'TW',
  'Asia/Singapore': 'SG',
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
  'Asia/Karachi': 'PK',
  'Asia/Dhaka': 'BD',
  'Asia/Colombo': 'LK',
  'Asia/Bangkok': 'TH', 'Asia/Phnom_Penh': 'KH', 'Asia/Vientiane': 'LA',
  'Asia/Manila': 'PH',
  'Asia/Jakarta': 'ID', 'Asia/Makassar': 'ID', 'Asia/Jayapura': 'ID',
  'Asia/Pontianak': 'ID',
  'Asia/Kuala_Lumpur': 'MY', 'Asia/Kuching': 'MY',
  'Asia/Ho_Chi_Minh': 'VN', 'Asia/Saigon': 'VN',
  // Middle East
  'Asia/Dubai': 'AE',
  'Asia/Riyadh': 'SA',
  'Asia/Qatar': 'QA', 'Asia/Doha': 'QA',
  // Oceania
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Brisbane': 'AU',
  'Australia/Adelaide': 'AU', 'Australia/Perth': 'AU', 'Australia/Darwin': 'AU',
  'Australia/Hobart': 'AU', 'Australia/Broken_Hill': 'AU', 'Australia/Eucla': 'AU',
  'Australia/Lord_Howe': 'AU', 'Australia/Lindeman': 'AU',
  'Pacific/Auckland': 'NZ', 'Pacific/Chatham': 'NZ',
  // Africa
  'Africa/Johannesburg': 'ZA', 'Africa/Maseru': 'LS', 'Africa/Mbabane': 'SZ',
  'Africa/Lagos': 'NG',
  'Africa/Nairobi': 'KE',
  'Africa/Cairo': 'EG',
};

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: 'USD', CA: 'CAD', AU: 'AUD', NZ: 'NZD', SG: 'SGD', HK: 'HKD', TW: 'TWD',
  GB: 'GBP',
  DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR',
  FI: 'EUR', IE: 'EUR', GR: 'EUR', SK: 'EUR', SI: 'EUR', EE: 'EUR', LV: 'EUR',
  LT: 'EUR', LU: 'EUR', MT: 'EUR', CY: 'EUR', PT: 'EUR',
  CH: 'CHF', NO: 'NOK', SE: 'SEK', DK: 'DKK', PL: 'PLN', CZ: 'CZK', HU: 'HUF',
  RO: 'RON', BG: 'BGN', RU: 'RUB', UA: 'UAH', TR: 'TRY', IL: 'ILS',
  JP: 'JPY', CN: 'CNY', KR: 'KRW', IN: 'INR', PK: 'PKR', BD: 'BDT', LK: 'LKR',
  TH: 'THB', PH: 'PHP', ID: 'IDR', MY: 'MYR', VN: 'VND',
  AE: 'AED', SA: 'SAR', QA: 'QAR',
  ZA: 'ZAR', NG: 'NGN', KE: 'KES', EG: 'EGP',
  CL: 'CLP', MX: 'MXN', AR: 'ARS', CO: 'COP', BR: 'BRL', PE: 'PEN',
  UY: 'UYU', BO: 'BOB', PY: 'PYG', EC: 'USD', VE: 'VES', CR: 'CRC',
  PA: 'USD', GT: 'GTQ', HN: 'HNL', SV: 'USD', NI: 'NIO', DO: 'DOP',
  CU: 'CUP', JM: 'JMD',
};

const SYMBOL_MAP: Record<string, string> = {
  USD: '$', CAD: 'C$', AUD: 'A$', NZD: 'NZ$', SGD: 'S$', HKD: 'HK$', TWD: 'NT$',
  GBP: '£', EUR: '€', CHF: 'CHF',
  JPY: '¥', CNY: '¥',
  KRW: '₩', THB: '฿', PHP: '₱', IDR: 'Rp', MYR: 'RM', VND: '₫', BDT: '৳',
  INR: '₹', PKR: '₨', LKR: 'Rs',
  BRL: 'R$', MXN: 'MX$', COP: 'COP', ARS: 'ARS', CLP: 'CLP', PEN: 'S/',
  TRY: '₺', RUB: '₽', UAH: '₴', ILS: '₪',
  ZAR: 'R', NGN: '₦', KES: 'KSh', EGP: 'E£',
  AED: 'د.إ', SAR: '﷼', QAR: 'ر.ق',
  NOK: 'kr', SEK: 'kr', DKK: 'kr',
  PLN: 'zł', CZK: 'Kč', HUF: 'Ft', RON: 'lei', BGN: 'лв',
  UYU: 'UYU', BOB: 'Bs', PYG: '₲', VES: 'Bs', CRC: '₡',
  GTQ: 'Q', HNL: 'L', NIO: 'C$', DOP: 'RD$', CUP: 'CUP', JMD: 'J$',
};

// ---------------------------------------------------------------------------
// Detection (no caching — always reads live timezone)
// ---------------------------------------------------------------------------

function detectFromTimezone(): { timezone: string; country: string; currency: string; symbol: string } {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let country = TIMEZONE_TO_COUNTRY[tz];

  if (!country) {
    const lang = navigator.language || '';
    const parts = lang.split('-');
    if (parts.length >= 2) {
      const region = parts[parts.length - 1].toUpperCase();
      if (COUNTRY_TO_CURRENCY[region]) country = region;
    }
  }

  country = country ?? 'US';
  const currency = COUNTRY_TO_CURRENCY[country] ?? 'USD';
  const symbol = SYMBOL_MAP[currency] ?? '$';
  return { timezone: tz, country, currency, symbol };
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface CurrencyContextType {
  timezone: string;
  country: string;
  currency: string;
  symbol: string;
  rate: number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [detected, setDetected] = useState(detectFromTimezone);
  const [rate, setRate] = useState(() => getCachedRate(detectFromTimezone().currency));

  useEffect(() => {
    // Clear any stale cached values from previous implementations
    try { localStorage.removeItem('user_currency_v3'); } catch { /* ignore */ }

    const id = setInterval(() => {
      const fresh = detectFromTimezone();
      setDetected(prev => prev.timezone !== fresh.timezone ? fresh : prev);
    }, 2000);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetchExchangeRate(detected.currency).then(setRate);
  }, [detected.currency]);

  return (
    <CurrencyContext.Provider value={{ ...detected, rate }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
};
