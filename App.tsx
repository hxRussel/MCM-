
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  updateProfile,
  User 
} from 'firebase/auth';
import { 
  writeBatch, 
  doc, 
  collection, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
// Removed Storage imports to fix infinite loading issues
import { auth, db } from './services/firebase';
import { Language, Theme, AppView, Career, Currency, WageFrequency, MeasurementSystem } from './types';
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
  ChevronRightIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  CommandLineIcon,
  CameraIcon,
  TrashIcon,
  PencilSquareIcon,
  XMarkIcon,
  CheckIcon,
  ChevronLeftIcon,
  ScaleIcon,
  BanknotesIcon,
  CalendarDaysIcon
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

// --- Helper Functions for CSV & Image ---

// Compress image to small base64 string
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 250; // Small thumbnail size
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Compress to JPEG 0.6 quality
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// List of columns expected to be numbers
const NUMBER_FIELDS = new Set([
  'overall', 'acceleration', 'sprint speed', 'positioning', 'finishing', 'shot power', 
  'long shots', 'volleys', 'penalties', 'vision', 'crossing', 'free kick accuracy', 
  'short passing', 'long passing', 'curve', 'dribbling', 'agility', 'balance', 
  'reactions', 'ball control', 'composure', 'interceptions', 'heading accuracy', 
  'def awareness', 'standing tackle', 'sliding tackle', 'jumping', 'stamina', 
  'strenght', 'aggression', 'weak foot', 'skill moves', 'height', 'weight', 'age',
  'gk diving', 'gk handling', 'gk kicking', 'gk positioning', 'gk reflexes'
]);

const parseCSVRow = (row: string, delimiter: string) => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, '')); // Clean quotes
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
};

// --- Profile View Component ---

const ProfileView = ({ t, user, goBack, userAvatar }: { t: any, user: User, goBack: () => void, userAvatar: string | null }) => {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameSave = async () => {
    if (!displayName.trim()) return;
    try {
      await updateProfile(user, { displayName: displayName });
      setIsEditingName(false);
      setStatusMsg(t.nameUpdated);
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (e) {
      console.error(e);
      setStatusMsg(t.errorGeneric);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);
      try {
        // Compress client-side
        const base64Img = await compressImage(file);
        
        // Save to Firestore 'users' collection instead of Auth Profile
        // This bypasses the 2048 bytes limit on photoURL
        await setDoc(doc(db, 'users', user.uid), { photoBase64: base64Img }, { merge: true });
        
        setStatusMsg(t.photoUpdated);
      } catch (err) {
        console.error(err);
        setStatusMsg("Error updating photo.");
      } finally {
        setUploading(false);
        setTimeout(() => setStatusMsg(''), 3000);
      }
    }
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm("Are you sure?")) return;
    setUploading(true);
    try {
      // Remove from Firestore
      await setDoc(doc(db, 'users', user.uid), { photoBase64: null }, { merge: true });
      setStatusMsg(t.photoDeleted);
    } catch (err) {
       console.error(err);
       setStatusMsg(t.errorGeneric);
    } finally {
      setUploading(false);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  // Use avatar from Firestore (passed via props) or fallback
  const photoUrl = userAvatar || user.photoURL;
  const initials = (user.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="px-6 pt-12 pb-32 max-w-md mx-auto w-full animate-fadeIn h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={goBack} className="p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
           <ChevronLeftIcon className="w-6 h-6"/>
        </button>
        <h2 className="text-3xl font-black">{t.profileTitle}</h2>
      </div>

      <div className="flex flex-col items-center">
        {/* Avatar Section */}
        <div className="relative group mb-8">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-white/10 shadow-2xl bg-mint flex items-center justify-center">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl font-bold text-obsidian">{initials}</span>
            )}
          </div>
          
          {/* Floating Action Buttons */}
          <div className="absolute -bottom-2 -right-2 flex gap-2">
             {/* Edit Photo */}
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="w-10 h-10 rounded-full bg-mint text-obsidian flex items-center justify-center shadow-lg hover:bg-mint-hover hover:scale-105 transition-all"
               title={t.changePhoto}
             >
                {uploading ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <CameraIcon className="w-5 h-5"/>}
             </button>
             <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileSelect} />
             
             {/* Delete Photo - Only show if photo exists */}
             {photoUrl && (
               <button 
                onClick={handleDeletePhoto}
                className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 hover:scale-105 transition-all"
                title={t.deletePhoto}
               >
                 <TrashIcon className="w-5 h-5"/>
               </button>
             )}
          </div>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div className="mb-6 px-4 py-2 bg-mint/10 text-mint rounded-lg text-sm font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircleIcon className="w-5 h-5" /> {statusMsg}
          </div>
        )}

        {/* Nickname Section */}
        <div className="w-full bg-white dark:bg-white/5 rounded-2xl p-6 shadow-sm">
           <div className="flex justify-between items-center mb-2">
             <label className="text-xs font-bold uppercase opacity-50 tracking-wider">{t.nickname}</label>
             {!isEditingName && (
               <button onClick={() => setIsEditingName(true)} className="text-mint text-sm font-bold hover:underline">
                 {t.edit}
               </button>
             )}
           </div>

           {isEditingName ? (
             <div className="flex gap-2">
               <input 
                 value={displayName}
                 onChange={(e) => setDisplayName(e.target.value)}
                 className="flex-1 bg-black/5 dark:bg-white/10 rounded px-3 py-2 outline-none focus:ring-2 ring-mint rounded-lg"
                 autoFocus
               />
               <button onClick={handleNameSave} className="p-2 bg-mint text-obsidian rounded-lg hover:opacity-90"><CheckIcon className="w-5 h-5"/></button>
               <button onClick={() => { setIsEditingName(false); setDisplayName(user.displayName || ''); }} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"><XMarkIcon className="w-5 h-5"/></button>
             </div>
           ) : (
             <p className="text-xl font-medium">{displayName || 'Manager'}</p>
           )}
        </div>

        <div className="w-full mt-6 opacity-50 text-center text-xs">
          UID: {user.uid.slice(0, 8)}...
        </div>

      </div>
    </div>
  );
};

