export enum Language {
  EN = 'en',
  IT = 'it'
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto'
}

export interface UserData {
  uid: string;
  email: string | null;
}

export interface Translation {
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
}