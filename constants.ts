import { Language, Translation, Career } from './types';

export const TRANSLATIONS: Record<Language, Translation> = {
  [Language.EN]: {
    welcome: "Welcome to MCM+",
    subtitle: "Manage your FC career like a pro.",
    login: "Log In",
    register: "Sign Up",
    email: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    submitLogin: "Log In",
    submitRegister: "Create Account",
    haveAccount: "Already have an account?",
    noAccount: "Don't have an account?",
    switchLogin: "Log in here",
    switchRegister: "Register here",
    loading: "Processing...",
    errorGeneric: "Something went wrong. Please check your credentials.",
    successLogin: "Successfully logged in!",
    signOut: "Sign Out",
    dashboardTitle: "Manager Dashboard",
    dashboardText: "Your career data is now synced securely in the cloud.",
    secureAccess: "Secure Access",
    newCareer: "New Career",
    
    // Dashboard
    hello: "Hello",
    navHome: "Home",
    navSquad: "Database",
    navMarket: "Transfers",
    navSettings: "Settings",

    // Home
    addTeam: "Add Team",
    createCareer: "Start a new journey",
    continueCareer: "Continue Career",
    lastPlayed: "Last played",
    season: "Season",

    // Generic
    editProfile: "Edit Profile",
    appearance: "Appearance",
    language: "Language",

    // Profile
    profileTitle: "User Profile",
    changePhoto: "Change Photo",
    deletePhoto: "Remove Photo",
    nickname: "Nickname",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    photoUpdated: "Photo updated successfully",
    photoDeleted: "Photo removed",
    nameUpdated: "Nickname updated",
    clickToUpload: "Tap to upload"
  },
  [Language.IT]: {
    welcome: "Benvenuto su MCM+",
    subtitle: "Gestisci la tua carriera FC come un professionista.",
    login: "Accedi",
    register: "Registrati",
    email: "Indirizzo Email",
    password: "Password",
    confirmPassword: "Conferma Password",
    submitLogin: "Accedi",
    submitRegister: "Crea Account",
    haveAccount: "Hai già un account?",
    noAccount: "Non hai un account?",
    switchLogin: "Accedi qui",
    switchRegister: "Registrati qui",
    loading: "Elaborazione in corso...",
    errorGeneric: "Qualcosa è andato storto. Controlla le tue credenziali.",
    successLogin: "Accesso effettuato con successo!",
    signOut: "Disconnetti",
    dashboardTitle: "Dashboard Manager",
    dashboardText: "I dati della tua carriera sono ora sincronizzati nel cloud.",
    secureAccess: "Accesso Sicuro",
    newCareer: "Nuova Carriera",

    // Dashboard
    hello: "Ciao",
    navHome: "Home",
    navSquad: "Database",
    navMarket: "Mercato",
    navSettings: "Impostazioni",

    // Home
    addTeam: "Aggiungi Squadra",
    createCareer: "Inizia un nuovo viaggio",
    continueCareer: "Continua Carriera",
    lastPlayed: "Ultimo accesso",
    season: "Stagione",

    // Generic
    editProfile: "Modifica Profilo",
    appearance: "Aspetto",
    language: "Lingua",

    // Profile
    profileTitle: "Profilo Utente",
    changePhoto: "Cambia Foto",
    deletePhoto: "Rimuovi Foto",
    nickname: "Nickname",
    save: "Salva",
    cancel: "Annulla",
    edit: "Modifica",
    photoUpdated: "Foto aggiornata con successo",
    photoDeleted: "Foto rimossa",
    nameUpdated: "Nickname aggiornato",
    clickToUpload: "Tocca per caricare"
  }
};

export const MOCK_CAREERS: Career[] = [
  {
    id: '1',
    teamName: 'Manchester City',
    managerName: 'Pep Guardiola',
    season: '2024/2025',
    lastPlayed: '2h ago',
    rating: 5,
    logoUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '2',
    teamName: 'Como 1907',
    managerName: 'Cesc Fàbregas',
    season: '2023/2024',
    lastPlayed: '1d ago',
    rating: 3,
    logoUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=2070&auto=format&fit=crop'
  }
];