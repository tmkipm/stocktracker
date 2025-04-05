'use client';

import React from 'react';
import { StockQuote as StockQuoteType } from '@/lib/api';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

interface StockQuoteProps {
  quote: StockQuoteType;
  onRemove?: () => void;
}

export default function StockQuote({ quote, onRemove }: StockQuoteProps) {
  const isPositive = quote.change >= 0;
  const changePercent = parseFloat(quote.changePercent.replace('%', ''));
  
  const formattedDate = () => {
    try {
      const date = new Date(quote.latestTradingDay);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return quote.latestTradingDay;
    }
  };

  return (
    <div className="card p-6 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{quote.symbol}</h2>
          <p className="text-gray-500">Updated {formattedDate()}</p>
        </div>
        
        {onRemove && (
          <button 
            onClick={onRemove}
            className="text-gray-400 hover:text-gray-600"
            aria-label={`Remove ${quote.symbol}`}
          >
            ×
          </button>
        )}
      </div>
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-gray-500 text-sm">Current Price</p>
          <p className="text-2xl font-semibold">${quote.price.toFixed(2)}</p>
          <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <FiArrowUp className="mr-1" /> : <FiArrowDown className="mr-1" />}
            <span>{Math.abs(quote.change).toFixed(2)} ({Math.abs(changePercent).toFixed(2)}%)</span>
          </div>
        </div>
        
        <div>
          <p className="text-gray-500 text-sm">Previous Close</p>
          <p className="text-xl">${quote.previousClose.toFixed(2)}</p>
        </div>
        
        <div>
          <p className="text-gray-500 text-sm">Open</p>
          <p className="text-xl">${quote.open.toFixed(2)}</p>
        </div>
        
        <div>
          <p className="text-gray-500 text-sm">Volume</p>
          <p className="text-xl">{new Intl.NumberFormat().format(quote.volume)}</p>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-gray-500 text-sm">Day Range</p>
          <p className="text-base">${quote.low.toFixed(2)} - ${quote.high.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
} 