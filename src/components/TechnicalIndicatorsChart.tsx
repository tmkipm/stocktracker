'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  BarChart,
  Bar,
  ComposedChart
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { TechnicalIndicators } from '@/lib/technical-indicators';
import { StockTimeSeriesData } from '@/lib/api';
import { FiInfo } from 'react-icons/fi';

type IndicatorType = 'price' | 'bollinger' | 'macd' | 'rsi' | 'adx' | 'volume' | 'sar';

interface TechnicalIndicatorsChartProps {
  data: StockTimeSeriesData[];
  indicators: TechnicalIndicators;
  symbol: string;
}

export default function TechnicalIndicatorsChart({ data, indicators, symbol }: TechnicalIndicatorsChartProps) {
  const [activeIndicator, setActiveIndicator] = useState<IndicatorType>('price');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  
  // Prepare data for charts
  const chartData = data.map((item, index) => {
    return {
      date: item.date,
      price: item.close,
      volume: item.volume,
      sma: indicators.sma[index],
      ema: indicators.ema[index],
      upper: indicators.bollingerBands.upper[index],
      middle: indicators.bollingerBands.middle[index],
      lower: indicators.bollingerBands.lower[index],
      macdLine: indicators.macd.line[index],
      macdSignal: indicators.macd.signal[index],
      macdHistogram: indicators.macd.histogram[index],
      rsi: indicators.rsi[index],
      adx: indicators.adx[index],
      psar: indicators.parabolicSAR[index]
    };
  });
  
  // Format tooltip date
  const formatDate = (date: string) => {
    try {
      return format(parseISO(date), 'MMM d, yyyy');
    } catch (e) {
      return date;
    }
  };
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Format display based on active indicator
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{formatDate(label)}</p>
          
          {activeIndicator === 'price' && (
            <>
              <p className="text-primary-600">Price: ${payload.find((p: any) => p.name === 'Price')?.value?.toFixed(2)}</p>
              <p className="text-green-600">SMA(20): ${payload.find((p: any) => p.name === 'SMA(20)')?.value?.toFixed(2) || 'N/A'}</p>
              <p className="text-purple-600">EMA(20): ${payload.find((p: any) => p.name === 'EMA(20)')?.value?.toFixed(2) || 'N/A'}</p>
              <p className="text-gray-500">PSAR: ${payload.find((p: any) => p.name === 'PSAR')?.value?.toFixed(2) || 'N/A'}</p>
            </>
          )}
          
          {activeIndicator === 'bollinger' && (
            <>
              <p className="text-primary-600">Price: ${payload.find((p: any) => p.name === 'Price')?.value?.toFixed(2)}</p>
              <p className="text-green-600">Middle: ${payload.find((p: any) => p.name === 'Middle')?.value?.toFixed(2) || 'N/A'}</p>
              <p className="text-red-600">Upper: ${payload.find((p: any) => p.name === 'Upper')?.value?.toFixed(2) || 'N/A'}</p>
              <p className="text-blue-600">Lower: ${payload.find((p: any) => p.name === 'Lower')?.value?.toFixed(2) || 'N/A'}</p>
            </>
          )}
          
          {activeIndicator === 'macd' && (
            <>
              <p className="text-blue-600">MACD: ${payload.find((p: any) => p.name === 'MACD')?.value?.toFixed(4) || 'N/A'}</p>
              <p className="text-red-600">Signal: ${payload.find((p: any) => p.name === 'Signal')?.value?.toFixed(4) || 'N/A'}</p>
              <p className="text-green-600">Histogram: ${payload.find((p: any) => p.name === 'Histogram')?.value?.toFixed(4) || 'N/A'}</p>
            </>
          )}
          
          {activeIndicator === 'rsi' && (
            <>
              <p className="text-primary-600">RSI: {payload.find((p: any) => p.name === 'RSI')?.value?.toFixed(2) || 'N/A'}</p>
            </>
          )}
          
          {activeIndicator === 'adx' && (
            <>
              <p className="text-primary-600">ADX: {payload.find((p: any) => p.name === 'ADX')?.value?.toFixed(2) || 'N/A'}</p>
            </>
          )}
          
          {activeIndicator === 'volume' && (
            <>
              <p className="text-primary-600">Volume: {new Intl.NumberFormat().format(payload.find((p: any) => p.name === 'Volume')?.value || 0)}</p>
            </>
          )}
        </div>
      );
    }
    return null;
  };
  
  // Render chart based on active indicator
  const renderChart = () => {
    switch (activeIndicator) {
      case 'price':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(parseISO(date), 'MM/dd')}
                interval={Math.floor(chartData.length / 10)}
              />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="#0284c7" dot={false} name="Price" />
              <Line type="monotone" dataKey="sma" stroke="#10b981" dot={false} name="SMA(20)" />
              <Line type="monotone" dataKey="ema" stroke="#8b5cf6" dot={false} name="EMA(20)" />
              <Line type="monotone" dataKey="psar" stroke="#6b7280" dot={false} name="PSAR" />
            </ComposedChart>
          </ResponsiveContainer>
        );
      
      case 'bollinger':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(parseISO(date), 'MM/dd')}
                interval={Math.floor(chartData.length / 10)}
              />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="upper" 
                stroke="#ef4444" 
                fill="#fee2e2" 
                fillOpacity={0.3} 
                name="Upper" 
              />
              <Area 
                type="monotone" 
                dataKey="lower" 
                stroke="#3b82f6" 
                fill="#dbeafe" 
                fillOpacity={0.3} 
                name="Lower" 
              />
              <Line type="monotone" dataKey="middle" stroke="#10b981" dot={false} name="Middle" />
              <Line type="monotone" dataKey="price" stroke="#0284c7" dot={false} name="Price" />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'macd':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(parseISO(date), 'MM/dd')}
                interval={Math.floor(chartData.length / 10)}
              />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="macdLine" stroke="#3b82f6" name="MACD" />
              <Line type="monotone" dataKey="macdSignal" stroke="#ef4444" name="Signal" />
              <Bar dataKey="macdHistogram" fill="#10b981" name="Histogram" />
              <ReferenceLine y={0} stroke="#666" />
            </ComposedChart>
          </ResponsiveContainer>
        );
      
      case 'rsi':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(parseISO(date), 'MM/dd')}
                interval={Math.floor(chartData.length / 10)}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" label="Overbought" />
              <ReferenceLine y={30} stroke="#3b82f6" strokeDasharray="3 3" label="Oversold" />
              <Line type="monotone" dataKey="rsi" stroke="#8b5cf6" name="RSI" />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'adx':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(parseISO(date), 'MM/dd')}
                interval={Math.floor(chartData.length / 10)}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine y={25} stroke="#10b981" strokeDasharray="3 3" label="Strong Trend" />
              <Line type="monotone" dataKey="adx" stroke="#8b5cf6" name="ADX" />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'volume':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(parseISO(date), 'MM/dd')}
                interval={Math.floor(chartData.length / 10)}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="volume" fill="#3b82f6" name="Volume" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'sar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(parseISO(date), 'MM/dd')}
                interval={Math.floor(chartData.length / 10)}
              />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="#0284c7" dot={false} name="Price" />
              <Line type="monotone" dataKey="psar" stroke="#6b7280" dot={false} name="PSAR" />
            </ComposedChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-xl font-bold mb-4">Technical Indicators for {symbol}</h3>
        
        <div className="flex flex-wrap space-x-2">
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium mb-2 ${
              activeIndicator === 'price' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveIndicator('price')}
          >
            Price & Moving Averages
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium mb-2 ${
              activeIndicator === 'bollinger' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveIndicator('bollinger')}
          >
            Bollinger Bands
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium mb-2 ${
              activeIndicator === 'macd' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveIndicator('macd')}
          >
            MACD
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium mb-2 ${
              activeIndicator === 'rsi' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveIndicator('rsi')}
          >
            RSI
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium mb-2 ${
              activeIndicator === 'adx' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveIndicator('adx')}
          >
            ADX
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium mb-2 ${
              activeIndicator === 'volume' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveIndicator('volume')}
          >
            Volume
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium mb-2 ${
              activeIndicator === 'sar' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveIndicator('sar')}
          >
            PSAR
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {renderChart()}
        
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">About {getIndicatorName(activeIndicator)}</h4>
          <p className="text-sm text-gray-700">
            {getIndicatorDescription(activeIndicator)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper function to get readable indicator name
function getIndicatorName(indicator: IndicatorType): string {
  switch (indicator) {
    case 'price':
      return 'Price & Moving Averages';
    case 'bollinger':
      return 'Bollinger Bands';
    case 'macd':
      return 'Moving Average Convergence Divergence (MACD)';
    case 'rsi':
      return 'Relative Strength Index (RSI)';
    case 'adx':
      return 'Average Directional Index (ADX)';
    case 'volume':
      return 'Volume';
    case 'sar':
      return 'Parabolic SAR';
    default:
      return '';
  }
}

// Helper function to get indicator description
function getIndicatorDescription(indicator: IndicatorType): string {
  switch (indicator) {
    case 'price':
      return 'Stock price over time with volume bars indicating trading activity';
    case 'bollinger':
      return 'Bollinger Bands: Shows volatility channels around a moving average - price outside bands often signals potential reversals';
    case 'macd':
      return 'Moving Average Convergence Divergence: Momentum indicator showing relationship between two moving averages - crossovers signal potential trend changes';
    case 'rsi':
      return 'Relative Strength Index: Measures speed and change of price movements on a scale of 0-100 - values above 70 indicate overbought conditions, below 30 indicate oversold';
    case 'adx':
      return 'Average Directional Index: Measures trend strength on a scale of 0-100 - values above 25 indicate strong trends';
    case 'volume':
      return 'Trading volume: Number of shares traded in a given period - high volume often confirms price movements';
    case 'sar':
      return 'Parabolic SAR: Stop And Reverse - dots below price indicate uptrend, dots above indicate downtrend';
    default:
      return 'Technical indicator showing market patterns and potential trading signals';
  }
} 