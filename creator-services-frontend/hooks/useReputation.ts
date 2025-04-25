// src/hooks/useReputation.ts
import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { ReputationContract } from '../contracts/ReputationContract';

export const useReputation = () => {
  const { signer, account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRatingDetails = useCallback(async (providerAddress: string) => {
    if (!signer) {
      return { average: null, total: 0, count: 0 };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const reputationContract = new ReputationContract(signer);
      const ratingDetails = await reputationContract.getAverageRating(providerAddress);
      return ratingDetails;
    } catch (err: any) {
      console.error('Error getting rating details:', err);
      setError(err.message || 'Failed to get rating details');
      return { average: null, total: 0, count: 0 };
    } finally {
      setLoading(false);
    }
  }, [signer]);

  const submitRating = useCallback(async (providerAddress: string, score: number) => {
    if (!signer) {
      setError('Wallet not connected');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const reputationContract = new ReputationContract(signer);
      await reputationContract.submitRating(providerAddress, score);
      return true;
    } catch (err: any) {
      console.error('Error submitting rating:', err);
      setError(err.message || 'Failed to submit rating');
      return false;
    } finally {
      setLoading(false);
    }
  }, [signer]);

  const checkInteraction = useCallback(async (providerAddress: string) => {
    if (!signer || !account) {
      return false;
    }
    
    try {
      const reputationContract = new ReputationContract(signer);
      return await reputationContract.hasInteracted(account, providerAddress);
    } catch (err) {
      console.error('Error checking interaction:', err);
      return false;
    }
  }, [signer, account]);

  return {
    getRatingDetails,
    submitRating,
    checkInteraction,
    loading,
    error
  };
};
