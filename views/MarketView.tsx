

import React, { useState } from 'react';
import { 
  CurrencyDollarIcon, 
  XMarkIcon,
  UserPlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { Career, Player, Transaction, Currency } from '../types';
import { formatMoney, formatNumberInput, cleanNumberInput } from '../utils/helpers';
import { GlassCard, Button, InputField, ConfirmationModal, NumberSelectionModal, RoleSelector, PlayerSelectionModal } from '../components/SharedUI';

export const MarketView = ({ t, career, onUpdateCareer, currency }: { t: any, career: Career, onUpdateCareer: (c: Career) => void, currency: Currency }) => {
  // --- Budget Editing States (Identical logic to HomeView) ---
  const [editTransferOpen, setEditTransferOpen] = useState(false);
  const [editWageOpen, setEditWageOpen] = useState(false);
  const [transferInput, setTransferInput] = useState('');
  const [wageInput, setWageInput] = useState('');
  const [isYearlyWage, setIsYearlyWage] = useState(false);

  // --- Signing States ---
  const [signingModalOpen, setSigningModalOpen] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [signingFee, setSigningFee] = useState('');
  const [signingWage, setSigningWage] = useState('');
  const [newPlayerAge, setNewPlayerAge] = useState(25);
  const [newPlayerOvr, setNewPlayerOvr] = useState(75);
  const [newPlayerPos, setNewPlayerPos] = useState('MID');
  const [activePicker, setActivePicker] = useState<'age' | 'overall' | null>(null);
  const [signingError, setSigningError] = useState<string | null>(null);

  // --- Selling States ---
  const [sellingModalOpen, setSellingModalOpen] = useState(false);
  const [playerSelectionOpen, setPlayerSelectionOpen] = useState(false);
  const [selectedSellPlayer, setSelectedSellPlayer] = useState<Player | null>(null);
  const [sellFee, setSellFee] = useState('');
  const [sellWage, setSellWage] = useState('');

  // --- Budget Helpers (Shared logic with HomeView) ---
  const openTransferModal = () => {
    setTransferInput(career.transferBudget.toString());
    setEditTransferOpen(true);
  };

  const saveTransferBudget = () => {
    if (transferInput) {
      const val = Number(cleanNumberInput(transferInput));
      onUpdateCareer({ ...career, transferBudget: val });
      setEditTransferOpen(false);
    }
  };

  const openWageModal = () => {
    const isYearly = career.wageDisplayMode === 'yearly';
    setIsYearlyWage(isYearly);
    const val = isYearly ? career.wageBudget * 52 : career.wageBudget;
    setWageInput(val.toString());
    setEditWageOpen(true);
  };

  const toggleWageView = () => {
    const currentValue = Number(cleanNumberInput(wageInput));
    if (isYearlyWage) {
      setWageInput(Math.round(currentValue / 52).toString());
    } else {
      setWageInput((currentValue * 52).toString());
    }
    setIsYearlyWage(!isYearlyWage);
  };

  const saveWageBudget = () => {
    if (wageInput) {
      let finalValue = Number(cleanNumberInput(wageInput));
      if (isYearlyWage) {
        finalValue = Math.round(finalValue / 52);
      }
      onUpdateCareer({ 
        ...career, 
        wageBudget: finalValue,
        wageDisplayMode: isYearlyWage ? 'yearly' : 'weekly'
      });
      setEditWageOpen(false);
    }
  };

  const getDisplayWage = () => {
    const isYearly = career.wageDisplayMode === 'yearly';
    if (isYearly) {
      return { value: career.wageBudget * 52, suffix: t.yearlySuffix };
    }
    return { value: career.wageBudget, suffix: t.weeklySuffix };
  };
  
  const displayWageData = getDisplayWage();

  // --- Signing Logic ---
  const handleSignPlayer = () => {
    setSigningError(null);
    const fee = Number(cleanNumberInput(signingFee));
    const wage = Number(cleanNumberInput(signingWage));

    // Validation
    if (!newPlayerName.trim() || !fee || !wage) return;

    // Check Funds
    if (fee > career.transferBudget) {
      setSigningError(`${t.fundsError} (Fee > Transfer Budget)`);
      return;
    }
    if (wage > career.wageBudget) {
      setSigningError(`${t.fundsError} (Wage > Wage Budget)`);
      return;
    }

    // Process Transaction
    const newPlayer: Player = {
      id: 'signed-' + Date.now(),
      name: newPlayerName,
      age: newPlayerAge,
      overall: newPlayerOvr,
      position: newPlayerPos,
      nationality: 'Unknown',
      value: fee,
      wage: wage,
      isHomegrown: false,
      isNonEU: false
    };

    const newTransaction: Transaction = {
      id: 'tx-' + Date.now(),
      type: 'buy',
      playerName: newPlayerName,
      amount: fee,
      wage: wage,
      date: new Date().toISOString()
    };

    const updatedTransferBudget = career.transferBudget - fee;
    const updatedWageBudget = career.wageBudget - wage;

    const updatedCareer = {
      ...career,
      transferBudget: updatedTransferBudget,
      wageBudget: updatedWageBudget,
      players: [...career.players, newPlayer],
      transactions: [...(career.transactions || []), newTransaction],
      budgetHistory: [...(career.budgetHistory || []), { 
        date: new Date().toISOString(), 
        transferBudget: updatedTransferBudget, 
        wageBudget: updatedWageBudget 
      }]
    };

    onUpdateCareer(updatedCareer);
    setSigningModalOpen(false);
    
    // Reset Form
    setNewPlayerName('');
    setSigningFee('');
    setSigningWage('');
  };

  // --- Selling Logic ---
  const handleSelectPlayerToSell = (player: Player) => {
    setSelectedSellPlayer(player);
    // Auto-fill wage (ensure we assume weekly as stored in DB)
    setSellWage(player.wage.toString());
    // Suggest value as sell fee
    setSellFee(player.value.toString());
  };

  const handleSellPlayer = () => {
    if (!selectedSellPlayer) return;
    
    const fee = Number(cleanNumberInput(sellFee));
    const wage = Number(cleanNumberInput(sellWage));

    // Logic: Add Fee to Budget, Add Wage back to Budget, Remove Player
    const updatedPlayers = career.players.filter(p => p.id !== selectedSellPlayer.id);
    
    const updatedTransferBudget = career.transferBudget + fee;
    const updatedWageBudget = career.wageBudget + wage;

    const newTransaction: Transaction = {
      id: 'tx-' + Date.now(),
      type: 'sell',
      playerName: selectedSellPlayer.name,
      amount: fee,
      wage: wage,
      date: new Date().toISOString()
    };

    const updatedCareer = {
      ...career,
      transferBudget: updatedTransferBudget,
      wageBudget: updatedWageBudget,
      players: updatedPlayers,
      transactions: [...(career.transactions || []), newTransaction],
      budgetHistory: [...(career.budgetHistory || []), { 
         date: new Date().toISOString(), 
         transferBudget: updatedTransferBudget, 
         wageBudget: updatedWageBudget 
      }]
    };

    onUpdateCareer(updatedCareer);
    setSellingModalOpen(false);

    // Reset Form
    setSelectedSellPlayer(null);
    setSellFee('');
    setSellWage('');
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* --- Budget Modals (Reused) --- */}
      {editTransferOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <GlassCard className="w-full max-w-sm p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-obsidian/5 dark:border-ghost/5 pb-4">
                 <h3 className="text-xl font-bold">{t.editTransferBudget}</h3>
                 <button onClick={() => setEditTransferOpen(false)}><XMarkIcon className="w-6 h-6" /></button>
              </div>
              <div className="flex flex-col items-center justify-center py-6">
                 <div className="relative w-full">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-green-500 opacity-50">{currency}</span>
                    <input 
                      type="text"
                      inputMode="numeric"
                      value={formatNumberInput(transferInput)}
                      onChange={(e) => setTransferInput(cleanNumberInput(e.target.value))}
                      className="w-full bg-transparent text-center text-4xl font-black text-green-500 placeholder-green-500/30 outline-none border-none p-0"
                      placeholder="0"
                      autoFocus
                    />
                 </div>
              </div>
              <Button onClick={saveTransferBudget}>{t.saveChanges}</Button>
           </GlassCard>
        </div>
      )}

      {editWageOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <GlassCard className="w-full max-w-sm p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-obsidian/5 dark:border-ghost/5 pb-4">
                 <h3 className="text-xl font-bold">{t.editWageBudget}</h3>
                 <button onClick={() => setEditWageOpen(false)}><XMarkIcon className="w-6 h-6" /></button>
              </div>
              <div className="flex justify-center">
                <div className="bg-black/5 dark:bg-white/5 p-1 rounded-xl flex gap-1">
                   <button onClick={() => isYearlyWage && toggleWageView()} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!isYearlyWage ? 'bg-mint text-obsidian shadow-sm' : 'opacity-50'}`}>{t.weekly}</button>
                   <button onClick={() => !isYearlyWage && toggleWageView()} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isYearlyWage ? 'bg-mint text-obsidian shadow-sm' : 'opacity-50'}`}>{t.yearly}</button>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center py-6">
                 <div className="relative w-full">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-blue-500 opacity-50">{currency}</span>
                    <input 
                      type="text"
                      inputMode="numeric"
                      value={formatNumberInput(wageInput)}
                      onChange={(e) => setWageInput(cleanNumberInput(e.target.value))}
                      className="w-full bg-transparent text-center text-4xl font-black text-blue-500 placeholder-blue-500/30 outline-none border-none p-0"
                      placeholder="0"
                      autoFocus
                    />
                 </div>
                 <span className="text-xs font-bold opacity-50 uppercase tracking-widest mt-2">{isYearlyWage ? t.yearly : t.weekly}</span>
              </div>
              <Button onClick={saveWageBudget}>{t.saveChanges}</Button>
           </GlassCard>
        </div>
      )}

      {/* --- Signing Modal --- */}
      {signingModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
           <NumberSelectionModal isOpen={activePicker === 'age'} onClose={() => setActivePicker(null)} title={t.labelAge} min={14} max={45} selectedValue={newPlayerAge} onSelect={setNewPlayerAge} />
           <NumberSelectionModal isOpen={activePicker === 'overall'} onClose={() => setActivePicker(null)} title={t.labelOverall} min={50} max={99} selectedValue={newPlayerOvr} onSelect={setNewPlayerOvr} />

           <GlassCard className="w-full max-w-md p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-obsidian/5 dark:border-ghost/5 pb-4">
                 <h3 className="text-xl font-bold">{t.signingModalTitle}</h3>
                 <button onClick={() => setSigningModalOpen(false)}><XMarkIcon className="w-6 h-6" /></button>
              </div>

              {signingError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg font-bold text-center">
                  {signingError}
                </div>
              )}

              <div className="space-y-1">
                 <label className="text-xs font-bold opacity-50 uppercase tracking-wider">{t.playerName}</label>
                 <InputField label="" type="text" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} placeholder="e.g. Kylian Mbappé" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-bold opacity-50 uppercase tracking-wider block mb-1">{t.transferFee}</label>
                    <div className="relative">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-green-500">{currency}</span>
                       <input 
                         type="text"
                         inputMode="numeric"
                         value={formatNumberInput(signingFee)}
                         onChange={(e) => setSigningFee(cleanNumberInput(e.target.value))}
                         className="w-full py-3 pl-8 pr-3 rounded-lg bg-white/5 border border-obsidian/10 dark:border-ghost/20 font-black text-lg text-green-500 outline-none focus:border-green-500 transition-all"
                         placeholder="0"
                       />
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold opacity-50 uppercase tracking-wider block mb-1">{t.wage}</label>
                    <div className="relative">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-blue-500">{currency}</span>
                       <input 
                         type="text"
                         inputMode="numeric"
                         value={formatNumberInput(signingWage)}
                         onChange={(e) => setSigningWage(cleanNumberInput(e.target.value))}
                         className="w-full py-3 pl-8 pr-3 rounded-lg bg-white/5 border border-obsidian/10 dark:border-ghost/20 font-black text-lg text-blue-500 outline-none focus:border-blue-500 transition-all"
                         placeholder="0"
                       />
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold opacity-50 uppercase tracking-wider">{t.labelAge}</label>
                  <button onClick={() => setActivePicker('age')} className="w-full py-3 rounded-xl bg-black/5 dark:bg-white/5 font-black text-xl text-center hover:bg-black/10 transition-colors">{newPlayerAge}</button>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold opacity-50 uppercase tracking-wider">{t.labelOverall}</label>
                  <button onClick={() => setActivePicker('overall')} className="w-full py-3 rounded-xl bg-black/5 dark:bg-white/5 font-black text-xl text-center hover:bg-black/10 transition-colors">{newPlayerOvr}</button>
                </div>
              </div>

              <div className="space-y-2">
                 <label className="block text-xs font-bold opacity-50 uppercase tracking-wider">{t.labelRole}</label>
                 <RoleSelector value={newPlayerPos} onChange={setNewPlayerPos} t={t} />
              </div>

              <Button onClick={handleSignPlayer}>{t.confirmSigning}</Button>
           </GlassCard>
        </div>
      )}

      {/* --- Selling Modal --- */}
      {sellingModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
           <PlayerSelectionModal 
              isOpen={playerSelectionOpen}
              onClose={() => setPlayerSelectionOpen(false)}
              title={t.selectPlayerToSell}
              players={career.players}
              onSelect={handleSelectPlayerToSell}
           />

           <GlassCard className="w-full max-w-md p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-obsidian/5 dark:border-ghost/5 pb-4">
                 <h3 className="text-xl font-bold">{t.sellingModalTitle}</h3>
                 <button onClick={() => setSellingModalOpen(false)}><XMarkIcon className="w-6 h-6" /></button>
              </div>

              <div className="space-y-1">
                 <label className="text-xs font-bold opacity-50 uppercase tracking-wider">{t.playerName}</label>
                 <div 
                   onClick={() => setPlayerSelectionOpen(true)}
                   className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent hover:border-mint transition-all cursor-pointer flex items-center justify-between"
                 >
                   <span className={selectedSellPlayer ? 'font-bold' : 'opacity-50'}>
                     {selectedSellPlayer ? selectedSellPlayer.name : 'Select a player...'}
                   </span>
                   <UserPlusIcon className="w-5 h-5 opacity-50" />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-bold opacity-50 uppercase tracking-wider block mb-1">{t.saleFee}</label>
                    <div className="relative">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-green-500">{currency}</span>
                       <input 
                         type="text"
                         inputMode="numeric"
                         value={formatNumberInput(sellFee)}
                         onChange={(e) => setSellFee(cleanNumberInput(e.target.value))}
                         className="w-full py-3 pl-8 pr-3 rounded-lg bg-white/5 border border-obsidian/10 dark:border-ghost/20 font-black text-lg text-green-500 outline-none focus:border-green-500 transition-all"
                         placeholder="0"
                       />
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold opacity-50 uppercase tracking-wider block mb-1">{t.releasedWage}</label>
                    <div className="relative">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-blue-500">{currency}</span>
                       <input 
                         type="text"
                         inputMode="numeric"
                         value={formatNumberInput(sellWage)}
                         onChange={(e) => setSellWage(cleanNumberInput(e.target.value))}
                         className="w-full py-3 pl-8 pr-3 rounded-lg bg-white/5 border border-obsidian/10 dark:border-ghost/20 font-black text-lg text-blue-500 outline-none focus:border-blue-500 transition-all"
                         placeholder="0"
                       />
                    </div>
                 </div>
              </div>

              <Button onClick={handleSellPlayer} disabled={!selectedSellPlayer} variant="danger">
                 {t.confirmSale}
              </Button>
           </GlassCard>
        </div>
      )}

      {/* --- Budget Overview (Same as Home) --- */}
      <div>
        <h3 className="text-lg font-bold mb-3 px-1 flex items-center gap-2 opacity-80">
          <CurrencyDollarIcon className="w-5 h-5" /> {t.financials}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <GlassCard onClick={openTransferModal} className="p-5 cursor-pointer hover:scale-[1.02] transition-transform">
             <span className="text-xs font-bold opacity-50 uppercase tracking-wider block mb-1">{t.transferBudget}</span>
             <span className="text-2xl font-black text-green-500">{formatMoney(career.transferBudget, currency)}</span>
          </GlassCard>
          <GlassCard onClick={openWageModal} className="p-5 cursor-pointer hover:scale-[1.02] transition-transform">
             <span className="text-xs font-bold opacity-50 uppercase tracking-wider block mb-1">{t.wageBudget}</span>
             <span className="text-xl font-black text-blue-500">
               {formatMoney(displayWageData.value, currency)}
               <span className="text-xs font-normal opacity-60">{displayWageData.suffix}</span>
             </span>
          </GlassCard>
        </div>
      </div>

      {/* --- Actions --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <GlassCard 
           onClick={() => setSigningModalOpen(true)}
           className="p-6 cursor-pointer hover:bg-mint/10 border-mint/20 flex flex-col items-center justify-center gap-2 group transition-all"
         >
           <div className="p-4 rounded-full bg-mint text-obsidian shadow-lg group-hover:scale-110 transition-transform">
             <UserPlusIcon className="w-8 h-8" />
           </div>
           <span className="text-lg font-black">{t.buyPlayer}</span>
           <ArrowTrendingUpIcon className="w-6 h-6 text-green-500" />
         </GlassCard>

         <GlassCard 
           onClick={() => setSellingModalOpen(true)} 
           className="p-6 cursor-pointer hover:bg-red-500/10 border-red-500/20 flex flex-col items-center justify-center gap-2 group transition-all"
         >
           <div className="p-4 rounded-full bg-red-500 text-white shadow-lg group-hover:scale-110 transition-transform">
             <CurrencyDollarIcon className="w-8 h-8" />
           </div>
           <span className="text-lg font-black">{t.sellPlayer}</span>
           <ArrowTrendingDownIcon className="w-6 h-6 text-red-500" />
         </GlassCard>
      </div>

    </div>
  );
};