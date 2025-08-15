export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  issuerAddress: string;
  role: string;
  walletAddress: string;
}

export interface RegisterInstitutionData {
  institutionName: string;
  email: string;
  password: string;
  address: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
}
