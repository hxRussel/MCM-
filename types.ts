
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
}