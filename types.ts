
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

export interface Team {
  id: string;
  name: string;
  league: string;
  [key: string]: any;
}

export interface Player {
  id: string;
  name: string;
  teamId?: string;
  team?: string;
  overall: number;
  position: string;
  age: number;
  height: number;
  weight: number;
  nationality?: string;
  // Stats
  acceleration?: number;
  'sprint speed'?: number;
  finishing?: number;
  'shot power'?: number;
  dribbling?: number;
  'ball control'?: number;
  def_awareness?: number;
  standing_tackle?: number;
  gk_diving?: number;
  [key: string]: any; // Allow dynamic access for all CSV fields
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

  // Database
  dbPlayers: string;
  dbTeams: string;
  dbLeagues: string;
  searchPlaceholder: string;
  noResults: string;
  deleteConfirm: string;
  itemDeleted: string;
  itemUpdated: string;
  editName: string;
  statsTitle: string;
  physical: string;
  technical: string;
  defending: string;
  goalkeeping: string;
  mental: string;
}
