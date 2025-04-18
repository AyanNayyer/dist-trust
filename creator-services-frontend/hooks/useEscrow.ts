import { useState, useCallback } from 'react';
import { useWallet } from './useWallet';
import { EscrowContract } from '../contracts/EscrowContract';

export const useEscrow = () => {
  const { signer } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const createProject = useCallback(async (providerAddress: string, amount: string) => {
    if (!signer) {
      setError('Wallet not connected');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const escrowContract = new EscrowContract(signer);
      const projectId = await escrowContract.createProject(providerAddress, amount);
      return projectId;
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message || 'Failed to create project');
      return null;
    } finally {
      setLoading(false);
    }
  }, [signer]);

  const releaseFunds = useCallback(async (projectId: number) => {
    if (!signer) {
      setError('Wallet not connected');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const escrowContract = new EscrowContract(signer);
      await escrowContract.releaseFunds(projectId);
      return true;
    } catch (err: any) {
      console.error('Error releasing funds:', err);
      setError(err.message || 'Failed to release funds');
      return false;
    } finally {
      setLoading(false);
    }
  }, [signer]);

  const getProject = useCallback(async (projectId: number) => {
    if (!signer) {
      setError('Wallet not connected');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const escrowContract = new EscrowContract(signer);
      const project = await escrowContract.getProject(projectId);
      return project;
    } catch (err: any) {
      console.error('Error getting project:', err);
      setError(err.message || 'Failed to get project');
      return null;
    } finally {
      setLoading(false);
    }
  }, [signer]);

  return {
    createProject,
    releaseFunds,
    getProject,
    loading,
    error
  };
};
