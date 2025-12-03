import React, { useState, useEffect, useMemo } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  User 
} from 'firebase/auth';
import { auth } from './services/firebase';
import { Language, Theme, View } from './types';
import { TRANSLATIONS } from './constants';
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
  HeartIcon
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
    danger: "bg-red-500/10 text-red-600 hover:bg-red-500/20"
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

const Chip = ({ label, active }: { label: string, active?: boolean }) => (
  <button className={`
    px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap
    ${active 
      ? 'bg-obsidian dark:bg-ghost text-ghost dark:text-obsidian shadow-lg' 
      : 'bg-white/50 dark:bg-white/5 text-obsidian dark:text-ghost hover:bg-white/80 dark:hover:bg-white/10'}
  `}>
    {label}
  </button>
);

// --- Views ---

const HomeView = ({ t }: { t: any }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-obsidian/40 dark:text-ghost/40" />
        </div>
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          className="w-full pl-11 pr-12 py-4 rounded-full bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/5 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-mint/50 transition-all text-obsidian dark:text-ghost placeholder-obsidian/40 dark:placeholder-ghost/40 shadow-sm"
        />
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
           <button className="p-2 rounded-full bg-obsidian text-ghost dark:bg-ghost dark:text-obsidian hover:scale-105 transition-transform">
             <AdjustmentsHorizontalIcon className="h-5 w-5" />
           </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <Chip label="All Careers" active />
        <Chip label="Premier League" />
        <Chip label="Serie A" />
        <Chip label="La Liga" />
      </div>

      {/* Active Career Hero Card */}
      <div>
        <h3 className="text-xl font-bold mb-4 px-1">{t.continueCareer}</h3>
        <GlassCard className="relative h-[400px] group cursor-pointer transition-transform duration-300 active:scale-95">
           {/* Background Image Placeholder */}
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 z-10"></div>
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
           
           <div className="absolute top-4 right-4 z-20">
             <button className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors">
               <HeartIcon className="w-6 h-6" />
             </button>
           </div>

           <div className="absolute bottom-0 left-0 w-full p-6 z-20 text-white">
             <span className="text-mint font-bold text-sm tracking-wider uppercase mb-1 block">Season 2025/26</span>
             <h2 className="text-4xl font-black mb-1">Real Madrid</h2>
             <div className="flex items-center gap-2 mb-4 opacity-80">
                <span className="text-sm">Carlo Ancelotti</span>
                <span className="w-1 h-1 rounded-full bg-white"></span>
                <span className="text-sm flex items-center gap-1">
                   <span className="text-yellow-400">★</span> 92 OVR
                </span>
             </div>
             
             <div className="flex items-center justify-between">
               <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm font-semibold transition-all w-full mr-3">
                 See details
               </button>
               <button className="bg-mint text-obsidian p-3 rounded-full hover:bg-mint-hover transition-colors shadow-lg shadow-mint/20">
                 <ArrowRightIcon className="w-5 h-5" />
               </button>
             </div>
           </div>
        </GlassCard>
      </div>

      {/* Quick Stats Grid Placeholder */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-4 flex flex-col justify-between h-32">
           <div className="p-2 bg-blue-500/10 rounded-full w-fit text-blue-500"><UserGroupSolid className="w-5 h-5"/></div>
           <div>
             <span className="text-2xl font-bold block">28</span>
             <span className="text-xs opacity-60">Players</span>
           </div>
        </GlassCard>
        <GlassCard className="p-4 flex flex-col justify-between h-32">
           <div className="p-2 bg-green-500/10 rounded-full w-fit text-green-500"><CurrencyDollarSolid className="w-5 h-5"/></div>
           <div>
             <span className="text-2xl font-bold block">€120M</span>
             <span className="text-xs opacity-60">Budget</span>
           </div>
        </GlassCard>
      </div>
    </div>
  );
};

const ProfileView = ({ user, handleLogout, t }: any) => (
  <div className="animate-fade-in flex flex-col items-center justify-center h-full pt-20">
    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-mint to-blue-500 mb-6 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
      {user?.email?.charAt(0).toUpperCase()}
    </div>
    <h2 className="text-2xl font-bold mb-1">{user?.displayName || 'Manager'}</h2>
    <p className="opacity-50 mb-8">{user?.email}</p>
    
    <GlassCard className="w-full max-w-sm p-4 space-y-2">
      <Button variant="ghost" className="justify-start gap-3">
        <CogSolid className="w-5 h-5" /> Account Settings
      </Button>
      <div className="h-px bg-obsidian/5 dark:bg-ghost/5"></div>
      <Button variant="danger" onClick={handleLogout} className="justify-start gap-3">
         Sign Out
      </Button>
    </GlassCard>
  </div>
);

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

  // Auth Form State
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
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

  const handleLogout = async () => { await signOut(auth); };

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
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 p-0.5 shadow-md group-hover:scale-105 transition-transform">
                   {/* Placeholder Avatar */}
                   <img 
                      src={`https://ui-avatars.com/api/?name=${user.email}&background=0D8ABC&color=fff`} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                   />
                 </div>
              </button>
           </div>
        </div>

        {/* Main Scrollable Content */}
        <main className="pt-24 pb-32 px-6 min-h-screen">
          {currentView === View.HOME && <HomeView t={t} />}
          {currentView === View.PROFILE && <ProfileView user={user} handleLogout={handleLogout} t={t} />}
          
          {/* Placeholder for other views */}
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

  // --- Login / Register View (Same as before) ---
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