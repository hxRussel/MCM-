
import React from 'react';
import { 
  GlobeAltIcon, 
  SwatchIcon, 
  CurrencyDollarIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { GlassCard } from '../components/SharedUI';
import { Language, Theme, Currency } from '../types';

export const SettingsView = ({ 
  t, 
  language, 
  setLanguage, 
  theme, 
  setTheme, 
  currency, 
  setCurrency 
}: { 
  t: any, 
  language: Language, 
  setLanguage: (l: Language) => void,
  theme: Theme,
  setTheme: (t: Theme) => void,
  currency: Currency,
  setCurrency: (c: Currency) => void
}) => {

  const OptionRow = ({ icon: Icon, title, children }: any) => (
    <div className="flex flex-col gap-3 py-2">
      <h4 className="flex items-center gap-2 font-bold opacity-80">
        <Icon className="w-5 h-5 text-mint" />
        {title}
      </h4>
      <div className="flex p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-obsidian/5 dark:border-ghost/5">
        {children}
      </div>
    </div>
  );

  const Toggle = ({ active, onClick, label, icon: Icon }: any) => (
    <button
      onClick={onClick}
      className={`
        flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200
        ${active 
          ? 'bg-white dark:bg-obsidian shadow-md text-obsidian dark:text-ghost scale-[1.02]' 
          : 'text-obsidian dark:text-ghost opacity-50 hover:opacity-80'}
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </button>
  );

  return (
    <div className="animate-fade-in space-y-6 pb-24">
      <h2 className="text-3xl font-black">{t.appSettings}</h2>
      
      <GlassCard className="p-6 space-y-6">
        
        {/* Language */}
        <OptionRow icon={GlobeAltIcon} title={t.language}>
           <Toggle 
             active={language === Language.IT} 
             onClick={() => setLanguage(Language.IT)} 
             label="Italiano" 
             icon={() => <span className="text-xs">🇮🇹</span>}
           />
           <Toggle 
             active={language === Language.EN} 
             onClick={() => setLanguage(Language.EN)} 
             label="English" 
             icon={() => <span className="text-xs">🇺🇸</span>}
           />
        </OptionRow>

        {/* Theme */}
        <OptionRow icon={SwatchIcon} title={t.theme}>
           <Toggle 
             active={theme === Theme.LIGHT} 
             onClick={() => setTheme(Theme.LIGHT)} 
             label={t.themeLight} 
             icon={SunIcon}
           />
           <Toggle 
             active={theme === Theme.DARK} 
             onClick={() => setTheme(Theme.DARK)} 
             label={t.themeDark} 
             icon={MoonIcon}
           />
           <Toggle 
             active={theme === Theme.AUTO} 
             onClick={() => setTheme(Theme.AUTO)} 
             label={t.themeAuto} 
             icon={ComputerDesktopIcon}
           />
        </OptionRow>

        {/* Currency */}
        <OptionRow icon={CurrencyDollarIcon} title={t.currency}>
           <Toggle 
             active={currency === '€'} 
             onClick={() => setCurrency('€')} 
             label="EUR (€)" 
           />
           <Toggle 
             active={currency === '$'} 
             onClick={() => setCurrency('$')} 
             label="USD ($)" 
           />
           <Toggle 
             active={currency === '£'} 
             onClick={() => setCurrency('£')} 
             label="GBP (£)" 
           />
        </OptionRow>

      </GlassCard>

      <div className="text-center opacity-30 text-xs font-mono pt-4">
        MCM+ Version 1.0.1 (Beta)
      </div>
    </div>
  );
};
