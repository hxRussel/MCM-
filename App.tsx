import React, { useState, useEffect, useMemo } from 'react';
import firebase from 'firebase/compat/app';
import { auth, db } from './services/firebase';
import { Language, Theme, View, Career, Currency } from './types';
import { TRANSLATIONS } from './constants';
import { 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon, 
  ExclamationCircleIcon,
  HomeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeSolid,
  UserGroupIcon as UserGroupSolid, 
  CurrencyDollarIcon as CurrencyDollarSolid, 
  Cog6ToothIcon as CogSolid,
  TrophyIcon as TrophySolid
} from '@heroicons/react/24/solid';

// Components & Views
import { InputField, Button, NavItem } from './components/SharedUI';
import { HomeView } from './views/HomeView';
import { SquadView } from './views/SquadView';
import { ProfileView } from './views/ProfileView';
import { MarketView } from './views/MarketView';
import { SettingsView } from './views/SettingsView';
import { ClubView } from './views/ClubView';

export default function App() {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Theme & Language State
  const [language, setLanguage] = useState<Language>(Language.IT);
  const [theme, setTheme] = useState<Theme>(Theme.AUTO);
  const [currency, setCurrency] = useState<Currency>('€');
  
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

  // Auth & Cloud Sync Listener
  useEffect(() => {
    let unsubscribeSnapshot: () => void;

    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        // Subscribe to Firestore document to sync data in real-time
        const userRef = db.collection('users').doc(currentUser.uid);
        unsubscribeSnapshot = userRef.onSnapshot((docSnap) => {
          if (docSnap.exists) {
            const data = docSnap.data();
            setCareer(data?.career || null);
            setAvatar(data?.avatar || null);
            if (data?.settings) {
              if (data.settings.language) setLanguage(data.settings.language);
              if (data.settings.theme) setTheme(data.settings.theme);
              if (data.settings.currency) setCurrency(data.settings.currency);
            }
          } else {
            setCareer(null);
            setAvatar(null);
          }
        }, (error) => {
           console.error("Error syncing data:", error);
        });
      } else {
        setCareer(null);
        setAvatar(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  // Handlers for Firestore Persistence
  // HELPER: Sanitize data to remove undefined values which Firestore rejects in arrays
  const sanitizeForFirestore = (data: any) => {
    return JSON.parse(JSON.stringify(data));
  };

  const handleSaveCareer = async (newCareer: Career | null) => {
    // Optimistic UI update
    setCareer(newCareer);
    if (user) {
      try {
        const cleanCareer = sanitizeForFirestore(newCareer);
        await db.collection('users').doc(user.uid).set({ career: cleanCareer }, { merge: true });
      } catch (err) {
        console.error("Failed to save career to cloud", err);
        setError("Errore nel salvataggio. Riprova.");
      }
    }
  };

  const handleSaveAvatar = async (newAvatar: string | null) => {
    // Optimistic UI update
    setAvatar(newAvatar);
    if (user) {
      try {
        await db.collection('users').doc(user.uid).set({ avatar: newAvatar }, { merge: true });
      } catch (err) {
        console.error("Failed to save avatar to cloud", err);
      }
    }
  };

  const handleSaveProfile = async (displayName: string) => {
    if (user) {
      try {
        await db.collection('users').doc(user.uid).set({ nickname: displayName }, { merge: true });
      } catch (err) {
        console.error("Failed to save profile to cloud", err);
      }
    }
  };

  // Persist Settings
  const saveSettings = async (newLang?: Language, newTheme?: Theme, newCurrency?: Currency) => {
    const l = newLang || language;
    const t = newTheme || theme;
    const c = newCurrency || currency;

    if (newLang) setLanguage(newLang);
    if (newTheme) setTheme(newTheme);
    if (newCurrency) setCurrency(newCurrency);

    if (user) {
      try {
         await db.collection('users').doc(user.uid).set({
            settings: {
              language: l,
              theme: t,
              currency: c
            }
         }, { merge: true });
      } catch (e) {
        console.error("Failed to save settings", e);
      }
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (isLogin) { await auth.signInWithEmailAndPassword(email, password); }
      else {
        if (password !== confirmPassword) throw new Error("Passwords do not match");
        await auth.createUserWithEmailAndPassword(email, password);
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
    await auth.signOut(); 
    setAvatar(null);
    setCareer(null); 
  };

  const handleDevLogin = () => {
    // Mock user for dev purposes
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
    } as unknown as firebase.User;
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
          {currentView === View.HOME && <HomeView t={t} career={career} onSaveCareer={handleSaveCareer} currency={currency} />}
          {currentView === View.SQUAD && career && <SquadView t={t} career={career} onUpdateCareer={handleSaveCareer} />}
          {currentView === View.CLUB && career && <ClubView t={t} career={career} onUpdateCareer={handleSaveCareer} language={language} currency={currency} />}
          {currentView === View.MARKET && career && <MarketView t={t} career={career} onUpdateCareer={handleSaveCareer} currency={currency} />}
          {currentView === View.SETTINGS && 
             <SettingsView 
               t={t} 
               language={language}
               setLanguage={(l) => saveSettings(l, undefined, undefined)}
               theme={theme}
               setTheme={(th) => saveSettings(undefined, th, undefined)}
               currency={currency}
               setCurrency={(c) => saveSettings(undefined, undefined, c)}
               career={career}
               onUpdateCareer={handleSaveCareer}
             />
          }
          {currentView === View.PROFILE && 
            <ProfileView 
              user={user} 
              handleLogout={handleLogout} 
              t={t} 
              avatar={avatar}
              onSaveAvatar={handleSaveAvatar}
              onSaveProfile={handleSaveProfile}
            />
          }
        </main>

        {/* Bottom Navigation Pill */}
        <div className="fixed bottom-8 left-0 w-full flex justify-center z-50 px-4">
           <div className="bg-white/80 dark:bg-black/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-full px-2 py-2 shadow-2xl shadow-black/10 dark:shadow-black/40 flex gap-1 sm:gap-2">
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
              {/* New Club Tab */}
              <NavItem 
                icon={TrophyIcon} 
                solidIcon={TrophySolid} 
                active={currentView === View.CLUB} 
                onClick={() => setCurrentView(View.CLUB)} 
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
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-mint/10 dark:bg-mint/5 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl opacity-30"></div>
      </div>

      {/* Top Bar */}
      <div className="absolute top-6 right-6 flex gap-3 z-20">
        <button 
          onClick={() => setLanguage(language === Language.EN ? Language.IT : Language.EN)}
          className="px-3 py-1 rounded-full bg-white/5 border border-obsidian/5 dark:border-ghost/10 hover:bg-white/10 text-xs font-bold tracking-wider"
        >
          {language.toUpperCase()}
        </button>
        <button 
          onClick={() => setTheme(theme === Theme.DARK ? Theme.LIGHT : Theme.DARK)}
          className="p-2 rounded-full bg-white/5 border border-obsidian/5 dark:border-ghost/10 hover:bg-white/10"
        >
          {theme === Theme.DARK ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white/80 dark:bg-black/40 backdrop-blur-2xl border border-white/40 dark:border-white/5 shadow-2xl shadow-mint/5 rounded-3xl p-8 relative animate-fade-in-up">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-logo tracking-tighter mb-2 bg-gradient-to-r from-obsidian to-obsidian/60 dark:from-ghost dark:to-ghost/60 bg-clip-text text-transparent">
            MCM<span className="text-mint">+</span>
          </h1>
          <p className="opacity-60 text-sm font-medium">{t.subtitle}</p>
        </div>

        {/* Error Message */}
        {error && (
           <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex items-start gap-3">
             <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
             <span>{error}</span>
           </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
           <InputField 
             label={t.email}
             type="email"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             placeholder="manager@mcm.plus"
           />
           
           <InputField 
             label={t.password}
             type="password"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             placeholder="••••••••"
           />

           {!isLogin && (
             <InputField 
               label={t.confirmPassword}
               type="password"
               value={confirmPassword}
               onChange={(e) => setConfirmPassword(e.target.value)}
               placeholder="••••••••"
             />
           )}

           <Button 
             variant="primary" 
             className="mt-6"
             disabled={isSubmitting}
           >
             {isSubmitting ? t.loading : (isLogin ? t.submitLogin : t.submitRegister)}
           </Button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
           <p className="text-sm opacity-60">
             {isLogin ? t.noAccount : t.haveAccount}
             <button 
               onClick={() => { setIsLogin(!isLogin); setError(null); }}
               className="ml-2 font-bold text-mint hover:underline"
             >
               {isLogin ? t.switchRegister : t.switchLogin}
             </button>
           </p>
        </div>

        {/* Dev Bypass (Hidden/Discrete) */}
        <div className="mt-8 pt-6 border-t border-obsidian/5 dark:border-ghost/5 flex justify-center">
           <button 
             onClick={handleDevLogin}
             className="text-xs opacity-30 hover:opacity-100 transition-opacity flex items-center gap-1 font-mono"
           >
             <ComputerDesktopIcon className="w-3 h-3" />
             DEV_ACCESS_V1.0
           </button>
        </div>

      </div>
      
      {/* Footer */}
      <p className="mt-8 text-xs opacity-30 font-mono">
        MCM+ v1.0.0 • {t.secureAccess}
      </p>

    </div>
  );
}