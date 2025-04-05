import axios from 'axios';

// Use Alpha Vantage as our stock API
// You'll need to sign up for a free API key at https://www.alphavantage.co/
const API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

// Log the API key (masked) to help with debugging
console.log(`Alpha Vantage API Key configured: ${API_KEY ? 'Yes (ending with ' + API_KEY.slice(-4) + ')' : 'No'}`);

export interface StockQuote {
  symbol: string;
  open: number;
  high: number;
  low: number;
  price: number;
  volume: number;
  latestTradingDay: string;
  previousClose: number;
  change: number;
  changePercent: string;
}

export interface StockTimeSeriesData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Helper function to check if the API response indicates a rate limit error
function checkForRateLimitError(data: any): boolean {
  if (data && typeof data === 'object') {
    const note = data.Note || data.Information || '';
    if (typeof note === 'string' && 
        (note.includes('API call frequency') || 
         note.includes('rate limit') || 
         note.includes('API key') || 
         note.includes('limit is 25'))) {
      return true;
    }
  }
  return false;
}

export async function getStockQuote(symbol: string): Promise<StockQuote> {
  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: API_KEY,
      },
    });

    const data = response.data;
    
    // Check for rate limit error
    if (checkForRateLimitError(data)) {
      throw new Error('Alpha Vantage API rate limit reached. The free tier is limited to 25 requests per day.');
    }
    
    const quoteData = data['Global Quote'];
    
    if (!quoteData || Object.keys(quoteData).length === 0) {
      throw new Error('No data found for this symbol');
    }
    
    return {
      symbol: quoteData['01. symbol'],
      open: parseFloat(quoteData['02. open']),
      high: parseFloat(quoteData['03. high']),
      low: parseFloat(quoteData['04. low']),
      price: parseFloat(quoteData['05. price']),
      volume: parseInt(quoteData['06. volume'], 10),
      latestTradingDay: quoteData['07. latest trading day'],
      previousClose: parseFloat(quoteData['08. previous close']),
      change: parseFloat(quoteData['09. change']),
      changePercent: quoteData['10. change percent'],
    };
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    throw error;
  }
}

export async function getStockTimeSeries(
  symbol: string, 
  interval: 'daily' | 'weekly' | 'monthly' = 'daily',
  outputsize: 'compact' | 'full' = 'compact'
): Promise<StockTimeSeriesData[]> {
  try {
    const functionName = interval === 'daily' 
      ? 'TIME_SERIES_DAILY' 
      : interval === 'weekly' 
        ? 'TIME_SERIES_WEEKLY' 
        : 'TIME_SERIES_MONTHLY';
    
    console.log(`Making Alpha Vantage API request for ${symbol} (${functionName})`);
    
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        function: functionName,
        symbol,
        outputsize,
        apikey: API_KEY,
      },
    });

    const data = response.data;
    
    // Debug output to check the response
    console.log(`API response for ${symbol}:`, 
      data.Note || data.Information || 
      (data['Time Series (Daily)'] ? 'Success (got time series data)' : 'Unexpected response format')
    );
    
    // Check for rate limit error
    if (checkForRateLimitError(data)) {
      throw new Error('Alpha Vantage API rate limit reached. The free tier is limited to 25 requests per day.');
    }
    
    const timeSeriesKey = interval === 'daily' 
      ? 'Time Series (Daily)' 
      : interval === 'weekly' 
        ? 'Weekly Time Series' 
        : 'Monthly Time Series';
    
    const timeSeries = data[timeSeriesKey];
    
    if (!timeSeries || Object.keys(timeSeries).length === 0) {
      throw new Error('No time series data found for this symbol');
    }
    
    return Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume'], 10),
    })).reverse();
  } catch (error) {
    console.error('Error fetching stock time series:', error);
    throw error;
  }
}

export async function searchStocks(keywords: string): Promise<any[]> {
  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords,
        apikey: API_KEY,
      },
    });
    
    const data = response.data;
    
    // Check for rate limit error
    if (checkForRateLimitError(data)) {
      throw new Error('Alpha Vantage API rate limit reached. The free tier is limited to 25 requests per day.');
    }
    
    return data.bestMatches || [];
  } catch (error) {
    console.error('Error searching stocks:', error);
    throw error;
  }
} 