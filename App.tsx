import React, { useState, useEffect, useMemo } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  User 
} from 'firebase/auth';
import { auth } from './services/firebase';
import { Language, Theme, AppView, Career } from './types';
import { TRANSLATIONS, MOCK_CAREERS } from './constants';
import { 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon, 
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  HomeIcon,
  CircleStackIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  PlusIcon,
  UserCircleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// --- Shared Components ---

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

const Button = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  disabled = false,
  className = ''
}: { 
  onClick?: () => void; 
  children?: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'ghost'; 
  disabled?: boolean;
  className?: string;
}) => {
  let baseStyles = "w-full py-3 rounded-lg font-semibold transition-all duration-200 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-mint text-mint-text hover:bg-mint-hover shadow-lg shadow-mint/20",
    secondary: "bg-obsidian text-ghost dark:bg-ghost dark:text-obsidian hover:opacity-90",
    ghost: "bg-transparent text-obsidian dark:text-ghost hover:bg-black/5 dark:hover:bg-white/5"
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

const ToggleButton = ({ active, onClick, children, title }: any) => (
  <button
    onClick={onClick}
    title={title}
    className={`
      flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200
      ${active 
        ? 'bg-obsidian text-ghost dark:bg-ghost dark:text-obsidian shadow-sm scale-105' 
        : 'text-obsidian dark:text-ghost opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'}
    `}
  >
    {children}
  </button>
);

// --- Dashboard Components ---

const CareerCard: React.FC<{ career: Career, t: any, onClick: () => void }> = ({ career, t, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group relative min-w-[280px] w-[80%] max-w-[320px] h-[420px] rounded-3xl overflow-hidden cursor-pointer shadow-xl transition-all duration-300 hover:scale-[1.02] snap-center"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={career.logoUrl} 
          alt={career.teamName} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent opacity-90"></div>
      </div>

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end text-ghost">
        <div className="mb-auto pt-2 flex justify-between items-start">
           <div className="bg-obsidian/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-mono">
             {career.season}
           </div>
           <div className="flex text-mint">
             {[...Array(career.rating)].map((_, i) => (
               <StarIconSolid key={i} className="w-4 h-4" />
             ))}
           </div>
        </div>

        <h3 className="text-3xl font-black uppercase tracking-tight leading-none mb-1">
          {career.teamName}
        </h3>
        <p className="text-lg opacity-80 mb-4 font-medium">{career.managerName}</p>

        <div className="flex items-center gap-2 text-xs opacity-60 font-mono border-t border-white/10 pt-4">
          <span>{t.lastPlayed}:</span>
          <span className="text-mint">{career.lastPlayed}</span>
        </div>
      </div>
    </div>
  );
};

const AddCareerCard: React.FC<{ t: any, onClick: () => void }> = ({ t, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group relative min-w-[280px] w-[80%] max-w-[320px] h-[420px] rounded-3xl overflow-hidden cursor-pointer shadow-lg bg-ghost dark:bg-white/5 border-2 border-dashed border-obsidian/10 dark:border-ghost/10 flex flex-col items-center justify-center text-center p-6 snap-center hover:border-mint transition-colors duration-300"
    >
      <div className="w-20 h-20 rounded-full bg-mint/10 group-hover:bg-mint flex items-center justify-center mb-6 transition-all duration-300 shadow-lg shadow-mint/10">
        <PlusIcon className="w-10 h-10 text-mint group-hover:text-obsidian transition-colors duration-300" />
      </div>
      <h3 className="text-xl font-bold mb-2">{t.addTeam}</h3>
      <p className="text-sm opacity-50 px-4">{t.createCareer}</p>
    </div>
  );
};

const BottomNav = ({ currentView, setView, t }: { currentView: AppView, setView: (v: AppView) => void, t: any }) => {
  const navItems = [
    { id: AppView.HOME, icon: HomeIcon, label: t.navHome },
    { id: AppView.SQUAD, icon: CircleStackIcon, label: t.navSquad },
    { id: AppView.MARKET, icon: CurrencyDollarIcon, label: t.navMarket },
    { id: AppView.SETTINGS, icon: Cog6ToothIcon, label: t.navSettings },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <div className="bg-white/90 dark:bg-obsidian/90 backdrop-blur-2xl border border-obsidian/5 dark:border-ghost/10 rounded-full shadow-2xl shadow-obsidian/20 dark:shadow-black/50 flex justify-around items-center px-2 py-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex flex-col items-center justify-center w-16 transition-all duration-300 ${
              currentView === item.id 
                ? 'text-mint -translate-y-1' 
                : 'text-obsidian/40 dark:text-ghost/40 hover:text-obsidian dark:hover:text-ghost hover:-translate-y-0.5'
            }`}
          >
            <item.icon className={`w-6 h-6 mb-1 ${currentView === item.id ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            {currentView === item.id && (
               <span className="text-[10px] font-bold absolute -bottom-3 animate-fadeIn">{item.label}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Settings View Component ---
const SettingsView = ({ t, user, handleLogout, language, setLanguage, theme, setTheme }: any) => {
  return (
    <div className="px-6 pt-24 pb-32 max-w-md mx-auto w-full animate-fadeIn">
      <h2 className="text-3xl font-black mb-8">{t.navSettings}</h2>
      
      {/* Profile Section */}
      <div className="bg-white dark:bg-white/5 rounded-2xl p-4 mb-6 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-mint flex items-center justify-center text-obsidian text-xl font-bold">
          {user.email?.[0].toUpperCase()}
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="font-bold text-lg truncate">{user.email?.split('@')[0]}</h3>
          <p className="text-xs opacity-50 truncate">{user.email}</p>
        </div>
        <button className="p-2 text-mint hover:bg-mint/10 rounded-full">
           <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Preferences */}
      <div className="space-y-4">
        <div className="bg-white dark:bg-white/5 rounded-2xl p-4 shadow-sm">
          <h4 className="text-xs font-bold uppercase opacity-50 mb-4 tracking-wider">{t.appearance}</h4>
          <div className="flex justify-between items-center">
             <span>Theme</span>
             <div className="flex bg-obsidian/5 dark:bg-ghost/5 p-1 rounded-full">
                <ToggleButton active={theme === Theme.LIGHT} onClick={() => setTheme(Theme.LIGHT)}><SunIcon className="w-4 h-4"/></ToggleButton>
                <ToggleButton active={theme === Theme.AUTO} onClick={() => setTheme(Theme.AUTO)}><ComputerDesktopIcon className="w-4 h-4"/></ToggleButton>
                <ToggleButton active={theme === Theme.DARK} onClick={() => setTheme(Theme.DARK)}><MoonIcon className="w-4 h-4"/></ToggleButton>
             </div>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl p-4 shadow-sm">
          <h4 className="text-xs font-bold uppercase opacity-50 mb-4 tracking-wider">{t.language}</h4>
          <div className="flex justify-between items-center">
             <span>Language</span>
             <div className="flex bg-obsidian/5 dark:bg-ghost/5 p-1 rounded-full gap-1">
                <ToggleButton active={language === Language.IT} onClick={() => setLanguage(Language.IT)}><span className="text-xs font-bold">IT</span></ToggleButton>
                <ToggleButton active={language === Language.EN} onClick={() => setLanguage(Language.EN)}><span className="text-xs font-bold">EN</span></ToggleButton>
             </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button variant="secondary" onClick={handleLogout}>{t.signOut}</Button>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Settings State
  const [language, setLanguage] = useState<Language>(Language.IT);
  const [theme, setTheme] = useState<Theme>(Theme.AUTO);
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);

  // Form State
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = useMemo(() => TRANSLATIONS[language], [language]);

  // Handle Theme
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (themeVal: Theme) => {
      if (themeVal === Theme.DARK) {
        root.classList.add('dark');
      } else if (themeVal === Theme.LIGHT) {
        root.classList.remove('dark');
      } else {
        // Auto
        if (mediaQuery.matches) root.classList.add('dark');
        else root.classList.remove('dark');
      }
    };

    applyTheme(theme);

    const handleSystemChange = () => {
      if (theme === Theme.AUTO) applyTheme(Theme.AUTO);
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  // Handle Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    // Reset view to home on logout for next login
    setCurrentView(AppView.HOME);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ghost dark:bg-obsidian">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mint"></div>
      </div>
    );
  }

  // --- LOGGED IN DASHBOARD ---
  if (user) {
    const userName = user.email ? user.email.split('@')[0] : 'Manager';
    const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);

    return (
      <div className="min-h-screen bg-ghost dark:bg-obsidian text-obsidian dark:text-ghost font-sans relative overflow-hidden transition-colors duration-300">
        
        {/* Top Header - Always visible on top (except maybe settings? keeping it consistent) */}
        {currentView !== AppView.SETTINGS && (
          <div className="pt-8 px-6 pb-4 flex justify-between items-center z-20 relative">
             <div>
                <p className="text-sm opacity-60 font-medium mb-0.5">{t.welcome}</p>
                <h1 className="text-2xl font-bold tracking-tight">{formattedName}</h1>
             </div>
             <button 
               onClick={() => setCurrentView(AppView.PROFILE)}
               className="w-10 h-10 rounded-full bg-mint flex items-center justify-center shadow-lg shadow-mint/20 hover:scale-105 transition-transform"
             >
                <UserCircleIcon className="w-6 h-6 text-obsidian" />
             </button>
          </div>
        )}

        {/* View Content */}
        <div className="h-full pb-32 overflow-y-auto overflow-x-hidden">
          
          {currentView === AppView.HOME && (
            <div className="flex flex-col h-full justify-center">
              {/* Horizontal Scroll Section */}
              <div className="w-full overflow-x-auto pb-8 pt-4 hide-scrollbar snap-x flex gap-6 px-8 items-center" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <AddCareerCard t={t} onClick={() => console.log('Create new career')} />
                {MOCK_CAREERS.map(career => (
                  <CareerCard 
                    key={career.id} 
                    career={career} 
                    t={t} 
                    onClick={() => console.log(`Open career ${career.id}`)} 
                  />
                ))}
                {/* Spacer for padding at end */}
                <div className="w-2 shrink-0"></div>
              </div>
            </div>
          )}

          {currentView === AppView.SQUAD && (
            <div className="flex items-center justify-center h-[60vh] opacity-30">
              <div className="text-center">
                <CircleStackIcon className="w-16 h-16 mx-auto mb-4" />
                <p>{t.navSquad} - Coming Soon</p>
              </div>
            </div>
          )}

          {currentView === AppView.MARKET && (
            <div className="flex items-center justify-center h-[60vh] opacity-30">
              <div className="text-center">
                <CurrencyDollarIcon className="w-16 h-16 mx-auto mb-4" />
                <p>{t.navMarket} - Coming Soon</p>
              </div>
            </div>
          )}

          {(currentView === AppView.SETTINGS || currentView === AppView.PROFILE) && (
             <SettingsView 
               t={t} 
               user={user} 
               handleLogout={handleLogout}
               language={language}
               setLanguage={setLanguage}
               theme={theme}
               setTheme={setTheme}
             />
          )}

        </div>

        <BottomNav currentView={currentView} setView={setCurrentView} t={t} />
      </div>
    );
  }

  // --- AUTH SCREEN (From previous iteration) ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans bg-ghost dark:bg-obsidian text-obsidian dark:text-ghost transition-colors duration-300">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-mint/10 dark:bg-mint/5 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl opacity-30"></div>
      </div>

      {/* Unified Top Controls Bar (Visible only on login) */}
      <div className="absolute top-6 right-6 z-50">
        <div className="flex items-center gap-1 bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-full p-1.5 border border-obsidian/5 dark:border-ghost/5 shadow-lg shadow-black/5">
            <div className="flex gap-1">
              <ToggleButton active={language === Language.IT} onClick={() => setLanguage(Language.IT)}>
                <span className="text-xs font-bold">IT</span>
              </ToggleButton>
              <ToggleButton active={language === Language.EN} onClick={() => setLanguage(Language.EN)}>
                <span className="text-xs font-bold">EN</span>
              </ToggleButton>
            </div>
            <div className="w-px h-5 bg-obsidian/10 dark:bg-ghost/10 mx-1"></div>
            <div className="flex gap-1">
              <ToggleButton active={theme === Theme.LIGHT} onClick={() => setTheme(Theme.LIGHT)} title="Light Mode">
                <SunIcon className="w-4 h-4" />
              </ToggleButton>
              <ToggleButton active={theme === Theme.AUTO} onClick={() => setTheme(Theme.AUTO)} title="Auto Mode">
                <ComputerDesktopIcon className="w-4 h-4" />
              </ToggleButton>
              <ToggleButton active={theme === Theme.DARK} onClick={() => setTheme(Theme.DARK)} title="Dark Mode">
                <MoonIcon className="w-4 h-4" />
              </ToggleButton>
            </div>
        </div>
      </div>

      {/* Main Auth Content */}
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black tracking-tighter mb-2 bg-gradient-to-br from-obsidian to-obsidian/60 dark:from-ghost dark:to-ghost/60 bg-clip-text text-transparent">
            MCM<span className="text-mint">+</span>
          </h1>
          <p className="text-sm font-medium opacity-60 uppercase tracking-widest">{t.subtitle}</p>
        </div>

        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl p-8 rounded-2xl border border-white/20 dark:border-white/5 shadow-2xl transition-all duration-300">
          <div className="mb-6 flex justify-between items-end">
            <h2 className="text-2xl font-bold">{isLogin ? t.login : t.register}</h2>
            <span className="text-mint text-xs font-bold uppercase tracking-wider mb-1">
              {isLogin ? t.secureAccess : t.newCareer}
            </span>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-600 dark:text-red-400 text-sm">
              <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAuth}>
            <InputField 
              label={t.email} 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="manager@fc.com"
              disabled={isSubmitting}
            />
            
            <InputField 
              label={t.password} 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              disabled={isSubmitting}
            />

            {!isLogin && (
              <InputField 
                label={t.confirmPassword} 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="••••••••"
                disabled={isSubmitting}
              />
            )}

            <div className="mt-8">
              <Button disabled={isSubmitting}>
                {isSubmitting ? t.loading : (isLogin ? t.submitLogin : t.submitRegister)}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-obsidian/10 dark:border-ghost/10 text-center text-sm">
            <span className="opacity-60 mr-2">
              {isLogin ? t.noAccount : t.haveAccount}
            </span>
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="font-bold text-mint-hover dark:text-mint hover:underline"
            >
              {isLogin ? t.switchRegister : t.switchLogin}
            </button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 text-xs opacity-30 text-center w-full">
        MCM+ v1.0.0 &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
}