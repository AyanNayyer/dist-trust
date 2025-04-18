import { ethers } from 'ethers';

const ESCROW_ABI = [
  "function createProject(address payable _provider) external payable",
  "function releaseFunds(uint256 _projectId) external",
  "function getProject(uint256 _projectId) external view returns (address client, address provider, uint256 amount, bool status)",
  "event ProjectCreated(uint256 indexed projectId, address client, address provider, uint256 amount)",
  "event ProjectCompleted(uint256 indexed projectId)"
];

const ESCROW_ADDRESS = "YOUR_DEPLOYED_ESCROW_ADDRESS";

export class EscrowContract {
  private contract: ethers.Contract;
  
  constructor(signerOrProvider: ethers.Signer | ethers.providers.Provider) {
    this.contract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signerOrProvider);
  }
  
  async createProject(providerAddress: string, amount: string): Promise<number> {
    const tx = await this.contract.createProject(providerAddress, {
      value: ethers.utils.parseEther(amount)
    });
    const receipt = await tx.wait();
    
    const event = receipt.events?.find((e: any) => e.event === 'ProjectCreated');
    return event.args.projectId.toNumber();
  }
  
  async releaseFunds(projectId: number): Promise<void> {
    const tx = await this.contract.releaseFunds(projectId);
    await tx.wait();
  }
  
  async getProject(projectId: number): Promise<{
    client: string;
    provider: string;
    amount: string;
    status: boolean;
  }> {
    const [client, provider, amount, status] = await this.contract.getProject(projectId);
    return {
      client,
      provider,
      amount: ethers.utils.formatEther(amount),
      status
    };
  }
}
