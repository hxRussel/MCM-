

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
  addDoc, 
  onSnapshot,
  query,
  limit,
  orderBy,
  startAt,
  endAt,
  deleteDoc,
  updateDoc,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { Language, Theme, AppView, Career, Currency, WageFrequency, MeasurementSystem, Player, Team } from './types';
import { TRANSLATIONS, MOCK_CAREER, MOCK_PLAYERS } from './constants';
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
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  UserGroupIcon,
  GlobeEuropeAfricaIcon,
  AcademicCapIcon,
  IdentificationIcon
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

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  isDanger = false
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-obsidian w-full max-w-sm rounded-2xl shadow-2xl border border-white/10 p-6 animate-scaleIn">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="opacity-70 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="!py-2">{cancelText}</Button>
          <Button variant={isDanger ? "danger" : "primary"} onClick={onConfirm} className="!py-2">{confirmText}</Button>
        </div>
      </div>
    </div>
  );
};

// --- Helper Functions ---
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 250; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

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
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
};

// Function to generate a mock squad for a custom team
const generateMockSquad = (teamId: string, teamName: string) => {
  const players: any[] = [];
  const positions = [
    { pos: 'GK', count: 2, minOvr: 75, maxOvr: 85 },
    { pos: 'CB', count: 4, minOvr: 74, maxOvr: 84 },
    { pos: 'RB', count: 1, minOvr: 74, maxOvr: 82 },
    { pos: 'LB', count: 1, minOvr: 74, maxOvr: 82 },
    { pos: 'CM', count: 4, minOvr: 75, maxOvr: 86 },
    { pos: 'CDM', count: 2, minOvr: 74, maxOvr: 83 },
    { pos: 'CAM', count: 2, minOvr: 76, maxOvr: 87 },
    { pos: 'ST', count: 2, minOvr: 78, maxOvr: 88 },
    { pos: 'LW', count: 1, minOvr: 76, maxOvr: 85 },
    { pos: 'RW', count: 1, minOvr: 76, maxOvr: 85 },
  ];

  positions.forEach(p => {
    for(let i=0; i<p.count; i++) {
      const ovr = Math.floor(Math.random() * (p.maxOvr - p.minOvr + 1)) + p.minOvr;
      const id = `${teamId}_${p.pos}_${i}`;
      players.push({
        id,
        name: `Mock ${p.pos} ${i+1}`,
        position: p.pos,
        overall: ovr,
        age: Math.floor(Math.random() * 15) + 18,
        height: 175 + Math.floor(Math.random() * 20),
        weight: 70 + Math.floor(Math.random() * 20),
        teamId: teamId,
        team: teamName,
        nationality: 'Unknown',
        acceleration: ovr - 5 + Math.floor(Math.random() * 10),
        'sprint speed': ovr - 5 + Math.floor(Math.random() * 10),
        finishing: p.pos === 'ST' ? ovr : ovr - 20,
        'gk diving': p.pos === 'GK' ? ovr : 10,
        'gk reflexes': p.pos === 'GK' ? ovr : 10,
        // Add minimal stats to prevent crashes
        dribbling: ovr - 10,
        'ball control': ovr - 5,
        stamina: 80,
      });
    }
  });
  return players;
};

// --- Modals ---

