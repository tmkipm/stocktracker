'use client';

import React, { useState, useEffect } from 'react';
import { getStockQuote, getStockTimeSeries } from '@/lib/mockData';
import { 
  getCachedStockData, 
  cacheStockData, 
  shouldRefreshCache,
  trackApiCall,
  getApiCallCount
} from '@/lib/storage';
import StockSearch from '@/components/StockSearch';
import WatchList from '@/components/WatchList';
import StockChart from '@/components/StockChart';
import PredictionTabs from '@/components/PredictionTabs';
import RateLimitAlert from '@/components/ui/RateLimitAlert';
import { motion } from 'framer-motion';

// Maximum API calls per day (from storage.ts)
const MAX_DAILY_CALLS = 25;

export default function Home() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [stockData, setStockData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPredictions, setShowPredictions] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  // Load watchlist from localStorage on initial render
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('stockWatchlist');
    if (savedWatchlist) {
      try {
        const parsed = JSON.parse(savedWatchlist);
        setWatchlist(parsed);
        if (parsed.length > 0) {
          setSelectedStock(parsed[0]);
        }
      } catch (e) {
        console.error('Failed to parse watchlist from localStorage', e);
      }
    }
  }, []);

  // Save watchlist to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('stockWatchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Load chart data when selected stock changes
  useEffect(() => {
    if (selectedStock) {
      fetchStockData(selectedStock);
    } else {
      setStockData([]);
    }
  }, [selectedStock]);

  // Add periodic cache refresh (hourly)
  useEffect(() => {
    if (shouldRefreshCache() && watchlist.length > 0) {
      refreshAllStockData();
    }
    
    // Set up interval to check for refresh every minute
    const intervalId = setInterval(() => {
      if (shouldRefreshCache() && watchlist.length > 0) {
        refreshAllStockData();
      }
    }, 60000); // Check every minute if it's time to refresh
    
    return () => clearInterval(intervalId);
  }, [watchlist]);

  // Refresh all stocks in watchlist
  const refreshAllStockData = async () => {
    if (watchlist.length === 0) return;
    
    // Track this as a single API refresh session
    trackApiCall();
    console.log(`Refreshing data for ${watchlist.length} stocks at ${new Date().toLocaleTimeString()}`);
    
    // Add a small delay between requests to avoid hitting rate limits
    for (const symbol of watchlist) {
      try {
        await fetchStockDataFromAPI(symbol, false); // Don't track individual calls within bulk refresh
        // Add a 12-second delay between API calls to respect the 5 calls per minute limit
        await new Promise(resolve => setTimeout(resolve, 12000));
      } catch (err) {
        console.error(`Error refreshing ${symbol}:`, err);
        // If we hit an error, stop refreshing to avoid more API calls
        break;
      }
    }
    
    // Set last refresh time after batch update
    localStorage.setItem('last_cache_refresh', Date.now().toString());
    
    // If the currently selected stock is in the watchlist, update its display
    if (selectedStock && watchlist.includes(selectedStock)) {
      fetchStockData(selectedStock);
    }
  };

  const fetchStockData = async (symbol: string) => {
    setIsLoading(true);
    setError('');
    setShowPredictions(false);
    setIsCached(false);

    try {
      // First check cache
      const cachedData = getCachedStockData(symbol);
      
      if (cachedData) {
        // Use cached data
        setStockData(cachedData);
        setIsCached(true);
        
        // Format the timestamp to show when data was last updated
        const cache = JSON.parse(localStorage.getItem(`stock_data_${symbol}`) || '{}');
        if (cache && cache.timestamp) {
          const date = new Date(cache.timestamp);
          setLastUpdate(date.toLocaleTimeString());
        }
        
        // Only show predictions if we have sufficient data
        if (cachedData.length >= 30) {
          setShowPredictions(true);
        }
      } else {
        // No valid cache, fetch from API
        await fetchStockDataFromAPI(symbol);
      }
    } catch (err) {
      handleFetchError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStockDataFromAPI = async (symbol: string, trackIndividualCall = true) => {
    try {
      // We're using mock data now - no need to track API calls 
      const data = await getStockTimeSeries(symbol, 'daily', 'full');
      
      // Cache the data
      cacheStockData(symbol, data);
      
      // If this is the selected stock, update the UI
      if (symbol === selectedStock) {
        setStockData(data);
        setIsCached(false);
        setLastUpdate(new Date().toLocaleTimeString());
        
        // Only show predictions if we have sufficient data
        if (data.length >= 30) {
          setShowPredictions(true);
        }
      }
      
      return data;
    } catch (err) {
      if (symbol === selectedStock) {
        handleFetchError(err);
      }
      throw err;
    }
  };

  const handleFetchError = (err: any) => {
    console.error('Error fetching stock data:', err);
    
    // Check if the error contains the rate limit message
    const errorMessage = err instanceof Error ? err.message : String(err);
    if (errorMessage.includes('rate limit') || errorMessage.includes('API key') || errorMessage.includes('limit is 25')) {
      setError('Alpha Vantage API daily limit reached. The free tier is limited to 25 requests per day. Try again tomorrow or upgrade to a premium plan.');
    } else {
      setError('Failed to load stock data. Please try again later.');
    }
    
    setStockData([]);
  };

  const handleSelectStock = (symbol: string) => {
    // Add to watchlist if not already present
    if (!watchlist.includes(symbol)) {
      setWatchlist(prev => [...prev, symbol]);
    }
    
    // Set as selected stock to show chart
    setSelectedStock(symbol);
  };

  const handleRemoveSymbol = (symbol: string) => {
    setWatchlist(prev => prev.filter(s => s !== symbol));
    
    // If the removed stock was selected, select another one
    if (selectedStock === symbol) {
      const remaining = watchlist.filter(s => s !== symbol);
      setSelectedStock(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const handleRefresh = () => {
    if (selectedStock) {
      fetchStockDataFromAPI(selectedStock)
        .catch(err => console.error('Error refreshing stock data:', err));
    }
  };

  const MotionDiv = motion.div;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Advanced Stock Tracker with AI Predictions</h1>
        <p className="text-gray-600">Track stocks in real-time and analyze their performance with AI-powered insights</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <StockSearch onSelectStock={handleSelectStock} />
          
          {selectedStock && (
            <div>
              {isLoading ? (
                <div className="card p-6 flex items-center justify-center h-80">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mb-2"></div>
                    <p>Loading {selectedStock} data...</p>
                  </div>
                </div>
              ) : error ? (
                error.includes('API rate limit') || error.includes('limit reached') || error.includes('limit is 25') ? (
                  <RateLimitAlert message={error} />
                ) : (
                  <div className="card p-6 bg-red-50 text-red-600 flex items-center justify-center">
                    <p>{error}</p>
                  </div>
                )
              ) : stockData.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      {isCached && lastUpdate && (
                        <div className="text-xs text-gray-500 italic">
                          <span className="font-medium">Cached data</span> (Last updated: {lastUpdate})
                        </div>
                      )}
                      {!isCached && lastUpdate && (
                        <div className="text-xs text-gray-500 italic">
                          <span className="font-medium">Fresh data</span> (Updated: {lastUpdate})
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={handleRefresh}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded flex items-center"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                      Refresh
                    </button>
                  </div>
                  <MotionDiv
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <StockChart data={stockData} symbol={selectedStock} />
                  </MotionDiv>
                  
                  {showPredictions && (
                    <MotionDiv
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <PredictionTabs data={stockData} symbol={selectedStock} />
                    </MotionDiv>
                  )}
                </>
              ) : (
                <div className="card p-6 flex items-center justify-center h-40">
                  <p>Select a stock to view its chart</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div>
          <WatchList 
            initialSymbols={watchlist} 
            onRemoveSymbol={handleRemoveSymbol} 
          />
          
          <div className="card p-4 mb-6">
            <h3 className="text-lg font-medium mb-2">About AI Predictions</h3>
            <p className="text-sm text-gray-700 mb-4">
              Our stock tracker features advanced AI predictions using both statistical models and large language models. 
              The predictions are based on historical trends, technical indicators, and market sentiment analysis.
            </p>
            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
              <p className="text-xs text-yellow-800">
                <strong>Disclaimer:</strong> AI predictions are for informational purposes only and should not be considered as financial advice. 
                Always conduct your own research before making investment decisions.
              </p>
            </div>
          </div>
          
          <div className="card p-4 mb-6">
            <h3 className="text-lg font-medium mb-2">Technology Insights</h3>
            <p className="text-sm text-gray-700 mb-2">
              This application uses several modern technologies to deliver a seamless experience:
            </p>
            <ul className="text-xs list-disc list-inside text-gray-700 ml-2 mb-4">
              <li><span className="font-medium">React & Next.js:</span> Fast, responsive UI with server-side rendering</li>
              <li><span className="font-medium">TypeScript:</span> Type-safe code for reliability</li>
              <li><span className="font-medium">Tailwind CSS:</span> Beautiful, responsive design</li>
              <li><span className="font-medium">Recharts:</span> Interactive data visualization</li>
              <li><span className="font-medium">Yahoo Finance API:</span> Comprehensive financial data</li>
              <li><span className="font-medium">AI Models:</span> Statistical predictions and LLM market analysis</li>
            </ul>
            
            <p className="text-sm text-gray-700 mt-4">
              <span className="font-medium">How to use this app:</span> Search for stocks, add them to your watchlist, and explore the technical indicators and AI predictions to gain insights for your investment decisions.
            </p>
          </div>
        </div>
      </div>
      
      <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600 text-sm">
        <p>Advanced Stock Tracker | Using Realistic Mock Data</p>
        <div className="flex justify-center items-center mt-2 gap-4">
          <span className="text-primary-600 hover:underline">
            Mock data for demonstration purposes
          </span>
        </div>
        <p className="mt-4 text-xs text-gray-600">
          All stock price data is generated locally with realistic simulations
        </p>
      </footer>
    </div>
  );
} 