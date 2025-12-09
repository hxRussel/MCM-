import React, { useState } from 'react';
import { 
  TrophyIcon, 
  PlusIcon, 
  TrashIcon, 
  BoltIcon, 
  CalendarDaysIcon,
  SparklesIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { GoogleGenAI } from "@google/genai";
import { Career, Language } from '../types';
import { GlassCard, Button, InputField, ConfirmationModal } from '../components/SharedUI';
import { formatMoney } from '../utils/helpers';

export const ClubView = ({ t, career, onUpdateCareer, language, currency }: { t: any, career: Career, onUpdateCareer: (c: Career) => void, language: Language, currency: string }) => {
  const [newTrophy, setNewTrophy] = useState('');
  
  // Modal States
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiEventType, setAiEventType] = useState<'seasonal' | 'prematch' | null>(null);
  const [generatedEvent, setGeneratedEvent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Delete Confirmation State
  const [deleteEventData, setDeleteEventData] = useState<{type: 'seasonal' | 'prematch', index: number} | null>(null);

  // --- Trophy Logic ---
  const handleAddTrophy = () => {
    if (!newTrophy.trim()) return;
    const updatedTrophies = [...(career.trophies || []), newTrophy.trim()];
    onUpdateCareer({ ...career, trophies: updatedTrophies });
    setNewTrophy('');
  };

  const handleDeleteTrophy = (index: number) => {
    const updatedTrophies = (career.trophies || []).filter((_, i) => i !== index);
    onUpdateCareer({ ...career, trophies: updatedTrophies });
  };

  // --- AI Event Logic ---
  const generateAIEvent = async (type: 'seasonal' | 'prematch') => {
    if (!process.env.API_KEY) {
      alert("API Key missing.");
      return;
    }

    setIsGenerating(true);
    setGeneratedEvent('');
    setAiEventType(type);
    setIsAiModalOpen(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const langName = language === Language.IT ? 'Italian' : 'English';
      
      let systemPrompt = "";
      
      if (type === 'seasonal') {
         // Calculate Stats properly to give context
         const totalPlayers = career.players.length;
         const loanedPlayersCount = career.players.filter(p => p.isOnLoan).length;
         const activeSquadSize = totalPlayers - loanedPlayersCount;

         const activePlayers = career.players.filter(p => !p.isOnLoan);
         
         const avgAge = activePlayers.length > 0 
            ? (activePlayers.reduce((sum, p) => sum + p.age, 0) / activePlayers.length).toFixed(1) 
            : "0";
         
         // Get a mix of players for context, not just top ones
         const sortedPlayers = [...activePlayers].sort((a, b) => b.overall - a.overall);
         const keyPlayers = sortedPlayers.slice(0, 5).map(p => p.name).join(", ");
         const youngTalents = activePlayers.filter(p => p.age <= 21 && p.overall > 65).slice(0, 3).map(p => p.name).join(", ");

         systemPrompt = `
           ROLE: You are an unpredictable and creative Football Director / Board Member for "${career.teamName}".
           TASK: Generate ONE realistic, challenging, and fun seasonal objective or scenario.
           
           REAL TEAM CONTEXT:
           - Transfer Budget: ${formatMoney(career.transferBudget, currency)}
           - Wage Budget: ${formatMoney(career.wageBudget, currency)}/wk
           - Active Squad Size: ${activeSquadSize} players (Standard for this level is ~28-32. Do NOT consider this bloated unless > 35).
           - Players out on Loan: ${loanedPlayersCount} (Ignore these for squad size complaints).
           - Average Age: ${avgAge} years.
           - Key Stars: ${keyPlayers}
           - Young Prospects: ${youngTalents}
           
           INSTRUCTIONS FOR VARIETY (Crucial):
           Do NOT always focus on selling players. Do NOT always target the best player.
           Randomly select ONE of the following categories for the event:
           
           1. **YOUTH DEVELOPMENT**: e.g., "Give 5 starts to a player under 21", "Promote a youth player", "Make [Young Prospect Name] a starter".
           2. **TACTICAL / PERFORMANCE**: e.g., "Keep 3 clean sheets in a row", "Win a match using a specific formation", "Have a substitute score 5 goals this season".
           3. **LOCKER ROOM / CONTRACTS**: e.g., "Renew the contract of a veteran", "A rotation player complains about game time", "Resolve a dispute between two players".
           4. **FINANCIAL / MARKET**: e.g., "Reduce wage bill by 10% without selling starters", "Sign a player from [Specific Nation] for marketing", "Sell a fringe player for profit".
           5. **MEDIA / BOARD**: e.g., "The Board demands attacking football (Score 2+ goals in next 3 games)", "Avoid bad press by not criticizing refs".

           OUTPUT RULES:
           - Be specific and creative. 
           - If referencing a player, you can pick a star OR a random squad player.
           - Ensure the objective is achievable but challenging.
           - Max 2 sentences.
           - Language: ${langName}.
         `;
      } else {
         const activePlayers = career.players.filter(p => !p.isOnLoan);
         
         if (activePlayers.length === 0) {
            setGeneratedEvent("No active players available to generate an event.");
            setIsGenerating(false);
            return;
         }

         // Get a random selection of players so we don't always talk about the best ones
         // Increased sample size to allow for groups
         const shuffled = [...activePlayers].sort(() => 0.5 - Math.random());
         const playerList = shuffled.slice(0, 12).map(p => p.name).join(", ");

         systemPrompt = `
           ROLE: You are a Football Assistant Coach preparing for the next match.
           TASK: Generate ONE realistic, varied, and challenging pre-match incident or scenario.
           
           CONTEXT:
           - Active Squad (Selection): ${playerList}
           
           INSTRUCTIONS:
           1. **TARGET**: Can affect 1 player, 2 players (conflict/chemistry), or a small group (3 players, e.g., flu). ONLY use players from the list provided.
           2. **VARIETY**: Randomly select one of these categories:
              - **MEDICAL**: Flu outbreak (multiple players), food poisoning, late fitness test failure, fatigue, minor knock.
              - **DISCIPLINE**: Late for team meeting, training ground bust-up (2 players), leaking tactics, unprofessional behavior.
              - **PSYCHOLOGY**: Nervousness before big game, distracted by transfer rumors, personal family issue affecting focus, overconfidence.
              - **TACTICAL**: Two players showing great chemistry in training, a player struggling to adapt to tactics, weather conditions favoring a specific player's style.
              - **EXTERNAL**: Stuck in traffic, kit man forgot boots, bad pitch conditions affecting technical players, fan pressure on a local player.
           
           OUTPUT RULES:
           - Be concise (max 2 sentences).
           - Do not always default to "Player X is injured". Be creative.
           - Language: ${langName}.
         `;
      }

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: systemPrompt
      });
      
      setGeneratedEvent(result.text.trim());

    } catch (e) {
      console.error("AI Error", e);
      setGeneratedEvent("Error generating event. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveEvent = () => {
    if (!generatedEvent) return;

    if (aiEventType === 'seasonal') {
       const currentEvents = career.seasonalEvents || [];
       if (currentEvents.length >= 3) return;
       onUpdateCareer({ ...career, seasonalEvents: [...currentEvents, generatedEvent] });
    } else {
       // Pre-match is restricted to 1 active event. We overwrite or push.
       // User requirement: "Choose only one at a time". So we replace the list with this one.
       onUpdateCareer({ ...career, preMatchEvents: [generatedEvent] });
    }
    setIsAiModalOpen(false);
  };

  const handleDeleteEvent = () => {
    if (!deleteEventData) return;
    
    if (deleteEventData.type === 'seasonal') {
       const updated = (career.seasonalEvents || []).filter((_, i) => i !== deleteEventData.index);
       onUpdateCareer({ ...career, seasonalEvents: updated });
    } else {
       const updated = (career.preMatchEvents || []).filter((_, i) => i !== deleteEventData.index);
       onUpdateCareer({ ...career, preMatchEvents: updated });
    }
    setDeleteEventData(null);
  };

  // Helper getters
  const seasonalEvents = career.seasonalEvents || [];
  const preMatchEvents = career.preMatchEvents || [];

  return (
    <div className="animate-fade-in space-y-6 pb-24">
      
      <ConfirmationModal 
        isOpen={!!deleteEventData}
        title={t.deleteEventConfirm}
        message={t.deleteEventMessage}
        onConfirm={handleDeleteEvent}
        onCancel={() => setDeleteEventData(null)}
        t={t}
      />

      {/* AI Generation Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <GlassCard className="w-full max-w-md p-6 relative">
              <button onClick={() => setIsAiModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
                 <XMarkIcon className="w-6 h-6" />
              </button>
              
              <div className="text-center mb-6">
                 <div className="w-16 h-16 bg-mint/20 text-mint rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <SparklesIcon className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-black">{t.aiEventGenerator}</h3>
              </div>

              <div className="min-h-[100px] flex items-center justify-center p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-obsidian/5 dark:border-ghost/5 mb-6 text-center italic font-medium">
                 {isGenerating ? (
                   <span className="animate-pulse">{t.analyzing}</span>
                 ) : (
                   generatedEvent || "..."
                 )}
              </div>

              <div className="flex gap-3">
                 <Button variant="secondary" onClick={() => generateAIEvent(aiEventType!)} disabled={isGenerating}>
                    <ArrowPathIcon className={`w-5 h-5 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                    {t.regenerate}
                 </Button>
                 <Button onClick={saveEvent} disabled={isGenerating || !generatedEvent}>
                    {t.saveEvent}
                 </Button>
              </div>
           </GlassCard>
        </div>
      )}

      {/* Header */}
      <GlassCard className="p-8 text-center relative overflow-hidden border-t-4 border-t-mint">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-mint/10 rounded-full blur-2xl pointer-events-none"></div>
        <h2 className="text-3xl font-black mb-1">{career.teamName}</h2>
        <p className="text-lg font-medium opacity-60 flex items-center justify-center gap-2">
           <span className="w-2 h-2 rounded-full bg-mint"></span>
           {career.managerName}
        </p>
      </GlassCard>

      {/* Trophy Cabinet */}
      <div>
         <h3 className="text-lg font-bold mb-3 px-1 flex items-center gap-2 opacity-80">
            <TrophyIcon className="w-5 h-5 text-yellow-500" /> {t.trophyCabinet}
         </h3>
         <GlassCard className="p-6">
            <div className="flex gap-2 mb-6">
               <div className="flex-1">
                 <InputField 
                   label="" 
                   type="text" 
                   value={newTrophy} 
                   onChange={(e) => setNewTrophy(e.target.value)} 
                   placeholder={t.addTrophyPlaceholder}
                 />
               </div>
               <button 
                 onClick={handleAddTrophy}
                 className="h-[50px] w-[50px] flex items-center justify-center bg-yellow-500 text-obsidian rounded-lg shadow-lg shadow-yellow-500/20 hover:scale-105 transition-transform"
               >
                 <PlusIcon className="w-6 h-6" />
               </button>
            </div>

            {(!career.trophies || career.trophies.length === 0) ? (
               <div className="text-center py-8 opacity-40 text-sm border-2 border-dashed border-obsidian/10 dark:border-ghost/10 rounded-xl">
                  No trophies yet. Time to win!
               </div>
            ) : (
               <div className="grid grid-cols-1 gap-2">
                  {career.trophies.map((trophy, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 font-bold">
                       <span className="flex items-center gap-3">
                          <TrophyIcon className="w-5 h-5" />
                          {trophy}
                       </span>
                       <button onClick={() => handleDeleteTrophy(idx)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-obsidian dark:text-ghost opacity-60 hover:opacity-100">
                          <TrashIcon className="w-4 h-4" />
                       </button>
                    </div>
                  ))}
               </div>
            )}
         </GlassCard>
      </div>

      {/* Seasonal Events */}
      <div>
         <h3 className="text-lg font-bold mb-3 px-1 flex items-center gap-2 opacity-80">
            <CalendarDaysIcon className="w-5 h-5 text-blue-500" /> {t.seasonalEvents}
         </h3>
         
         <div className="mb-4">
            <Button 
               onClick={() => generateAIEvent('seasonal')} 
               disabled={seasonalEvents.length >= 3}
               className="bg-blue-500 text-white shadow-blue-500/20"
            >
               <SparklesIcon className="w-5 h-5 mr-2" />
               {seasonalEvents.length >= 3 ? t.maxEventsReached : t.generateEvent}
            </Button>
         </div>

         <div className="space-y-3">
            {seasonalEvents.length === 0 && (
               <div className="text-center py-6 opacity-40 text-sm italic">No active seasonal events.</div>
            )}
            {seasonalEvents.map((event, idx) => (
               <div key={idx}>
               <GlassCard className="p-4 border-l-4 border-l-blue-500">
                  <p className="font-medium text-sm leading-relaxed mb-3">{event}</p>
                  <div className="flex justify-end">
                     <button 
                       onClick={() => setDeleteEventData({type: 'seasonal', index: idx})}
                       className="p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                     >
                        <TrashIcon className="w-4 h-4" />
                     </button>
                  </div>
               </GlassCard>
               </div>
            ))}
         </div>
      </div>

      {/* Pre-Match Events */}
      <div>
         <h3 className="text-lg font-bold mb-3 px-1 flex items-center gap-2 opacity-80">
            <BoltIcon className="w-5 h-5 text-red-500" /> {t.preMatchEvents}
         </h3>
         
         <div className="mb-4">
            <Button 
               onClick={() => generateAIEvent('prematch')} 
               disabled={preMatchEvents.length >= 1}
               className="bg-red-500 text-white shadow-red-500/20"
            >
               <SparklesIcon className="w-5 h-5 mr-2" />
               {preMatchEvents.length >= 1 ? t.maxEventsReached : t.generateEvent}
            </Button>
         </div>

         <div className="space-y-3">
            {preMatchEvents.length === 0 && (
               <div className="text-center py-6 opacity-40 text-sm italic">No active pre-match events.</div>
            )}
            {preMatchEvents.map((event, idx) => (
               <div key={idx}>
               <GlassCard className="p-4 border-l-4 border-l-red-500">
                  <p className="font-medium text-sm leading-relaxed mb-3">{event}</p>
                  <div className="flex justify-end">
                     <button 
                       onClick={() => setDeleteEventData({type: 'prematch', index: idx})}
                       className="p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                     >
                        <TrashIcon className="w-4 h-4" />
                     </button>
                  </div>
               </GlassCard>
               </div>
            ))}
         </div>
      </div>

    </div>
  );
};