

import React, { useState, useRef, useEffect } from 'react';
import { 
  SparklesIcon, 
  UserGroupIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowRightIcon, 
  PhotoIcon, 
  DocumentTextIcon, 
  CameraIcon, 
  CheckCircleIcon,
  XMarkIcon,
  HomeIcon,
  GlobeEuropeAfricaIcon, 
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { GoogleGenAI } from "@google/genai";
import { Career, Player } from '../types';
import { compressImage } from '../utils/helpers';
import { GlassCard, Button, ConfirmationModal, InputField, NumberSelectionModal, RoleSelector } from '../components/SharedUI';

// --- Components ---

const PlayerCard: React.FC<{ player: Player; onEdit: () => void; onDelete: () => void }> = ({ player, onEdit, onDelete }) => {
  let ovrColor = "bg-red-500 text-white";
  if (player.overall >= 70) ovrColor = "bg-yellow-500 text-black";
  if (player.overall >= 80) ovrColor = "bg-mint text-obsidian";
  if (player.overall >= 90) ovrColor = "bg-teal-400 text-white";

  return (
    <GlassCard className="p-3 flex items-center gap-3 cursor-pointer hover:bg-white/90 dark:hover:bg-black/50 transition-colors group relative">
      <div className={`w-10 h-10 rounded-full ${ovrColor} flex items-center justify-center font-black text-sm shadow-md shrink-0`}>
        {player.overall}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold truncate text-sm">{player.name}</h4>
        <div className="flex items-center gap-2 text-xs opacity-60">
           <span className="font-mono bg-obsidian/10 dark:bg-ghost/10 px-1 rounded">{player.position}</span>
           <span>• {player.age}yo</span>
           {player.isHomegrown && <HomeIcon className="w-3 h-3 text-mint" title="Homegrown" />}
           {player.isNonEU && <GlobeEuropeAfricaIcon className="w-3 h-3 text-orange-500" title="Non-EU" />}
           {player.isOnLoan && <PaperAirplaneIcon className="w-3 h-3 text-blue-400" title="On Loan" />}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(); }} 
          className="p-2 rounded-full bg-obsidian/5 dark:bg-ghost/5 hover:bg-mint hover:text-obsidian transition-colors"
          title="Edit"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }} 
          className="p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
          title="Delete"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </GlassCard>
  );
};

// Collapsible Section Component
interface SquadSectionProps {
  title: string;
  players: Player[];
  onEdit: (p: Player) => void;
  onDelete: (id: string) => void;
}

const SquadSection: React.FC<SquadSectionProps> = ({ title, players, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (players.length === 0) return null;

  return (
    <div className="space-y-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors group"
      >
        <div className="flex items-center gap-2">
           <h3 className="text-xs font-bold uppercase tracking-widest opacity-60">{title}</h3>
           <span className="text-xs font-bold bg-white dark:bg-black px-2 py-0.5 rounded-full opacity-50">{players.length}</span>
        </div>
        {isOpen ? <ChevronUpIcon className="w-4 h-4 opacity-50" /> : <ChevronDownIcon className="w-4 h-4 opacity-50" />}
      </button>
      
      {isOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in pl-2 border-l-2 border-obsidian/5 dark:border-ghost/5">
           {players.map(player => (
             <PlayerCard 
               key={player.id} 
               player={player} 
               onEdit={() => onEdit(player)}
               onDelete={() => onDelete(player.id)}
             />
           ))}
        </div>
      )}
    </div>
  );
};

