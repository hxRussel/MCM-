import React, { useState, useEffect, useMemo } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  User 
} from 'firebase/auth';
import { auth } from './services/firebase';
import { Language, Theme } from './types';
import { TRANSLATIONS } from './constants';
import { 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon, 
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

// --- Components ---

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

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Settings State
  const [language, setLanguage] = useState<Language>(Language.IT);
  const [theme, setTheme] = useState<Theme>(Theme.AUTO);

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
      if (err.message === "Passwords do not match") msg = "Le password non corrispondono."; // Simple fallback
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
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ghost dark:bg-obsidian">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mint"></div>
      </div>
    );
  }

  // Unified Toggle Component
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-mint/10 dark:bg-mint/5 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl opacity-30"></div>
      </div>

      {/* Unified Top Controls Bar */}
      <div className="absolute top-6 right-6 z-50">
        <div className="flex items-center gap-1 bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-full p-1.5 border border-obsidian/5 dark:border-ghost/5 shadow-lg shadow-black/5">
            {/* Language Group */}
            <div className="flex gap-1">
              <ToggleButton active={language === Language.IT} onClick={() => setLanguage(Language.IT)}>
                <span className="text-xs font-bold">IT</span>
              </ToggleButton>
              <ToggleButton active={language === Language.EN} onClick={() => setLanguage(Language.EN)}>
                <span className="text-xs font-bold">EN</span>
              </ToggleButton>
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-obsidian/10 dark:bg-ghost/10 mx-1"></div>

            {/* Theme Group */}
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

      {/* Main Content */}
      <div className="w-full max-w-md z-10">
        
        {/* Header Logo Area */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black tracking-tighter mb-2 bg-gradient-to-br from-obsidian to-obsidian/60 dark:from-ghost dark:to-ghost/60 bg-clip-text text-transparent">
            MCM<span className="text-mint">+</span>
          </h1>
          <p className="text-sm font-medium opacity-60 uppercase tracking-widest">{t.subtitle}</p>
        </div>

        {user ? (
          // Logged In State
          <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-white/20 dark:border-white/5 shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 bg-mint rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg shadow-mint/20">
                <span className="text-3xl font-bold text-mint-text">
                  {user.email ? user.email[0].toUpperCase() : 'U'}
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-2">{t.dashboardTitle}</h2>
              <p className="opacity-70 mb-8">{t.dashboardText}</p>
              <div className="p-4 bg-obsidian/5 dark:bg-ghost/5 rounded-lg mb-8 text-sm break-all font-mono">
                {user.email}
              </div>
              <Button onClick={handleLogout} variant="secondary">
                {t.signOut}
              </Button>
            </div>
          </div>
        ) : (
          // Auth Form State
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
        )}

      </div>
      
      <div className="absolute bottom-4 text-xs opacity-30 text-center w-full">
        MCM+ v1.0.0 &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
}