const AddCareerModal = ({ t, userId, onClose }: { t: any, userId: string, onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [managerName, setManagerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCustomTeam, setIsCustomTeam] = useState(false);

  // Debounced search for teams
  useEffect(() => {
    if (step !== 1 || searchTerm.length < 2) return;
    
    const delaySearch = setTimeout(async () => {
      try {
        const q = query(
          collection(db, 'teams'),
          orderBy('name'),
          startAt(searchTerm),
          endAt(searchTerm + '\uf8ff'),
          limit(10)
        );
        const snap = await getDocs(q);
        // Correct order: data first, then ID
        setTeams(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Team)));
      } catch (err) {
        console.error(err);
      }
    }, 400);

    return () => clearTimeout(delaySearch);
  }, [searchTerm, step]);

  const selectCustomTeam = () => {
    const customId = searchTerm.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    setSelectedTeam({
      id: customId,
      name: searchTerm,
      league: 'Custom League'
    });
    setIsCustomTeam(true);
    setStep(2);
  };

  const handleCreate = async () => {
    if (!selectedTeam || !managerName) return;
    setLoading(true);
    try {
      const batch = writeBatch(db);

      // If custom team, create the team document first so it exists
      if (isCustomTeam) {
        const teamRef = doc(db, 'teams', selectedTeam.id);
        batch.set(teamRef, selectedTeam);

        // Generate mock squad for this custom team
        const mockSquad = generateMockSquad(selectedTeam.id, selectedTeam.name);
        mockSquad.forEach(player => {
           const playerRef = doc(collection(db, 'players'));
           batch.set(playerRef, player);
        });
      }

      // Create Career
      const newCareerRef = doc(collection(db, 'careers'));
      const newCareer: Omit<Career, 'id'> = {
        userId,
        teamId: selectedTeam.id,
        teamName: selectedTeam.name,
        managerName,
        season: "2025/2026",
        seasonOffset: 0,
        lastPlayed: new Date().toISOString(),
        isActive: false, 
        rating: 3,
        logoUrl: "", 
        playerOverrides: {}
      };
      batch.set(newCareerRef, newCareer);

      await batch.commit();

      if(isCustomTeam) {
        alert(t.customTeamCreated);
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert(t.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-obsidian w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-slideUp border border-white/10">
        <div className="p-6 border-b border-obsidian/5 dark:border-ghost/5 flex justify-between items-center">
           <h2 className="text-xl font-black">{t.newCareer}</h2>
           <button onClick={onClose}><XMarkIcon className="w-6 h-6"/></button>
        </div>
        
        <div className="p-6">
          {step === 1 && (
            <>
              <h3 className="text-sm font-bold opacity-70 mb-2 uppercase">{t.selectTeam}</h3>
              <div className="relative mb-4">
                 <input 
                   className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-mint"
                   placeholder={t.searchPlaceholder}
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   autoFocus
                 />
                 <MagnifyingGlassIcon className="absolute right-4 top-3.5 w-5 h-5 opacity-50"/>
              </div>
              <div className="h-48 overflow-y-auto custom-scrollbar space-y-2 mb-4">
                 {teams.map(team => (
                   <div 
                     key={team.id}
                     onClick={() => { setSelectedTeam(team); setIsCustomTeam(false); setStep(2); }}
                     className={`p-3 rounded-lg cursor-pointer flex justify-between items-center transition-colors bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10`}
                   >
                     <span className="font-bold">{team.name}</span>
                     <span className="text-xs opacity-60">{team.league}</span>
                   </div>
                 ))}
                 
                 {searchTerm.length > 1 && (
                   <div 
                     onClick={selectCustomTeam}
                     className="p-3 rounded-lg cursor-pointer flex justify-between items-center transition-colors bg-mint/10 text-mint hover:bg-mint/20 border border-mint/20"
                   >
                     <span className="font-bold flex items-center gap-2"><PlusIcon className="w-4 h-4"/> {t.createCustomTeam} "{searchTerm}"</span>
                   </div>
                 )}

                 {searchTerm.length > 1 && teams.length === 0 && (
                   <p className="text-center opacity-50 py-4">{t.noResults}</p>
                 )}
              </div>
            </>
          )}

          {step === 2 && (
            <>
               <h3 className="text-sm font-bold opacity-70 mb-2 uppercase">{t.managerName}</h3>
               <input 
                  className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-mint mb-6"
                  placeholder="Pep Guardiola"
                  value={managerName}
                  onChange={e => setManagerName(e.target.value)}
                  autoFocus
               />
               <div className="bg-mint/10 p-4 rounded-xl mb-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-mint rounded-full flex items-center justify-center font-bold text-xl text-obsidian">
                    {selectedTeam?.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold">{selectedTeam?.name}</div>
                    <div className="text-xs opacity-60">{selectedTeam?.league}</div>
                    {isCustomTeam && <span className="text-[10px] bg-mint text-obsidian px-1.5 rounded font-bold uppercase">Custom</span>}
                  </div>
               </div>
               <div className="flex gap-3">
                 <Button variant="ghost" onClick={() => setStep(1)}>{t.cancel}</Button>
                 <Button disabled={!managerName || loading} onClick={handleCreate}>
                   {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : t.createCareer}
                 </Button>
               </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Player Detail Modal ---
const PlayerDetailModal = ({ player, onClose, t, onSave }: { player: Player, onClose: () => void, t: any, onSave?: (id: string, updates: any) => void }) => {
  const [editedOverall, setEditedOverall] = useState(player.overall);
  const [isHomegrown, setIsHomegrown] = useState(!!player.isHomegrown);
  const [isNonEU, setIsNonEU] = useState(!!player.isNonEU);

  if (!player) return null;

  const getStat = (key: string) => player[key] || player[key.toLowerCase()] || 0;
  
  const statGroups = [
    {
      title: t.physical,
      stats: [
        { label: 'Acceleration', val: getStat('acceleration') },
        { label: 'Sprint Speed', val: getStat('sprint speed') },
        { label: 'Agility', val: getStat('agility') },
        { label: 'Balance', val: getStat('balance') },
        { label: 'Jumping', val: getStat('jumping') },
        { label: 'Stamina', val: getStat('stamina') },
        { label: 'Strength', val: getStat('strength') },
      ]
    },
    {
      title: t.technical,
      stats: [
        { label: 'Dribbling', val: getStat('dribbling') },
        { label: 'Ball Control', val: getStat('ball control') },
        { label: 'Finishing', val: getStat('finishing') },
        { label: 'Shot Power', val: getStat('shot power') },
        { label: 'Long Shots', val: getStat('long shots') },
        { label: 'Vision', val: getStat('vision') },
        { label: 'Crossing', val: getStat('crossing') },
        { label: 'Short Passing', val: getStat('short passing') },
      ]
    },
    {
      title: t.defending,
      stats: [
        { label: 'Interceptions', val: getStat('interceptions') },
        { label: 'Heading', val: getStat('heading accuracy') },
        { label: 'Def. Aware', val: getStat('def awareness') },
        { label: 'Stand Tackle', val: getStat('standing tackle') },
        { label: 'Slide Tackle', val: getStat('sliding tackle') },
      ]
    },
    {
      title: t.mental,
      stats: [
        { label: 'Aggression', val: getStat('aggression') },
        { label: 'Reactions', val: getStat('reactions') },
        { label: 'Composure', val: getStat('composure') },
        { label: 'Positioning', val: getStat('positioning') },
      ]
    }
  ];

  if (player.position === 'GK') {
    statGroups.unshift({
      title: t.goalkeeping,
      stats: [
        { label: 'Diving', val: getStat('gk diving') },
        { label: 'Handling', val: getStat('gk handling') },
        { label: 'Kicking', val: getStat('gk kicking') },
        { label: 'Positioning', val: getStat('gk positioning') },
        { label: 'Reflexes', val: getStat('gk reflexes') },
      ]
    });
  }

  const getOverallColor = (ovr: number) => {
    if (ovr >= 90) return 'text-mint';
    if (ovr >= 80) return 'text-green-400';
    if (ovr >= 70) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const handleSave = () => {
    if (onSave) onSave(player.id, { overall: Number(editedOverall), isHomegrown, isNonEU });
  };

  const diff = editedOverall - player.overall;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white dark:bg-obsidian w-full max-w-2xl h-[90vh] sm:h-auto max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slideUp">
        <div className="p-6 bg-gradient-to-br from-mint/20 to-transparent border-b border-obsidian/5 dark:border-ghost/5 flex justify-between items-start">
           <div className="flex gap-4">
              <div className="w-20 h-20 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-3xl font-black shadow-lg relative shrink-0">
                 <span className={getOverallColor(editedOverall)}>{editedOverall}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-black uppercase leading-none mb-1">{player.name}</h2>
                <div className="flex items-center gap-2 opacity-70 text-sm font-mono mb-1">
                  <span className="font-bold bg-obsidian/10 dark:bg-white/10 px-2 py-0.5 rounded">{player.position}</span>
                  <span>{player.team || player['club'] || 'Free Agent'}</span>
                </div>
                {player.nationality && (
                  <div className="flex items-center gap-1.5 text-xs font-bold opacity-60">
                    <GlobeEuropeAfricaIcon className="w-3.5 h-3.5"/>
                    <span>{player.nationality}</span>
                  </div>
                )}
                
                <div className="mt-2 text-xs opacity-50 flex gap-3">
                   <span>{player.age} yo</span>
                   <span>{player.height} cm</span>
                   <span>{player.weight} kg</span>
                </div>

                {onSave && (
                   <div className="mt-4 flex flex-wrap gap-4 items-end">
                      <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
                            <span className="text-xs uppercase font-bold px-2">{t.newOverall}</span>
                            <input 
                              type="number" 
                              value={editedOverall} 
                              onChange={(e) => setEditedOverall(Number(e.target.value))}
                              className="w-12 bg-black/10 dark:bg-white/20 rounded px-1 py-0.5 text-center text-sm font-bold outline-none focus:ring-1 ring-mint"
                            />
                          </div>
                          {diff !== 0 && (
                            <span className={`text-sm font-bold ${diff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {diff > 0 ? '+' : ''}{diff}
                            </span>
                          )}
                      </div>

                      <div className="flex items-center gap-4">
                         <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={isHomegrown} onChange={e => setIsHomegrown(e.target.checked)} className="accent-mint w-4 h-4"/>
                            <div className="text-xs font-bold opacity-70 group-hover:opacity-100 flex items-center gap-1"><AcademicCapIcon className="w-3 h-3"/> {t.homegrown}</div>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={isNonEU} onChange={e => setIsNonEU(e.target.checked)} className="accent-mint w-4 h-4"/>
                            <div className="text-xs font-bold opacity-70 group-hover:opacity-100 flex items-center gap-1"><IdentificationIcon className="w-3 h-3"/> {t.nonEu}</div>
                         </label>
                      </div>

                      <button onClick={handleSave} className="bg-mint text-obsidian px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-mint-hover shadow-sm ml-auto">
                        {t.save}
                      </button>
                   </div>
                )}
              </div>
           </div>
           <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
              <XMarkIcon className="w-6 h-6"/>
           </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {statGroups.map((group, idx) => (
                <div key={idx} className="bg-black/5 dark:bg-white/5 rounded-xl p-4">
                   <h4 className="text-xs font-bold uppercase opacity-50 mb-3 tracking-wider flex items-center gap-2">
                     <ChartBarIcon className="w-3 h-3"/> {group.title}
                   </h4>
                   <div className="space-y-2">
                      {group.stats.map((stat, sIdx) => (
                        <div key={sIdx} className="flex items-center justify-between text-sm">
                           <span className="opacity-80">{stat.label}</span>
                           <div className="flex items-center gap-2 w-24">
                              <div className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${stat.val >= 80 ? 'bg-mint' : stat.val >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`} 
                                  style={{ width: `${Math.min(stat.val, 100)}%` }}
                                ></div>
                              </div>
                              <span className="font-bold w-6 text-right">{stat.val}</span>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const CareerDetailModal = ({ career, t, onClose, userId }: { career: Career, t: any, onClose: () => void, userId: string }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayerForEdit, setSelectedPlayerForEdit] = useState<Player | null>(null);
  const [showEndSeasonConfirm, setShowEndSeasonConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch Squad and Apply Overrides
  useEffect(() => {
    // MOCK DATA HANDLING
    if (career.id === MOCK_CAREER.id) {
       setPlayers(MOCK_PLAYERS.map(p => ({
         ...p,
         age: p.age + (career.seasonOffset || 0)
       })));
       setLoading(false);
       return;
    }

    const fetchSquad = async () => {
      if (!career.teamId) return;
      try {
        const q = query(collection(db, 'players'), where('teamId', '==', career.teamId));
        const snap = await getDocs(q);
        // Correct order: data first, then ID
        let pl = snap.docs.map(d => ({ ...d.data(), id: d.id } as Player));
        
        // Apply career specific overrides
        pl = pl.map(p => {
           const override = career.playerOverrides?.[p.id];
           return {
             ...p,
             age: p.age + (career.seasonOffset || 0),
             overall: override?.overall ?? p.overall,
             isHomegrown: override?.isHomegrown ?? p.isHomegrown ?? false,
             isNonEU: override?.isNonEU ?? p.isNonEU ?? false
           };
        });

        pl.sort((a, b) => b.overall - a.overall);
        setPlayers(pl);
      } catch (err) {
        console.error("Squad fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSquad();
  }, [career.id, career.teamId, career.seasonOffset, career.playerOverrides]);

  const handleDelete = () => {
    if (career.id === MOCK_CAREER.id) {
       alert("Mock career cannot be deleted.");
       return;
    }
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    try {
      await deleteDoc(doc(db, 'careers', career.id));
      setShowDeleteConfirm(false);
      onClose();
    } catch (err) {
      console.error(err);
      alert(t.errorGeneric);
    }
  };

  const executeEndSeason = async () => {
    setShowEndSeasonConfirm(false);

    if (career.id === MOCK_CAREER.id) {
       // Simulate age increase locally for immediate feedback
       setPlayers(prev => prev.map(p => ({...p, age: p.age + 1})));
       return;
    }

    try {
      const newOffset = (career.seasonOffset || 0) + 1;
      await updateDoc(doc(db, 'careers', career.id), {
        seasonOffset: newOffset
      });
      // The parent listener will update the career prop, which triggers useEffect to re-fetch/re-calc
    } catch (err) {
      console.error(err);
      alert(t.errorGeneric);
    }
  };

  const handleToggleActive = async () => {
    if (career.isActive) return;
    if (career.id === MOCK_CAREER.id) {
       alert("Mock career set as active (Simulated).");
       return;
    }
    
    try {
      const batch = writeBatch(db);
      // Use userId prop here instead of the undefined 'user' variable
      const q = query(collection(db, 'careers'), where('userId', '==', userId));
      const snap = await getDocs(q);
      
      snap.docs.forEach(d => {
        batch.update(doc(db, 'careers', d.id), { isActive: false });
      });
      
      batch.update(doc(db, 'careers', career.id), { isActive: true });
      await batch.commit();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSellPlayer = async (playerId: string) => {
    if (!window.confirm("Confirm sale? Player will become Free Agent.")) return;
    
    if (career.id === MOCK_CAREER.id) {
       setPlayers(prev => prev.filter(p => p.id !== playerId));
       return;
    }

    try {
      await updateDoc(doc(db, 'players', playerId), {
        teamId: null,
        team: "Free Agent"
      });
      setPlayers(prev => prev.filter(p => p.id !== playerId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePlayerStats = async (playerId: string, updates: any) => {
    if (career.id === MOCK_CAREER.id) {
       setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, ...updates } : p));
       setSelectedPlayerForEdit(null);
       alert("Mock stats updated locally.");
       return;
    }

    try {
       const updateData: any = {};
       if (updates.overall !== undefined) updateData[`playerOverrides.${playerId}.overall`] = updates.overall;
       if (updates.isHomegrown !== undefined) updateData[`playerOverrides.${playerId}.isHomegrown`] = updates.isHomegrown;
       if (updates.isNonEU !== undefined) updateData[`playerOverrides.${playerId}.isNonEU`] = updates.isNonEU;

       await updateDoc(doc(db, 'careers', career.id), updateData);
       setSelectedPlayerForEdit(null);
       alert(t.statsSaved);
    } catch (e) {
      console.error(e);
      alert(t.errorGeneric);
    }
  };

  const groupedPlayers = useMemo(() => {
    const groups = {
      gk: players.filter(p => p.position === 'GK'),
      def: players.filter(p => ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(p.position)),
      mid: players.filter(p => ['CM', 'CDM', 'CAM', 'LM', 'RM'].includes(p.position)),
      fwd: players.filter(p => ['ST', 'CF', 'LW', 'RW'].includes(p.position))
    };
    return groups;
  }, [players]);

  const renderPlayerGroup = (title: string, list: Player[]) => (
    <div className="mb-6">
      <h4 className="text-xs font-bold uppercase opacity-50 mb-3 tracking-wider border-b border-white/10 pb-1">{title} ({list.length})</h4>
      <div className="space-y-2">
         {list.map(p => (
           <div 
             key={p.id} 
             onClick={() => setSelectedPlayerForEdit(p)}
             className="bg-black/5 dark:bg-white/5 p-3 rounded-xl flex items-center justify-between cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
           >
              <div className="flex items-center gap-3">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${p.overall >= 85 ? 'bg-mint text-obsidian' : 'bg-white/10'}`}>
                    {p.overall}
                 </div>
                 <div>
                    <div className="font-bold text-sm">{p.name}</div>
                    <div className="text-[10px] opacity-60 font-mono">
                      {p.position} | {p.age}yo
                    </div>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                {p.isHomegrown && <AcademicCapIcon className="w-4 h-4 text-mint" title={t.homegrown} />}
                {p.isNonEU && <IdentificationIcon className="w-4 h-4 text-yellow-500" title={t.nonEu} />}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleSellPlayer(p.id); }}
                  className="text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-colors ml-2"
                >
                  {t.sellPlayer}
                </button>
              </div>
           </div>
         ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md animate-fadeIn">
        <div className="bg-white dark:bg-obsidian w-full sm:max-w-4xl h-[95vh] sm:h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp border border-white/5">
          
          {/* Header */}
          <div className="relative h-48 shrink-0 bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e]">
             <div className="absolute top-4 right-4 z-20 flex gap-2">
                <button 
                  onClick={handleDelete}
                  className="p-2 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all"
                  title={t.deleteConfirm}
                >
                  <TrashIcon className="w-5 h-5"/>
                </button>
                <button onClick={onClose} className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20">
                  <XMarkIcon className="w-5 h-5"/>
                </button>
             </div>

             <div className="absolute bottom-6 left-6 z-20 text-white">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-12 h-12 bg-mint rounded-2xl flex items-center justify-center text-obsidian font-black text-xl shadow-lg shadow-mint/20">
                     {career.teamName.charAt(0)}
                   </div>
                   <div>
                      <h2 className="text-3xl font-black uppercase tracking-tight leading-none">{career.teamName}</h2>
                      <p className="opacity-60 font-medium text-sm">{career.managerName}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 mt-4">
                   <div className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-mono text-mint">
                     {career.season}
                   </div>
                   {career.isActive && (
                      <div className="flex items-center gap-1 bg-mint/20 px-2 py-0.5 rounded text-xs text-mint font-bold uppercase">
                        <CheckCircleIcon className="w-3 h-3"/> Active
                      </div>
                   )}
                </div>
             </div>
          </div>

          {/* Controls */}
          <div className="px-6 py-4 border-b border-obsidian/5 dark:border-ghost/5 flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-white/5">
             <div className="flex items-center gap-4">
                <label className="flex items-center cursor-pointer relative">
                  <input type="checkbox" checked={career.isActive} onChange={handleToggleActive} className="sr-only peer" disabled={career.isActive}/>
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-mint"></div>
                  <span className="ml-3 text-sm font-medium">{t.activeCareer}</span>
                </label>
             </div>
             
             <Button variant="secondary" onClick={() => setShowEndSeasonConfirm(true)} className="!w-auto !py-2 !px-4 text-xs">
               <CalendarDaysIcon className="w-4 h-4 mr-2"/> {t.endSeason}
             </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
             <div className="flex items-center gap-2 mb-6">
                <UserGroupIcon className="w-5 h-5 text-mint"/>
                <h3 className="font-bold text-lg">{t.squadList}</h3>
             </div>

             {loading ? (
               <div className="flex justify-center py-12"><ArrowPathIcon className="w-8 h-8 animate-spin text-mint"/></div>
             ) : players.length === 0 ? (
               <p className="text-center opacity-50 py-12">No players found in this team.</p>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {groupedPlayers.gk.length > 0 && renderPlayerGroup(t.goalkeepers, groupedPlayers.gk)}
                  {groupedPlayers.def.length > 0 && renderPlayerGroup(t.defenders, groupedPlayers.def)}
                  {groupedPlayers.mid.length > 0 && renderPlayerGroup(t.midfielders, groupedPlayers.mid)}
                  {groupedPlayers.fwd.length > 0 && renderPlayerGroup(t.forwards, groupedPlayers.fwd)}
               </div>
             )}
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {selectedPlayerForEdit && (
        <PlayerDetailModal 
          player={selectedPlayerForEdit} 
          t={t} 
          onClose={() => setSelectedPlayerForEdit(null)} 
          onSave={handleSavePlayerStats}
        />
      )}

      <ConfirmationModal 
        isOpen={showEndSeasonConfirm}
        onClose={() => setShowEndSeasonConfirm(false)}
        onConfirm={executeEndSeason}
        title={t.endSeason}
        message={t.confirmEndSeason}
        confirmText="Confirm +1 Age"
        cancelText={t.cancel}
      />

      <ConfirmationModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={executeDelete}
        title={t.deleteCareerTitle}
        message={t.deleteCareerConfirm}
        confirmText={t.deleteAction}
        cancelText={t.cancel}
        isDanger={true}
      />
    </>
  );
};


// --- Database View Component ---
const DatabaseView = ({ t }: { t: any }) => {
  const [activeTab, setActiveTab] = useState<'players' | 'teams' | 'leagues'>('players');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameVal, setEditNameVal] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{isOpen: boolean, id: string | null}>({isOpen: false, id: null});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let q;
        const collectionName = activeTab === 'leagues' ? 'teams' : activeTab;
        const colRef = collection(db, collectionName);
        
        if (searchQuery.length > 2) {
           q = query(colRef, orderBy('name'), startAt(searchQuery), endAt(searchQuery + '\uf8ff'), limit(50));
        } else {
           q = query(colRef, orderBy('name'), limit(50));
        }

        const snapshot = await getDocs(q);
        // Correct order: data first, then ID
        const results = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

        if (activeTab === 'leagues') {
           const leaguesSet = new Set<string>();
           results.forEach((team: any) => {
             if (team.league) leaguesSet.add(team.league);
             if (team.campionato) leaguesSet.add(team.campionato);
           });
           setData(Array.from(leaguesSet).map(l => ({ id: l, name: l })));
        } else {
           setData(results);
        }
      } catch (err) {
        console.error("Error fetching DB data:", err);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(() => { fetchData(); }, 500);
    return () => clearTimeout(timer);
  }, [activeTab, searchQuery]);

  const handleRequestDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmation({ isOpen: true, id });
  };

  const executeDelete = async () => {
    const id = deleteConfirmation.id;
    if (!id) return;

    try {
      if (activeTab === 'leagues') {
        // For leagues, we need to update all teams with this league to "Unknown"
        const leagueName = id;
        const q = query(collection(db, 'teams'), where('league', '==', leagueName));
        const snap = await getDocs(q);
        
        const batch = writeBatch(db);
        snap.docs.forEach(docSnap => {
          batch.update(doc(db, 'teams', docSnap.id), { league: 'Unknown' });
        });
        await batch.commit();
        setData(prev => prev.filter(item => item.id !== id));
      } else {
        // For players and teams, direct delete
        await deleteDoc(doc(db, activeTab, id));
        setData(prev => prev.filter(item => item.id !== id));
      }
      setDeleteConfirmation({ isOpen: false, id: null });
    } catch (err) {
      console.error(err);
      alert(t.errorGeneric);
    }
  };

  const handleUpdateStart = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditNameVal(item.name);
  };

  const handleUpdateSave = async (id: string, e: React.MouseEvent) => {
     e.stopPropagation();
     
     // Check if name actually changed
     const currentItem = data.find(item => item.id === id);
     if (currentItem && currentItem.name === editNameVal) {
        setEditingId(null);
        return;
     }

     try {
       if (activeTab === 'leagues') {
          // Batch update teams with old league name to new league name
          const oldLeagueName = id;
          const q = query(collection(db, 'teams'), where('league', '==', oldLeagueName));
          const snap = await getDocs(q);
          
          const batch = writeBatch(db);
          snap.docs.forEach(docSnap => {
            batch.update(doc(db, 'teams', docSnap.id), { league: editNameVal });
          });
          await batch.commit();
          // Update local state
          setData(prev => prev.map(item => item.id === id ? { id: editNameVal, name: editNameVal } : item));
       } else {
          // Direct update for players and teams
          await updateDoc(doc(db, activeTab, id), { name: editNameVal });
          setData(prev => prev.map(item => item.id === id ? { ...item, name: editNameVal } : item));
       }
       setEditingId(null);
     } catch (err) {
       console.error(err);
       alert(t.errorGeneric);
     }
  };

  return (
    <div className="h-full flex flex-col pt-24 px-4 animate-fadeIn">
       <h2 className="text-3xl font-black mb-6 px-2">{t.navSquad}</h2>
       <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-xl mb-6 mx-2 shrink-0">
          {[
            { id: 'players', label: t.dbPlayers },
            { id: 'teams', label: t.dbTeams },
            { id: 'leagues', label: t.dbLeagues }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setSearchQuery(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-white dark:bg-white/10 shadow-sm text-mint' 
                  : 'text-obsidian/50 dark:text-ghost/50 hover:text-obsidian dark:hover:text-ghost'
              }`}
            >
              {tab.label}
            </button>
          ))}
       </div>
       <div className="relative mb-4 mx-2 shrink-0">
         <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
         <input 
           type="text" 
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           placeholder={t.searchPlaceholder}
           className="w-full bg-white dark:bg-white/5 border border-obsidian/5 dark:border-ghost/5 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 ring-mint/50 transition-all"
         />
       </div>
       <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-2 pb-32">
          {loading ? (
             <div className="flex justify-center py-12"><ArrowPathIcon className="w-8 h-8 animate-spin text-mint" /></div>
          ) : data.length === 0 ? (
             <div className="text-center py-12 opacity-50">{t.noResults}</div>
          ) : (
             data.map((item, idx) => (
                <div 
                  key={item.id || idx}
                  onClick={() => activeTab === 'players' && setSelectedPlayer(item)}
                  className="group bg-white dark:bg-white/5 p-4 rounded-xl flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors border border-transparent hover:border-mint/20"
                >
                   <div className="flex items-center gap-4 overflow-hidden">
                      {activeTab === 'players' && (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${item.overall >= 85 ? 'bg-mint text-obsidian' : 'bg-black/10 dark:bg-white/10'}`}>
                           {item.overall || '-'}
                        </div>
                      )}
                      {activeTab !== 'players' && (
                        <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
                           <div className="text-xs font-bold opacity-50">{item.name?.substring(0, 2).toUpperCase()}</div>
                        </div>
                      )}
                      
                      <div className="min-w-0">
                         {editingId === item.id ? (
                           <input 
                             value={editNameVal}
                             onClick={(e) => e.stopPropagation()}
                             onChange={(e) => setEditNameVal(e.target.value)}
                             className="bg-transparent border-b border-mint outline-none w-full"
                             autoFocus
                           />
                         ) : (
                           <h4 className="font-bold truncate">{item.name}</h4>
                         )}
                         <p className="text-xs opacity-50 truncate">
                            {activeTab === 'players' ? (item.team || item.position || 'Unknown') : (item.league || 'Unknown')}
                         </p>
                      </div>
                   </div>

                   <div className="flex items-center gap-2">
                      {editingId === item.id ? (
                        <button onClick={(e) => handleUpdateSave(item.id, e)} className="p-2 text-mint hover:bg-mint/10 rounded-lg">
                           <CheckIcon className="w-5 h-5"/>
                        </button>
                      ) : (
                        <button onClick={(e) => handleUpdateStart(item, e)} className="p-2 text-obsidian dark:text-ghost hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
                           <PencilSquareIcon className="w-5 h-5"/>
                        </button>
                      )}
                      
                      <button onClick={(e) => handleRequestDelete(item.id, e)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                           <TrashIcon className="w-5 h-5"/>
                      </button>
                   </div>
                </div>
             ))
          )}
       </div>
       {selectedPlayer && (
         <PlayerDetailModal player={selectedPlayer} t={t} onClose={() => setSelectedPlayer(null)} />
       )}

      <ConfirmationModal 
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({isOpen: false, id: null})}
        onConfirm={executeDelete}
        title={t.deleteConfirm}
        message={t.deleteConfirm}
        confirmText={t.deleteAction}
        cancelText={t.cancel}
        isDanger={true}
      />
    </div>
  );
};

// --- Dashboard Components ---

const CareerCard: React.FC<{ career: Career, t: any, onClick: () => void }> = ({ career, t, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`group relative min-w-[280px] w-[80%] max-w-[320px] h-[420px] rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] snap-center flex flex-col justify-between border ${career.isActive ? 'border-mint' : 'border-white/5'}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e]"></div>
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity"></div>
      
      {/* Decorative Blur */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-mint/20 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl opacity-30"></div>

      <div className="relative z-10 p-6 flex-1 flex flex-col">
         <div className="flex justify-between items-start mb-4">
            <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/5 text-xs font-mono text-mint/80">
              {career.season}
            </div>
            {career.isActive && (
              <div className="bg-mint text-obsidian px-2 py-0.5 rounded text-xs font-bold uppercase">
                Active
              </div>
            )}
         </div>

         <div className="mt-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-mint to-mint-hover text-obsidian flex items-center justify-center font-black text-3xl mb-4">
              {career.teamName.charAt(0)}
            </div>
            <h3 className="text-3xl font-black uppercase tracking-tight leading-none mb-1 text-white">
              {career.teamName}
            </h3>
            <p className="text-lg text-white/60 font-medium">{career.managerName}</p>
         </div>
      </div>

      <div className="relative z-10 bg-black/20 backdrop-blur-md p-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
          <span>{t.lastPlayed}:</span>
          <span className="text-white/80">{new Date(career.lastPlayed).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

const AddCareerCard: React.FC<{ t: any, onClick: () => void }> = ({ t, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group relative min-w-[280px] w-[80%] max-w-[320px] h-[420px] rounded-3xl overflow-hidden cursor-pointer bg-ghost dark:bg-white/5 border-2 border-dashed border-obsidian/10 dark:border-ghost/10 flex flex-col items-center justify-center text-center p-6 snap-center hover:border-mint transition-colors duration-300"
    >
      <div className="w-20 h-20 rounded-full bg-mint/10 group-hover:bg-mint flex items-center justify-center mb-6 transition-all duration-300">
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

// --- Main App and Helper Functions ---
// (The rest of the file remains unchanged, included here for context continuity if needed, 
// but the diff above focused on injecting `generateMockSquad` and updating `AddCareerModal`)

// --- Profile View ---
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
        const base64Img = await compressImage(file);
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
        <div className="relative group mb-8">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-white/10 shadow-2xl bg-mint flex items-center justify-center">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl font-bold text-obsidian">{initials}</span>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 flex gap-2">
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="w-10 h-10 rounded-full bg-mint text-obsidian flex items-center justify-center shadow-lg hover:bg-mint-hover hover:scale-105 transition-all"
               title={t.changePhoto}
             >
                {uploading ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <CameraIcon className="w-5 h-5"/>}
             </button>
             <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileSelect} />
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

        {statusMsg && (
          <div className="mb-6 px-4 py-2 bg-mint/10 text-mint rounded-lg text-sm font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircleIcon className="w-5 h-5" /> {statusMsg}
          </div>
        )}

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

// --- Settings View ---
const SettingsView = ({ t, user, handleLogout, language, setLanguage, theme, setTheme, onProfileClick, userAvatar, currency, setCurrency, wageFrequency, setWageFrequency, measurementSystem, setMeasurementSystem }: any) => {
  const [step, setStep] = useState(0); 
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [startRowIndex, setStartRowIndex] = useState<number>(0);
  const [importTeams, setImportTeams] = useState<boolean>(true);
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
      if (lines.length < 2) { setUploadStatus("File is empty or invalid."); return; }
      
      const firstLine = lines[0];
      const commaCount = (firstLine.match(/,/g) || []).length;
      const semiCount = (firstLine.match(/;/g) || []).length;
      const delimiter = semiCount > commaCount ? ';' : ',';

      const headers = parseCSVRow(firstLine, delimiter).map(h => h.trim());
      const dataRows = lines.slice(1).map(line => {
        const values = parseCSVRow(line, delimiter);
        const obj: any = {};
        headers.forEach((h, i) => {
          if (h && h !== "") {
            let val: any = values[i] || "";
            if (typeof val === 'string') val = val.trim();
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
      setCsvPreview(dataRows.slice(0, 3));
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
      if (importTeams && startRowIndex === 0) {
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

        const batchSize = 250; 
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
          await new Promise(r => setTimeout(r, 1000));
          setUploadProgress(Math.round(((i + 1) / totalBatches) * 20));
        }
      }

      const playersToUpload = parsedRows.slice(startRowIndex);
      setUploadStatus(`Uploading ${playersToUpload.length} players starting from index ${startRowIndex}...`);
      
      const batchSize = 200; 
      let totalBatches = Math.ceil(playersToUpload.length / batchSize);

      for (let i = 0; i < totalBatches; i++) {
        const batch = writeBatch(db);
        const chunk = playersToUpload.slice(i * batchSize, (i + 1) * batchSize);
        chunk.forEach(player => {
          const teamName = player['team'] || player['squadra'] || player['club'];
          if (teamName) player.teamId = String(teamName).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
          const docRef = doc(collection(db, 'players'));
          batch.set(docRef, player);
        });
        await batch.commit();
        await new Promise(r => setTimeout(r, 1200)); 
        const currentBatchProgress = ((i + 1) / totalBatches) * 80;
        setUploadProgress(20 + Math.round(currentBatchProgress));
        setUploadStatus(`Uploaded batch ${i+1}/${totalBatches} (${chunk.length} players)...`);
      }

      setUploadStatus('Import Complete!');
      setTimeout(() => {
        setStep(0); setParsedRows([]); setUploadStatus(''); setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setUploadStatus("Error: " + err.message);
    }
  };

  return (
    <div className="px-6 pt-24 pb-32 max-w-md mx-auto w-full animate-fadeIn">
      <h2 className="text-3xl font-black mb-8">{t.navSettings}</h2>
      
      <div onClick={onProfileClick} className="bg-white dark:bg-white/5 rounded-2xl p-4 mb-6 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
        <div className="w-16 h-16 rounded-full bg-mint flex items-center justify-center text-obsidian text-xl font-bold overflow-hidden">
          {userAvatar || user.photoURL ? (<img src={userAvatar || user.photoURL} alt="Avatar" className="w-full h-full object-cover" />) : (user.email?.[0].toUpperCase())}
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="font-bold text-lg truncate">{user.displayName || user.email?.split('@')[0]}</h3>
          <p className="text-xs opacity-50 truncate">{user.email}</p>
        </div>
        <button className="p-2 text-mint hover:bg-mint/10 rounded-full"><ChevronRightIcon className="w-5 h-5" /></button>
      </div>

      <div className="space-y-4">
        <div className="bg-white dark:bg-white/5 rounded-2xl p-4 shadow-sm">
          <h4 className="text-xs font-bold uppercase opacity-50 mb-4 tracking-wider flex items-center gap-2"><SunIcon className="w-3 h-3"/> {t.appearance}</h4>
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

        <div className="bg-white dark:bg-white/5 rounded-2xl p-4 shadow-sm">
          <h4 className="text-xs font-bold uppercase opacity-50 mb-4 tracking-wider flex items-center gap-2"><CurrencyDollarIcon className="w-3 h-3"/> {t.preferences}</h4>
          <div className="flex justify-between items-center mb-4">
             <span className="text-sm">{t.currency}</span>
             <div className="flex bg-obsidian/5 dark:bg-ghost/5 p-1 rounded-full gap-1">
                {Object.values(Currency).map((cur) => (<ToggleButton key={cur} active={currency === cur} onClick={() => setCurrency(cur)}><span className="text-xs font-bold">{cur}</span></ToggleButton>))}
             </div>
          </div>
          <div className="flex justify-between items-center mb-4">
             <span className="text-sm">{t.wageFrequency}</span>
             <div className="flex bg-obsidian/5 dark:bg-ghost/5 p-1 rounded-full gap-1">
                <ToggleButton active={wageFrequency === WageFrequency.WEEKLY} onClick={() => setWageFrequency(WageFrequency.WEEKLY)}><span className="text-xs font-bold px-1">{t.weekly}</span></ToggleButton>
                <ToggleButton active={wageFrequency === WageFrequency.YEARLY} onClick={() => setWageFrequency(WageFrequency.YEARLY)}><span className="text-xs font-bold px-1">{t.yearly}</span></ToggleButton>
             </div>
          </div>
          <div className="flex flex-col gap-2">
             <span className="text-sm">{t.measurements}</span>
             <div className="flex bg-obsidian/5 dark:bg-ghost/5 p-1 rounded-full w-full">
                <ToggleButton className="flex-1" active={measurementSystem === MeasurementSystem.METRIC} onClick={() => setMeasurementSystem(MeasurementSystem.METRIC)}><span className="text-xs font-bold">{t.metric}</span></ToggleButton>
                <ToggleButton className="flex-1" active={measurementSystem === MeasurementSystem.IMPERIAL} onClick={() => setMeasurementSystem(MeasurementSystem.IMPERIAL)}><span className="text-xs font-bold">{t.imperial}</span></ToggleButton>
             </div>
          </div>
        </div>

         <div className="bg-obsidian/5 dark:bg-ghost/5 border-2 border-dashed border-mint/30 rounded-2xl p-4 shadow-sm mt-8">
          <h4 className="text-xs font-bold uppercase text-mint mb-4 tracking-wider flex items-center gap-2"><CloudArrowUpIcon className="w-4 h-4"/> Smart CSV Importer</h4>
          <div className="text-sm opacity-70 mb-4">Auto-maps columns and manages write quotas.</div>
          {step === 0 && (
            <div className="relative">
              <input type="file" ref={fileInputRef} accept=".csv" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
              <div className="w-full py-4 bg-white dark:bg-obsidian border border-obsidian/10 dark:border-ghost/10 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-mint transition-colors cursor-pointer">
                 <DocumentTextIcon className="w-8 h-8 opacity-50" />
                 <span className="text-sm font-medium">Select CSV File</span>
              </div>
            </div>
          )}
          {step === 1 && (
             <div className="space-y-4 animate-fadeIn">
                <div className="text-xs text-mint font-mono flex items-center gap-2"><CheckCircleIcon className="w-4 h-4" /> {uploadStatus}</div>
                <div className="bg-black/10 dark:bg-white/10 p-2 rounded text-[10px] font-mono overflow-x-auto">
                  <p className="font-bold mb-1 text-mint">Preview:</p>
                  {csvPreview.length > 0 && (
                     <div className="grid grid-cols-2 gap-1">
                       <div>Name: <span className="opacity-70">{csvPreview[0].name}</span></div>
                       <div>Team: <span className="opacity-70">{csvPreview[0].team}</span></div>
                     </div>
                  )}
                </div>
                <div className="bg-white/5 rounded-lg p-3 space-y-3">
                   <div className="flex items-center justify-between text-sm">
                      <label className="opacity-80">Import Teams?</label>
                      <input type="checkbox" checked={importTeams} onChange={(e) => setImportTeams(e.target.checked)} className="accent-mint w-4 h-4"/>
                   </div>
                   <div className="flex items-center justify-between text-sm">
                      <label className="opacity-80">Start from Row (Index)</label>
                      <input type="number" value={startRowIndex} onChange={(e) => setStartRowIndex(Number(e.target.value))} className="bg-black/10 dark:bg-white/10 rounded px-2 py-1 w-20 text-right outline-none focus:ring-1 ring-mint"/>
                   </div>
                   <p className="text-[10px] opacity-50 leading-tight">Use "Start from Row" if previous upload failed due to quota.</p>
                </div>
                <div className="flex gap-2 pt-2">
                   <Button variant="ghost" onClick={() => { setStep(0); setParsedRows([]); }} className="!py-2 text-sm">Cancel</Button>
                   <Button variant="primary" onClick={handleStartImport} className="!py-2 text-sm">Start Import</Button>
                </div>
             </div>
          )}
          {step === 2 && (
            <div className="space-y-3 animate-fadeIn">
               <div className="flex justify-between text-xs font-mono"><span className="truncate max-w-[70%]">{uploadStatus}</span><span>{uploadProgress}%</span></div>
               <div className="w-full h-2 bg-obsidian/10 dark:bg-ghost/10 rounded-full overflow-hidden">
                  <div className="h-full bg-mint transition-all duration-300 relative overflow-hidden" style={{ width: `${uploadProgress}%` }}><div className="absolute inset-0 bg-white/20 animate-pulse"></div></div>
               </div>
               <div className="flex justify-center pt-2"><ArrowPathIcon className="w-5 h-5 animate-spin opacity-50" /></div>
            </div>
          )}
          {uploadStatus === 'Import Complete!' && (
             <div className="mt-4 p-3 bg-mint/10 rounded-lg text-center text-mint text-sm font-bold flex items-center justify-center gap-2"><CheckCircleIcon className="w-5 h-5" /> All Data Imported!</div>
          )}
        </div>
      </div>
      <div className="mt-8"><Button variant="secondary" onClick={handleLogout}>{t.signOut}</Button></div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<Language>(Language.IT);
  const [theme, setTheme] = useState<Theme>(Theme.AUTO);
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [currency, setCurrency] = useState<Currency>(Currency.EUR);
  const [wageFrequency, setWageFrequency] = useState<WageFrequency>(WageFrequency.WEEKLY);
  const [measurementSystem, setMeasurementSystem] = useState<MeasurementSystem>(MeasurementSystem.METRIC);
  const [careers, setCareers] = useState<Career[]>([]);
  const [showAddCareerModal, setShowAddCareerModal] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useMemo(() => TRANSLATIONS[language], [language]);

  const selectedCareerData = useMemo(() => {
    if (!selectedCareer) return null;
    return careers.find(c => c.id === selectedCareer.id) || selectedCareer;
  }, [careers, selectedCareer]);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'careers'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Correct order: data first, then ID
      const c = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Career));
      c.sort((a, b) => {
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        return new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime();
      });
      c.unshift(MOCK_CAREER);
      setCareers(c);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.photoBase64) { setUserAvatar(data.photoBase64); return; }
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

  const handleLogout = async () => { await signOut(auth); setCurrentView(AppView.HOME); setUserAvatar(null); };

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

  if (user) {
    const userName = user.displayName || (user.email ? user.email.split('@')[0] : 'Manager');
    return (
      <div className="min-h-screen bg-ghost dark:bg-obsidian text-obsidian dark:text-ghost font-sans relative overflow-hidden transition-colors duration-300">
        {currentView !== AppView.PROFILE && (
          <div className="fixed top-6 left-0 w-full px-6 flex justify-between items-start z-30 pointer-events-none animate-fadeIn">
             <div className="bg-white/80 dark:bg-obsidian/80 backdrop-blur-md border border-obsidian/5 dark:border-ghost/5 rounded-2xl px-4 py-2 shadow-sm pointer-events-auto">
                 <p className="text-[10px] opacity-60 font-bold uppercase tracking-wider mb-0.5">{t.welcome}</p>
                 <h1 className="text-lg font-black tracking-tight leading-none">{userName}</h1>
             </div>
             <button onClick={() => setCurrentView(AppView.PROFILE)} className="w-10 h-10 rounded-full bg-mint flex items-center justify-center shadow-sm hover:scale-105 transition-transform overflow-hidden pointer-events-auto border-2 border-white dark:border-obsidian">
                {userAvatar || user.photoURL ? (<img src={userAvatar || user.photoURL} alt="User" className="w-full h-full object-cover" />) : (<UserCircleIcon className="w-6 h-6 text-obsidian" />)}
             </button>
          </div>
        )}
        <div className="h-full overflow-y-auto overflow-x-hidden">
          {currentView === AppView.HOME && (
            <div className="flex flex-col h-full justify-center pb-32 pt-20">
              <div className="w-full overflow-x-auto pb-8 pt-4 hide-scrollbar snap-x flex gap-6 px-8 items-center" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <AddCareerCard t={t} onClick={() => setShowAddCareerModal(true)} />
                {careers.map(career => (<CareerCard key={career.id} career={career} t={t} onClick={() => setSelectedCareer(career)} />))}
                <div className="w-2 shrink-0"></div>
              </div>
            </div>
          )}
          {currentView === AppView.SQUAD && (<DatabaseView t={t} />)}
          {currentView === AppView.MARKET && (
            <div className="flex items-center justify-center h-[60vh] opacity-30 pb-32"><div className="text-center"><CurrencyDollarIcon className="w-16 h-16 mx-auto mb-4" /><p>{t.navMarket} - Coming Soon</p></div></div>
          )}
          {currentView === AppView.SETTINGS && (
             <SettingsView t={t} user={user} handleLogout={handleLogout} language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} onProfileClick={() => setCurrentView(AppView.PROFILE)} userAvatar={userAvatar} currency={currency} setCurrency={setCurrency} wageFrequency={wageFrequency} setWageFrequency={setWageFrequency} measurementSystem={measurementSystem} setMeasurementSystem={setMeasurementSystem} />
          )}
          {currentView === AppView.PROFILE && (<ProfileView t={t} user={user} goBack={() => setCurrentView(AppView.SETTINGS)} userAvatar={userAvatar} />)}
        </div>
        {showAddCareerModal && (<AddCareerModal t={t} userId={user.uid} onClose={() => setShowAddCareerModal(false)} />)}
        {selectedCareerData && (<CareerDetailModal career={selectedCareerData} t={t} userId={user.uid} onClose={() => setSelectedCareer(null)} />)}
        <BottomNav currentView={currentView} setView={setCurrentView} t={t} />
      </div>
    );
  }

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