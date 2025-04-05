'use client';

import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { StockTimeSeriesData } from '@/lib/api';
import { format, parseISO } from 'date-fns';

interface StockChartProps {
  data: StockTimeSeriesData[];
  symbol: string;
}

type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y' | 'All';

export default function StockChart({ data, symbol }: StockChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  
  if (!data || data.length === 0) {
    return <div className="h-80 flex items-center justify-center">No chart data available</div>;
  }

  // Filter data based on selected time range
  const filteredData = () => {
    const now = new Date();
    let threshold: Date;
    
    switch (timeRange) {
      case '1W':
        threshold = new Date(now.setDate(now.getDate() - 7));
        break;
      case '1M':
        threshold = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case '3M':
        threshold = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case '6M':
        threshold = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case '1Y':
        threshold = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        return data;
    }
    
    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= threshold;
    });
  };

  const chartData = filteredData();
  
  // Calculate min and max values for the y-axis
  const minValue = Math.min(...chartData.map(item => item.low));
  const maxValue = Math.max(...chartData.map(item => item.high));
  
  // Add some padding to the min and max values
  const yDomain = [
    Math.floor(minValue * 0.995),
    Math.ceil(maxValue * 1.005)
  ];

  const formatTooltipDate = (date: string) => {
    try {
      return format(parseISO(date), 'MMM d, yyyy');
    } catch (error) {
      return date;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{formatTooltipDate(label)}</p>
          <p className="text-primary-600">Open: ${payload[0].payload.open.toFixed(2)}</p>
          <p className="text-success">High: ${payload[0].payload.high.toFixed(2)}</p>
          <p className="text-danger">Low: ${payload[0].payload.low.toFixed(2)}</p>
          <p className="text-primary-800">Close: ${payload[0].payload.close.toFixed(2)}</p>
          <p className="text-gray-600">Volume: {new Intl.NumberFormat().format(payload[0].payload.volume)}</p>
        </div>
      );
    }
  
    return null;
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">{symbol} Stock Price</h3>
        <div className="flex space-x-2">
          {(['1W', '1M', '3M', '6M', '1Y', 'All'] as TimeRange[]).map((range) => (
            <button
              key={range}
              className={`px-2 py-1 text-sm rounded ${
                timeRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </button>
          ))}
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
            <YAxis domain={yDomain} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="close"
              stroke="#0284c7"
              dot={false}
              name="Price"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 