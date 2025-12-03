
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  updateProfile,
  User 
} from 'firebase/auth';
import { auth } from './services/firebase';
import { Language, Theme, View, Career, Team } from './types';
import { TRANSLATIONS, MOCK_TEAMS, STARTING_SEASONS } from './constants';
import { 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon, 
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  CommandLineIcon,
  HomeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  UserCircleIcon,
  ArrowRightIcon,
  HeartIcon,
  ArrowLeftIcon,
  CameraIcon,
  TrashIcon,
  PlusIcon,
  AcademicCapIcon,
  GlobeEuropeAfricaIcon,
  UserPlusIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ForwardIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeSolid,
  UserGroupIcon as UserGroupSolid, 
  CurrencyDollarIcon as CurrencyDollarSolid, 
  Cog6ToothIcon as CogSolid,
  HeartIcon as HeartSolid
} from '@heroicons/react/24/solid';

// --- Shared UI Components ---

const InputField = ({ 
  label, 
  type, 
  value, 
  onChange, 
  placeholder,
  disabled
}: { 
  label: string; 
  type: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  placeholder?: string;
  disabled?: boolean;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1 opacity-80">{label}</label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-12 rounded-lg bg-white/5 border border-obsidian/10 dark:border-ghost/20 focus:border-mint focus:ring-2 focus:ring-mint/50 outline-none transition-all duration-200 text-obsidian dark:text-ghost placeholder-obsidian/30 dark:placeholder-ghost/30"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-obsidian/50 dark:text-ghost/50 hover:text-mint transition-colors p-1"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const SelectField = ({ label, value, onChange, options, disabled }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-1 opacity-80">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-obsidian/10 dark:border-ghost/20 focus:border-mint focus:ring-2 focus:ring-mint/50 outline-none transition-all duration-200 text-obsidian dark:text-ghost appearance-none"
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value} className="bg-ghost dark:bg-obsidian text-obsidian dark:text-ghost">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </div>
  </div>
);

const Button = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  disabled = false,
  className = ''
}: { 
  onClick?: () => void; 
  children?: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; 
  disabled?: boolean;
  className?: string;
}) => {
  let baseStyles = "w-full py-3 rounded-lg font-semibold transition-all duration-200 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-mint text-mint-text hover:bg-mint-hover shadow-lg shadow-mint/20",
    secondary: "bg-obsidian text-ghost dark:bg-ghost dark:text-obsidian hover:opacity-90",
    ghost: "bg-transparent text-obsidian dark:text-ghost hover:bg-black/5 dark:hover:bg-white/5",
    danger: "bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const ToggleButton = ({ active, onClick, children, title, className = '' }: any) => (
  <button
    onClick={onClick}
    title={title}
    className={`
      flex items-center justify-center rounded-full transition-all duration-200 px-3 py-1.5
      ${active 
        ? 'bg-obsidian text-ghost dark:bg-ghost dark:text-obsidian shadow-sm font-medium' 
        : 'text-obsidian dark:text-ghost opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'}
      ${className}
    `}
  >
    {children}
  </button>
);

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, t }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-obsidian border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full animate-scale-in">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="opacity-70 mb-6 text-sm">{message}</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onCancel}>{t.cancel}</Button>
          <Button variant="danger" onClick={onConfirm}>{t.confirm}</Button>
        </div>
      </div>
    </div>
  );
};

