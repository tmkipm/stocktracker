'use client';

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ReferenceArea 
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { PredictionResult } from '@/lib/prediction';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

interface StockPredictionProps {
  prediction: PredictionResult;
  symbol: string;
}

export default function StockPrediction({ prediction, symbol }: StockPredictionProps) {
  // Combine actual and predicted data for the chart
  const chartData = prediction.dates.map((date, i) => ({
    date,
    actual: prediction.actual[i],
    predicted: prediction.predicted[i]
  }));

  // Add future predictions
  const today = new Date();
  const nextDay = new Date(today);
  nextDay.setDate(today.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  // Add future predictions to chart data
  chartData.push({
    date: format(nextDay, 'yyyy-MM-dd'),
    actual: null,
    predicted: prediction.nextDayPrediction
  });
  
  chartData.push({
    date: format(nextWeek, 'yyyy-MM-dd'),
    actual: null,
    predicted: prediction.nextWeekPrediction
  });

  // Confidence as percentage
  const confidencePercentage = Math.round(prediction.confidence * 100);

  // Format trend indicator
  const getTrendIndicator = () => {
    switch (prediction.trend) {
      case 'bullish':
        return <FiTrendingUp className="text-success text-xl" />;
      case 'bearish':
        return <FiTrendingDown className="text-danger text-xl" />;
      default:
        return <FiMinus className="text-warning text-xl" />;
    }
  };

  // Format tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      let formattedDate;
      try {
        formattedDate = format(parseISO(label), 'MMM d, yyyy');
      } catch (e) {
        formattedDate = label;
      }

      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{formattedDate}</p>
          {payload[0].value !== null && (
            <p className="text-primary-600">
              Actual: ${payload[0].value?.toFixed(2)}
            </p>
          )}
          {payload[1].value !== null && (
            <p className="text-success">
              Predicted: ${payload[1].value?.toFixed(2)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card p-4">
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-2">{symbol} Price Prediction</h3>
        <div className="flex flex-col sm:flex-row justify-between">
          <div className="mb-2 sm:mb-0">
            <div className="flex items-center">
              <div className="mr-2">
                {getTrendIndicator()}
              </div>
              <div>
                <p className="font-medium">Trend: <span className="capitalize">{prediction.trend}</span></p>
                <p className="text-sm text-gray-600">Prediction confidence: {confidencePercentage}%</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Next Day</p>
              <p className={`text-lg font-medium ${
                prediction.nextDayPrediction > prediction.actual[prediction.actual.length - 1] 
                  ? 'text-success' 
                  : 'text-danger'
              }`}>
                ${prediction.nextDayPrediction.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Next Week</p>
              <p className={`text-lg font-medium ${
                prediction.nextWeekPrediction > prediction.actual[prediction.actual.length - 1] 
                  ? 'text-success' 
                  : 'text-danger'
              }`}>
                ${prediction.nextWeekPrediction.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => {
                try {
                  return format(parseISO(date), 'MM/dd');
                } catch (e) {
                  return date;
                }
              }}
              interval={Math.max(Math.floor(chartData.length / 10), 1)}
            />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#0284c7" 
              name="Actual Price" 
              strokeWidth={2} 
              dot={false} 
            />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="#10b981" 
              name="Predicted Price" 
              strokeWidth={2} 
              strokeDasharray="5 5" 
              dot={false} 
            />
            <ReferenceLine 
              y={prediction.supportLevel} 
              stroke="#9333ea" 
              strokeDasharray="3 3"
              label={{ value: 'Support', position: 'insideBottomRight' }} 
            />
            <ReferenceLine 
              y={prediction.resistanceLevel} 
              stroke="#ef4444" 
              strokeDasharray="3 3"
              label={{ value: 'Resistance', position: 'insideTopRight' }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div className="bg-gray-50 rounded-md p-4">
          <h4 className="font-medium mb-2 text-gray-900">Technical Analysis</h4>
          <ul className="text-sm space-y-2 text-gray-800">
            <li className="flex justify-between">
              <span className="text-gray-800">Support Level:</span> 
              <span className="font-medium text-gray-900">${prediction.supportLevel.toFixed(2)}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-800">Resistance Level:</span> 
              <span className="font-medium text-gray-900">${prediction.resistanceLevel.toFixed(2)}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-800">Current Trend:</span> 
              <span className="font-medium text-gray-900 capitalize">{prediction.trend}</span>
            </li>
          </ul>
        </div>
        <div className="bg-gray-50 rounded-md p-4">
          <h4 className="font-medium mb-2 text-gray-900">Prediction Summary</h4>
          <p className="text-sm text-gray-800">
            Based on historical data analysis and our {confidencePercentage}% confidence model, 
            {prediction.nextDayPrediction > prediction.actual[prediction.actual.length - 1] 
              ? ' we expect an upward movement ' 
              : ' we expect a downward movement '} 
            for {symbol} in the short term.
          </p>
        </div>
      </div>
    </div>
  );
} 