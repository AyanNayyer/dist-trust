// src/contracts/ReputationContract.ts
import { ethers } from 'ethers';

const REPUTATION_ABI = [
  "function getAverageRating(address provider) external view returns (uint256 numerator, uint256 denominator)",
  "function submitRating(address provider, uint8 score) external",
  "function hasInteracted(address client, address provider) external view returns (bool)",
  "event RatingSubmitted(address indexed rater, address indexed provider, uint8 rating)"
];

const REPUTATION_ADDRESS = import.meta.env.VITE_REPUTATION_ADDRESS || "0xd9145CCE52D386f254917e481eB44e9943F39138";

export class ReputationContract {
  private contract: ethers.Contract;

  constructor(signerOrProvider: ethers.Signer | ethers.providers.Provider) {
    this.contract = new ethers.Contract(REPUTATION_ADDRESS, REPUTATION_ABI, signerOrProvider);
  }

  async getAverageRating(provider: string): Promise<{ average: number | null; total: number; count: number }> {
    try {
      const [numerator, denominator] = await this.contract.getAverageRating(provider);
      const average = denominator.toNumber() > 1 ? numerator.toNumber() / denominator.toNumber() : null;
      return { 
        average, 
        total: numerator.toNumber(), 
        count: denominator.toNumber() > 1 ? denominator.toNumber() : 0 
      };
    } catch (err) {
      console.error("Error getting average rating:", err);
      return { average: null, total: 0, count: 0 };
    }
  }

  async submitRating(provider: string, score: number): Promise<boolean> {
    try {
      if (score < 1 || score > 5) {
        throw new Error("Rating must be between 1-5");
      }
      
      const tx = await this.contract.submitRating(provider, score);
      await tx.wait();
      return true;
    } catch (err) {
      console.error("Error submitting rating:", err);
      throw err;
    }
  }

  async hasInteracted(client: string, provider: string): Promise<boolean> {
    try {
      return await this.contract.hasInteracted(client, provider);
    } catch (err) {
      console.error("Error checking interaction:", err);
      return false;
    }
  }
}
