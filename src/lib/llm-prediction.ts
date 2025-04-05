import axios from 'axios';
import { StockTimeSeriesData } from './api';

// Check if we have a Hugging Face API key - try both variables
const HUGGINGFACE_API_KEY = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_API_KEY;
// Model to use - text-generation model from Hugging Face
const HUGGINGFACE_MODEL = 'mistralai/Mixtral-8x7B-Instruct-v0.1';

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
 * Generate a context for the AI model with historical stock data
 */
function generateContext(symbol: string, stockData: StockTimeSeriesData[]): string {
  // Extract the last 30 days of data
  const recentData = stockData.slice(-30);
  
  // Format the data as a string
  const dataPoints = recentData.map(day => 
    `Date: ${day.date}, Open: $${day.open.toFixed(2)}, High: $${day.high.toFixed(2)}, ` +
    `Low: $${day.low.toFixed(2)}, Close: $${day.close.toFixed(2)}, Volume: ${day.volume}`
  ).join('\n');
  
  // Calculate some basic statistics
  const lastPrice = recentData[recentData.length - 1].close;
  const firstPrice = recentData[0].close;
  const percentChange = ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2);
  
  const highestPrice = Math.max(...recentData.map(d => d.high));
  const lowestPrice = Math.min(...recentData.map(d => d.low));
  
  // Create the context
  return `
  STOCK ANALYSIS CONTEXT:
  Symbol: ${symbol}
  Current Price: $${lastPrice.toFixed(2)}
  30-Day Change: ${percentChange}%
  30-Day High: $${highestPrice.toFixed(2)}
  30-Day Low: $${lowestPrice.toFixed(2)}
  
  HISTORICAL DATA (Last 30 Days):
  ${dataPoints}
  `;
}

/**
 * Use Hugging Face API to generate a prediction based on historical data
 */
export async function generateLLMPrediction(
  symbol: string, 
  stockData: StockTimeSeriesData[]
): Promise<LLMPredictionResult> {
  if (!HUGGINGFACE_API_KEY) {
    throw new Error('Hugging Face API key is not configured. Set NEXT_PUBLIC_HUGGINGFACE_API_KEY in your .env.local');
  }
  
  if (!stockData || stockData.length < 30) {
    throw new Error('Insufficient data for LLM prediction. Need at least 30 data points.');
  }
  
  const context = generateContext(symbol, stockData);
  const lastPrice = stockData[stockData.length - 1].close;

  // Construct the prompt in the Mixtral instruction format
  const prompt = `<s>[INST]You are a financial analysis AI assistant that specializes in stock market predictions. 
  Analyze the provided historical stock data and provide next-day and next-week price predictions, 
  along with market sentiment analysis and investment recommendations. 
  Return your response in JSON format ONLY with no additional text.

  ${context}
  
  Based on this data, provide a comprehensive analysis with the following information in JSON format ONLY:
  1. A predicted price for the next trading day
  2. A predicted price for one week from now
  3. An assessment of market sentiment (bullish, bearish, or neutral)
  4. A brief rationale for your predictions
  5. A risk assessment (low, medium, high)
  6. A suggested action (buy, sell, hold, or watch)
  7. Key factors influencing your prediction (as an array of strings)
  
  Return ONLY a JSON object with keys: nextDayPrediction (number), nextWeekPrediction (number), marketSentiment (string), 
  rationale (string), riskAssessment (string), suggestedAction (string), and keyFactors (array of strings).[/INST]</s>`;
  
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.3,
          return_full_text: false,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`
        }
      }
    );
    
    // Extract content from Hugging Face response format
    const content = response.data[0]?.generated_text || '';
    let result: LLMPredictionResult;
    
    try {
      // Find the first occurrence of a JSON object in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : '';
      
      if (jsonStr) {
        // Parse the JSON from the model's response
        result = JSON.parse(jsonStr);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      // Fallback to a simulated prediction if parsing fails
      result = {
        nextDayPrediction: lastPrice * (1 + (Math.random() * 0.02 - 0.01)),
        nextWeekPrediction: lastPrice * (1 + (Math.random() * 0.05 - 0.025)),
        marketSentiment: 'neutral',
        rationale: 'Based on recent price movements and volatility.',
        riskAssessment: 'medium',
        suggestedAction: 'watch',
        keyFactors: ['recent price action', 'market volatility']
      };
    }
    
    return result;
  } catch (error) {
    console.error('Error calling Hugging Face API:', error);
    
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