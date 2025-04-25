// src/contexts/WalletContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
  account: string | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  isConnecting: boolean;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  error: string | null;
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  provider: null,
  signer: null,
  isConnecting: false,
  isConnected: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  error: null
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeProvider = () => {
    if (window.ethereum) {
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(ethersProvider);
      return ethersProvider;
    }
    return null;
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const ethersProvider = initializeProvider();
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          
          if (ethersProvider) {
            const signerInstance = ethersProvider.getSigner();
            setSigner(signerInstance);
          }
          
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      return false;
    }
  };

  useEffect(() => {
    // Initialize provider
    initializeProvider();
    
    // Check if wallet is already connected
    checkIfWalletIsConnected();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          
          if (provider) {
            const signerInstance = provider.getSigner();
            setSigner(signerInstance);
          }
        } else {
          setAccount(null);
          setSigner(null);
        }
      });
      
      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        // Refresh provider when chain changes
        initializeProvider();
        checkIfWalletIsConnected();
      });
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed. Please install MetaMask to continue.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const ethersProvider = initializeProvider();
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      setAccount(accounts[0]);
      
      if (ethersProvider) {
        const signerInstance = ethersProvider.getSigner();
        setSigner(signerInstance);
      }
    } catch (error: any) {
      if (error.code === 4001) {
        setError("User rejected the connection request.");
      } else {
        setError("An error occurred while connecting to wallet.");
        console.error(error);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        provider,
        signer,
        isConnecting,
        isConnected: !!account,
        connectWallet,
        disconnectWallet,
        error
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