const EditPlayerModal = ({ isOpen, onClose, player, onSave, t }: any) => {
  const [formData, setFormData] = useState<Player | null>(null);
  const [activePicker, setActivePicker] = useState<'age' | 'overall' | null>(null);

  useEffect(() => {
    if (player) {
      setFormData({ ...player });
    }
  }, [player]);

  const handleChange = (field: keyof Player, value: any) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      
      {/* Sub-Modal for Number Selection */}
      <NumberSelectionModal 
        isOpen={activePicker === 'age'}
        onClose={() => setActivePicker(null)}
        title={t.labelAge}
        min={14}
        max={45}
        selectedValue={formData.age}
        onSelect={(val: number) => handleChange('age', val)}
      />

      <NumberSelectionModal 
        isOpen={activePicker === 'overall'}
        onClose={() => setActivePicker(null)}
        title={t.labelOverall}
        min={50}
        max={99}
        selectedValue={formData.overall}
        onSelect={(val: number) => handleChange('overall', val)}
      />

      <GlassCard className="w-full max-w-sm p-6 space-y-6 relative">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <PencilIcon className="w-5 h-5 text-mint" />
          {t.editPlayer}
        </h3>
        
        <div className="space-y-1">
          <label className="text-xs font-bold opacity-50 uppercase tracking-wider">{t.labelName}</label>
          <InputField 
             label="" 
             type="text" 
             value={formData.name} 
             onChange={(e) => handleChange('name', e.target.value)} 
          />
        </div>
        
        {/* Clickable Inputs for Age/OVR */}
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-1">
             <label className="text-xs font-bold opacity-50 uppercase tracking-wider">{t.labelAge}</label>
             <button 
               onClick={() => setActivePicker('age')}
               className="w-full py-4 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent hover:border-mint transition-all font-black text-2xl text-center"
             >
               {formData.age}
             </button>
           </div>
           
           <div className="space-y-1">
             <label className="text-xs font-bold opacity-50 uppercase tracking-wider">{t.labelOverall}</label>
             <button 
               onClick={() => setActivePicker('overall')}
               className="w-full py-4 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent hover:border-mint transition-all font-black text-2xl text-center"
             >
               {formData.overall}
             </button>
           </div>
        </div>

        {/* Attributes Toggles */}
        <div className="grid grid-cols-3 gap-2">
           <button 
             onClick={() => handleChange('isHomegrown', !formData.isHomegrown)}
             className={`
               p-2 rounded-xl flex flex-col items-center justify-center gap-1 font-bold text-xs transition-all duration-200 border border-transparent h-16
               ${formData.isHomegrown 
                 ? 'bg-mint/10 border-mint text-mint-text' 
                 : 'bg-black/5 dark:bg-white/5 opacity-60 hover:opacity-100'}
             `}
           >
             <HomeIcon className={`w-5 h-5 ${formData.isHomegrown ? 'text-mint' : ''}`} />
             {t.homegrown}
           </button>

           <button 
             onClick={() => handleChange('isNonEU', !formData.isNonEU)}
             className={`
               p-2 rounded-xl flex flex-col items-center justify-center gap-1 font-bold text-xs transition-all duration-200 border border-transparent h-16
               ${formData.isNonEU 
                 ? 'bg-orange-500/10 border-orange-500 text-orange-500' 
                 : 'bg-black/5 dark:bg-white/5 opacity-60 hover:opacity-100'}
             `}
           >
             <GlobeEuropeAfricaIcon className={`w-5 h-5 ${formData.isNonEU ? 'text-orange-500' : ''}`} />
             {t.nonEU}
           </button>

           <button 
             onClick={() => handleChange('isOnLoan', !formData.isOnLoan)}
             className={`
               p-2 rounded-xl flex flex-col items-center justify-center gap-1 font-bold text-xs transition-all duration-200 border border-transparent h-16
               ${formData.isOnLoan 
                 ? 'bg-blue-500/10 border-blue-500 text-blue-500' 
                 : 'bg-black/5 dark:bg-white/5 opacity-60 hover:opacity-100'}
             `}
           >
             <PaperAirplaneIcon className={`w-5 h-5 -rotate-45 ${formData.isOnLoan ? 'text-blue-500' : ''}`} />
             {t.positionLoan}
           </button>
        </div>

        <div className="space-y-2">
           <label className="block text-xs font-bold opacity-50 uppercase tracking-wider">{t.labelRole}</label>
           <RoleSelector 
             value={formData.position}
             onChange={(val) => handleChange('position', val)}
             t={t}
           />
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-obsidian/5 dark:border-ghost/5">
           <Button variant="ghost" onClick={onClose}>{t.cancel}</Button>
           <Button onClick={() => onSave(formData)}>{t.saveChanges}</Button>
        </div>
      </GlassCard>
    </div>
  );
};

