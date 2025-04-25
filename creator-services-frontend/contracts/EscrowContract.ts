import { ethers } from 'ethers';

// ABI for your ProjectEscrow contract
const ESCROW_ABI = [
  "function client() external view returns (address)",
  "function creator() external view returns (address)",
  "function amount() external view returns (uint256)",
  "function status() external view returns (uint8)",
  "function depositEscrow() external payable",
  "function startProject() external",
  "function markProjectCompleted() external",
  "function clientApproveCompletion(bool approval) external",
  "event ProjectSubmitted(address indexed client, address indexed creator, uint amount)",
  "event EscrowAllocated(address indexed client, uint amount)",
  "event ProjectStarted(address indexed creator)",
  "event ProjectCompleted(address indexed creator)",
  "event ClientApprovalCompletion(address indexed client, bool approved)",
  "event EscrowReleased(address indexed creator, uint amount)",
  "event EscrowRefunded(address indexed client, uint amount)"
];

const ESCROW_ADDRESS = import.meta.env.VITE_ESCROW_ADDRESS;

export class EscrowContract {
  private contract: ethers.Contract;

  constructor(signerOrProvider: ethers.Signer | ethers.providers.Provider, contractAddress: string) {
    this.contract = new ethers.Contract(contractAddress, ESCROW_ABI, signerOrProvider);
  }

  async getDetails() {
    const [client, creator, amount, status] = await Promise.all([
      this.contract.client(),
      this.contract.creator(),
      this.contract.amount(),
      this.contract.status(),
    ]);
    return {
      client,
      creator,
      amount: ethers.utils.formatEther(amount),
      status: Number(status),
    };
  }

  async depositEscrow(amount: string) {
    const tx = await this.contract.depositEscrow({ value: ethers.utils.parseEther(amount) });
    return tx.wait();
  }

  async startProject() {
    const tx = await this.contract.startProject();
    return tx.wait();
  }

  async markProjectCompleted() {
    const tx = await this.contract.markProjectCompleted();
    return tx.wait();
  }

  async clientApproveCompletion(approval: boolean) {
    const tx = await this.contract.clientApproveCompletion(approval);
    return tx.wait();
  }
}