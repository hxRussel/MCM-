
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
    workInProgress: "Work in Progress"
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
    workInProgress: "Lavori in corso"
  }
};