'use client';

import React, { useState } from 'react';
import { searchStocks } from '@/lib/mockData';
import { FiSearch, FiInfo } from 'react-icons/fi';

interface SearchResult {
  '1. symbol': string;
  '2. name': string;
  '3. type': string;
  '4. region': string;
  '5. marketOpen': string;
  '6. marketClose': string;
  '7. timezone': string;
  '8. currency': string;
  '9. matchScore': string;
}

interface StockSearchProps {
  onSelectStock: (symbol: string) => void;
}

export default function StockSearch({ onSelectStock }: StockSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    
    try {
      const data = await searchStocks(query);
      setResults(data);
    } catch (error) {
      console.error('Error searching stocks:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleSelectResult = (symbol: string) => {
    onSelectStock(symbol);
    setQuery('');
    setResults([]);
  };

  // Popular stock suggestions
  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple' },
    { symbol: 'MSFT', name: 'Microsoft' },
    { symbol: 'GOOGL', name: 'Alphabet' },
    { symbol: 'AMZN', name: 'Amazon' },
    { symbol: 'TSLA', name: 'Tesla' },
  ];
  
  return (
    <div className="mb-6">
      <div className="mb-2 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Search Stocks</h2>
        <div className="relative" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
          <FiInfo className="text-gray-600 cursor-help" />
          {showTooltip && (
            <div className="absolute z-10 right-0 bottom-full mb-2 p-3 bg-gray-800 text-white text-xs rounded shadow-lg w-64">
              <p className="font-medium mb-1">Search Tips:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Search by ticker symbol (e.g., AAPL) for exact matches</li>
                <li>Search by company name (e.g., Apple) for broader results</li>
                <li>Click on popular stocks below for quick access</li>
                <li>Select any result to view detailed analysis</li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex mb-4">
        <input
          type="text"
          className="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-primary-300"
          placeholder="Enter stock symbol or company name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="bg-primary-600 text-white p-2 rounded-r hover:bg-primary-700 flex items-center justify-center"
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
          ) : (
            <FiSearch className="text-lg" />
          )}
        </button>
      </div>
      
      {/* Popular stocks */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 mb-2">Popular stocks:</p>
        <div className="flex flex-wrap gap-2">
          {popularStocks.map(stock => (
            <button
              key={stock.symbol}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm flex items-center"
              onClick={() => handleSelectResult(stock.symbol)}
            >
              <span className="font-medium">{stock.symbol}</span>
              <span className="text-gray-600 text-xs ml-1">({stock.name})</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Search results */}
      {results.length > 0 && (
        <div className="border rounded divide-y max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={index}
              className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleSelectResult(result['1. symbol'])}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{result['1. symbol']}</p>
                  <p className="text-sm text-gray-600">{result['2. name']}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {result['4. region']} / {result['8. currency']}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 