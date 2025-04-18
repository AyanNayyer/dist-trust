import { ethers } from 'ethers';

const REPUTATION_ABI = [
  "function submitRating(address provider, uint8 score) external",
  "function getAverageRating(address provider) external view returns (uint256)",
  "function getRatingDetails(address provider) external view returns (uint256 total, uint256 count)",
  "event RatingSubmitted(address indexed provider, uint8 rating)"
];

const REPUTATION_ADDRESS = "YOUR_DEPLOYED_REPUTATION_ADDRESS";

export class ReputationContract {
  private contract: ethers.Contract;
  
  constructor(signerOrProvider: ethers.Signer | ethers.providers.Provider) {
    this.contract = new ethers.Contract(REPUTATION_ADDRESS, REPUTATION_ABI, signerOrProvider);
  }
  
  async submitRating(providerAddress: string, rating: number): Promise<boolean> {
    if (rating < 0 || rating > 5) throw new Error("Rating must be between 0 and 5");
    
    const tx = await this.contract.submitRating(providerAddress, rating);
    await tx.wait();
    return true;
  }
  
  async getRatingDetails(providerAddress: string): Promise<{
    average: number;
    total: number;
    count: number;
  }> {
    const [total, count] = await this.contract.getRatingDetails(providerAddress);
    return {
      average: count > 0 ? Math.round(total / count) : 0,
      total: total.toNumber(),
      count: count.toNumber()
    };
  }
}