// --- Settings View Component with CSV Upload Tool ---
const SettingsView = ({ 
  t, 
  user, 
  handleLogout, 
  language, 
  setLanguage, 
  theme, 
  setTheme, 
  onProfileClick, 
  userAvatar,
  currency,
  setCurrency,
  wageFrequency,
  setWageFrequency,
  measurementSystem,
  setMeasurementSystem
}: any) => {
  // Upload State
  const [step, setStep] = useState(0); // 0: select, 1: preview, 2: processing
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [startRowIndex, setStartRowIndex] = useState<number>(0); // New: Start Index
  const [importTeams, setImportTeams] = useState<boolean>(true); // New: Toggle Teams
  
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) {
        setUploadStatus("File is empty or invalid.");
        return;
      }

      // Auto-detect delimiter (Comma or Semicolon)
      const firstLine = lines[0];
      const commaCount = (firstLine.match(/,/g) || []).length;
      const semiCount = (firstLine.match(/;/g) || []).length;
      const delimiter = semiCount > commaCount ? ';' : ',';

      // Parse Headers
      const headers = parseCSVRow(firstLine, delimiter).map(h => h.trim());
      
      // Parse Rows
      const dataRows = lines.slice(1).map(line => {
        const values = parseCSVRow(line, delimiter);
        const obj: any = {};
        
        headers.forEach((h, i) => {
          if (h && h !== "") {
            let val: any = values[i] || "";
            
            // Clean value
            if (typeof val === 'string') val = val.trim();

            // Convert to Number if it's a numeric field
            if (NUMBER_FIELDS.has(h.toLowerCase())) {
              const num = parseFloat(val);
              val = isNaN(num) ? 0 : num;
            }
            
            obj[h.toLowerCase()] = val;
          }
        });
        return obj;
      });

      setCsvHeaders(headers);
      setParsedRows(dataRows);
      setCsvPreview(dataRows.slice(0, 3)); // Preview first 3 rows
      setStep(1);
      setUploadStatus(`Detected ${delimiter === ';' ? 'semicolon' : 'comma'} delimiter. Loaded ${dataRows.length} rows.`);
    };
    reader.readAsText(file);
  };

  const handleStartImport = async () => {
    setStep(2);
    setUploadProgress(0);
    setUploadStatus("Initializing...");

    try {
      // 1. Upload Teams (Optional)
      if (importTeams && startRowIndex === 0) {
        // Extract Unique Teams
        const uniqueTeams = new Map();
        parsedRows.forEach(row => {
          const teamName = row['team'] || row['squadra'] || row['club']; 
          const leagueName = row['league'] || row['campionato'] || row['division'];
          if (teamName && !uniqueTeams.has(teamName)) {
             uniqueTeams.set(teamName, {
               name: teamName,
               league: leagueName || 'Unknown',
               updatedAt: new Date().toISOString()
             });
          }
        });

        const teamsArray = Array.from(uniqueTeams.values());
        setUploadStatus(`Found ${teamsArray.length} unique teams. Uploading teams...`);

        const batchSize = 250; // Lower batch size for safety
        let totalBatches = Math.ceil(teamsArray.length / batchSize);
        
        for (let i = 0; i < totalBatches; i++) {
          const batch = writeBatch(db);
          const chunk = teamsArray.slice(i * batchSize, (i + 1) * batchSize);
          
          chunk.forEach(team => {
            const docId = String(team.name).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            const docRef = doc(db, 'teams', docId);
            batch.set(docRef, team);
          });

          await batch.commit();
          // Rate Limit Sleep
          await new Promise(r => setTimeout(r, 1000));
          setUploadProgress(Math.round(((i + 1) / totalBatches) * 20)); // First 20%
        }
      }

      // 2. Upload Players
      const playersToUpload = parsedRows.slice(startRowIndex);
      setUploadStatus(`Uploading ${playersToUpload.length} players starting from index ${startRowIndex}...`);
      
      const batchSize = 200; // Smaller batches to avoid quota burst
      let totalBatches = Math.ceil(playersToUpload.length / batchSize);

      for (let i = 0; i < totalBatches; i++) {
        const batch = writeBatch(db);
        const chunk = playersToUpload.slice(i * batchSize, (i + 1) * batchSize);
        
        chunk.forEach(player => {
          const teamName = player['team'] || player['squadra'] || player['club'];
          if (teamName) {
             player.teamId = String(teamName).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
          }
          const docRef = doc(collection(db, 'players'));
          batch.set(docRef, player);
        });

        await batch.commit();
        
        // IMPORTANT: Sleep to prevent "backend overload" / rate limiting
        await new Promise(r => setTimeout(r, 1200)); 

        const currentBatchProgress = ((i + 1) / totalBatches) * 80;
        setUploadProgress(20 + Math.round(currentBatchProgress));
        setUploadStatus(`Uploaded batch ${i+1}/${totalBatches} (${chunk.length} players)...`);
      }

      setUploadStatus('Import Complete!');
      setTimeout(() => {
        setStep(0);
        setParsedRows([]);
        setUploadStatus('');
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 3000);

    } catch (err: any) {
      console.error(err);
      setUploadStatus("Error: " + err.message);
      // Do not reset step, let them see error
    }
  };

  return (
    <div className="px-6 pt-24 pb-32 max-w-md mx-auto w-full animate-fadeIn">
      <h2 className="text-3xl font-black mb-8">{t.navSettings}</h2>
      
      {/* Profile Section */}
      <div 
        onClick={onProfileClick}
        className="bg-white dark:bg-white/5 rounded-2xl p-4 mb-6 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      >
        <div className="w-16 h-16 rounded-full bg-mint flex items-center justify-center text-obsidian text-xl font-bold overflow-hidden">
          {userAvatar || user.photoURL ? (
            <img src={userAvatar || user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            user.email?.[0].toUpperCase()
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="font-bold text-lg truncate">{user.displayName || user.email?.split('@')[0]}</h3>
          <p className="text-xs opacity-50 truncate">{user.email}</p>
        </div>
        <button className="p-2 text-mint hover:bg-mint/10 rounded-full">
           <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Preferences */}
      <div className="space-y-4">
        
        {/* Appearance Group */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-4 shadow-sm">
          <h4 className="text-xs font-bold uppercase opacity-50 mb-4 tracking-wider flex items-center gap-2">
            <SunIcon className="w-3 h-3"/> {t.appearance}
          </h4>
          <div className="flex justify-between items-center mb-4">
             <span>Theme</span>
             <div className="flex bg-obsidian/5 dark:bg-ghost/5 p-1 rounded-full">
                <ToggleButton active={theme === Theme.LIGHT} onClick={() => setTheme(Theme.LIGHT)}><SunIcon className="w-4 h-4"/></ToggleButton>
                <ToggleButton active={theme === Theme.AUTO} onClick={() => setTheme(Theme.AUTO)}><ComputerDesktopIcon className="w-4 h-4"/></ToggleButton>
                <ToggleButton active={theme === Theme.DARK} onClick={() => setTheme(Theme.DARK)}><MoonIcon className="w-4 h-4"/></ToggleButton>
             </div>
          </div>
          <div className="flex justify-between items-center">
             <span>{t.language}</span>
             <div className="flex bg-obsidian/5 dark:bg-ghost/5 p-1 rounded-full gap-1">
                <ToggleButton active={language === Language.IT} onClick={() => setLanguage(Language.IT)}><span className="text-xs font-bold">IT</span></ToggleButton>
                <ToggleButton active={language === Language.EN} onClick={() => setLanguage(Language.EN)}><span className="text-xs font-bold">EN</span></ToggleButton>
             </div>
          </div>
        </div>

        {/* Career Preferences Group */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-4 shadow-sm">
          <h4 className="text-xs font-bold uppercase opacity-50 mb-4 tracking-wider flex items-center gap-2">
            <CurrencyDollarIcon className="w-3 h-3"/> {t.preferences}
          </h4>

          {/* Currency */}
          <div className="flex justify-between items-center mb-4">
             <span className="text-sm">{t.currency}</span>
             <div className="flex bg-obsidian/5 dark:bg-ghost/5 p-1 rounded-full gap-1">
                {Object.values(Currency).map((cur) => (
                  <ToggleButton 
                    key={cur}
                    active={currency === cur} 
                    onClick={() => setCurrency(cur)}
                  >
                    <span className="text-xs font-bold">{cur}</span>
                  </ToggleButton>
                ))}
             </div>
          </div>

          {/* Wage Frequency */}
          <div className="flex justify-between items-center mb-4">
             <span className="text-sm">{t.wageFrequency}</span>
             <div className="flex bg-obsidian/5 dark:bg-ghost/5 p-1 rounded-full gap-1">
                <ToggleButton active={wageFrequency === WageFrequency.WEEKLY} onClick={() => setWageFrequency(WageFrequency.WEEKLY)}>
                   <span className="text-xs font-bold px-1">{t.weekly}</span>
                </ToggleButton>
                <ToggleButton active={wageFrequency === WageFrequency.YEARLY} onClick={() => setWageFrequency(WageFrequency.YEARLY)}>
                   <span className="text-xs font-bold px-1">{t.yearly}</span>
                </ToggleButton>
             </div>
          </div>

          {/* Measurement System */}
          <div className="flex flex-col gap-2">
             <span className="text-sm">{t.measurements}</span>
             <div className="flex bg-obsidian/5 dark:bg-ghost/5 p-1 rounded-full w-full">
                <ToggleButton 
                  className="flex-1"
                  active={measurementSystem === MeasurementSystem.METRIC} 
                  onClick={() => setMeasurementSystem(MeasurementSystem.METRIC)}
                >
                   <span className="text-xs font-bold">{t.metric}</span>
                </ToggleButton>
                <ToggleButton 
                  className="flex-1"
                  active={measurementSystem === MeasurementSystem.IMPERIAL} 
                  onClick={() => setMeasurementSystem(MeasurementSystem.IMPERIAL)}
                >
                   <span className="text-xs font-bold">{t.imperial}</span>
                </ToggleButton>
             </div>
          </div>

        </div>


         {/* DEVELOPER TOOLS - SMART CSV IMPORTER */}
         <div className="bg-obsidian/5 dark:bg-ghost/5 border-2 border-dashed border-mint/30 rounded-2xl p-4 shadow-sm mt-8">
          <h4 className="text-xs font-bold uppercase text-mint mb-4 tracking-wider flex items-center gap-2">
            <CloudArrowUpIcon className="w-4 h-4"/> Smart CSV Importer
          </h4>
          
          <div className="text-sm opacity-70 mb-4">
             Auto-maps columns and manages write quotas.
          </div>

          {step === 0 && (
            <div className="relative">
              <input 
                type="file" 
                ref={fileInputRef}
                accept=".csv"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-full py-4 bg-white dark:bg-obsidian border border-obsidian/10 dark:border-ghost/10 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-mint transition-colors cursor-pointer">
                 <DocumentTextIcon className="w-8 h-8 opacity-50" />
                 <span className="text-sm font-medium">Select CSV File</span>
              </div>
            </div>
          )}

          {step === 1 && (
             <div className="space-y-4 animate-fadeIn">
                <div className="text-xs text-mint font-mono flex items-center gap-2">
                   <CheckCircleIcon className="w-4 h-4" /> {uploadStatus}
                </div>

                <div className="bg-black/10 dark:bg-white/10 p-2 rounded text-[10px] font-mono overflow-x-auto">
                  <p className="font-bold mb-1 text-mint">Preview:</p>
                  {csvPreview.length > 0 && (
                     <div className="grid grid-cols-2 gap-1">
                       <div>Name: <span className="opacity-70">{csvPreview[0].name}</span></div>
                       <div>Team: <span className="opacity-70">{csvPreview[0].team}</span></div>
                     </div>
                  )}
                </div>

                {/* Import Config Options */}
                <div className="bg-white/5 rounded-lg p-3 space-y-3">
                   <div className="flex items-center justify-between text-sm">
                      <label className="opacity-80">Import Teams?</label>
                      <input 
                        type="checkbox" 
                        checked={importTeams} 
                        onChange={(e) => setImportTeams(e.target.checked)}
                        className="accent-mint w-4 h-4"
                      />
                   </div>
                   <div className="flex items-center justify-between text-sm">
                      <label className="opacity-80">Start from Row (Index)</label>
                      <input 
                        type="number" 
                        value={startRowIndex} 
                        onChange={(e) => setStartRowIndex(Number(e.target.value))}
                        className="bg-black/10 dark:bg-white/10 rounded px-2 py-1 w-20 text-right outline-none focus:ring-1 ring-mint"
                      />
                   </div>
                   <p className="text-[10px] opacity-50 leading-tight">
                     Use "Start from Row" if previous upload failed due to quota. E.g., if it failed at 50%, try starting at row 8000.
                   </p>
                </div>

                <div className="flex gap-2 pt-2">
                   <Button variant="ghost" onClick={() => { setStep(0); setParsedRows([]); }} className="!py-2 text-sm">Cancel</Button>
                   <Button variant="primary" onClick={handleStartImport} className="!py-2 text-sm">Start Import</Button>
                </div>
             </div>
          )}

          {step === 2 && (
            <div className="space-y-3 animate-fadeIn">
               <div className="flex justify-between text-xs font-mono">
                  <span className="truncate max-w-[70%]">{uploadStatus}</span>
                  <span>{uploadProgress}%</span>
               </div>
               <div className="w-full h-2 bg-obsidian/10 dark:bg-ghost/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-mint transition-all duration-300 relative overflow-hidden"
                    style={{ width: `${uploadProgress}%` }}
                  >
                     <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
               </div>
               <div className="flex justify-center pt-2">
                  <ArrowPathIcon className="w-5 h-5 animate-spin opacity-50" />
               </div>
            </div>
          )}

          {uploadStatus === 'Import Complete!' && (
             <div className="mt-4 p-3 bg-mint/10 rounded-lg text-center text-mint text-sm font-bold flex items-center justify-center gap-2">
               <CheckCircleIcon className="w-5 h-5" /> All Data Imported!
             </div>
          )}
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
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Settings State
  const [language, setLanguage] = useState<Language>(Language.IT);
  const [theme, setTheme] = useState<Theme>(Theme.AUTO);
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);

  // New Career Preferences State
  const [currency, setCurrency] = useState<Currency>(Currency.EUR);
  const [wageFrequency, setWageFrequency] = useState<WageFrequency>(WageFrequency.WEEKLY);
  const [measurementSystem, setMeasurementSystem] = useState<MeasurementSystem>(MeasurementSystem.METRIC);

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

  // Listen for real-time avatar updates from Firestore to bypass Auth profile limits
  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.photoBase64) {
             setUserAvatar(data.photoBase64);
             return;
          }
        }
        setUserAvatar(null);
      });
      return () => unsubscribe();
    } else {
      setUserAvatar(null);
    }
  }, [user]);

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
    setUserAvatar(null);
  };

  const handleDevLogin = () => {
    // Bypass authentication by setting a mock user object directly in state
    // This allows developer access without hitting Firebase Auth
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
      getIdTokenResult: async () => ({
        token: 'dev-token',
        signInProvider: 'dev',
        claims: {},
        authTime: Date.now().toString(),
        issuedAtTime: Date.now().toString(),
        expirationTime: (Date.now() + 3600000).toString(),
      }),
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

  // --- LOGGED IN DASHBOARD ---
  if (user) {
    const userName = user.displayName || (user.email ? user.email.split('@')[0] : 'Manager');
    // const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);

    return (
      <div className="min-h-screen bg-ghost dark:bg-obsidian text-obsidian dark:text-ghost font-sans relative overflow-hidden transition-colors duration-300">
        
        {/* Top Header - Always visible on top (except maybe settings? keeping it consistent) */}
        {currentView !== AppView.PROFILE && (
          <div className="pt-8 px-6 pb-4 flex justify-between items-center z-20 relative animate-fadeIn">
             <div>
                <p className="text-sm opacity-60 font-medium mb-0.5">{t.welcome}</p>
                <h1 className="text-2xl font-bold tracking-tight">{userName}</h1>
             </div>
             <button 
               onClick={() => setCurrentView(AppView.PROFILE)}
               className="w-10 h-10 rounded-full bg-mint flex items-center justify-center shadow-lg shadow-mint/20 hover:scale-105 transition-transform overflow-hidden"
             >
                {userAvatar || user.photoURL ? (
                  <img src={userAvatar || user.photoURL} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <UserCircleIcon className="w-6 h-6 text-obsidian" />
                )}
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

          {currentView === AppView.SETTINGS && (
             <SettingsView 
               t={t} 
               user={user} 
               handleLogout={handleLogout}
               language={language}
               setLanguage={setLanguage}
               theme={theme}
               setTheme={setTheme}
               onProfileClick={() => setCurrentView(AppView.PROFILE)}
               userAvatar={userAvatar}
               currency={currency}
               setCurrency={setCurrency}
               wageFrequency={wageFrequency}
               setWageFrequency={setWageFrequency}
               measurementSystem={measurementSystem}
               setMeasurementSystem={setMeasurementSystem}
             />
          )}

          {currentView === AppView.PROFILE && (
             <ProfileView 
               t={t} 
               user={user} 
               goBack={() => setCurrentView(AppView.SETTINGS)}
               userAvatar={userAvatar}
             />
          )}

        </div>

        <BottomNav currentView={currentView} setView={setCurrentView} t={t} />
      </div>
    );
  }

  // --- AUTH SCREEN ---
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

            <Button 
              className="mt-6" 
              disabled={isSubmitting}
            >
              {isSubmitting ? t.loading : (isLogin ? t.submitLogin : t.submitRegister)}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="opacity-60">{isLogin ? t.noAccount : t.haveAccount} </span>
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="font-bold text-mint hover:underline"
            >
              {isLogin ? t.switchRegister : t.switchLogin}
            </button>
          </div>
        </div>

        {/* DEVELOPER QUICK ACCESS */}
        <div className="mt-8 flex justify-center">
          <button 
            onClick={handleDevLogin}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-mint/10 hover:text-mint transition-all duration-300 text-xs font-mono opacity-50 hover:opacity-100"
          >
            <CommandLineIcon className="w-4 h-4" />
            <span>Developer Quick Access (Beta)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
