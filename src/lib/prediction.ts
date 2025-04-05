import { StockTimeSeriesData } from './api';

export interface PredictionResult {
  dates: string[];
  actual: number[];
  predicted: number[];
  nextDayPrediction: number;
  nextWeekPrediction: number;
  confidence: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  supportLevel: number;
  resistanceLevel: number;
}

// Simple moving average
function calculateSMA(data: number[], window: number): number[] {
  const result = [];
  for (let i = window - 1; i < data.length; i++) {
    const windowSlice = data.slice(i - window + 1, i + 1);
    const sum = windowSlice.reduce((acc, val) => acc + val, 0);
    result.push(sum / window);
  }
  return result;
}

// Exponential moving average
function calculateEMA(data: number[], window: number): number[] {
  const k = 2 / (window + 1);
  const emaData = [data[0]];
  
  for (let i = 1; i < data.length; i++) {
    emaData.push(data[i] * k + emaData[i - 1] * (1 - k));
  }
  
  return emaData;
}

// Relative Strength Index
function calculateRSI(data: number[], window: number = 14): number[] {
  const deltas = [];
  for (let i = 1; i < data.length; i++) {
    deltas.push(data[i] - data[i - 1]);
  }
  
  const gains = deltas.map(d => d > 0 ? d : 0);
  const losses = deltas.map(d => d < 0 ? Math.abs(d) : 0);
  
  const avgGain = calculateSMA(gains, window);
  const avgLoss = calculateSMA(losses, window);
  
  const rs = avgGain.map((gain, i) => gain / (avgLoss[i] || 0.001)); // Avoid division by zero
  const rsi = rs.map(rs => 100 - (100 / (1 + rs)));
  
  // Pad with nulls to match original data length
  const paddedRsi = Array(window).fill(null).concat(rsi);
  return paddedRsi;
}

// Simple Linear Regression for prediction
function linearRegression(xValues: number[], yValues: number[], predict: number): number {
  const n = xValues.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += xValues[i];
    sumY += yValues[i];
    sumXY += xValues[i] * yValues[i];
    sumXX += xValues[i] * xValues[i];
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return slope * predict + intercept;
}

// ARIMA-inspired prediction (simplified)
function arimaInspiredPrediction(data: number[], daysToPredict: number): number[] {
  const predictions = [];
  const window = 5; // AR window size
  
  // Create differenced series
  const differenced = [];
  for (let i = 1; i < data.length; i++) {
    differenced.push(data[i] - data[i - 1]);
  }
  
  // Predict future differences using simple AR model
  for (let i = 0; i < daysToPredict; i++) {
    const xValues = Array.from({ length: window }, (_, j) => j + 1);
    const startIdx = differenced.length - window;
    const yValues = differenced.slice(startIdx);
    
    // Predict next difference
    const nextDiff = linearRegression(xValues, yValues, window + 1);
    differenced.push(nextDiff);
    
    // Convert back to original scale
    const nextVal = data[data.length - 1 + i] + nextDiff;
    predictions.push(nextVal);
    
    // Add the prediction to the data for multi-step forecasting
    data.push(nextVal);
  }
  
  return predictions;
}

// Find support and resistance levels
function findSupportResistance(data: number[]): { support: number; resistance: number } {
  const sorted = [...data].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  
  return {
    support: sorted[q1Index],
    resistance: sorted[q3Index]
  };
}

// Determine trend based on recent price movement
function determineTrend(data: number[]): 'bullish' | 'bearish' | 'neutral' {
  const recentDays = 10; // Last 10 days
  const recent = data.slice(-recentDays);
  
  const startPrice = recent[0];
  const endPrice = recent[recent.length - 1];
  const percentChange = (endPrice - startPrice) / startPrice * 100;
  
  if (percentChange > 3) return 'bullish';
  if (percentChange < -3) return 'bearish';
  return 'neutral';
}

// Calculate confidence level based on model stability
function calculateConfidence(actual: number[], predicted: number[]): number {
  if (predicted.length === 0 || actual.length < 10) return 0.5;
  
  // Use simple metrics as proxy for confidence
  const mse = predicted.reduce((sum, pred, i) => {
    const error = pred - actual[i];
    return sum + (error * error);
  }, 0) / predicted.length;
  
  // Convert MSE to a confidence score between 0 and 1
  const maxMSE = Math.pow(actual[actual.length - 1] * 0.2, 2); // 20% error is max
  const confidence = Math.max(0, Math.min(1, 1 - (mse / maxMSE)));
  
  return confidence;
}

export function predictStockPrices(stockData: StockTimeSeriesData[]): PredictionResult {
  if (!stockData || stockData.length < 30) {
    throw new Error('Insufficient data for prediction. Need at least 30 data points.');
  }
  
  // Extract closing prices and dates
  const closePrices = stockData.map(item => item.close);
  const dates = stockData.map(item => item.date);
  
  // Calculate technical indicators
  const sma20 = calculateSMA(closePrices, 20);
  const ema12 = calculateEMA(closePrices, 12);
  const ema26 = calculateEMA(closePrices, 26);
  const rsi = calculateRSI(closePrices);
  
  // Calculate MACD
  const macd = ema12.map((ema12Val, i) => ema12Val - ema26[i]);
  
  // Generate predicted values for historical comparison
  const trainingWindow = 20; // Use 20 days for training
  let predictedValues: number[] = [];
  
  for (let i = trainingWindow; i < closePrices.length; i++) {
    const trainingData = closePrices.slice(i - trainingWindow, i);
    const xValues = Array.from({ length: trainingWindow }, (_, j) => j + 1);
    const predicted = linearRegression(xValues, trainingData, trainingWindow + 1);
    predictedValues.push(predicted);
  }
  
  // Pad with nulls for display alignment
  predictedValues = Array(trainingWindow).fill(null).concat(predictedValues);
  
  // Get future predictions
  const nextDayPrediction = arimaInspiredPrediction(closePrices, 1)[0];
  const nextWeekPrediction = arimaInspiredPrediction(closePrices, 7)[6];
  
  // Support and resistance
  const { support, resistance } = findSupportResistance(closePrices);
  
  // Trend analysis
  const trend = determineTrend(closePrices);
  
  // Calculate confidence
  const nonNullPredicted = predictedValues.filter(p => p !== null) as number[];
  const actual = closePrices.slice(-nonNullPredicted.length);
  const confidence = calculateConfidence(actual, nonNullPredicted);
  
  return {
    dates,
    actual: closePrices,
    predicted: predictedValues,
    nextDayPrediction,
    nextWeekPrediction,
    confidence,
    trend,
    supportLevel: support,
    resistanceLevel: resistance
  };
} 