export interface WalletDetails {
  rdns: string;
  name: string;
  network: string;
  address: string;
  shieldedAddress: string;
  unshieldedAddress: string;
}

export interface EscrowState {
  contractAddress: string | null;
  status: string | null;
  statusName: string | null;
  agreementCommitment: string | null;
  buyerAuthority: string | null;
  sellerAuthority: string | null;
  network: string | null;
  message: string | null;
}

export interface WalletProvider {
  rdns: string;
  name: string;
  icon: string | null;
  apiVersion: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialApi: any;
}

export type NetworkId = 'preprod' | 'preview' | 'undeployed';
