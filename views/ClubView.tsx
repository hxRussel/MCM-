
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
         // Calculate Context Stats
         const playerCount = career.players.length;
         const avgAge = playerCount > 0 
            ? (career.players.reduce((sum, p) => sum + p.age, 0) / playerCount).toFixed(1) 
            : "0";
         const over22 = career.players.filter(p => p.age > 22).length;
         const under22 = playerCount - over22;

         systemPrompt = `
           ROLE: You are the Club Board of Directors / Football Director.
           TASK: Generate ONE realistic seasonal objective or obstacle for the manager of "${career.teamName}".
           
           DETAILED CONTEXT:
           - Transfer Budget: ${formatMoney(career.transferBudget, currency)}
           - Wage Budget: ${formatMoney(career.wageBudget, currency)}/wk
           - Squad Size: ${playerCount} players (Standard is ~25-28)
           - Average Age: ${avgAge} years
           - Experienced Players (>22): ${over22}
           - Young Players (<=22): ${under22}
           
           LOGIC FOR GENERATION (Analyze the context):
           1. **SQUAD SIZE**: 
              - If > 30 players: Demand to sell at least 3 players to reduce bloat.
              - If < 20 players: Demand to sign at least 3 players for depth.
           2. **AGE PROFILE**:
              - If Avg Age > 28: Demand to lower average age (Sign U21 players).
              - If Avg Age < 23: Demand to add experience (Sign players > 30yo).
           3. **FINANCIAL**:
              - If Budget is High (>100M): Demand a "Marquee Signing" (Star player).
              - If Budget is Low (<5M): Demand strict austerity or selling a key player to raise funds.
              - If Wage Bill is high: Demand to reduce total wage bill by 10%.
           4. **IDENTITY**:
              - Demand to sign players from a specific nation (e.g., local talent).
              - Demand to play/promote academy graduates.
           
           OUTPUT RULES:
           - Pick ONE scenario based on the logic above.
           - Be creative and realistic for a football simulation.
           - Max 2 sentences.
           - Language: ${langName}.
         `;
      } else {
         const playerList = career.players.map(p => p.name).slice(0, 15).join(", ");
         systemPrompt = `
           ROLE: You are a Football Assistant Coach.
           TASK: Generate ONE random pre-match scenario regarding player availability or selection.
           CONTEXT:
           - Key Players: ${playerList}
           
           TYPES OF EVENTS (Pick one randomly):
           - A player has the flu/virus and cannot play.
           - Training ground bust-up: Player X cannot start.
           - Board pressure: You MUST start Player Y this match.
           - Late fitness test failed for a defender.
           - Personal issue: Player Z needs a rest.
           
           OUTPUT RULES:
           - Pick a specific name from the list provided if possible.
           - Max 2 sentences.
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
