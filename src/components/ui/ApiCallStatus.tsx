'use client';

import React from 'react';

interface ApiCallStatusProps {
  compact?: boolean;
}

export default function ApiCallStatus({ compact = false }: ApiCallStatusProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span>Using Mock Data</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
      <h4 className="text-sm font-medium mb-2">Data Source</h4>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <div 
          className="h-2.5 rounded-full bg-green-500" 
          style={{ width: '100%' }}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>Using generated mock data</span>
        <span>Unlimited requests ✓</span>
      </div>
    </div>
  );
} 