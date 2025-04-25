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
  switchToHedera: () => Promise<void>;
  error: string | null;
  network: string | null;
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  provider: null,
  signer: null,
  isConnecting: false,
  isConnected: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  switchToHedera: async () => {},
  error: null,
  network: null
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

// Hedera network configurations
const HEDERA_NETWORKS = {
  testnet: {
    chainName: "Hedera Testnet",
    chainId: "0x128", // 296 in decimal
    nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 18 },
    rpcUrls: ["https://testnet.hashio.io/api"],
    blockExplorerUrls: ["https://hashscan.io/testnet"]
  },
  mainnet: {
    chainName: "Hedera Mainnet",
    chainId: "0x127", // 295 in decimal
    nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 18 },
    rpcUrls: ["https://mainnet.hashio.io/api"],
    blockExplorerUrls: ["https://hashscan.io/mainnet"]
  }
};

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);

  const initializeProvider = () => {
    if (window.ethereum) {
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
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
            
            // Get current network
            const networkInfo = await ethersProvider.getNetwork();
            setNetwork(networkInfo.name);
            
            // Check if on Hedera network
            if (networkInfo.chainId === 296) {
              setNetwork('hedera-testnet');
            } else if (networkInfo.chainId === 295) {
              setNetwork('hedera-mainnet');
            }
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
        const newProvider = initializeProvider();
        if (newProvider) {
          newProvider.getNetwork().then(network => {
            if (network.chainId === 296) {
              setNetwork('hedera-testnet');
            } else if (network.chainId === 295) {
              setNetwork('hedera-mainnet');
            } else {
              setNetwork(network.name);
            }
          });
        }
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
        
        // Get current network
        const networkInfo = await ethersProvider.getNetwork();
        if (networkInfo.chainId === 296) {
          setNetwork('hedera-testnet');
        } else if (networkInfo.chainId === 295) {
          setNetwork('hedera-mainnet');
        } else {
          setNetwork(networkInfo.name);
        }
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

  const switchToHedera = async (networkType: 'testnet' | 'mainnet' = 'testnet') => {
    if (!window.ethereum) {
      setError("MetaMask is not installed. Please install MetaMask to continue.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Try to switch to the Hedera network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: HEDERA_NETWORKS[networkType].chainId }],
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [HEDERA_NETWORKS[networkType]],
          });
        } else {
          throw switchError;
        }
      }

      // Update provider after network switch
      const ethersProvider = initializeProvider();
      if (ethersProvider) {
        const networkInfo = await ethersProvider.getNetwork();
        if (networkInfo.chainId === 296) {
          setNetwork('hedera-testnet');
        } else if (networkInfo.chainId === 295) {
          setNetwork('hedera-mainnet');
        } else {
          setNetwork(networkInfo.name);
        }
        
        // If account is already connected, update signer
        if (account) {
          const signerInstance = ethersProvider.getSigner();
          setSigner(signerInstance);
        }
      }
    } catch (error: any) {
      if (error.code === 4001) {
        setError("User rejected the network switch request.");
      } else {
        setError("An error occurred while switching networks.");
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
        switchToHedera,
        error,
        network
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
