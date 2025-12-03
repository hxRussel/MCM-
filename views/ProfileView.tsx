import React, { useState, useRef } from 'react';
import { 
  ArrowLeftIcon, 
  CameraIcon, 
  TrashIcon, 
  UserCircleIcon, 
  Cog6ToothIcon as CogSolid 
} from '@heroicons/react/24/solid';
import { compressImage } from '../utils/helpers';
import { GlassCard, Button, ConfirmationModal } from '../components/SharedUI';

export const ProfileView = ({ user, handleLogout, t, avatar, onSaveAvatar, onSaveProfile }: any) => {
  const [viewMode, setViewMode] = useState<'main' | 'settings'>('main');
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        // Use standard 300x300 for avatar
        const compressed = await compressImage(file, 300, 300);
        // Save to Firestore via parent handler
        onSaveAvatar(compressed);
      } catch (err) {
        console.error("Image processing failed", err);
      }
    }
  };

  const deleteAvatar = () => {
    // Save to Firestore via parent handler
    onSaveAvatar(null);
    setShowDeleteConfirm(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUpdateProfile = async () => {
    if (user && newName.trim() !== '') {
      try {
        await user.updateProfile({ displayName: newName });
        // Sync nickname to Firestore
        onSaveProfile(newName);
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating profile", error);
      }
    }
    setViewMode('main');
  };

  if (viewMode === 'settings') {
    return (
      <div className="animate-fade-in flex flex-col h-full pt-20 relative">
        <ConfirmationModal 
          isOpen={showDeleteConfirm}
          title={t.deleteConfirmTitle}
          message={t.deleteConfirmMessage}
          onConfirm={deleteAvatar}
          onCancel={() => setShowDeleteConfirm(false)}
          t={t}
        />

        <div className="absolute top-6 left-0">
          <button onClick={() => setViewMode('main')} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
        </div>

        <h2 className="text-2xl font-black mb-8 text-center">{t.accountSettings}</h2>

        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden shadow-2xl bg-black/5 dark:bg-white/5 border-4 border-white/20 dark:border-white/5">
              <img 
                src={avatar || `https://ui-avatars.com/api/?name=${user.email}&background=0D8ABC&color=fff`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <button 
              onClick={triggerFileInput}
              className="absolute bottom-0 right-0 bg-mint text-obsidian p-2 rounded-full shadow-lg hover:bg-mint-hover transition-transform hover:scale-110"
              title={t.changeAvatar}
            >
              <CameraIcon className="w-5 h-5" />
            </button>
            {avatar && (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-transform hover:scale-110"
                title={t.deleteAvatar}
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>
        </div>

        <GlassCard className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold opacity-70 ml-1">{t.nickname}</label>
            <div className="relative">
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-mint focus:ring-1 focus:ring-mint outline-none transition-all"
              />
              <UserCircleIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
             <Button variant="ghost" onClick={() => setViewMode('main')}>{t.cancel}</Button>
             <Button variant="primary" onClick={handleUpdateProfile}>{t.saveChanges}</Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center h-full pt-20">
      <div className="w-24 h-24 rounded-full bg-obsidian/5 dark:bg-ghost/5 mb-6 flex items-center justify-center text-3xl font-bold shadow-xl overflow-hidden border-4 border-white/20 dark:border-white/5">
        <img 
          src={avatar || `https://ui-avatars.com/api/?name=${user.email}&background=0D8ABC&color=fff`} 
          alt="Profile" 
          className="w-full h-full object-cover"
        />
      </div>
      <h2 className="text-2xl font-bold mb-1">{user?.displayName || 'Manager'}</h2>
      <p className="opacity-50 mb-8">{user?.email}</p>
      
      <GlassCard className="w-full max-w-sm p-4 space-y-2">
        <Button variant="ghost" className="justify-start gap-3" onClick={() => setViewMode('settings')}>
          <CogSolid className="w-5 h-5" /> {t.accountSettings}
        </Button>
        <div className="h-px bg-obsidian/5 dark:bg-ghost/5"></div>
        <Button variant="danger" onClick={handleLogout} className="justify-start gap-3">
           {t.signOut}
        </Button>
      </GlassCard>
    </div>
  );
};