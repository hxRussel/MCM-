
import React, { useState, useEffect } from 'react';
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
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Career, Team } from '../types';
import { MOCK_TEAMS, STARTING_SEASONS } from '../constants';
import { formatMoney } from '../utils/helpers';
import { GlassCard, Button, InputField, SelectField, ConfirmationModal, StatCard } from '../components/SharedUI';

export const HomeView = ({ t, career, onSaveCareer }: { t: any, career: Career | null, onSaveCareer: (c: Career | null) => void }) => {
  const [managerName, setManagerName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [customTeamName, setCustomTeamName] = useState('');
  const [startingSeason, setStartingSeason] = useState(STARTING_SEASONS[1]); // Default 2025/2026
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEndSeasonConfirm, setShowEndSeasonConfirm] = useState(false);

  // Budget Editing States
  const [editTransferOpen, setEditTransferOpen] = useState(false);
  const [editWageOpen, setEditWageOpen] = useState(false);
  const [transferInput, setTransferInput] = useState('');
  const [wageInput, setWageInput] = useState('');
  const [isYearlyWage, setIsYearlyWage] = useState(false);

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
      season: startingSeason,
      wageDisplayMode: 'weekly' // Default to weekly
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

    // Update career state
    onSaveCareer({
      ...career,
      season: nextSeason,
      players: updatedPlayers
    });

    setShowEndSeasonConfirm(false);
  };

  // --- Budget Helpers ---

  // Formats a raw number string (e.g. "10000") into "10.000"
  const formatInputDisplay = (val: string) => {
    if (!val) return '';
    // Remove non-digits first
    const clean = val.replace(/\D/g, '');
    return Number(clean).toLocaleString('it-IT');
  };

  // Handles input change, cleaning non-digits
  const handleBudgetChange = (val: string, setter: (v: string) => void) => {
    const clean = val.replace(/\D/g, '');
    setter(clean);
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
      onSaveCareer({ ...career, transferBudget: Number(transferInput) });
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
    const currentValue = Number(wageInput);
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
      let finalValue = Number(wageInput);
      
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

  const displayWageData = getDisplayWage();

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

      {/* Transfer Budget Modal */}
      {editTransferOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <GlassCard className="w-full max-w-sm p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-obsidian/5 dark:border-ghost/5 pb-4">
                 <h3 className="text-xl font-bold">{t.editTransferBudget}</h3>
                 <button onClick={() => setEditTransferOpen(false)}><XMarkIcon className="w-6 h-6" /></button>
              </div>
              
              <div className="flex flex-col items-center justify-center py-6">
                 <div className="relative w-full">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-green-500 opacity-50">€</span>
                    <input 
                      type="text"
                      inputMode="numeric"
                      value={formatInputDisplay(transferInput)}
                      onChange={(e) => handleBudgetChange(e.target.value, setTransferInput)}
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

      {/* Wage Budget Modal */}
      {editWageOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <GlassCard className="w-full max-w-sm p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-obsidian/5 dark:border-ghost/5 pb-4">
                 <h3 className="text-xl font-bold">{t.editWageBudget}</h3>
                 <button onClick={() => setEditWageOpen(false)}><XMarkIcon className="w-6 h-6" /></button>
              </div>
              
              <div className="flex justify-center">
                <div className="bg-black/5 dark:bg-white/5 p-1 rounded-xl flex gap-1">
                   <button 
                     onClick={() => isYearlyWage && toggleWageView()}
                     className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!isYearlyWage ? 'bg-mint text-obsidian shadow-sm' : 'opacity-50'}`}
                   >
                     {t.weekly}
                   </button>
                   <button 
                     onClick={() => !isYearlyWage && toggleWageView()}
                     className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isYearlyWage ? 'bg-mint text-obsidian shadow-sm' : 'opacity-50'}`}
                   >
                     {t.yearly}
                   </button>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-6">
                 <div className="relative w-full">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-blue-500 opacity-50">€</span>
                    <input 
                      type="text"
                      inputMode="numeric"
                      value={formatInputDisplay(wageInput)}
                      onChange={(e) => handleBudgetChange(e.target.value, setWageInput)}
                      className="w-full bg-transparent text-center text-4xl font-black text-blue-500 placeholder-blue-500/30 outline-none border-none p-0"
                      placeholder="0"
                      autoFocus
                    />
                 </div>
                 <span className="text-xs font-bold opacity-50 uppercase tracking-widest mt-2">
                    {isYearlyWage ? t.yearly : t.weekly}
                 </span>
              </div>

              <Button onClick={saveWageBudget}>{t.saveChanges}</Button>
           </GlassCard>
        </div>
      )}
      
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
          <GlassCard onClick={openTransferModal} className="p-5 cursor-pointer hover:scale-[1.02] transition-transform">
             <span className="text-xs font-bold opacity-50 uppercase tracking-wider block mb-1">{t.transferBudget}</span>
             <span className="text-2xl font-black text-green-500">{formatMoney(career.transferBudget)}</span>
          </GlassCard>
          <GlassCard onClick={openWageModal} className="p-5 cursor-pointer hover:scale-[1.02] transition-transform">
             <span className="text-xs font-bold opacity-50 uppercase tracking-wider block mb-1">{t.wageBudget}</span>
             <span className="text-xl font-black text-blue-500">
               {formatMoney(displayWageData.value)}
               <span className="text-xs font-normal opacity-60">{displayWageData.suffix}</span>
             </span>
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