// --- Utilities ---

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const formatMoney = (amount: number) => {
  if (amount >= 1000000) {
    return `€${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `€${(amount / 1000).toFixed(1)}K`;
  }
  return `€${amount}`;
};

// --- Dashboard Components ---

const GlassCard = ({ children, className = '', onClick }: { children?: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`
      bg-white/80 dark:bg-black/40 backdrop-blur-xl 
      border border-white/40 dark:border-white/5 
      shadow-xl shadow-black/5 dark:shadow-black/20
      rounded-3xl overflow-hidden
      ${className}
    `}
  >
    {children}
  </div>
);

const NavItem = ({ icon: Icon, solidIcon: SolidIcon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`
      flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300
      ${active ? 'bg-obsidian dark:bg-ghost text-ghost dark:text-obsidian scale-110 shadow-lg' : 'text-obsidian/50 dark:text-ghost/50 hover:text-obsidian dark:hover:text-ghost'}
    `}
  >
    {active ? <SolidIcon className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
  </button>
);

const StatCard = ({ icon: Icon, value, label, colorClass = "text-obsidian dark:text-ghost" }: any) => (
  <GlassCard className="p-4 flex flex-col justify-between items-center text-center h-full hover:bg-white/90 dark:hover:bg-black/50 transition-colors">
    <div className={`p-3 rounded-full bg-white/50 dark:bg-white/5 mb-2 ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <span className="text-2xl font-black block tracking-tight">{value}</span>
      <span className="text-xs font-bold opacity-50 uppercase tracking-widest">{label}</span>
    </div>
  </GlassCard>
);

// --- Views ---

const HomeView = ({ t, career, setCareer }: { t: any, career: Career | null, setCareer: (c: Career | null) => void }) => {
  const [managerName, setManagerName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [customTeamName, setCustomTeamName] = useState('');
  const [startingSeason, setStartingSeason] = useState(STARTING_SEASONS[1]); // Default 2025/2026
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const createCareer = () => {
    let teamData: Team;
    
    if (selectedTeamId === 'custom') {
      if (!customTeamName.trim()) return;
      teamData = {
        id: 'custom-' + Date.now(),
        name: customTeamName,
        league: 'Custom League',
        transferBudget: 50000000, // Default budget for custom team
        wageBudget: 100000,
        players: []
      };
    } else {
      const found = MOCK_TEAMS.find(t => t.id === selectedTeamId);
      if (!found) return;
      teamData = found;
    }

    const newCareer: Career = {
      managerName: managerName || 'Manager',
      teamName: teamData.name,
      transferBudget: teamData.transferBudget,
      wageBudget: teamData.wageBudget,
      players: teamData.players,
      startDate: new Date().toISOString(),
      season: startingSeason
    };
    
    setCareer(newCareer);
  };

  const deleteCareer = () => {
    setCareer(null);
    setShowDeleteConfirm(false);
  };

  const advanceSeason = () => {
    if (!career) return;
    
    // Parse current season "YYYY/YYYY"
    const [startYear, endYear] = career.season.split('/').map(y => parseInt(y));
    const nextSeason = `${startYear + 1}/${endYear + 1}`;

    // Increment age for all players
    const updatedPlayers = career.players.map(player => ({
      ...player,
      age: player.age + 1
    }));

    // Update career state
    setCareer({
      ...career,
      season: nextSeason,
      players: updatedPlayers
    });
  };

  // If no career, show Wizard
  if (!career) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in">
        <GlassCard className="w-full max-w-lg p-8">
           <div className="text-center mb-8">
             <div className="w-16 h-16 bg-mint/20 text-mint rounded-2xl flex items-center justify-center mx-auto mb-4">
               <BriefcaseIcon className="w-8 h-8" />
             </div>
             <h2 className="text-3xl font-black">{t.startCareer}</h2>
             <p className="opacity-60 mt-2">Begin your journey to glory.</p>
           </div>

           <div className="space-y-4">
              <InputField 
                label={t.managerName} 
                type="text" 
                value={managerName} 
                onChange={(e) => setManagerName(e.target.value)} 
                placeholder="Carlo Ancelotti"
              />

              <div className="grid grid-cols-2 gap-4">
                 <SelectField 
                   label={t.selectTeam}
                   value={selectedTeamId}
                   onChange={(e: any) => setSelectedTeamId(e.target.value)}
                   options={[
                     { value: '', label: 'Select a team...' },
                     ...MOCK_TEAMS.map(team => ({ value: team.id, label: team.name })),
                     { value: 'custom', label: `+ ${t.customTeam}` }
                   ]}
                 />
                 <SelectField 
                   label={t.startSeason}
                   value={startingSeason}
                   onChange={(e: any) => setStartingSeason(e.target.value)}
                   options={STARTING_SEASONS.map(season => ({ value: season, label: season }))}
                 />
              </div>

              {selectedTeamId === 'custom' && (
                <InputField 
                  label={t.teamName} 
                  type="text" 
                  value={customTeamName} 
                  onChange={(e) => setCustomTeamName(e.target.value)} 
                  placeholder="My Dream FC"
                />
              )}

              <Button 
                onClick={createCareer} 
                disabled={!managerName || !selectedTeamId}
                className="mt-6"
              >
                {t.createCareer}
              </Button>
           </div>
        </GlassCard>
      </div>
    );
  }

  // Calculate Stats
  const playerCount = career.players.length;
  const avgAge = playerCount > 0 
    ? (career.players.reduce((sum, p) => sum + p.age, 0) / playerCount).toFixed(1) 
    : "0";
  const over22 = career.players.filter(p => p.age > 22).length;
  const homeGrown = career.players.filter(p => p.isHomegrown).length;
  const nonEU = career.players.filter(p => p.isNonEU).length;

  // Active Career Dashboard
  return (
    <div className="space-y-6 animate-fade-in pb-20 relative">
      <ConfirmationModal 
        isOpen={showDeleteConfirm}
        title={t.deleteCareerTitle}
        message={t.deleteCareerMessage}
        onConfirm={deleteCareer}
        onCancel={() => setShowDeleteConfirm(false)}
        t={t}
      />
      
      {/* Header Card */}
      <GlassCard className="relative overflow-hidden p-6 text-center border-t-4 border-t-mint">
        <div className="absolute top-0 right-0 w-32 h-32 bg-mint/10 rounded-full blur-3xl pointer-events-none"></div>
        <h2 className="text-4xl font-black mb-1">{career.teamName}</h2>
        <p className="text-lg font-medium opacity-60 mb-6">{career.managerName}</p>
        <div className="flex justify-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mint/10 text-mint-text text-xs font-bold uppercase tracking-wider">
             <span className="w-2 h-2 rounded-full bg-mint animate-pulse"></span>
             {t.continueCareer}
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 dark:bg-white/5 border border-white/20 text-xs font-bold uppercase tracking-wider">
             <CalendarDaysIcon className="w-4 h-4" />
             {career.season}
          </div>
        </div>
      </GlassCard>

      {/* Financials */}
      <div>
        <h3 className="text-lg font-bold mb-3 px-1 flex items-center gap-2 opacity-80">
          <CurrencyDollarIcon className="w-5 h-5" /> {t.financials}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <GlassCard className="p-5">
             <span className="text-xs font-bold opacity-50 uppercase tracking-wider block mb-1">{t.transferBudget}</span>
             <span className="text-2xl font-black text-green-500">{formatMoney(career.transferBudget)}</span>
          </GlassCard>
          <GlassCard className="p-5">
             <span className="text-xs font-bold opacity-50 uppercase tracking-wider block mb-1">{t.wageBudget}</span>
             <span className="text-xl font-black text-blue-500">{formatMoney(career.wageBudget)}<span className="text-xs font-normal opacity-60">/wk</span></span>
          </GlassCard>
        </div>
      </div>

      {/* Squad Overview Grid */}
      <div>
        <h3 className="text-lg font-bold mb-3 px-1 flex items-center gap-2 opacity-80">
          <UserGroupIcon className="w-5 h-5" /> {t.statsOverview}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
           <StatCard icon={UserGroupIcon} value={playerCount} label={t.squadSize} />
           <StatCard icon={AcademicCapIcon} value={avgAge} label={t.avgAge} />
           <StatCard icon={UserPlusIcon} value={over22} label={t.over22} />
           <StatCard icon={HomeIcon} value={homeGrown} label={t.homegrown} colorClass="text-green-500" />
           <StatCard icon={GlobeEuropeAfricaIcon} value={nonEU} label={t.nonEU} colorClass="text-orange-500" />
        </div>
      </div>

      {/* Manager Actions */}
      <div>
        <h3 className="text-lg font-bold mb-3 px-1 flex items-center gap-2 opacity-80">
          <AdjustmentsHorizontalIcon className="w-5 h-5" /> {t.managerActions}
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" onClick={advanceSeason} className="gap-2">
            <ForwardIcon className="w-5 h-5" />
            {t.endSeason}
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} className="gap-2">
            <TrashIcon className="w-5 h-5" />
            {t.deleteCareer}
          </Button>
        </div>
      </div>

    </div>
  );
};

