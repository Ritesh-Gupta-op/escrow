import { resolveNetwork, getDeployment } from './network';

export const CONTRACT_ADDRESS_PLACEHOLDER = '<YOUR_DEPLOYED_CONTRACT_ADDRESS>';

export function getContractAddress(): string {
  if (process.env.CONTRACT_ADDRESS?.trim()) {
    return process.env.CONTRACT_ADDRESS.trim();
  }
  const { network } = resolveNetwork();
  const deployment = getDeployment(network);
  return deployment?.address || '02003ccecf9e1d8ea83e60155b5507ffcc98ae7ee5f4c4a45a333190df0e56e927c9';
}
