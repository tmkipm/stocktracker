import { StockTimeSeriesData } from './api';

export interface TechnicalIndicators {
  sma: number[];
  ema: number[];
  macd: {
    line: number[];
    signal: number[];
    histogram: number[];
  };
  rsi: number[];
  bollingerBands: {
    upper: number[];
    middle: number[];
    lower: number[];
  };
  volumes: number[];
  dates: string[];
  adx: number[];
  parabolicSAR: number[];
}

/**
 * Simple Moving Average
 */
export function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
      continue;
    }
    
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j];
    }
    result.push(sum / period);
  }
  
  return result;
}

/**
 * Exponential Moving Average
 */
export function calculateEMA(data: number[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // Start with SMA for the initial EMA
  let ema = data.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
      continue;
    }
    
    if (i === period - 1) {
      result.push(ema);
      continue;
    }
    
    // EMA = Price(t) * k + EMA(y) * (1 - k)
    ema = data[i] * multiplier + ema * (1 - multiplier);
    result.push(ema);
  }
  
  return result;
}

/**
 * Moving Average Convergence Divergence (MACD)
 */
export function calculateMACD(data: number[], fastPeriod = 12, slowPeriod = 26, signalPeriod = 9): {
  line: number[];
  signal: number[];
  histogram: number[];
} {
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  
  const macdLine: number[] = [];
  
  // Calculate MACD line (fastEMA - slowEMA)
  for (let i = 0; i < data.length; i++) {
    if (isNaN(fastEMA[i]) || isNaN(slowEMA[i])) {
      macdLine.push(NaN);
    } else {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }
  }
  
  // Calculate signal line (EMA of MACD line)
  const validMacdLine = macdLine.filter(value => !isNaN(value));
  const signalLine = calculateEMA(validMacdLine, signalPeriod);
  
  // Pad signal line with NaN to match the original data length
  const paddedSignalLine: number[] = Array(data.length).fill(NaN);
  const startIndex = macdLine.findIndex(value => !isNaN(value));
  const signalStartIndex = startIndex + validMacdLine.length - signalLine.length;
  
  for (let i = 0; i < signalLine.length; i++) {
    paddedSignalLine[signalStartIndex + i] = signalLine[i];
  }
  
  // Calculate histogram (MACD line - signal line)
  const histogram: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (isNaN(macdLine[i]) || isNaN(paddedSignalLine[i])) {
      histogram.push(NaN);
    } else {
      histogram.push(macdLine[i] - paddedSignalLine[i]);
    }
  }
  
  return {
    line: macdLine,
    signal: paddedSignalLine,
    histogram: histogram
  };
}

/**
 * Relative Strength Index (RSI)
 */
export function calculateRSI(data: number[], period = 14): number[] {
  const result: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  // Initialize with NaN for the first period values
  for (let i = 0; i < period; i++) {
    result.push(NaN);
  }
  
  // Calculate first average gain and loss
  let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;
  
  // First RSI value
  result.push(100 - (100 / (1 + avgGain / (avgLoss || 0.001)))); // Avoid division by zero
  
  // Calculate remaining RSI values
  for (let i = period + 1; i < data.length; i++) {
    avgGain = ((avgGain * (period - 1)) + gains[i - 1]) / period;
    avgLoss = ((avgLoss * (period - 1)) + losses[i - 1]) / period;
    
    const rs = avgGain / (avgLoss || 0.001); // Avoid division by zero
    result.push(100 - (100 / (1 + rs)));
  }
  
  return result;
}

/**
 * Bollinger Bands
 */
export function calculateBollingerBands(data: number[], period = 20, stdDev = 2): {
  upper: number[];
  middle: number[];
  lower: number[];
} {
  const middle = calculateSMA(data, period);
  const upper: number[] = [];
  const lower: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (isNaN(middle[i])) {
      upper.push(NaN);
      lower.push(NaN);
      continue;
    }
    
    // Calculate standard deviation
    let sum = 0;
    for (let j = 0; j < period; j++) {
      if (i - j < 0) break;
      sum += Math.pow(data[i - j] - middle[i], 2);
    }
    const sd = Math.sqrt(sum / period);
    
    // Calculate upper and lower bands
    upper.push(middle[i] + (stdDev * sd));
    lower.push(middle[i] - (stdDev * sd));
  }
  
  return { upper, middle, lower };
}

/**
 * Average Directional Index (ADX)
 */
