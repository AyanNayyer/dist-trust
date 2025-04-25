import { useState, useCallback } from 'react';
import { getProjectEscrowFactory } from '../contracts/ProjectEscrow';
import { useWallet } from '../contexts/WalletContext';

export const useProjectEscrowFactory = () => {
  const { signer } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deployProject = useCallback(async (creator: string, amount: string, reputationAddress: string) => {
    if (!signer) {
      setError('Wallet not connected');
      return null;
    }
    setLoading(true);
    try {
      const factory = getProjectEscrowFactory(signer);
      const amountWei = ethers.utils.parseEther(amount);
      const contract = await factory.deploy(creator, amountWei, reputationAddress, { value: amountWei });
      await contract.deployed();
      return contract.address;
    } catch (err: any) {
      setError(err.message || 'Failed to deploy project');
      return null;
    } finally {
      setLoading(false);
    }
  }, [signer]);

  return { deployProject, loading, error };
};
