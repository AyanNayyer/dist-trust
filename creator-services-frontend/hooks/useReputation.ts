import { useState, useCallback } from 'react';
import { useWallet } from './useWallet';
import { ReputationContract } from '../contracts/ReputationContract';

export const useReputation = () => {
  const { signer } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const submitRating = useCallback(async (providerAddress: string, rating: number) => {
    if (!signer) {
      setError('Wallet not connected');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const reputationContract = new ReputationContract(signer);
      const result = await reputationContract.submitRating(providerAddress, rating);
      return result;
    } catch (err: any) {
      console.error('Error submitting rating:', err);
      setError(err.message || 'Failed to submit rating');
      return false;
    } finally {
      setLoading(false);
    }
  }, [signer]);

  const getRatingDetails = useCallback(async (providerAddress: string) => {
    if (!signer) {
      setError('Wallet not connected');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const reputationContract = new ReputationContract(signer);
      const ratingDetails = await reputationContract.getRatingDetails(providerAddress);
      return ratingDetails;
    } catch (err: any) {
      console.error('Error getting rating details:', err);
      setError(err.message || 'Failed to get rating details');
      return null;
    } finally {
      setLoading(false);
    }
  }, [signer]);

  return {
    submitRating,
    getRatingDetails,
    loading,
    error
  };
};
