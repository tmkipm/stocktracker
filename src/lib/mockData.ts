import { StockTimeSeriesData } from './api';

// Common tech stocks
const STOCK_LIST = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 188.63 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 425.22 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 164.97 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 182.15 },
  { symbol: 'META', name: 'Meta Platforms Inc.', price: 478.22 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 175.15 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 95.36 },
  { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', price: 158.38 },
  { symbol: 'INTC', name: 'Intel Corporation', price: 31.09 },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 640.63 },
  { symbol: 'DIS', name: 'The Walt Disney Company', price: 114.46 },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.', price: 61.85 },
  { symbol: 'CRM', name: 'Salesforce Inc.', price: 293.60 },
  { symbol: 'IBM', name: 'International Business Machines', price: 171.42 },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.', price: 48.51 },
  { symbol: 'ORCL', name: 'Oracle Corporation', price: 126.33 },
  { symbol: 'ADBE', name: 'Adobe Inc.', price: 503.97 },
  { symbol: 'QCOM', name: 'Qualcomm Inc.', price: 168.60 }
];

// Return stock data for search
export function searchStocks(query: string): any[] {
  const lowerQuery = query.toLowerCase();
  return STOCK_LIST
    .filter(stock => 
      stock.symbol.toLowerCase().includes(lowerQuery) || 
      stock.name.toLowerCase().includes(lowerQuery)
    )
    .map(stock => ({
      '1. symbol': stock.symbol,
      '2. name': stock.name,
      '3. type': 'Equity',
      '4. region': 'United States',
      '5. marketOpen': '09:30',
      '6. marketClose': '16:00',
      '7. timezone': 'UTC-04',
      '8. currency': 'USD',
      '9. matchScore': '1.0000'
    }));
}

// Generate realistic stock time series data
export function generateStockTimeSeries(symbol: string, days: number = 365): StockTimeSeriesData[] {
  // Find the base price for the symbol, or use a default
  const stockInfo = STOCK_LIST.find(s => s.symbol === symbol);
  const basePrice = stockInfo ? stockInfo.price : 100;
  
  const data: StockTimeSeriesData[] = [];
  const today = new Date();
  
  // Volatility parameters
  const dailyVolatility = 0.015; // 1.5% daily volatility
  const trendStrength = 0.001; // Slight upward trend
  
  // Start with the base price
  let currentPrice = basePrice;
  
  // Generate data points going backward from today
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Skip weekends (Saturday and Sunday)
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }
    
    // Random daily movement with slight trend
    const randomMovement = (Math.random() * 2 - 1) * dailyVolatility;
    const trendMovement = Math.random() * trendStrength;
    const dailyChange = currentPrice * (randomMovement + trendMovement);
    
    // Calculate other data points
    const open = currentPrice;
    const close = open + dailyChange;
    const high = Math.max(open, close) * (1 + Math.random() * 0.005); // 0.5% above max
    const low = Math.min(open, close) * (1 - Math.random() * 0.005); // 0.5% below min
    const volume = Math.floor(Math.random() * 10000000) + 1000000; // Random volume
    
    // Push the data point
    data.push({
      date: date.toISOString().split('T')[0], // YYYY-MM-DD format
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: volume
    });
    
    // Update the current price for the next iteration
    currentPrice = close;
  }
  
  // Sort by date ascending
  return data.sort((a, b) => a.date.localeCompare(b.date));
}

// Get stock time series data with random data generation
export function getStockTimeSeries(
  symbol: string, 
  interval: 'daily' | 'weekly' | 'monthly' = 'daily',
  outputsize: 'compact' | 'full' = 'compact'
): Promise<StockTimeSeriesData[]> {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      const days = outputsize === 'full' ? 365 : 100;
      const data = generateStockTimeSeries(symbol, days);
      
      // If interval is weekly or monthly, aggregate the data
      if (interval === 'weekly' || interval === 'monthly') {
        const aggregatedData = aggregateData(data, interval);
        resolve(aggregatedData);
      } else {
        resolve(data);
      }
    }, 500); // 500ms simulated delay
  });
}

// Aggregate daily data to weekly or monthly
function aggregateData(
  data: StockTimeSeriesData[], 
  interval: 'weekly' | 'monthly'
): StockTimeSeriesData[] {
  const aggregated: StockTimeSeriesData[] = [];
  const groupedData: { [key: string]: StockTimeSeriesData[] } = {};
  
  // Group data by week or month
  data.forEach(day => {
    const date = new Date(day.date);
    let key: string;
    
    if (interval === 'weekly') {
      // Get the Monday of the week
      const dayOfWeek = date.getDay();
      const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(date);
      monday.setDate(diff);
      key = monday.toISOString().split('T')[0];
    } else {
      // Get the first day of the month
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
    }
    
    if (!groupedData[key]) {
      groupedData[key] = [];
    }
    
    groupedData[key].push(day);
  });
  
  // Calculate aggregated values for each period
  Object.keys(groupedData).forEach(key => {
    const period = groupedData[key];
    const open = period[0].open;
    const close = period[period.length - 1].close;
    const high = Math.max(...period.map(d => d.high));
    const low = Math.min(...period.map(d => d.low));
    const volume = period.reduce((sum, d) => sum + d.volume, 0);
    
    aggregated.push({
      date: key,
      open,
      high,
      low,
      close,
      volume
    });
  });
  
  // Sort by date
  return aggregated.sort((a, b) => a.date.localeCompare(b.date));
}

// Get a stock quote for the current price
export function getStockQuote(symbol: string): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const stockInfo = STOCK_LIST.find(s => s.symbol === symbol);
      const basePrice = stockInfo ? stockInfo.price : 100;
      
      // Add some random movement
      const changePercent = (Math.random() * 6 - 3) / 100; // -3% to +3%
      const change = basePrice * changePercent;
      const price = basePrice + change;
      
      resolve({
        symbol: symbol,
        open: (price * 0.99).toFixed(2),
        high: (price * 1.01).toFixed(2),
        low: (price * 0.98).toFixed(2),
        price: price.toFixed(2),
        volume: Math.floor(Math.random() * 10000000) + 1000000,
        latestTradingDay: new Date().toISOString().split('T')[0],
        previousClose: (price - (price * (Math.random() * 0.02 - 0.01))).toFixed(2),
        change: change.toFixed(2),
        changePercent: `${(changePercent * 100).toFixed(2)}%`
      });
    }, 300);
  });
} 