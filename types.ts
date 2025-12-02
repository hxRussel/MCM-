
export enum Language {
  EN = 'en',
  IT = 'it'
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto'
}

export enum AppView {
  HOME = 'home',
  SQUAD = 'squad',
  MARKET = 'market',
  SETTINGS = 'settings',
  PROFILE = 'profile',
  CAREER_DETAIL = 'career_detail'
}

export enum Currency {
  EUR = 'EUR',
  USD = 'USD',
  GBP = 'GBP'
}

export enum WageFrequency {
  WEEKLY = 'weekly',
  YEARLY = 'yearly'
}

export enum MeasurementSystem {
  METRIC = 'metric',   // cm, kg
  IMPERIAL = 'imperial' // ft, lbs
}

export interface UserData {
  uid: string;
  email: string | null;
}

export interface Career {
  id: string;
  teamName: string;
  managerName: string;
  season: string;
  lastPlayed: string; // ISO Date string or formatted string
  logoUrl?: string; // URL for team background/logo
  rating: number; // 0-5 stars
}

export interface Translation {
  // Auth
  welcome: string;
  subtitle: string;
  login: string;
  register: string;
  email: string;
  password: string;
  confirmPassword: string;
  submitLogin: string;
  submitRegister: string;
  haveAccount: string;
  noAccount: string;
  switchLogin: string;
  switchRegister: string;
  loading: string;
  errorGeneric: string;
  successLogin: string;
  signOut: string;
  dashboardTitle: string;
  dashboardText: string;
  secureAccess: string;
  newCareer: string;
  
  // Dashboard / Nav
  hello: string;
  navHome: string;
  navSquad: string;
  navMarket: string;
  navSettings: string;
  
  // Home Content
  addTeam: string;
  createCareer: string;
  continueCareer: string;
  lastPlayed: string;
  season: string;
  
  // Generic
  editProfile: string;
  appearance: string;
  language: string;
  preferences: string;

  // Settings specific
  currency: string;
  wageFrequency: string;
  weekly: string;
  yearly: string;
  measurements: string;
  metric: string;
  imperial: string;

  // Profile
  profileTitle: string;
  changePhoto: string;
  deletePhoto: string;
  nickname: string;
  save: string;
  cancel: string;
  edit: string;
  photoUpdated: string;
  photoDeleted: string;
  nameUpdated: string;
  clickToUpload: string;
}
