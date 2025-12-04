
import React, { useState, useRef } from 'react';
import { 
  BriefcaseIcon, 
  CalendarDaysIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  AcademicCapIcon, 
  UserPlusIcon, 
  HomeIcon, 
  GlobeEuropeAfricaIcon, 
  AdjustmentsHorizontalIcon, 
  ForwardIcon, 
  TrashIcon,
  XMarkIcon,
  ChartBarIcon,
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  TrophyIcon,
  ClockIcon,
  PresentationChartLineIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { Career, Team, Transaction, Currency } from '../types';
import { MOCK_TEAMS, STARTING_SEASONS } from '../constants';
import { formatMoney, formatNumberInput, cleanNumberInput, compressImage } from '../utils/helpers';
import { GlassCard, Button, InputField, SelectField, ConfirmationModal, StatCard } from '../components/SharedUI';

export const HomeView = ({ t, career, onSaveCareer, currency }: { t: any, career: Career | null, onSaveCareer: (c: Career | null) => void, currency: Currency }) => {
  const [managerName, setManagerName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [customTeamName, setCustomTeamName] = useState('');
  const [startingSeason, setStartingSeason] = useState(STARTING_SEASONS[1]); // Default 2025/2026
  const [teamLogo, setTeamLogo] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEndSeasonConfirm, setShowEndSeasonConfirm] = useState(false);
  
  // New Modal States
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showTrendsModal, setShowTrendsModal] = useState(false);

  // Budget Editing States
  const [editTransferOpen, setEditTransferOpen] = useState(false);
  const [editWageOpen, setEditWageOpen] = useState(false);
  const [transferInput, setTransferInput] = useState('');
  const [wageInput, setWageInput] = useState('');
  const [isYearlyWage, setIsYearlyWage] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        // Compress as PNG to preserve transparency for logos
        const compressed = await compressImage(e.target.files[0], 256, 256, 'png');
        setTeamLogo(compressed);
      } catch (err) {
        console.error("Logo processing failed", err);
      }
    }
  };

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
      teamLogo: teamLogo || undefined,
      transferBudget: teamData.transferBudget,
      wageBudget: teamData.wageBudget,
      players: teamData.players,
      startDate: new Date().toISOString(),
      season: startingSeason,
      wageDisplayMode: 'weekly',
      transactions: [],
      budgetHistory: [{ date: new Date().toISOString(), transferBudget: teamData.transferBudget, wageBudget: teamData.wageBudget }],
      trophies: [],
      seasonalEvents: [],
      preMatchEvents: []
    };
    
    onSaveCareer(newCareer);
  };

  const deleteCareer = () => {
    onSaveCareer(null);
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

    // Update career state: Reset transactions and budget history for new season
    onSaveCareer({
      ...career,
      season: nextSeason,
      players: updatedPlayers,
      transactions: [], // Reset history
      budgetHistory: [{ date: new Date().toISOString(), transferBudget: career.transferBudget, wageBudget: career.wageBudget }] // Start new history point
    });

    setShowEndSeasonConfirm(false);
  };

  // Handlers for Budget Modals
  const openTransferModal = () => {
    if (career) {
      setTransferInput(career.transferBudget.toString());
      setEditTransferOpen(true);
    }
  };

  const saveTransferBudget = () => {
    if (career && transferInput) {
      const val = Number(cleanNumberInput(transferInput));
      onSaveCareer({ ...career, transferBudget: val });
      setEditTransferOpen(false);
    }
  };

  const openWageModal = () => {
    if (career) {
      // Determine if we should show yearly or weekly based on persisted preference
      const isYearly = career.wageDisplayMode === 'yearly';
      setIsYearlyWage(isYearly);
      
      const val = isYearly ? career.wageBudget * 52 : career.wageBudget;
      setWageInput(val.toString());
      setEditWageOpen(true);
    }
  };

  const toggleWageView = () => {
    const currentValue = Number(cleanNumberInput(wageInput));
    if (isYearlyWage) {
      // Switch to Weekly: Divide by 52
      setWageInput(Math.round(currentValue / 52).toString());
    } else {
      // Switch to Yearly: Multiply by 52
      setWageInput((currentValue * 52).toString());
    }
    setIsYearlyWage(!isYearlyWage);
  };

  const saveWageBudget = () => {
    if (career && wageInput) {
      let finalValue = Number(cleanNumberInput(wageInput));
      
      // We always store the WEEKLY value in the DB for consistency
      if (isYearlyWage) {
        finalValue = Math.round(finalValue / 52);
      }
      
      // Save the budget AND the display preference
      onSaveCareer({ 
        ...career, 
        wageBudget: finalValue,
        wageDisplayMode: isYearlyWage ? 'yearly' : 'weekly'
      });
      setEditWageOpen(false);
    }
  };

  // Helper to get displayed wage for dashboard
  const getDisplayWage = () => {
    if (!career) return { value: 0, suffix: t.weeklySuffix };
    
    const isYearly = career.wageDisplayMode === 'yearly';
    if (isYearly) {
      return { value: career.wageBudget * 52, suffix: t.yearlySuffix };
    }
    return { value: career.wageBudget, suffix: t.weeklySuffix };
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

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium mb-2 opacity-80">{t.teamLogo} <span className="text-xs opacity-50 font-normal">(PNG)</span></label>
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-obsidian/10 dark:border-ghost/20 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                    {teamLogo ? (
                      <img src={teamLogo} alt="Logo Preview" className="w-full h-full object-contain" />
                    ) : (
                      <PhotoIcon className="w-6 h-6 opacity-30" />
                    )}
                  </div>
                  <div className="flex-1">
                     <p className="text-sm font-bold">{teamLogo ? "Logo Selected" : t.uploadLogo}</p>
                     <p className="text-xs opacity-50">{t.uploadLogoDesc}</p>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={logoInputRef} 
                  className="hidden" 
                  accept="image/png"
                  onChange={handleLogoUpload} 
                />
              </div>

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

  // Calculate Stats - EXCLUDE LOANED PLAYERS
  const activePlayers = career.players.filter(p => !p.isOnLoan);
  
  const playerCount = activePlayers.length;
  const avgAge = playerCount > 0 
    ? (activePlayers.reduce((sum, p) => sum + p.age, 0) / playerCount).toFixed(1) 
    : "0";
  const avgOvr = playerCount > 0
    ? (activePlayers.reduce((sum, p) => sum + p.overall, 0) / playerCount).toFixed(0)
    : "0";
  const over22 = activePlayers.filter(p => p.age > 22).length;
  const homeGrown = activePlayers.filter(p => p.isHomegrown).length;
  const nonEU = activePlayers.filter(p => p.isNonEU).length;

  const displayWageData = getDisplayWage();
  const sortedTransactions = [...(career.transactions || [])].reverse();
  const lastTransaction = sortedTransactions.length > 0 ? sortedTransactions[0] : null;

  // Simple SVG Line Chart Logic
  const getBudgetPoints = (type: 'transfer' | 'wage') => {
    const history = career.budgetHistory || [];
    if (history.length < 2) return null;
    
    // Select data set
    const values = history.map(h => type === 'transfer' ? h.transferBudget : h.wageBudget);
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1; 

    const points = values.map((val, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 100 - ((val - min) / range) * 100; // Invert Y because SVG 0 is top
      return `${x},${y}`;
    }).join(' ');

    return points;
  };

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

      <ConfirmationModal 
        isOpen={showEndSeasonConfirm}
        title={t.endSeasonConfirmTitle}
        message={t.endSeasonConfirmMessage}
        onConfirm={advanceSeason}
        onCancel={() => setShowEndSeasonConfirm(false)}
        t={t}
      />

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <GlassCard className="w-full max-w-md p-6 h-[70vh] flex flex-col">
              <div className="flex justify-between items-center border-b border-obsidian/5 dark:border-ghost/5 pb-4 mb-4">
                 <h3 className="text-xl font-bold flex items-center gap-2">
                   <ClockIcon className="w-6 h-6 text-mint" />
                   {t.history}
                 </h3>
                 <button onClick={() => setShowHistoryModal(false)}><XMarkIcon className="w-6 h-6" /></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                 {sortedTransactions.length > 0 ? sortedTransactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5">
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${tx.type === 'sell' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                             {tx.type === 'sell' ? <ArrowUpRightIcon className="w-4 h-4" /> : <ArrowDownRightIcon className="w-4 h-4" />}
                          </div>
                          <div>
                             <div className="font-bold text-sm">{tx.playerName}</div>
                             <div className="text-xs opacity-50 uppercase">{tx.type === 'sell' ? t.sold : t.bought}</div>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className={`font-bold text-sm ${tx.type === 'sell' ? 'text-green-500' : 'text-red-500'}`}>
                             {tx.type === 'sell' ? '+' : '-'}{formatMoney(tx.amount, currency)}
                          </div>
                          <div className="text-xs opacity-50">
                             {formatMoney(tx.wage, currency)}/wk
                          </div>
                       </div>
                    </div>
                 )) : (
                   <div className="text-center py-10 opacity-40 text-sm">{t.noActivity}</div>
                 )}
              </div>
           </GlassCard>
        </div>
      )}

      {/* Trends Modal */}
      {showTrendsModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <GlassCard className="w-full max-w-lg p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-obsidian/5 dark:border-ghost/5 pb-4">
                 <h3 className="text-xl font-bold flex items-center gap-2">
                   <PresentationChartLineIcon className="w-6 h-6 text-mint" />
                   {t.trends}
                 </h3>
                 <button onClick={() => setShowTrendsModal(false)}><XMarkIcon className="w-6 h-6" /></button>
              </div>

              {/* Transfer Chart */}
              <div className="space-y-2">
                 <h4 className="text-xs font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> {t.transferTrend}
                 </h4>
                 <div className="h-32 w-full bg-black/5 dark:bg-white/5 rounded-xl p-2 relative">
                    {getBudgetPoints('transfer') ? (
                       <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                         <polyline 
                           fill="none" 
                           stroke="#22c55e" 
                           strokeWidth="2" 
                           points={getBudgetPoints('transfer') || ""} 
                           vectorEffect="non-scaling-stroke"
                         />
                       </svg>
                    ) : ( <div className="absolute inset-0 flex items-center justify-center text-xs opacity-30">Not enough data</div> )}
                 </div>
              </div>

              {/* Wage Chart */}
              <div className="space-y-2">
                 <h4 className="text-xs font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> {t.wageTrend}
                 </h4>
                 <div className="h-32 w-full bg-black/5 dark:bg-white/5 rounded-xl p-2 relative">
                    {getBudgetPoints('wage') ? (
                       <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                         <polyline 
                           fill="none" 
                           stroke="#3b82f6" 
                           strokeWidth="2" 
                           points={getBudgetPoints('wage') || ""} 
                           vectorEffect="non-scaling-stroke"
                         />
                       </svg>
                    ) : ( <div className="absolute inset-0 flex items-center justify-center text-xs opacity-30">Not enough data</div> )}
                 </div>
              </div>

              <div className="text-center text-xs opacity-40 pt-2">
                 Trends are reset at the end of each season.
              </div>
           </GlassCard>
        </div>
      )}

      {/* Transfer Budget Modal (Existing) */}
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

      {/* Wage Budget Modal (Existing) */}
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
      
      {/* Header Card */}
      <GlassCard className="relative overflow-hidden p-6 text-center border-t-4 border-t-mint flex flex-col items-center justify-center">
        <div className="absolute top-0 right-0 w-32 h-32 bg-mint/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center gap-4 mb-2">
           {career.teamLogo && (
             <img src={career.teamLogo} alt="Team Logo" className="w-16 h-16 object-contain drop-shadow-lg" />
           )}
           <h2 className="text-4xl font-black">{career.teamName}</h2>
        </div>
        
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

      {/* Financials & History */}
      <div>
        <h3 className="text-lg font-bold mb-3 px-1 flex items-center gap-2 opacity-80">
          <CurrencyDollarIcon className="w-5 h-5" /> {t.financials}
        </h3>
        
        {/* Budget Cards */}
        <div className="grid grid-cols-2 gap-4 mb-4">
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

        {/* Financial Activity Separate Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          
          {/* History Card (Last Transaction) */}
          <GlassCard onClick={() => setShowHistoryModal(true)} className="p-4 cursor-pointer hover:bg-white/90 dark:hover:bg-black/50 transition-colors">
            <div className="flex justify-between items-start mb-3">
               <h4 className="font-bold flex items-center gap-2 text-sm">
                  <ClockIcon className="w-4 h-4 text-mint" />
                  {t.latestTransaction}
               </h4>
            </div>
            {lastTransaction ? (
               <div className="flex items-center justify-between p-2 rounded-lg bg-black/5 dark:bg-white/5 mb-2">
                   <div className="flex items-center gap-2">
                       <div className={`p-1.5 rounded-full ${lastTransaction.type === 'sell' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                           {lastTransaction.type === 'sell' ? <ArrowUpRightIcon className="w-3 h-3" /> : <ArrowDownRightIcon className="w-3 h-3" />}
                       </div>
                       <div className="text-sm font-bold truncate max-w-[100px] sm:max-w-[150px]">{lastTransaction.playerName}</div>
                   </div>
                   <div className={`text-xs font-bold ${lastTransaction.type === 'sell' ? 'text-green-500' : 'text-red-500'}`}>
                      {lastTransaction.type === 'sell' ? '+' : '-'}{formatMoney(lastTransaction.amount, currency)}
                   </div>
               </div>
            ) : (
               <div className="text-xs opacity-40 italic py-2">{t.noActivity}</div>
            )}
            <div className="text-xs text-mint font-bold text-center mt-1">
               {t.viewFullHistory}
            </div>
          </GlassCard>

          {/* Trends Card */}
          <GlassCard onClick={() => setShowTrendsModal(true)} className="p-4 cursor-pointer hover:bg-white/90 dark:hover:bg-black/50 transition-colors flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <h4 className="font-bold flex items-center gap-2 text-sm">
                  <PresentationChartLineIcon className="w-4 h-4 text-mint" />
                  {t.trends}
               </h4>
            </div>
            <div className="flex items-center justify-center py-2 opacity-80">
               {/* Simple illustrative icon */}
               <ChartBarIcon className="w-12 h-12 text-obsidian/20 dark:text-ghost/20" />
            </div>
            <div className="text-xs text-mint font-bold text-center mt-1">
               {t.clickToView}
            </div>
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
           <StatCard icon={TrophyIcon} value={avgOvr} label={t.avgOvr} colorClass="text-yellow-500" />
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
          <Button variant="secondary" onClick={() => setShowEndSeasonConfirm(true)} className="gap-2">
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
