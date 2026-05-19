// ============================================
// F1 ANALYTICS OS — EXCHANGE RATE API
// ============================================
// Fetches live currency exchange rates for multi-currency
// sponsorship valuation and global merchandise pricing.

const API_KEY = process.env.EXCHANGE_RATE_API_KEY || "";

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  lastUpdated: string;
}

// Key currencies for F1 markets
const F1_CURRENCIES = ["EUR", "GBP", "JPY", "AUD", "BRL", "AED", "INR", "SGD", "CHF", "CAD", "MXN", "SAR"];

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  if (!API_KEY) return getFallbackRates();

  try {
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) {
      console.error(`Exchange rate API error: ${res.status}`);
      return getFallbackRates();
    }
    const data = await res.json();
    if (data.result !== "success") return getFallbackRates();

    const rates: Record<string, number> = { USD: 1 };
    for (const curr of F1_CURRENCIES) {
      if (data.conversion_rates?.[curr]) {
        rates[curr] = data.conversion_rates[curr];
      }
    }

    return {
      base: "USD",
      rates,
      lastUpdated: data.time_last_update_utc || new Date().toISOString(),
    };
  } catch (err) {
    console.error("Exchange rate fetch error:", err);
    return getFallbackRates();
  }
}

/**
 * Convert USD amount to target currency.
 */
export function convertCurrency(amountUSD: number, targetCurrency: string, rates: ExchangeRates): number {
  const rate = rates.rates[targetCurrency] || 1;
  return Math.round(amountUSD * rate * 100) / 100;
}

/**
 * Get region-specific market sizing with currency conversion.
 */
export function getRegionalMarketData(rates: ExchangeRates) {
  return [
    { region: "Europe", currency: "EUR", rate: rates.rates["EUR"] || 0.92, marketShare: 38, growth: 8.2 },
    { region: "Americas", currency: "USD", rate: 1, marketShare: 28, growth: 12.4 },
    { region: "Middle East", currency: "AED", rate: rates.rates["AED"] || 3.67, marketShare: 14, growth: 22.1 },
    { region: "Asia Pacific", currency: "JPY", rate: rates.rates["JPY"] || 149.5, marketShare: 12, growth: 18.6 },
    { region: "UK", currency: "GBP", rate: rates.rates["GBP"] || 0.79, marketShare: 8, growth: 6.8 },
  ];
}

function getFallbackRates(): ExchangeRates {
  return {
    base: "USD",
    rates: {
      USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, AUD: 1.53,
      BRL: 4.97, AED: 3.67, INR: 83.12, SGD: 1.34, CHF: 0.88,
      CAD: 1.36, MXN: 17.15, SAR: 3.75,
    },
    lastUpdated: new Date().toISOString(),
  };
}
