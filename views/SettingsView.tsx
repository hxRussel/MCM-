
import React, { useRef, useState } from 'react';
import { 
  GlobeAltIcon, 
  SwatchIcon, 
  CurrencyDollarIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  ShieldCheckIcon,
  PhotoIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { GlassCard, ConfirmationModal, Button } from '../components/SharedUI';
import { Language, Theme, Currency, Career } from '../types';
import { compressImage } from '../utils/helpers';

export const SettingsView = ({ 
  t, 
  language, 
  setLanguage, 
  theme, 
  setTheme, 
  currency, 
  setCurrency,
  career,
  onUpdateCareer
}: { 
  t: any, 
  language: Language, 
  setLanguage: (l: Language) => void,
  theme: Theme,
  setTheme: (t: Theme) => void,
  currency: Currency,
  setCurrency: (c: Currency) => void,
  career: Career | null,
  onUpdateCareer: (c: Career | null) => void
}) => {

  const [showDeleteLogoConfirm, setShowDeleteLogoConfirm] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && career) {
      try {
        const compressed = await compressImage(e.target.files[0], 256, 256, 'png');
        onUpdateCareer({ ...career, teamLogo: compressed });
      } catch (err) {
        console.error("Logo upload failed", err);
      }
    }
  };

  const deleteLogo = () => {
    if (career) {
      onUpdateCareer({ ...career, teamLogo: undefined });
      setShowDeleteLogoConfirm(false);
    }
  };

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
      <ConfirmationModal 
        isOpen={showDeleteLogoConfirm}
        title={t.deleteLogoConfirm}
        message={t.deleteLogoMessage}
        onConfirm={deleteLogo}
        onCancel={() => setShowDeleteLogoConfirm(false)}
        t={t}
      />

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

      {/* Club Customization (Only if Career Active) */}
      {career && (
        <>
          <h2 className="text-2xl font-black pt-4">{t.clubCustomization}</h2>
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center p-2 border border-obsidian/10 dark:border-ghost/10 overflow-hidden">
                {career.teamLogo ? (
                  <img src={career.teamLogo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <ShieldCheckIcon className="w-10 h-10 opacity-20" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                 <h4 className="font-bold">{t.teamLogo}</h4>
                 <div className="flex gap-2">
                    <Button onClick={() => logoInputRef.current?.click()} className="text-sm py-2">
                       <PhotoIcon className="w-4 h-4 mr-2" />
                       {career.teamLogo ? "Replace" : t.uploadLogo}
                    </Button>
                    {career.teamLogo && (
                       <Button variant="danger" onClick={() => setShowDeleteLogoConfirm(true)} className="text-sm py-2 w-auto px-4">
                         <TrashIcon className="w-4 h-4" />
                       </Button>
                    )}
                 </div>
                 <p className="text-xs opacity-50">{t.uploadLogoDesc}</p>
                 <input 
                   type="file" 
                   ref={logoInputRef} 
                   className="hidden" 
                   accept="image/png"
                   onChange={handleLogoUpload} 
                 />
              </div>
            </div>
          </GlassCard>
        </>
      )}

      <div className="text-center opacity-30 text-xs font-mono pt-4">
        MCM+ Version 1.0.1 (Beta)
      </div>
    </div>
  );
};
