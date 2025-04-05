'use client';

import React from 'react';

interface RateLimitAlertProps {
  message: string;
}

export default function RateLimitAlert({ message }: RateLimitAlertProps) {
  return (
    <div className="card p-6 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex flex-col items-center justify-center">
        <div className="text-green-600 mb-4 font-medium text-center">
          Using Mock Data - No API Limits!
        </div>
        
        <div className="mb-4 text-center">
          <h4 className="text-sm font-medium text-green-800 mb-2">Mock Data Features:</h4>
          <ul className="text-sm list-disc list-inside text-green-700 mb-2">
            <li>No rate limits or API restrictions</li>
            <li>Realistic stock price simulation</li>
            <li>Includes popular tech stocks</li>
          </ul>
          <p className="text-xs text-green-600 italic">All data is generated locally for demonstration purposes.</p>
        </div>
      </div>
    </div>
  );
} 