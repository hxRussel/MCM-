

export enum Language {
  EN = 'en',
  IT = 'it'
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto'
}

export type Currency = '€' | '$' | '£';

export enum View {
  HOME = 'home',
  SQUAD = 'squad',
  CLUB = 'club',
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
  isOnLoan?: boolean; // New field
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

export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  playerName: string;
  amount: number; // Transfer fee
  wage: number;   // Wage impact
  date: string;
  playerData?: Player; // Snapshot of the player to restore squad on delete
}

export interface BudgetHistory {
  date: string;
  transferBudget: number;
  wageBudget: number;
}

export interface Career {
  managerName: string;
  teamName: string;
  teamLogo?: string; // New field for Base64 PNG logo
  transferBudget: number;
  wageBudget: number;
  players: Player[];
  startDate: string;
  season: string; // e.g., "2025/2026"
  wageDisplayMode?: 'weekly' | 'yearly';
  transactions: Transaction[];
  budgetHistory: BudgetHistory[];
  
  // New Club Fields
  trophies: string[];
  seasonalEvents: string[];
  preMatchEvents: string[];
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
  navClub: string;
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

  // Settings
  appSettings: string;
  language: string;
  theme: string;
  currency: string;
  themeLight: string;
  themeDark: string;
  themeAuto: string;
  clubCustomization: string;
  teamLogo: string;
  uploadLogo: string;
  uploadLogoDesc: string;
  deleteLogoConfirm: string;
  deleteLogoMessage: string;
  replaceLogo: string; // NEW

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
  avgOvr: string;
  over22: string;
  homegrown: string;
  nonEU: string;
  statsOverview: string;
  financials: string;
  financialActivity: string;
  history: string;
  trends: string;
  noActivity: string;
  latestTransaction: string;
  viewFullHistory: string;
  transferTrend: string;
  wageTrend: string;
  clickToView: string;
  trendsResetMessage: string; // NEW

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
  confirmChangeTeam: string;
  newTeamName: string;
  changeTeamTitle: string;
  enterNewTeamName: string;

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
  positionLoan: string;
  onLoan: string;
  editPlayer: string;
  releasePlayer: string;
  releaseConfirmTitle: string;
  releaseConfirmMessage: string;
  labelName: string;
  labelAge: string;
  labelOverall: string;
  labelRole: string;
  playersCount: string;
  loanedCount: string;
  
  // Roles Short
  roleShortGK: string;
  roleShortDEF: string;
  roleShortMID: string;
  roleShortFWD: string;

  // Market
  buyPlayer: string;
  sellPlayer: string;
  signingModalTitle: string;
  sellingModalTitle: string;
  selectPlayerToSell: string;
  playerName: string;
  transferFee: string;
  wage: string;
  saleFee: string;
  releasedWage: string;
  confirmSigning: string;
  confirmSale: string;
  fundsError: string;
  bought: string;
  sold: string;

  // Club View
  clubOverview: string;
  trophyCabinet: string;
  addTrophy: string;
  addTrophyPlaceholder: string;
  seasonalEvents: string;
  preMatchEvents: string;
  generateEvent: string;
  activeEvents: string;
  maxEventsReached: string;
  aiEventGenerator: string;
  regenerate: string;
  saveEvent: string;
  deleteEventConfirm: string;
  deleteEventMessage: string;
}