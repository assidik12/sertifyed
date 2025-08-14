export interface IUser {
  isModified(arg0: string): unknown;
  name: string;
  email: string;
  password: string;
  role: string;
  walletAddress: string;
  sertificates: string[];
}