const ImportSquadModal = ({ isOpen, onClose, onImport, t }: any) => {
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [previewPlayers, setPreviewPlayers] = useState<Player[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Gemini AI Logic
  const analyzeData = async (content: any, type: 'text' | 'image') => {
    if (!process.env.API_KEY) {
      alert("API Key is missing! You must add 'API_KEY' to your Vercel Environment Variables.");
      return;
    }

    setIsLoading(true);
    setPreviewPlayers([]);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemPrompt = `
        ROLE: You are a smart Football Manager Assistant OCR.
        TASK: Extract player data from the provided image or text.

        CRITICAL INSTRUCTIONS FOR NUMBERS:
        - **Kit Number**: Usually strictly on the LEFT or RIGHT margin. IGNORE numbers 1-99 if they are isolated.
        - **Overall (OVR)**: The most important number. Usually 55-99. 
        - **Age**: Usually 16-45.
        - RULE: If you see "9" (Kit) and "82" (OVR), use 82.
        - RULE: If you see "19" (Age) and "70" (OVR), use 70 for OVR.

        CRITICAL INSTRUCTIONS FOR POSITIONS (NORMALIZATION):
        You must convert specific roles to these 4 generic categories if specific EN ones aren't clear.
        
        1. **GOALKEEPER (GK)**:
           - Input: P, POR, GK
           - Output: GK

        2. **DEFENDER (DEF)**:
           - Input: D, DC, DIF, TS, TD, Terzino, ADA, ASA, LB, RB, CB, LWB, RWB
           - Output: DEF (or CB, LB, RB if sure)

        3. **MIDFIELDER (MID)**:
           - Input: C, CC, CEN, MED, CDC, COC, ES, ED, Mezzala, CM, CDM, CAM, LM, RM
           - Output: MID (or CM, CDM, CAM if sure)

        4. **FORWARD (FWD)**:
           - Input: A, AT, ATT, AS, AD, Punta, ST, CF, LW, RW
           - Output: FWD (or ST, LW, RW if sure)

        OUTPUT FORMAT:
        Return ONLY a JSON array. 
        [{"name": "Player Name", "position": "FWD", "overall": 82, "age": 29}]
      `;

      let responseText: string | undefined;
      
      if (type === 'text') {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${systemPrompt}\n\nINPUT DATA:\n${textInput}`
        });
        responseText = result.text;
      } else {
         const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    { text: systemPrompt },
                    { 
                        inlineData: { 
                            mimeType: "image/jpeg", 
                            data: content.split(',')[1] 
                        } 
                    }
                ]
            }
        });
        responseText = result.text;
      }

      const rawText = responseText || "";
      console.log("Gemini Raw Response:", rawText);

      const jsonMatch = rawText.match(/\[.*\]/s);
      const cleanJson = jsonMatch ? jsonMatch[0] : "[]";
      
      let players = [];
      try {
        players = JSON.parse(cleanJson);
      } catch (jsonError) {
        console.error("Failed to parse extracted JSON", cleanJson);
      }

      if (!Array.isArray(players)) {
        players = [];
      }

      const formattedPlayers = players.map((p: any) => ({
        id: 'imported-' + Date.now() + Math.random(),
        name: p.name || 'Unknown',
        age: (typeof p.age === 'number' && p.age > 12) ? p.age : 25,
        overall: (typeof p.overall === 'number' && p.overall > 45) ? p.overall : 70,
        position: p.position ? p.position.toUpperCase() : 'MID',
        nationality: 'Unknown', 
        value: 1000000,
        wage: 5000,
        isHomegrown: false,
        isNonEU: false,
        isOnLoan: false
      }));

      setPreviewPlayers(formattedPlayers);
      
      if (formattedPlayers.length === 0) {
        alert(t.noPlayersFound);
      }

    } catch (e) {
      console.error("AI Error", e);
      alert(t.errorGeneric);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      // Use 2048px for better OCR text recognition
      const base64 = await compressImage(e.target.files[0], 2048, 2048);
      analyzeData(base64, 'image');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-obsidian border border-white/10 w-full max-w-2xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="p-6 border-b border-obsidian/5 dark:border-ghost/5 flex justify-between items-center">
           <div>
             <h3 className="text-xl font-black flex items-center gap-2">
               <SparklesIcon className="w-6 h-6 text-mint" />
               {t.importPlayers}
             </h3>
             <p className="text-xs opacity-50">Powered by Gemini AI</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full">
             <ArrowRightIcon className="w-6 h-6 rotate-45" />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
           
           {previewPlayers.length === 0 ? (
             <div className="space-y-6">
                <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-xl">
                  <button 
                    onClick={() => setActiveTab('image')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'image' ? 'bg-white dark:bg-obsidian shadow-sm text-mint' : 'opacity-50'}`}
                  >
                    <PhotoIcon className="w-4 h-4" /> {t.aiScan}
                  </button>
                  <button 
                    onClick={() => setActiveTab('text')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'text' ? 'bg-white dark:bg-obsidian shadow-sm text-mint' : 'opacity-50'}`}
                  >
                    <DocumentTextIcon className="w-4 h-4" /> {t.pasteText}
                  </button>
                </div>

                {activeTab === 'image' ? (
                  <div className="text-center py-10 border-2 border-dashed border-obsidian/10 dark:border-ghost/10 rounded-2xl hover:bg-black/5 transition-colors cursor-pointer" onClick={() => fileRef.current?.click()}>
                     <CameraIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                     <p className="font-bold">{t.uploadImage}</p>
                     <p className="text-sm opacity-50 mt-1 max-w-xs mx-auto">{t.aiScanDesc}</p>
                     <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea 
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={t.pasteTextDesc}
                      className="w-full h-40 p-4 rounded-xl bg-black/5 dark:bg-white/5 resize-none border-none focus:ring-2 focus:ring-mint outline-none"
                    />
                    <Button onClick={() => analyzeData(null, 'text')} disabled={!textInput}>
                      {t.analyze}
                    </Button>
                  </div>
                )}
                
                {isLoading && (
                   <div className="text-center py-4 text-mint animate-pulse font-bold">
                     {t.analyzing}
                   </div>
                )}
             </div>
           ) : (
             <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                   <h4 className="font-bold">{previewPlayers.length} Players Found</h4>
                   <button onClick={() => setPreviewPlayers([])} className="text-xs text-red-500 hover:underline">{t.discard}</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {previewPlayers.map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent">
                       <span className="font-mono text-xs font-bold bg-white dark:bg-black px-1.5 py-0.5 rounded w-10 text-center">{p.position}</span>
                       <span className="flex-1 font-bold text-sm truncate">{p.name}</span>
                       <div className="flex gap-1">
                          <span className="text-xs font-bold bg-mint text-obsidian px-1.5 rounded">{p.overall}</span>
                          <span className="text-xs font-bold bg-obsidian/10 dark:bg-ghost/10 px-1.5 rounded">{p.age}yo</span>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
           )}

        </div>

        {/* Footer */}
        {previewPlayers.length > 0 && (
          <div className="p-6 border-t border-obsidian/5 dark:border-ghost/5 bg-white/50 dark:bg-black/50">
             <Button onClick={() => onImport(previewPlayers)}>
               <CheckCircleIcon className="w-5 h-5 mr-2" />
               {t.confirmImport}
             </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export const SquadView = ({ t, career, onUpdateCareer }: { t: any, career: Career, onUpdateCareer: (c: Career) => void }) => {
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deletingPlayerId, setDeletingPlayerId] = useState<string | null>(null);

  // Manual Add States
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState(25);
  const [newOvr, setNewOvr] = useState(75);
  const [newPos, setNewPos] = useState('MID');
  const [activePicker, setActivePicker] = useState<'age' | 'overall' | null>(null);
  
  const handleImport = (newPlayers: Player[]) => {
    const updatedPlayers = [...career.players, ...newPlayers];
    onUpdateCareer({ ...career, players: updatedPlayers });
    setImportModalOpen(false);
  };

  const handleEditSave = (updatedPlayer: Player) => {
    const updatedPlayers = career.players.map(p => 
      p.id === updatedPlayer.id ? updatedPlayer : p
    );
    onUpdateCareer({ ...career, players: updatedPlayers });
    setEditingPlayer(null);
  };

  const handleDeleteConfirm = () => {
    if (deletingPlayerId) {
      const updatedPlayers = career.players.filter(p => p.id !== deletingPlayerId);
      onUpdateCareer({ ...career, players: updatedPlayers });
      setDeletingPlayerId(null);
    }
  };

  const handleAddManualPlayer = () => {
    if (!newName.trim()) return;

    const newPlayer: Player = {
      id: 'manual-' + Date.now(),
      name: newName,
      age: newAge,
      overall: newOvr,
      position: newPos,
      nationality: 'Unknown',
      value: 0,
      wage: 0,
      isHomegrown: false,
      isNonEU: false,
      isOnLoan: false
    };

    onUpdateCareer({ ...career, players: [...career.players, newPlayer] });
    setAddModalOpen(false);
    
    // Reset form
    setNewName('');
    setNewAge(25);
    setNewOvr(75);
    setNewPos('MID');
  };

  // Improved Player Categorization Logic
  const categorizePlayer = (pos: string) => {
    const p = pos.toUpperCase().trim();
    if (['GK', 'POR', 'P'].includes(p)) return 'GK';
    if (['CB', 'LB', 'RB', 'LWB', 'RWB', 'DC', 'TS', 'TD', 'D', 'DEF'].includes(p)) return 'DEF';
    if (['CM', 'CDM', 'CAM', 'LM', 'RM', 'CC', 'CDC', 'COC', 'C', 'MID', 'CEN', 'MED'].includes(p)) return 'MID';
    if (['ST', 'CF', 'LW', 'RW', 'ATT', 'A', 'AT', 'AS', 'AD', 'FWD'].includes(p)) return 'FWD';
    return 'OTHER';
  };

  const loanedPlayers = career.players.filter(p => p.isOnLoan);
  const activePlayers = career.players.filter(p => !p.isOnLoan);

  const sections = {
    [t.positionGK]: activePlayers.filter(p => categorizePlayer(p.position) === 'GK'),
    [t.positionDEF]: activePlayers.filter(p => categorizePlayer(p.position) === 'DEF'),
    [t.positionMID]: activePlayers.filter(p => categorizePlayer(p.position) === 'MID'),
    [t.positionFWD]: activePlayers.filter(p => categorizePlayer(p.position) === 'FWD'),
    "Others / Unassigned": activePlayers.filter(p => categorizePlayer(p.position) === 'OTHER'),
    [t.positionLoan]: loanedPlayers
  };

  return (
    <div className="animate-fade-in space-y-8 pb-24">
      <ImportSquadModal 
        isOpen={importModalOpen} 
        onClose={() => setImportModalOpen(false)} 
        onImport={handleImport} 
        t={t}
      />
      
      <EditPlayerModal
        isOpen={!!editingPlayer}
        onClose={() => setEditingPlayer(null)}
        player={editingPlayer}
        onSave={handleEditSave}
        t={t}
      />

      <ConfirmationModal
        isOpen={!!deletingPlayerId}
        title={t.releaseConfirmTitle}
        message={t.releaseConfirmMessage}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingPlayerId(null)}
        t={t}
      />

      {/* Manual Add Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
           <NumberSelectionModal isOpen={activePicker === 'age'} onClose={() => setActivePicker(null)} title={t.labelAge} min={14} max={45} selectedValue={newAge} onSelect={setNewAge} />
           <NumberSelectionModal isOpen={activePicker === 'overall'} onClose={() => setActivePicker(null)} title={t.labelOverall} min={50} max={99} selectedValue={newOvr} onSelect={setNewOvr} />

           <GlassCard className="w-full max-w-md p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-obsidian/5 dark:border-ghost/5 pb-4">
                 <h3 className="text-xl font-bold">{t.addPlayerTitle}</h3>
                 <button onClick={() => setAddModalOpen(false)}><XMarkIcon className="w-6 h-6" /></button>
              </div>

              <div className="space-y-1">
                 <label className="text-xs font-bold opacity-50 uppercase tracking-wider">{t.labelName}</label>
                 <InputField label="" type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Lionel Messi" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold opacity-50 uppercase tracking-wider">{t.labelAge}</label>
                  <button onClick={() => setActivePicker('age')} className="w-full py-3 rounded-xl bg-black/5 dark:bg-white/5 font-black text-xl text-center hover:bg-black/10 transition-colors">{newAge}</button>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold opacity-50 uppercase tracking-wider">{t.labelOverall}</label>
                  <button onClick={() => setActivePicker('overall')} className="w-full py-3 rounded-xl bg-black/5 dark:bg-white/5 font-black text-xl text-center hover:bg-black/10 transition-colors">{newOvr}</button>
                </div>
              </div>

              <div className="space-y-2">
                 <label className="block text-xs font-bold opacity-50 uppercase tracking-wider">{t.labelRole}</label>
                 <RoleSelector value={newPos} onChange={setNewPos} t={t} />
              </div>

              <Button onClick={handleAddManualPlayer}>{t.confirm}</Button>
           </GlassCard>
        </div>
      )}
      
      {/* Header Action */}
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-black">{t.navSquad}</h2>
           <p className="opacity-60">{career.players.length} {t.playersCount} ({loanedPlayers.length} {t.loanedCount})</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setAddModalOpen(true)}
            className="bg-white/10 dark:bg-white/5 text-obsidian dark:text-ghost border border-white/20 px-3 py-2 rounded-xl font-bold hover:bg-white/20 transition-all flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden sm:inline">{t.addManual}</span>
          </button>
          <button 
            onClick={() => setImportModalOpen(true)}
            className="bg-mint text-obsidian px-4 py-2 rounded-xl font-bold shadow-lg shadow-mint/20 hover:scale-105 transition-transform flex items-center gap-2"
          >
            <SparklesIcon className="w-5 h-5" />
            <span className="hidden sm:inline">{t.importPlayers}</span>
            <span className="sm:hidden">AI</span>
          </button>
        </div>
      </div>

      {/* Render Collapsible Groups */}
      {Object.entries(sections).map(([label, players]) => (
        <SquadSection 
          key={label}
          title={label}
          players={players}
          onEdit={(p) => setEditingPlayer(p)}
          onDelete={(id) => setDeletingPlayerId(id)}
        />
      ))}

      {career.players.length === 0 && (
        <div className="text-center py-20 opacity-40">
           <UserGroupIcon className="w-16 h-16 mx-auto mb-4" />
           <p>{t.noPlayersFound}</p>
        </div>
      )}
    </div>
  );
};