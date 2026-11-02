export const FIXED_PRICES = { weekly: 3.99, monthly: 4.99, yearly: 19.99 };

const INTEGER_CURRENCIES = new Set([
  'JPY', 'KRW', 'VND', 'CLP', 'IDR', 'HUF',
  'ARS', 'COP', 'NGN', 'PKR', 'BDT', 'CRC', 'LKR',
]);

export function formatPrice(symbol: string, amount: number, currency: string): string {
  if (INTEGER_CURRENCIES.has(currency) && amount >= 1) {
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }
  return `${symbol}${amount.toFixed(2)}`;
}

const RATE_CACHE_KEY = 'fx_rates_v1';
const RATE_CACHE_TTL = 12 * 60 * 60 * 1000;

export function getCachedRate(currency: string): number {
  if (currency === 'USD') return 1;
  try {
    const cached = localStorage.getItem(RATE_CACHE_KEY);
    if (cached) {
      const { timestamp, rates } = JSON.parse(cached) as { timestamp: number; rates: Record<string, number> };
      if (Date.now() - timestamp < RATE_CACHE_TTL) {
        return rates[currency.toLowerCase()] ?? 1;
      }
    }
  } catch { /* ignore */ }
  return 1;
}

export async function fetchExchangeRate(currency: string): Promise<number> {
  if (currency === 'USD') return 1;

  try {
    const cached = localStorage.getItem(RATE_CACHE_KEY);
    if (cached) {
      const { timestamp, rates } = JSON.parse(cached) as { timestamp: number; rates: Record<string, number> };
      if (Date.now() - timestamp < RATE_CACHE_TTL) {
        const rate = rates[currency.toLowerCase()];
        if (rate !== undefined) return rate;
      }
    }
  } catch { /* ignore */ }

  const urls = [
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
    'https://latest.currency-api.pages.dev/v1/currencies/usd.json',
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json() as { usd: Record<string, number> };
      const rates = data.usd;
      try {
        localStorage.setItem(RATE_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), rates }));
      } catch { /* quota exceeded */ }
      return rates[currency.toLowerCase()] ?? 1;
    } catch { /* try next url */ }
  }

  return 1;
}
