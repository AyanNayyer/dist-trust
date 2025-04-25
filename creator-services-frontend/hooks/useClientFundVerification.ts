// src/hooks/useClientFundVerification.ts
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';

export const useClientFundVerification = () => {
  const { provider, account, network } = useWallet();
  const [balance, setBalance] = useState('0');
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkBalance = async () => {
      console.log("Checking balance with provider:", provider);
      console.log("Account:", account);
      console.log("Current network:", network);
      
      if (!provider || !account) {
        console.log("Provider or account missing");
        setBalance('0');
        return;
      }
      
      try {
        // Get current network
        const networkInfo = await provider.getNetwork();
        console.log("Connected to network:", networkInfo);
        
        // Accept both Sepolia and Hedera Testnet
        const validNetworks = [
          11155111, // Sepolia chain ID
          296,      // Hedera Testnet chain ID (0x128)
          295       // Hedera Mainnet chain ID (0x127)
        ];
        
        if (!validNetworks.includes(networkInfo.chainId)) {
          console.log("Not on a supported network, current chainId:", networkInfo.chainId);
          setError("Please switch to Sepolia or Hedera network");
          return;
        } else {
          // Clear any previous network error
          setError(null);
        }
        
        const bal = await provider.getBalance(account);
        console.log("Raw balance:", bal.toString());
        
        const formatted = ethers.utils.formatEther(bal);
        console.log("Formatted balance:", formatted);
        
        // Display the correct currency symbol based on the network
        const isHederaNetwork = networkInfo.chainId === 296 || networkInfo.chainId === 295;
        const currencySymbol = isHederaNetwork ? 'HBAR' : 'ETH';
        console.log(`Balance: ${formatted} ${currencySymbol}`);
        
        setBalance(formatted);
      } catch (err) {
        console.error("Balance fetch error:", err);
        setError('Failed to fetch balance');
      }
    };
    
    checkBalance();
  }, [provider, account, network]);

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

  // Get the currency symbol based on the current network
  const getCurrencySymbol = () => {
    if (!provider) return 'ETH';
    
    try {
      // Check if we're on a Hedera network
      if (network === 'hedera-testnet' || network === 'hedera-mainnet') {
        return 'HBAR';
      }
      return 'ETH';
    } catch (err) {
      console.error("Error determining currency symbol:", err);
      return 'ETH';
    }
  };

  return { 
    balance, 
    verifyFunds, 
    error,
    currencySymbol: getCurrencySymbol()
  };
};
