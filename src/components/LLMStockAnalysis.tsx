'use client';

import React from 'react';
import { LLMPredictionResult } from '@/lib/llm-prediction';
import { FiTrendingUp, FiTrendingDown, FiMinus, FiAlertTriangle, FiCheckCircle, FiEye, FiHelpCircle } from 'react-icons/fi';

interface LLMStockAnalysisProps {
  prediction: LLMPredictionResult;
  symbol: string;
  currentPrice: number;
}

export default function LLMStockAnalysis({ prediction, symbol, currentPrice }: LLMStockAnalysisProps) {
  // Helper function to get the appropriate icon and color for sentiment
  const getSentimentDetails = () => {
    switch (prediction.marketSentiment.toLowerCase()) {
      case 'bullish':
        return {
          icon: <FiTrendingUp className="text-success text-xl" />,
          color: 'text-success',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'bearish':
        return {
          icon: <FiTrendingDown className="text-danger text-xl" />,
          color: 'text-danger',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: <FiMinus className="text-warning text-xl" />,
          color: 'text-warning',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
    }
  };

  // Helper function to get action icon
  const getActionIcon = () => {
    switch (prediction.suggestedAction) {
      case 'buy':
        return <FiTrendingUp className="text-success text-xl" />;
      case 'sell':
        return <FiTrendingDown className="text-danger text-xl" />;
      case 'hold':
        return <FiCheckCircle className="text-primary-600 text-xl" />;
      case 'watch':
        return <FiEye className="text-warning text-xl" />;
      default:
        return <FiEye className="text-gray-600 text-xl" />;
    }
  };

  // Helper function to get risk level styling
  const getRiskStyle = () => {
    switch (prediction.riskAssessment.toLowerCase()) {
      case 'high':
        return 'text-danger';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-success';
      default:
        return 'text-gray-600';
    }
  };

  // Helper function to explain what the sentiment means
  const explainSentiment = () => {
    switch (prediction.marketSentiment.toLowerCase()) {
      case 'bullish':
        return 'A bullish sentiment suggests the market expects this stock to rise in value. This is often based on positive fundamentals, technical indicators, or broader market conditions.';
      case 'bearish':
        return 'A bearish sentiment suggests the market expects this stock to fall in value. This could be due to concerning fundamentals, negative technical patterns, or broader market weaknesses.';
      case 'neutral':
        return 'A neutral sentiment suggests the market is balanced between positive and negative outlooks. The stock may trade sideways or follow broader market trends.';
      default:
        return 'This represents the overall market attitude toward this stock based on current data and trends.';
    }
  };

  // Helper function to explain the suggested action
  const explainAction = () => {
    switch (prediction.suggestedAction) {
      case 'buy':
        return 'The AI suggests considering a purchase based on positive indicators and outlook.';
      case 'sell':
        return 'The AI suggests considering selling based on negative indicators and outlook.';
      case 'hold':
        return 'The AI suggests maintaining current positions without adding or reducing.';
      case 'watch':
        return 'The AI suggests monitoring this stock for better entry points or more clarity.';
      default:
        return 'The AI recommends this action based on current analysis.';
    }
  };

  // Helper function to explain risk assessment
  const explainRisk = () => {
    switch (prediction.riskAssessment.toLowerCase()) {
      case 'high':
        return 'High risk indicates significant volatility or uncertainty. Only suitable for risk-tolerant investors.';
      case 'medium':
        return 'Medium risk indicates moderate volatility with some uncertainty about future movement.';
      case 'low':
        return 'Low risk indicates relatively stable performance with lower expected volatility.';
      default:
        return 'This measures the potential volatility and uncertainty in this stock.';
    }
  };

  const sentimentDetails = getSentimentDetails();
  const nextDayChange = ((prediction.nextDayPrediction - currentPrice) / currentPrice * 100).toFixed(2);
  const nextWeekChange = ((prediction.nextWeekPrediction - currentPrice) / currentPrice * 100).toFixed(2);

  return (
    <div className="card p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">AI Market Analysis for {symbol}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div>
          <div className={`rounded-lg p-4 mb-4 ${sentimentDetails.bgColor} ${sentimentDetails.borderColor} border`}>
            <div className="flex items-center mb-2">
              {sentimentDetails.icon}
              <h4 className={`ml-2 font-semibold ${sentimentDetails.color} capitalize`}>
                {prediction.marketSentiment} Sentiment
              </h4>
              <div className="relative group ml-2">
                <FiHelpCircle className="text-gray-600 cursor-help" />
                <div className="absolute z-10 left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white p-2 rounded text-xs w-64">
                  {explainSentiment()}
                </div>
              </div>
            </div>
            <p className="text-gray-700">{prediction.rationale}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">Next Day Forecast</p>
                <div className="relative group">
                  <FiHelpCircle className="text-gray-600 cursor-help" />
                  <div className="absolute z-10 right-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white p-2 rounded text-xs w-64">
                    This is the AI's price prediction for the next trading day. It's based on recent price action, indicators, and market sentiment.
                  </div>
                </div>
              </div>
              <p className={`text-lg font-medium ${
                prediction.nextDayPrediction > currentPrice 
                  ? 'text-success' 
                  : 'text-danger'
              }`}>
                ${prediction.nextDayPrediction.toFixed(2)}
                <span className="text-sm ml-1">({nextDayChange}%)</span>
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">Next Week Forecast</p>
                <div className="relative group">
                  <FiHelpCircle className="text-gray-600 cursor-help" />
                  <div className="absolute z-10 right-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white p-2 rounded text-xs w-64">
                    This is the AI's price prediction for one week from now. Longer timeframes naturally have more uncertainty.
                  </div>
                </div>
              </div>
              <p className={`text-lg font-medium ${
                prediction.nextWeekPrediction > currentPrice 
                  ? 'text-success' 
                  : 'text-danger'
              }`}>
                ${prediction.nextWeekPrediction.toFixed(2)}
                <span className="text-sm ml-1">({nextWeekChange}%)</span>
              </p>
            </div>
          </div>
          
          <div className="flex justify-between items-center bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              {getActionIcon()}
              <div className="ml-3">
                <div className="flex items-center">
                  <p className="text-sm text-gray-700">Suggested Action</p>
                  <div className="relative group ml-2">
                    <FiHelpCircle className="text-gray-600 cursor-help" />
                    <div className="absolute z-10 left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white p-2 rounded text-xs w-64">
                      {explainAction()}
                    </div>
                  </div>
                </div>
                <p className="font-medium capitalize">{prediction.suggestedAction}</p>
              </div>
            </div>
            <div>
              <div className="flex items-center">
                <p className="text-sm text-gray-700">Risk Level</p>
                <div className="relative group ml-2">
                  <FiHelpCircle className="text-gray-600 cursor-help" />
                  <div className="absolute z-10 right-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white p-2 rounded text-xs w-64">
                    {explainRisk()}
                  </div>
                </div>
              </div>
              <p className={`font-medium capitalize ${getRiskStyle()}`}>
                {prediction.riskAssessment}
              </p>
            </div>
          </div>
        </div>
        
        {/* Right column */}
        <div>
          <div className="flex items-center mb-3">
            <h4 className="font-medium">Key Factors</h4>
            <div className="relative group ml-2">
              <FiHelpCircle className="text-gray-600 cursor-help" />
              <div className="absolute z-10 left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white p-2 rounded text-xs w-64">
                These are the main drivers the AI has identified as influencing this stock's current and future performance.
              </div>
            </div>
          </div>
          <ul className="space-y-2">
            {prediction.keyFactors.map((factor, index) => (
              <li key={index} className="flex items-start">
                <FiAlertTriangle className="text-warning mt-1 mr-2 flex-shrink-0" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Understanding This Analysis</h4>
            <p className="text-sm text-gray-700 mb-3">
              This AI-powered analysis is based on historical data and market patterns. 
              While our model aims to provide accurate predictions, stock markets are inherently volatile.
              Always consider the risk level and conduct your own research before making investment decisions.
            </p>
            <div className="text-xs text-gray-600 space-y-1">
              <p><span className="font-medium">Data Source:</span> Historical stock prices and patterns</p>
              <p><span className="font-medium">Analysis Method:</span> Large language model with technical and fundamental context</p>
              <p><span className="font-medium">Refresh Rate:</span> Predictions update when new market data is available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 