
import { Language, Translation } from './types';

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
    secureAccess: "Secure Access",
    newCareer: "New Career",

    // Dashboard
    hello: "Hello",
    searchPlaceholder: "Search players, teams...",
    continueCareer: "Continue Career",

    // Nav
    navHome: "Home",
    navSquad: "Squad",
    navMarket: "Market",
    navSettings: "Settings",

    // App
    workInProgress: "Work in Progress",

    // Profile
    accountSettings: "Account Settings",
    editProfile: "Edit Profile",
    nickname: "Nickname",
    changeAvatar: "Change Photo",
    deleteAvatar: "Remove Photo",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    deleteConfirmTitle: "Delete Photo?",
    deleteConfirmMessage: "Are you sure you want to delete your profile photo? This cannot be undone.",
    confirm: "Confirm"
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
    secureAccess: "Accesso Sicuro",
    newCareer: "Nuova Carriera",

    // Dashboard
    hello: "Ciao",
    searchPlaceholder: "Cerca giocatori, squadre...",
    continueCareer: "Continua Carriera",

    // Nav
    navHome: "Home",
    navSquad: "Rosa",
    navMarket: "Mercato",
    navSettings: "Impostazioni",

    // App
    workInProgress: "Lavori in corso",

    // Profile
    accountSettings: "Impostazioni Account",
    editProfile: "Modifica Profilo",
    nickname: "Nickname",
    changeAvatar: "Cambia Foto",
    deleteAvatar: "Rimuovi Foto",
    saveChanges: "Salva Modifiche",
    cancel: "Annulla",
    deleteConfirmTitle: "Eliminare Foto?",
    deleteConfirmMessage: "Sei sicuro di voler eliminare la tua foto profilo? Questa azione non può essere annullata.",
    confirm: "Conferma"
  }
};