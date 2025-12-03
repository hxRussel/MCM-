
import React from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

export const SettingsView = ({ t }: { t: any }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] opacity-50">
     <Cog6ToothIcon className="w-16 h-16 mb-4" />
     <h3 className="text-xl font-bold">{t.workInProgress}</h3>
  </div>
);
