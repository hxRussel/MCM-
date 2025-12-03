
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
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { GoogleGenAI } from "@google/genai";
import { Career, Player } from '../types';
import { compressImage } from '../utils/helpers';
import { GlassCard, Button, ConfirmationModal, InputField } from '../components/SharedUI';

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
        </div>
      </div>
      <div className="flex gap-1 sm:gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
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

const EditPlayerModal = ({ isOpen, onClose, player, onSave, t }: any) => {
  const [formData, setFormData] = useState<Player | null>(null);

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
      <GlassCard className="w-full max-w-md p-6 space-y-5">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <PencilIcon className="w-5 h-5 text-mint" />
          {t.editPlayer}
        </h3>
        
        <InputField 
           label="Name" 
           type="text" 
           value={formData.name} 
           onChange={(e) => handleChange('name', e.target.value)} 
        />
        
        <div className="grid grid-cols-3 gap-4">
           <div>
             <label className="block text-sm font-medium mb-1 opacity-80">Age</label>
             <input 
               type="number" 
               value={formData.age} 
               onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
               className="w-full px-4 py-3 rounded-lg bg-white/5 border border-obsidian/10 dark:border-ghost/20 focus:border-mint focus:ring-2 focus:ring-mint/50 outline-none text-center font-mono"
             />
           </div>
           <div>
             <label className="block text-sm font-medium mb-1 opacity-80">OVR</label>
             <input 
               type="number" 
               value={formData.overall} 
               onChange={(e) => handleChange('overall', parseInt(e.target.value) || 0)}
               className="w-full px-4 py-3 rounded-lg bg-white/5 border border-obsidian/10 dark:border-ghost/20 focus:border-mint focus:ring-2 focus:ring-mint/50 outline-none text-center font-mono font-bold"
             />
           </div>
           <div>
             <label className="block text-sm font-medium mb-1 opacity-80">Pos</label>
             <input 
               type="text" 
               value={formData.position} 
               onChange={(e) => handleChange('position', e.target.value.toUpperCase())}
               className="w-full px-4 py-3 rounded-lg bg-white/5 border border-obsidian/10 dark:border-ghost/20 focus:border-mint focus:ring-2 focus:ring-mint/50 outline-none text-center font-mono"
             />
           </div>
        </div>

        <div className="flex gap-3 mt-6 pt-2 border-t border-obsidian/5 dark:border-ghost/5">
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
    // 1. Check if API Key exists
    if (!process.env.API_KEY) {
      alert("API Key is missing! You must add 'API_KEY' to your Vercel Environment Variables.");
      return;
    }

    setIsLoading(true);
    setPreviewPlayers([]);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // 2. Strict OCR System Prompt
      const systemPrompt = `
        ROLE: You are an Optical Character Recognition (OCR) engine. 
        TASK: Transcribe the text from the image perfectly.
        
        STRICT RULES:
        1. READ ONLY THE PIXELS IN THE IMAGE. 
        2. DO NOT USE YOUR INTERNAL KNOWLEDGE. If the image says "Edin Dzeko", write "Edin Dzeko". If it says "Mario Rossi", write "Mario Rossi".
        3. DO NOT HALLUCINATE players that are not visible.
        4. If you cannot read the text because it is blurry, return an empty array. Do not guess.
        
        EXTRACTION GOAL:
        Extract a JSON array of players. For each player row in the image, extract:
        - name (String)
        - position (String, e.g., ST, CB, GK)
        - overall (Number, 0-99) - Look for a number usually in a colored badge or column.
        - age (Number, 15-50)
        
        FALLBACKS:
        - If 'overall' is not visible, default to 75.
        - If 'age' is not visible, default to 25.
        - If 'position' is not visible, default to 'CM'.
        
        JSON FORMAT:
        [{"name": "Name found in pixels", "position": "ST", "overall": 82, "age": 29}]
        
        Return ONLY the JSON array string. No markdown, no explanations.
      `;

      let responseText: string | undefined;
      
      if (type === 'text') {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${systemPrompt}\n\nINPUT DATA:\n${textInput}`
        });
        responseText = result.text;
      } else {
        // Image handling
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
      console.log("Gemini Raw Response:", rawText); // For debugging

      // Robust JSON Extraction
      // Find the first '[' and the last ']'
      const jsonMatch = rawText.match(/\[.*\]/s);
      const cleanJson = jsonMatch ? jsonMatch[0] : "[]";
      
      let players = [];
      try {
        players = JSON.parse(cleanJson);
      } catch (jsonError) {
        console.error("Failed to parse extracted JSON", cleanJson);
        // Fallback: Try to find loose JSON objects if array parse fails
      }

      if (!Array.isArray(players)) {
        players = [];
      }

      // Add IDs and defaults
      const formattedPlayers = players.map((p: any) => ({
        id: 'imported-' + Date.now() + Math.random(),
        name: p.name || 'Unknown',
        age: (typeof p.age === 'number' && p.age > 10) ? p.age : 25,
        overall: (typeof p.overall === 'number' && p.overall > 40) ? p.overall : 75,
        position: p.position || 'CM',
        nationality: 'Unknown', 
        value: 1000000,
        wage: 5000,
        isHomegrown: false,
        isNonEU: false
      }));

      setPreviewPlayers(formattedPlayers);
      
      if (formattedPlayers.length === 0) {
        alert(t.noPlayersFound);
      }

    } catch (e) {
      console.error("AI Error", e);
      alert(t.errorGeneric + " Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      // Use HIGH RESOLUTION (2048px) for OCR, not 300px
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
                {/* Tabs */}
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
                       <span className="font-mono text-xs font-bold bg-white dark:bg-black px-1.5 py-0.5 rounded">{p.position}</span>
                       <span className="flex-1 font-bold text-sm truncate">{p.name}</span>
                       <span className="text-xs font-bold bg-mint text-obsidian px-1.5 rounded">{p.overall}</span>
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
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deletingPlayerId, setDeletingPlayerId] = useState<string | null>(null);
  
  const handleImport = (newPlayers: Player[]) => {
    // Append to existing
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

  // Group players
  const sections = {
    [t.positionGK]: career.players.filter(p => p.position === 'GK'),
    [t.positionDEF]: career.players.filter(p => ['CB','LB','RB','LWB','RWB'].includes(p.position)),
    [t.positionMID]: career.players.filter(p => ['CM','CDM','CAM','LM','RM'].includes(p.position)),
    [t.positionFWD]: career.players.filter(p => ['ST','CF','LW','RW'].includes(p.position)),
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
      
      {/* Header Action */}
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-black">{t.navSquad}</h2>
           <p className="opacity-60">{career.players.length} Players</p>
        </div>
        <button 
          onClick={() => setImportModalOpen(true)}
          className="bg-mint text-obsidian px-4 py-2 rounded-xl font-bold shadow-lg shadow-mint/20 hover:scale-105 transition-transform flex items-center gap-2"
        >
          <SparklesIcon className="w-5 h-5" />
          {t.importPlayers}
        </button>
      </div>

      {/* Render Groups */}
      {Object.entries(sections).map(([label, players]) => (
        players.length > 0 && (
          <div key={label}>
             <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-3 ml-1">{label}</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               {players.map(player => (
                 <PlayerCard 
                   key={player.id} 
                   player={player} 
                   onEdit={() => setEditingPlayer(player)}
                   onDelete={() => setDeletingPlayerId(player.id)}
                 />
               ))}
             </div>
          </div>
        )
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
