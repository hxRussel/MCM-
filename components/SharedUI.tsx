import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Player } from '../types';

export const InputField = ({ 
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

export const SelectField = ({ label, value, onChange, options, disabled }: any) => (
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

export const Button = ({ 
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

export const ToggleButton = ({ active, onClick, children, title, className = '' }: any) => (
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

export const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, extraButton, t }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-obsidian border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full animate-scale-in">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="opacity-70 mb-6 text-sm">{message}</p>
        <div className="flex flex-col gap-3">
           {extraButton}
           <div className="flex gap-3">
            <Button variant="ghost" onClick={onCancel}>{t.cancel}</Button>
            <Button variant="danger" onClick={onConfirm}>{t.confirm}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const GlassCard = ({ children, className = '', onClick }: { children?: React.ReactNode, className?: string, onClick?: () => void }) => (
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

export const NavItem = ({ icon: Icon, solidIcon: SolidIcon, label, active, onClick }: any) => (
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

export const StatCard = ({ icon: Icon, value, label, colorClass = "text-obsidian dark:text-ghost" }: any) => (
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

export const NumberSelectionModal = ({ isOpen, onClose, title, min, max, onSelect, selectedValue }: any) => {
  if (!isOpen) return null;

  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-obsidian border border-white/10 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[70vh]">
        
        <div className="p-4 border-b border-obsidian/5 dark:border-ghost/5 flex justify-between items-center bg-white/50 dark:bg-black/50 backdrop-blur-md">
          <h3 className="font-black text-lg">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 grid grid-cols-5 gap-2">
          {numbers.map((num) => (
            <button
              key={num}
              onClick={() => { onSelect(num); onClose(); }}
              className={`
                py-3 rounded-xl font-bold text-sm transition-all duration-200
                ${num === selectedValue 
                  ? 'bg-mint text-obsidian shadow-lg scale-105 ring-2 ring-mint/50' 
                  : 'bg-black/5 dark:bg-white/5 text-obsidian dark:text-ghost hover:bg-black/10 dark:hover:bg-white/10'}
              `}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PlayerSelectionModal = ({ isOpen, onClose, title, players, onSelect }: { isOpen: boolean, onClose: () => void, title: string, players: Player[], onSelect: (p: Player) => void }) => {
  if (!isOpen) return null;
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlayers = players.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-obsidian border border-white/10 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[70vh]">
        
        <div className="p-4 border-b border-obsidian/5 dark:border-ghost/5 flex flex-col gap-3 bg-white/50 dark:bg-black/50 backdrop-blur-md">
          <div className="flex justify-between items-center">
             <h3 className="font-black text-lg">{title}</h3>
             <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
               <XMarkIcon className="w-5 h-5" />
             </button>
          </div>
          <div className="relative">
             <input 
               type="text" 
               placeholder="Search player..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-9 pr-4 py-2 rounded-lg bg-black/5 dark:bg-white/5 outline-none focus:ring-1 focus:ring-mint"
             />
             <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
          </div>
        </div>

        <div className="overflow-y-auto p-2">
          {filteredPlayers.length > 0 ? (
            <div className="grid grid-cols-1 gap-1">
              {filteredPlayers.map((player) => {
                 let ovrColor = "text-obsidian dark:text-ghost";
                 if (player.overall >= 80) ovrColor = "text-mint";
                 
                 return (
                  <button
                    key={player.id}
                    onClick={() => { onSelect(player); onClose(); }}
                    className="p-3 rounded-xl flex items-center gap-3 hover:bg-black/5 dark:bg-white/5 transition-colors text-left group"
                  >
                    <div className={`font-black text-sm w-8 text-center ${ovrColor}`}>{player.overall}</div>
                    <div className="flex-1 min-w-0">
                       <div className="font-bold truncate">{player.name}</div>
                       <div className="text-xs opacity-50">{player.position} • {player.age}yo</div>
                    </div>
                  </button>
                 );
              })}
            </div>
          ) : (
             <div className="text-center py-8 opacity-50 text-sm">No players found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export const RoleSelector = ({ value, onChange, t }: { value: string, onChange: (val: string) => void, t: any }) => {
  const roleOptions = [
    { label: t?.roleShortGK || 'POR', value: 'GK', class: 'bg-yellow-500 text-obsidian border-yellow-400' },
    { label: t?.roleShortDEF || 'DIF', value: 'DEF', class: 'bg-blue-500 text-white border-blue-400' },
    { label: t?.roleShortMID || 'CEN', value: 'MID', class: 'bg-green-500 text-white border-green-400' },
    { label: t?.roleShortFWD || 'ATT', value: 'FWD', class: 'bg-red-500 text-white border-red-400' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {roleOptions.map((role) => {
          // Flexible matching logic for existing players
          const isActive = 
            (role.value === 'GK' && ['GK', 'POR', 'P'].includes(value)) ||
            (role.value === 'DEF' && ['DEF', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'D', 'DC', 'TS', 'TD'].includes(value)) ||
            (role.value === 'MID' && ['MID', 'CM', 'CDM', 'CAM', 'LM', 'RM', 'CC', 'CDC', 'COC', 'C', 'MID', 'CEN', 'MED'].includes(value)) ||
            (role.value === 'FWD' && ['FWD', 'ST', 'CF', 'LW', 'RW', 'A', 'ATT', 'AS', 'AD'].includes(value)) ||
            (value === role.value);
          
          return (
          <button
            key={role.value}
            onClick={() => onChange(role.value)}
            className={`
              py-3 rounded-xl font-black text-xs border-b-4 transition-all
              ${isActive ? role.class + ' scale-105 shadow-lg' : 'bg-black/5 dark:bg-white/5 border-transparent opacity-50 hover:opacity-100'}
            `}
          >
            {role.label}
          </button>
          );
      })}
    </div>
  );
};