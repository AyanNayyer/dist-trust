import { ethers } from 'ethers';

// Replace with your actual ABI and bytecode
export const PROJECT_ESCROW_ABI = [ /* ... ABI array ... */ ];
export const PROJECT_ESCROW_BYTECODE = "0x..."; // Paste your bytecode here

export function getProjectEscrowFactory(signer: ethers.Signer) {
  return new ethers.ContractFactory(PROJECT_ESCROW_ABI, PROJECT_ESCROW_BYTECODE, signer);
}
