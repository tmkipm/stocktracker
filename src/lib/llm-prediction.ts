import axios from 'axios';
import { StockTimeSeriesData } from './api';

// This function will now call the server-side API endpoint instead of calling Hugging Face directly
export interface LLMPredictionResult {
  nextDayPrediction: number;
  nextWeekPrediction: number;
  marketSentiment: string;
  rationale: string;
  riskAssessment: string;
  suggestedAction: 'buy' | 'sell' | 'hold' | 'watch';
  keyFactors: string[];
}

/**
 * Use the server-side API endpoint to get LLM predictions
 */
export async function generateLLMPrediction(
  symbol: string, 
  stockData: StockTimeSeriesData[]
): Promise<LLMPredictionResult> {
  if (!stockData || stockData.length < 30) {
    throw new Error('Insufficient data for LLM prediction. Need at least 30 data points.');
  }
  
  const lastPrice = stockData[stockData.length - 1].close;

  try {
    // Call our secure server-side API endpoint
    const response = await axios.post('/api/huggingface', {
      symbol,
      stockData
    });
    
    return response.data;
  } catch (error) {
    console.error('Error calling prediction API:', error);
    
    // Return simulated prediction if API call fails
    return {
      nextDayPrediction: lastPrice * (1 + (Math.random() * 0.02 - 0.01)),
      nextWeekPrediction: lastPrice * (1 + (Math.random() * 0.05 - 0.025)),
      marketSentiment: 'neutral',
      rationale: 'Unable to generate AI prediction. This is a fallback prediction.',
      riskAssessment: 'medium',
      suggestedAction: 'watch',
      keyFactors: ['API error', 'fallback prediction']
    };
  }
} 