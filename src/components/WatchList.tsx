'use client';

import React, { useState, useEffect } from 'react';
import { getStockQuote, StockQuote as StockQuoteType } from '@/lib/api';
import StockQuote from './StockQuote';
import { motion, AnimatePresence } from 'framer-motion';

interface WatchListProps {
  initialSymbols?: string[];
  onRemoveSymbol: (symbol: string) => void;
}

export default function WatchList({ initialSymbols = [], onRemoveSymbol }: WatchListProps) {
  const [quotes, setQuotes] = useState<Record<string, StockQuoteType>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [refreshInterval, setRefreshInterval] = useState<number>(60); // seconds
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchQuotes = async (symbols: string[]) => {
    for (const symbol of symbols) {
      if (!symbol) continue;
      
      setLoading(prev => ({ ...prev, [symbol]: true }));
      setErrors(prev => ({ ...prev, [symbol]: '' }));
      
      try {
        const quote = await getStockQuote(symbol);
        setQuotes(prev => ({ ...prev, [symbol]: quote }));
      } catch (error) {
        console.error(`Error fetching quote for ${symbol}:`, error);
        setErrors(prev => ({ ...prev, [symbol]: `Failed to load data for ${symbol}` }));
      } finally {
        setLoading(prev => ({ ...prev, [symbol]: false }));
      }
    }
    
    setLastRefresh(new Date());
  };

  useEffect(() => {
    if (initialSymbols.length > 0) {
      fetchQuotes(initialSymbols);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (initialSymbols.length > 0) {
        fetchQuotes(initialSymbols);
      }
    }, refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [initialSymbols, refreshInterval]);

  const handleRefresh = () => {
    if (initialSymbols.length > 0) {
      fetchQuotes(initialSymbols);
    }
  };

  const handleRemove = (symbol: string) => {
    // Remove from state
    setQuotes(prev => {
      const newQuotes = { ...prev };
      delete newQuotes[symbol];
      return newQuotes;
    });
    
    // Notify parent
    onRemoveSymbol(symbol);
  };

  const updateRefreshInterval = (seconds: number) => {
    setRefreshInterval(seconds);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Watchlist</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="text-sm mr-2">Auto-refresh:</span>
            <select 
              value={refreshInterval}
              onChange={(e) => updateRefreshInterval(Number(e.target.value))}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value="15">15s</option>
              <option value="30">30s</option>
              <option value="60">1m</option>
              <option value="300">5m</option>
              <option value="600">10m</option>
            </select>
          </div>
          <button 
            onClick={handleRefresh}
            className="btn btn-outline text-sm"
            disabled={Object.values(loading).some(isLoading => isLoading)}
          >
            Refresh Now
          </button>
        </div>
      </div>
      
      {lastRefresh && (
        <p className="text-sm text-gray-500 mb-4">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </p>
      )}
      
      {initialSymbols.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p>Your watchlist is empty. Search and add stocks to track them here.</p>
        </div>
      ) : (
        <AnimatePresence>
          {initialSymbols.map(symbol => (
            <motion.div
              key={symbol}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              transition={{ duration: 0.3 }}
            >
              {loading[symbol] ? (
                <div className="card p-6 mb-4 flex justify-center items-center">
                  <p>Loading {symbol} data...</p>
                </div>
              ) : errors[symbol] ? (
                <div className="card p-6 mb-4 border-red-200 bg-red-50">
                  <p className="text-red-600">{errors[symbol]}</p>
                  <button 
                    onClick={() => handleRemove(symbol)}
                    className="text-sm text-red-500 hover:text-red-700 mt-2"
                  >
                    Remove from watchlist
                  </button>
                </div>
              ) : quotes[symbol] ? (
                <StockQuote 
                  quote={quotes[symbol]} 
                  onRemove={() => handleRemove(symbol)}
                />
              ) : null}
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
} 