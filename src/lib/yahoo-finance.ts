import yahooFinance from 'yahoo-finance2';
import { StockTimeSeriesData } from './api';

interface YahooQuote {
  symbol?: string;
  shortname?: string;
  longname?: string;
  quoteType?: string;
  exchDisp?: string;
  currency?: string;
  [key: string]: any;
}

/**
 * Search for stocks using Yahoo Finance API
 */
export async function searchStocks(query: string): Promise<any[]> {
  try {
    const result = await yahooFinance.search(query);
    return result.quotes.map((quote: YahooQuote) => ({
      '1. symbol': quote.symbol || query.toUpperCase(),
      '2. name': quote.shortname || quote.longname || 'Unknown',
      '3. type': quote.quoteType || 'Equity',
      '4. region': quote.exchDisp || 'United States',
      '5. marketOpen': '09:30',
      '6. marketClose': '16:00',
      '7. timezone': 'UTC-04',
      '8. currency': quote.currency || 'USD',
      '9. matchScore': '1.0000'
    }));
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
}

/**
 * Get historical stock data from Yahoo Finance
 */
export async function getStockTimeSeries(
  symbol: string,
  interval: 'daily' | 'weekly' | 'monthly' = 'daily',
  outputsize: 'compact' | 'full' = 'compact'
): Promise<StockTimeSeriesData[]> {
  try {
    // Map interval to Yahoo Finance period
    const period1 = new Date();
    period1.setFullYear(period1.getFullYear() - (outputsize === 'full' ? 2 : 1));
    
    // Map interval to Yahoo Finance interval
    let yahooInterval = '1d';
    if (interval === 'weekly') yahooInterval = '1wk';
    if (interval === 'monthly') yahooInterval = '1mo';
    
    const result = await yahooFinance.historical(symbol, {
      period1,
      interval: yahooInterval as any,
    });
    
    // Transform Yahoo Finance data to our app's format
    return result.map(item => ({
      date: item.date.toISOString().split('T')[0],
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume
    }));
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    throw new Error(`Failed to fetch data for ${symbol}`);
  }
}

/**
 * Get current stock quote from Yahoo Finance
 */
export async function getStockQuote(symbol: string): Promise<any> {
  try {
    const result = await yahooFinance.quote(symbol);
    
    // Transform Yahoo Finance data to match our expected format
    return {
      symbol: result.symbol,
      open: result.regularMarketOpen || 0,
      high: result.regularMarketDayHigh || 0,
      low: result.regularMarketDayLow || 0,
      price: result.regularMarketPrice || 0,
      volume: result.regularMarketVolume || 0,
      latestTradingDay: new Date().toISOString().split('T')[0],
      previousClose: result.regularMarketPreviousClose || 0,
      change: result.regularMarketChange || 0,
      changePercent: `${((result.regularMarketChangePercent || 0)).toFixed(2)}%`
    };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    throw new Error(`Failed to fetch quote for ${symbol}`);
  }
}

/**
 * Get company profile information
 */
export async function getCompanyProfile(symbol: string): Promise<any> {
  try {
    const result = await yahooFinance.quoteSummary(symbol, {
      modules: ['assetProfile', 'summaryProfile', 'financialData', 'summaryDetail', 'price']
    });
    
    return {
      companyName: result.price?.shortName || '',
      description: result.assetProfile?.longBusinessSummary || '',
      sector: result.assetProfile?.sector || '',
      industry: result.assetProfile?.industry || '',
      website: result.assetProfile?.website || '',
      marketCap: result.summaryDetail?.marketCap || 0,
      peRatio: result.summaryDetail?.trailingPE || 0,
      targetPrice: result.financialData?.targetMeanPrice || 0
    };
  } catch (error) {
    console.error(`Error fetching company profile for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get recommended stocks based on current symbol
 */
export async function getRecommendations(symbol: string): Promise<any[]> {
  try {
    const result = await yahooFinance.recommendationsBySymbol(symbol);
    return result.recommendedSymbols || [];
  } catch (error) {
    console.error(`Error fetching recommendations for ${symbol}:`, error);
    return [];
  }
}

/**
 * Get company news
 */
export async function getCompanyNews(symbol: string): Promise<any[]> {
  try {
    // Note: Yahoo Finance doesn't have a direct news API
    // This is a placeholder - in a real implementation, you might
    // need to use a different API for news
    return [];
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    return [];
  }
} 