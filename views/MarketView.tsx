
import React from 'react';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

export const MarketView = ({ t }: { t: any }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] opacity-50">
     <CurrencyDollarIcon className="w-16 h-16 mb-4" />
     <h3 className="text-xl font-bold">{t.workInProgress}</h3>
  </div>
);
