
export enum Language {
  EN = 'en',
  IT = 'it'
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto'
}

export enum View {
  HOME = 'home',
  SQUAD = 'squad',
  MARKET = 'market',
  SETTINGS = 'settings',
  PROFILE = 'profile'
}

export interface UserData {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

export interface Player {
  id: string;
  name: string;
  age: number;
  overall: number;
  position: string;
  nationality: string;
  value: number;
  wage: number;
  isHomegrown: boolean;
  isNonEU: boolean;
}

export interface Team {
  id: string;
  name: string;
  league: string;
  transferBudget: number;
  wageBudget: number;
  logoUrl?: string;
  players: Player[]; // Default roster
}

export interface Career {
  managerName: string;
  teamName: string;
  transferBudget: number;
  wageBudget: number;
  players: Player[];
  startDate: string;
  season: string; // e.g., "2025/2026"
  wageDisplayMode?: 'weekly' | 'yearly';
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
  secureAccess: string;
  newCareer: string;
  
  // Dashboard
  hello: string;
  searchPlaceholder: string;
  continueCareer: string;
  
  // Nav
  navHome: string;
  navSquad: string;
  navMarket: string;
  navSettings: string;

  // App
  workInProgress: string;

  // Profile
  accountSettings: string;
  editProfile: string;
  nickname: string;
  changeAvatar: string;
  deleteAvatar: string;
  saveChanges: string;
  cancel: string;
  deleteConfirmTitle: string;
  deleteConfirmMessage: string;
  confirm: string;

  // Career Creation & Stats
  startCareer: string;
  managerName: string;
  selectTeam: string;
  customTeam: string;
  teamName: string;
  createCareer: string;
  transferBudget: string;
  wageBudget: string;
  editTransferBudget: string;
  editWageBudget: string;
  weekly: string;
  yearly: string;
  weeklySuffix: string;
  yearlySuffix: string;
  squadSize: string;
  avgAge: string;
  over22: string;
  homegrown: string;
  nonEU: string;
  statsOverview: string;
  financials: string;

  // Season & Actions
  currentSeason: string;
  startSeason: string;
  endSeason: string;
  deleteCareer: string;
  deleteCareerTitle: string;
  deleteCareerMessage: string;
  endSeasonConfirmTitle: string;
  endSeasonConfirmMessage: string;
  seasonAdvanced: string;
  managerActions: string;

  // Squad & AI Import
  addPlayer: string;
  addManual: string;
  addPlayerTitle: string;
  importPlayers: string;
  aiScan: string;
  aiScanDesc: string;
  pasteText: string;
  pasteTextDesc: string;
  uploadImage: string;
  analyze: string;
  analyzing: string;
  importSuccess: string;
  noPlayersFound: string;
  confirmImport: string;
  discard: string;
  positionGK: string;
  positionDEF: string;
  positionMID: string;
  positionFWD: string;
  editPlayer: string;
  releasePlayer: string;
  releaseConfirmTitle: string;
  releaseConfirmMessage: string;

  // Market
  buyPlayer: string;
  sellPlayer: string;
  signingModalTitle: string;
  playerName: string;
  transferFee: string;
  wage: string;
  confirmSigning: string;
  fundsError: string;
}
