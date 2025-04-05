'use client';

import React, { useState, useEffect } from 'react';
import { StockTimeSeriesData } from '@/lib/api';
import { predictStockPrices, PredictionResult } from '@/lib/prediction';
import { generateLLMPrediction, LLMPredictionResult } from '@/lib/llm-prediction';
import { calculateAllIndicators, TechnicalIndicators } from '@/lib/technical-indicators';
import StockPrediction from './StockPrediction';
import LLMStockAnalysis from './LLMStockAnalysis';
import TechnicalIndicatorsChart from './TechnicalIndicatorsChart';

type PredictionTab = 'technical' | 'ai' | 'indicators';

interface PredictionTabsProps {
  symbol: string;
  data: StockTimeSeriesData[];
}

export default function PredictionTabs({ symbol, data }: PredictionTabsProps) {
  const [activeTab, setActiveTab] = useState<PredictionTab>('technical');
  const [technicalPrediction, setTechnicalPrediction] = useState<PredictionResult | null>(null);
  const [llmPrediction, setLlmPrediction] = useState<LLMPredictionResult | null>(null);
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicators | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Current price from the most recent data point
  const currentPrice = data.length > 0 ? data[data.length - 1].close : 0;
  
  useEffect(() => {
    if (data.length > 0) {
      // Reset state when data changes
      setTechnicalPrediction(null);
      setLlmPrediction(null);
      setTechnicalIndicators(null);
      setError('');
      
      // Load technical prediction on initial render
      loadTechnicalPrediction();
    }
  }, [data, symbol]);
  
  const loadTechnicalPrediction = () => {
    try {
      if (data.length < 30) {
        setError('Insufficient data for prediction. Need at least 30 data points.');
        return;
      }
      
      const prediction = predictStockPrices(data);
      setTechnicalPrediction(prediction);
    } catch (err) {
      setError('Failed to generate technical prediction.');
      console.error(err);
    }
  };
  
  const loadLLMPrediction = async () => {
    if (llmPrediction) return; // Don't reload if we already have data
    
    setIsLoading(true);
    setError('');
    
    try {
      if (data.length < 30) {
        throw new Error('Insufficient data for prediction. Need at least 30 data points.');
      }
      
      const prediction = await generateLLMPrediction(symbol, data);
      setLlmPrediction(prediction);
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI prediction.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadTechnicalIndicators = () => {
    if (technicalIndicators) return; // Don't reload if we already have data
    
    try {
      if (data.length < 30) {
        throw new Error('Insufficient data for technical indicators. Need at least 30 data points.');
      }
      
      const indicators = calculateAllIndicators(data);
      setTechnicalIndicators(indicators);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate technical indicators.');
      console.error(err);
    }
  };
  
  const handleTabChange = (tab: PredictionTab) => {
    setActiveTab(tab);
    
    // Load relevant data for the selected tab
    if (tab === 'ai' && !llmPrediction && !isLoading) {
      loadLLMPrediction();
    } else if (tab === 'indicators' && !technicalIndicators) {
      loadTechnicalIndicators();
    }
  };
  
  return (
    <div className="card mb-6 overflow-hidden">
      <div className="bg-gray-100 px-4 py-2">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'technical'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => handleTabChange('technical')}
          >
            Price Prediction
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'ai'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => handleTabChange('ai')}
          >
            AI Market Analysis
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'indicators'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => handleTabChange('indicators')}
          >
            Technical Indicators
          </button>
        </div>
      </div>
      
      <div className="p-0">
        {error ? (
          <div className="p-6 text-red-600">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {activeTab === 'technical' && technicalPrediction && (
              <StockPrediction prediction={technicalPrediction} symbol={symbol} />
            )}
            
            {activeTab === 'ai' && (
              isLoading ? (
                <div className="p-6 flex justify-center items-center h-64">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mb-2"></div>
                    <p>Generating AI analysis...</p>
                  </div>
                </div>
              ) : llmPrediction ? (
                <LLMStockAnalysis 
                  prediction={llmPrediction} 
                  symbol={symbol} 
                  currentPrice={currentPrice} 
                />
              ) : (
                <div className="p-6 text-center">
                  <p>Click the button below to generate an AI-powered analysis for {symbol}.</p>
                  <button 
                    className="mt-4 btn btn-primary"
                    onClick={loadLLMPrediction}
                  >
                    Generate AI Analysis
                  </button>
                </div>
              )
            )}
            
            {activeTab === 'indicators' && (
              technicalIndicators ? (
                <TechnicalIndicatorsChart 
                  data={data} 
                  indicators={technicalIndicators} 
                  symbol={symbol} 
                />
              ) : (
                <div className="p-6 text-center">
                  <p>Click the button below to generate technical indicators for {symbol}.</p>
                  <button 
                    className="mt-4 btn btn-primary"
                    onClick={loadTechnicalIndicators}
                  >
                    Calculate Technical Indicators
                  </button>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
} 