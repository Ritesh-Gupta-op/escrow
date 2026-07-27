export const CONTRACT_ADDRESS_PLACEHOLDER = '<YOUR_DEPLOYED_CONTRACT_ADDRESS>';

export function getContractAddress(): string {
  return process.env.CONTRACT_ADDRESS?.trim() || CONTRACT_ADDRESS_PLACEHOLDER;
}
