import { StockTimeSeriesData } from './api';

interface CachedStockData {
  data: StockTimeSeriesData[];
  timestamp: number;
  symbol: string;
}

// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 60 * 60 * 1000;

// Maximum API calls per day allowed by free tier
const MAX_DAILY_CALLS = 25;

/**
 * Clear all API tracking data and cache refresh timestamps
 * Use this for troubleshooting
 */
export function clearAllApiTracking(): void {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    localStorage.removeItem(`api_calls_${today}`);
    localStorage.removeItem('last_cache_refresh');
    console.log('API tracking data cleared');
  } catch (error) {
    console.error('Error clearing API tracking data:', error);
  }
}

/**
 * Get cached stock data if it exists and is not stale
 */
export function getCachedStockData(symbol: string): StockTimeSeriesData[] | null {
  try {
    const cacheKey = `stock_data_${symbol}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (!cachedData) {
      console.log(`No cached data found for ${symbol}`);
      return null;
    }
    
    const parsedCache: CachedStockData = JSON.parse(cachedData);
    const now = Date.now();
    
    // Check if cache is still valid (less than 1 hour old)
    if (now - parsedCache.timestamp < CACHE_DURATION) {
      console.log(`Using cached data for ${symbol} (${Math.round((now - parsedCache.timestamp) / 60000)} minutes old)`);
      return parsedCache.data;
    }
    
    console.log(`Cached data for ${symbol} is stale (${Math.round((now - parsedCache.timestamp) / 60000)} minutes old)`);
    return null;
  } catch (error) {
    console.error('Error retrieving cached stock data:', error);
    return null;
  }
}

/**
 * Save stock data to cache with current timestamp
 */
export function cacheStockData(symbol: string, data: StockTimeSeriesData[]): void {
  try {
    const cacheKey = `stock_data_${symbol}`;
    const cacheData: CachedStockData = {
      data,
      timestamp: Date.now(),
      symbol
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching stock data:', error);
  }
}

/**
 * Get all cached stock symbols
 */
export function getCachedSymbols(): string[] {
  try {
    const symbols: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('stock_data_')) {
        const symbol = key.replace('stock_data_', '');
        symbols.push(symbol);
      }
    }
    
    return symbols;
  } catch (error) {
    console.error('Error getting cached symbols:', error);
    return [];
  }
}

/**
 * Track API calls to prevent exceeding daily limits
 */
export function trackApiCall(): void {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const countKey = `api_calls_${today}`;
    
    const currentCount = localStorage.getItem(countKey);
    const newCount = currentCount ? parseInt(currentCount, 10) + 1 : 1;
    
    localStorage.setItem(countKey, newCount.toString());
    console.log(`API call count for ${today}: ${newCount}/${MAX_DAILY_CALLS}`);
    
    // Set the last refresh time
    localStorage.setItem('last_cache_refresh', Date.now().toString());
  } catch (error) {
    console.error('Error tracking API call:', error);
  }
}

/**
 * Get current API call count for today
 */
export function getApiCallCount(): number {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const countKey = `api_calls_${today}`;
    
    const currentCount = localStorage.getItem(countKey);
    return currentCount ? parseInt(currentCount, 10) : 0;
  } catch (error) {
    console.error('Error getting API call count:', error);
    return 0;
  }
}

/**
 * Checks if it's time to refresh the cache
 */
export function shouldRefreshCache(): boolean {
  try {
    // Don't refresh if we're already near the daily limit
    if (getApiCallCount() >= MAX_DAILY_CALLS - 2) {
      console.warn('Approaching daily API call limit, skipping refresh');
      return false;
    }
    
    const lastRefreshKey = 'last_cache_refresh';
    const lastRefresh = localStorage.getItem(lastRefreshKey);
    
    if (!lastRefresh) {
      // First time, set refresh time and return true
      localStorage.setItem(lastRefreshKey, Date.now().toString());
      return true;
    }
    
    const lastRefreshTime = parseInt(lastRefresh, 10);
    const now = Date.now();
    
    // Check if it's been more than 1 hour since last refresh
    if (now - lastRefreshTime > CACHE_DURATION) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking cache refresh time:', error);
    return false;
  }
} 