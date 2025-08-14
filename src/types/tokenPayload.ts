export interface TokenPayload {
  id: string;
  email: string;
  owner?: string;
  role?: string;
  walletAddress?: string;
}
