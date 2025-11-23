import balancesData from "../data/balances.json";

export interface PriceData {
  currency: string;
  date: string;
  price: number;
}

export interface Coin {
  symbol: string;
  name: string;
  valueUSDT: number;
  img: string;
  balance: number;
}

/**
 * Get token icon URL from GitHub Switcheo repository
 * Handles special cases for staked tokens with different casing
 */
const getTokenIconUrl = (currency: string): string => {
  const specialCases: Record<string, string> = {
    "RATOM": "rATOM",
    "STATOM": "stATOM",
    "STDYDX": "stDYDX",
    "STDYM": "stDYM",
    "STETH": "stETH",
    "STEVMOS": "stEVMOS",
    "STOSMO": "stOSMO",
    "STLUNA": "stLUNA",
  };
  
  const fileName = specialCases[currency.toUpperCase()] || currency;
  return `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${fileName}.svg`;
};

/**
 * Fetch cryptocurrency prices from Switcheo API
 */
export const fetchPrices = async (): Promise<PriceData[]> => {
  const response = await fetch("https://interview.switcheo.com/prices.json");
  if (!response.ok) {
    throw new Error("Failed to fetch prices");
  }
  return response.json();
};

/**
 * Fetch all available coins with prices and balances
 * Dynamically creates coins based on currencies from the API
 */
export const fetchCoins = async (): Promise<Coin[]> => {
  const prices = await fetchPrices();
  
  // Group by currency and keep the latest price for each
  const priceMap = new Map<string, PriceData>();
  prices.forEach((price) => {
    const existing = priceMap.get(price.currency);
    
    if (!existing || new Date(price.date).getTime() > new Date(existing.date).getTime()) {
      priceMap.set(price.currency, price);
    }
  });
  
  // Build coins array from unique currencies
  const coins: Coin[] = Array.from(priceMap.entries()).map(([currency, priceData]) => {
    const symbolForDisplay = currency.toUpperCase();
    const balanceKey = symbolForDisplay as keyof typeof balancesData.balances;
    const balance = balancesData.balances[balanceKey] || 0;
    
    return {
      symbol: symbolForDisplay.toLowerCase(),
      name: symbolForDisplay,
      valueUSDT: priceData.price,
      img: getTokenIconUrl(currency),
      balance,
    };
  });
  
  coins.sort((a, b) => a.symbol.localeCompare(b.symbol));
  
  return coins;
};

/**
 * Fetch a specific coin by symbol
 */
export const fetchCoinBySymbol = async (
  symbol: string
): Promise<Coin | undefined> => {
  const coins = await fetchCoins();
  return coins.find((coin) => coin.symbol.toLowerCase() === symbol.toLowerCase());
};

/**
 * Search coins by name or symbol
 */
export const searchCoins = async (searchTerm: string): Promise<Coin[]> => {
  const coins = await fetchCoins();
  const term = searchTerm.toLowerCase();
  return coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(term) ||
      coin.symbol.toLowerCase().includes(term)
  );
};

/**
 * Refresh prices for all coins
 */
export const refreshPrices = async (): Promise<PriceData[]> => {
  return fetchPrices();
};
