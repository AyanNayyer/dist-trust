// src/hooks/useClientFundVerification.ts
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';

export const useClientFundVerification = () => {
  const { provider, account } = useWallet();
  const [balance, setBalance] = useState('0');
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkBalance = async () => {
      console.log("Checking balance with provider:", provider);
      console.log("Account:", account);
      
      if (!provider || !account) {
        console.log("Provider or account missing");
        setBalance('0');
        return;
      }
      
      try {
        // Verify we're on Sepolia
        const network = await provider.getNetwork();
        console.log("Connected to network:", network);
        
        if (network.chainId !== 11155111) { // Sepolia chain ID
          console.log("Not on Sepolia network, current chainId:", network.chainId);
          setError("Please switch to Sepolia network");
          return;
        }
        
        const bal = await provider.getBalance(account);
        console.log("Raw balance:", bal.toString());
        
        const formatted = ethers.utils.formatEther(bal);
        console.log("Formatted balance:", formatted);
        
        setBalance(formatted);
      } catch (err) {
        console.error("Balance fetch error:", err);
        setError('Failed to fetch balance');
      }
    };
    
    checkBalance();
  }, [provider, account]);

  const verifyFunds = (amount) => {
    try {
      const amountNum = parseFloat(amount);
      const balanceNum = parseFloat(balance);
      console.log("Verifying funds:", { amount: amountNum, balance: balanceNum });
      return balanceNum >= amountNum;
    } catch (err) {
      console.error("Error verifying funds:", err);
      return false;
    }
  };

  return { balance, verifyFunds, error };
};