const ProfileView = ({ user, handleLogout, t, avatar, setAvatar }: any) => {
  const [viewMode, setViewMode] = useState<'main' | 'settings'>('main');
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressed = await compressImage(file);
        setAvatar(compressed);
        localStorage.setItem(`avatar_${user.uid}`, compressed);
      } catch (err) {
        console.error("Image processing failed", err);
      }
    }
  };

  const deleteAvatar = () => {
    setAvatar(null);
    localStorage.removeItem(`avatar_${user.uid}`);
    setShowDeleteConfirm(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUpdateProfile = async () => {
    if (user && newName.trim() !== '') {
      try {
        await updateProfile(user, { displayName: newName });
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating profile", error);
      }
    }
    setViewMode('main');
  };

  if (viewMode === 'settings') {
    return (
      <div className="animate-fade-in flex flex-col h-full pt-20 relative">
        <ConfirmationModal 
          isOpen={showDeleteConfirm}
          title={t.deleteConfirmTitle}
          message={t.deleteConfirmMessage}
          onConfirm={deleteAvatar}
          onCancel={() => setShowDeleteConfirm(false)}
          t={t}
        />

        <div className="absolute top-6 left-0">
          <button onClick={() => setViewMode('main')} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
        </div>

        <h2 className="text-2xl font-black mb-8 text-center">{t.accountSettings}</h2>

        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden shadow-2xl bg-black/5 dark:bg-white/5 border-4 border-white/20 dark:border-white/5">
              <img 
                src={avatar || `https://ui-avatars.com/api/?name=${user.email}&background=0D8ABC&color=fff`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <button 
              onClick={triggerFileInput}
              className="absolute bottom-0 right-0 bg-mint text-obsidian p-2 rounded-full shadow-lg hover:bg-mint-hover transition-transform hover:scale-110"
              title={t.changeAvatar}
            >
              <CameraIcon className="w-5 h-5" />
            </button>
            {avatar && (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-transform hover:scale-110"
                title={t.deleteAvatar}
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>
        </div>

        <GlassCard className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold opacity-70 ml-1">{t.nickname}</label>
            <div className="relative">
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-mint focus:ring-1 focus:ring-mint outline-none transition-all"
              />
              <UserCircleIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
             <Button variant="ghost" onClick={() => setViewMode('main')}>{t.cancel}</Button>
             <Button variant="primary" onClick={handleUpdateProfile}>{t.saveChanges}</Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center h-full pt-20">
      <div className="w-24 h-24 rounded-full bg-obsidian/5 dark:bg-ghost/5 mb-6 flex items-center justify-center text-3xl font-bold shadow-xl overflow-hidden border-4 border-white/20 dark:border-white/5">
        <img 
          src={avatar || `https://ui-avatars.com/api/?name=${user.email}&background=0D8ABC&color=fff`} 
          alt="Profile" 
          className="w-full h-full object-cover"
        />
      </div>
      <h2 className="text-2xl font-bold mb-1">{user?.displayName || 'Manager'}</h2>
      <p className="opacity-50 mb-8">{user?.email}</p>
      
      <GlassCard className="w-full max-w-sm p-4 space-y-2">
        <Button variant="ghost" className="justify-start gap-3" onClick={() => setViewMode('settings')}>
          <CogSolid className="w-5 h-5" /> {t.accountSettings}
        </Button>
        <div className="h-px bg-obsidian/5 dark:bg-ghost/5"></div>
        <Button variant="danger" onClick={handleLogout} className="justify-start gap-3">
           {t.signOut}
        </Button>
      </GlassCard>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Theme & Language State
  const [language, setLanguage] = useState<Language>(Language.IT);
  const [theme, setTheme] = useState<Theme>(Theme.AUTO);
  const t = useMemo(() => TRANSLATIONS[language], [language]);

  // View State
  const [currentView, setCurrentView] = useState<View>(View.HOME);

  // Career State
  const [career, setCareer] = useState<Career | null>(null);

  // Auth Form State
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Avatar State
  const [avatar, setAvatar] = useState<string | null>(null);

  // Theme Logic
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (themeVal: Theme) => {
      if (themeVal === Theme.DARK) root.classList.add('dark');
      else if (themeVal === Theme.LIGHT) root.classList.remove('dark');
      else { if (mediaQuery.matches) root.classList.add('dark'); else root.classList.remove('dark'); }
    };
    applyTheme(theme);
    const handleSystemChange = () => { if (theme === Theme.AUTO) applyTheme(Theme.AUTO); };
    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  // Auth Listener & Avatar Load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        const savedAvatar = localStorage.getItem(`avatar_${currentUser.uid}`);
        if (savedAvatar) {
          setAvatar(savedAvatar);
        } else {
          setAvatar(null);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Handlers
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (isLogin) { await signInWithEmailAndPassword(auth, email, password); }
      else {
        if (password !== confirmPassword) throw new Error("Passwords do not match");
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      let msg = t.errorGeneric;
      if (err.message === "Passwords do not match") msg = "Le password non corrispondono.";
      if (err.code === 'auth/invalid-email') msg = "Email non valida.";
      if (err.code === 'auth/wrong-password') msg = "Password errata.";
      if (err.code === 'auth/user-not-found') msg = "Utente non trovato.";
      if (err.code === 'auth/email-already-in-use') msg = "Email già in uso.";
      setError(msg);
    } finally { setIsSubmitting(false); }
  };

  const handleLogout = async () => { 
    await signOut(auth); 
    setAvatar(null);
    setCareer(null); // Reset career state on logout
  };

  const handleDevLogin = () => {
    const devUser = {
      uid: 'dev-access-bypass',
      email: 'developer@mcm.plus',
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'dev-token',
      getIdTokenResult: async () => ({ token: 'dev-token', signInProvider: 'dev', claims: {}, authTime: Date.now().toString(), issuedAtTime: Date.now().toString(), expirationTime: (Date.now() + 3600000).toString() }),
      reload: async () => {},
      toJSON: () => ({}),
      displayName: 'Developer',
      phoneNumber: null,
      photoURL: null,
      providerId: 'dev'
    } as unknown as User;
    setUser(devUser);
    const savedAvatar = localStorage.getItem(`avatar_${devUser.uid}`);
    setAvatar(savedAvatar || null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ghost dark:bg-obsidian">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mint"></div>
      </div>
    );
  }

  // --- Authenticated Dashboard ---
  if (user) {
    return (
      <div className="min-h-screen bg-ghost dark:bg-obsidian text-obsidian dark:text-ghost relative overflow-x-hidden font-sans">
        
        {/* Background Gradients */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-20%] w-[500px] h-[500px] bg-mint/5 dark:bg-mint/5 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-[-10%] left-[-20%] w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-3xl opacity-30"></div>
        </div>

        {/* Top Header */}
        <div className="fixed top-0 left-0 w-full z-40 px-6 pt-6 pb-2 bg-gradient-to-b from-ghost via-ghost/90 to-transparent dark:from-obsidian dark:via-obsidian/90">
           <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-60 font-medium">{t.hello},</p>
                <h1 className="text-2xl font-black tracking-tight">{user.displayName || 'Manager'}</h1>
              </div>
              <button onClick={() => setCurrentView(View.PROFILE)} className="relative group">
                 <div className="w-10 h-10 rounded-full bg-obsidian/5 dark:bg-white/5 border-2 border-transparent group-hover:border-mint transition-all duration-300 overflow-hidden">
                   <img 
                      src={avatar || `https://ui-avatars.com/api/?name=${user.email}&background=0D8ABC&color=fff`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                   />
                 </div>
              </button>
           </div>
        </div>

        {/* Main Scrollable Content */}
        <main className="pt-24 pb-32 px-6 min-h-screen">
          {currentView === View.HOME && <HomeView t={t} career={career} setCareer={setCareer} />}
          {currentView === View.PROFILE && 
            <ProfileView 
              user={user} 
              handleLogout={handleLogout} 
              t={t} 
              avatar={avatar}
              setAvatar={setAvatar}
            />
          }
          
          {(currentView !== View.HOME && currentView !== View.PROFILE) && (
            <div className="flex flex-col items-center justify-center h-[60vh] opacity-50">
               <CommandLineIcon className="w-16 h-16 mb-4" />
               <h3 className="text-xl font-bold">{t.workInProgress}</h3>
            </div>
          )}
        </main>

        {/* Bottom Navigation Pill */}
        <div className="fixed bottom-8 left-0 w-full flex justify-center z-50 px-4">
           <div className="bg-white/80 dark:bg-black/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-full px-2 py-2 shadow-2xl shadow-black/10 dark:shadow-black/40 flex gap-2">
              <NavItem 
                icon={HomeIcon} 
                solidIcon={HomeSolid} 
                active={currentView === View.HOME} 
                onClick={() => setCurrentView(View.HOME)} 
              />
              <NavItem 
                icon={UserGroupIcon} 
                solidIcon={UserGroupSolid} 
                active={currentView === View.SQUAD} 
                onClick={() => setCurrentView(View.SQUAD)} 
              />
              <NavItem 
                icon={CurrencyDollarIcon} 
                solidIcon={CurrencyDollarSolid} 
                active={currentView === View.MARKET} 
                onClick={() => setCurrentView(View.MARKET)} 
              />
              <NavItem 
                icon={Cog6ToothIcon} 
                solidIcon={CogSolid} 
                active={currentView === View.SETTINGS} 
                onClick={() => setCurrentView(View.SETTINGS)} 
              />
           </div>
        </div>

      </div>
    );
  }

  // --- Login / Register View ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans bg-ghost dark:bg-obsidian text-obsidian dark:text-ghost transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-mint/10 dark:bg-mint/5 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl opacity-30"></div>
      </div>
      <div className="absolute top-6 right-6 z-50">
        <div className="flex items-center gap-1 bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-full p-1.5 border border-obsidian/5 dark:border-ghost/5 shadow-lg shadow-black/5">
            <div className="flex gap-1">
              <ToggleButton active={language === Language.IT} onClick={() => setLanguage(Language.IT)}><span className="text-xs font-bold">IT</span></ToggleButton>
              <ToggleButton active={language === Language.EN} onClick={() => setLanguage(Language.EN)}><span className="text-xs font-bold">EN</span></ToggleButton>
            </div>
            <div className="w-px h-5 bg-obsidian/10 dark:bg-ghost/10 mx-1"></div>
            <div className="flex gap-1">
              <ToggleButton active={theme === Theme.LIGHT} onClick={() => setTheme(Theme.LIGHT)} title="Light Mode"><SunIcon className="w-4 h-4" /></ToggleButton>
              <ToggleButton active={theme === Theme.AUTO} onClick={() => setTheme(Theme.AUTO)} title="Auto Mode"><ComputerDesktopIcon className="w-4 h-4" /></ToggleButton>
              <ToggleButton active={theme === Theme.DARK} onClick={() => setTheme(Theme.DARK)} title="Dark Mode"><MoonIcon className="w-4 h-4" /></ToggleButton>
            </div>
        </div>
      </div>
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8"><h1 className="text-5xl font-black tracking-tighter mb-2 bg-gradient-to-br from-obsidian to-obsidian/60 dark:from-ghost dark:to-ghost/60 bg-clip-text text-transparent">MCM<span className="text-mint">+</span></h1><p className="text-sm font-medium opacity-60 uppercase tracking-widest">{t.subtitle}</p></div>
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl p-8 rounded-2xl border border-white/20 dark:border-white/5 shadow-2xl transition-all duration-300">
          <div className="mb-6 flex justify-between items-end"><h2 className="text-2xl font-bold">{isLogin ? t.login : t.register}</h2><span className="text-mint text-xs font-bold uppercase tracking-wider mb-1">{isLogin ? t.secureAccess : t.newCareer}</span></div>
          {error && (<div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-600 dark:text-red-400 text-sm"><ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" /><span>{error}</span></div>)}
          <form onSubmit={handleAuth}>
            <InputField label={t.email} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="manager@fc.com" disabled={isSubmitting} />
            <InputField label={t.password} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={isSubmitting} />
            {!isLogin && (<InputField label={t.confirmPassword} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" disabled={isSubmitting} />)}
            <Button className="mt-6" disabled={isSubmitting}>{isSubmitting ? t.loading : (isLogin ? t.submitLogin : t.submitRegister)}</Button>
          </form>
          <div className="mt-6 text-center text-sm"><span className="opacity-60">{isLogin ? t.noAccount : t.haveAccount} </span><button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="font-bold text-mint hover:underline">{isLogin ? t.switchRegister : t.switchLogin}</button></div>
        </div>
        <div className="mt-8 flex justify-center"><button onClick={handleDevLogin} className="group flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-mint/10 hover:text-mint transition-all duration-300 text-xs font-mono opacity-50 hover:opacity-100"><CommandLineIcon className="w-4 h-4" /><span>Developer Quick Access (Beta)</span></button></div>
      </div>
    </div>
  );
}