export function calculateADX(highs: number[], lows: number[], closes: number[], period = 14): number[] {
  const result: number[] = [];
  const plusDM: number[] = [];
  const minusDM: number[] = [];
  const tr: number[] = [];
  
  // Calculate True Range and Directional Movement
  for (let i = 1; i < closes.length; i++) {
    // True Range
    const tr1 = highs[i] - lows[i];
    const tr2 = Math.abs(highs[i] - closes[i - 1]);
    const tr3 = Math.abs(lows[i] - closes[i - 1]);
    tr.push(Math.max(tr1, tr2, tr3));
    
    // Directional Movement
    const upMove = highs[i] - highs[i - 1];
    const downMove = lows[i - 1] - lows[i];
    
    // +DM
    if (upMove > downMove && upMove > 0) {
      plusDM.push(upMove);
    } else {
      plusDM.push(0);
    }
    
    // -DM
    if (downMove > upMove && downMove > 0) {
      minusDM.push(downMove);
    } else {
      minusDM.push(0);
    }
  }
  
  // Calculate smoothed averages
  const smoothedTR = calculateSmoothedAverage(tr, period);
  const smoothedPlusDM = calculateSmoothedAverage(plusDM, period);
  const smoothedMinusDM = calculateSmoothedAverage(minusDM, period);
  
  // Calculate +DI and -DI
  const plusDI: number[] = [];
  const minusDI: number[] = [];
  
  for (let i = 0; i < smoothedTR.length; i++) {
    plusDI.push((smoothedPlusDM[i] / smoothedTR[i]) * 100);
    minusDI.push((smoothedMinusDM[i] / smoothedTR[i]) * 100);
  }
  
  // Calculate DX
  const dx: number[] = [];
  for (let i = 0; i < plusDI.length; i++) {
    dx.push(
      (Math.abs(plusDI[i] - minusDI[i]) / (plusDI[i] + minusDI[i])) * 100
    );
  }
  
  // Calculate ADX (smoothed DX)
  // Pad with NaN for the first (period * 2 - 1) values
  for (let i = 0; i < period * 2 - 1; i++) {
    result.push(NaN);
  }
  
  let adx = dx.slice(0, period).reduce((sum, val) => sum + val, 0) / period;
  result.push(adx);
  
  for (let i = period; i < dx.length; i++) {
    adx = ((adx * (period - 1)) + dx[i]) / period;
    result.push(adx);
  }
  
  return result;
}

/**
 * Helper function to calculate smoothed average
 */
function calculateSmoothedAverage(data: number[], period: number): number[] {
  const result: number[] = [];
  
  // First value is simple average
  const firstValue = data.slice(0, period).reduce((sum, val) => sum + val, 0) / period;
  result.push(firstValue);
  
  // Calculate remaining values
  for (let i = period; i < data.length; i++) {
    result.push(((result[result.length - 1] * (period - 1)) + data[i]) / period);
  }
  
  return result;
}

/**
 * Parabolic SAR (Stop and Reverse)
 */
export function calculateParabolicSAR(highs: number[], lows: number[], closes: number[], initialAF = 0.02, maxAF = 0.2): number[] {
  const result: number[] = [];
  let isUptrend = closes[1] > closes[0]; // Initial trend
  
  let ep = isUptrend ? highs[0] : lows[0]; // Extreme point
  let sar = isUptrend ? lows[0] : highs[0]; // Initial SAR value
  let af = initialAF; // Acceleration factor
  
  // First SAR value
  result.push(NaN); // Can't calculate for first point
  
  for (let i = 1; i < closes.length; i++) {
    // Calculate SAR for current period
    sar = sar + af * (ep - sar);
    
    // Ensure SAR is below/above prices for uptrend/downtrend
    if (isUptrend) {
      sar = Math.min(sar, lows[i - 1]);
      if (i >= 2) {
        sar = Math.min(sar, lows[i - 2]);
      }
    } else {
      sar = Math.max(sar, highs[i - 1]);
      if (i >= 2) {
        sar = Math.max(sar, highs[i - 2]);
      }
    }
    
    // Add to result
    result.push(sar);
    
    // Check for trend reversal
    const priorTrend = isUptrend;
    if ((isUptrend && lows[i] < sar) || (!isUptrend && highs[i] > sar)) {
      isUptrend = !isUptrend;
      sar = isUptrend ? lows[i] : highs[i];
      ep = isUptrend ? highs[i] : lows[i];
      af = initialAF;
    } else {
      // Update extreme point and acceleration factor
      if (isUptrend && highs[i] > ep) {
        ep = highs[i];
        af = Math.min(af + initialAF, maxAF);
      } else if (!isUptrend && lows[i] < ep) {
        ep = lows[i];
        af = Math.min(af + initialAF, maxAF);
      }
    }
  }
  
  return result;
}

/**
 * Calculate all technical indicators for given stock data
 */
export function calculateAllIndicators(stockData: StockTimeSeriesData[]): TechnicalIndicators {
  const prices = stockData.map(data => data.close);
  const highs = stockData.map(data => data.high);
  const lows = stockData.map(data => data.low);
  const volumes = stockData.map(data => data.volume);
  const dates = stockData.map(data => data.date);
  
  const sma = calculateSMA(prices, 20);
  const ema = calculateEMA(prices, 20);
  const macd = calculateMACD(prices);
  const rsi = calculateRSI(prices);
  const bollingerBands = calculateBollingerBands(prices);
  const adx = calculateADX(highs, lows, prices);
  const parabolicSAR = calculateParabolicSAR(highs, lows, prices);
  
  return {
    sma,
    ema,
    macd,
    rsi,
    bollingerBands,
    volumes,
    dates,
    adx,
    parabolicSAR
  };
} 