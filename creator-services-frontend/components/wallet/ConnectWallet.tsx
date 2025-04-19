// src/components/wallet/ConnectWallet.tsx
import React from 'react';
import { useWallet } from '../../contexts/WalletContext';

const ConnectWallet = () => {
  const { account, isConnected, isConnecting, connectWallet, disconnectWallet, error } = useWallet();

  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div>
      {isConnected ? (
        <div className="wallet-connected">
          <span className="wallet-address">{shortenAddress(account!)}</span>
          <button 
            className="btn btn-disconnect" 
            onClick={disconnectWallet}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button 
          className="btn btn-connect" 
          onClick={connectWallet} 
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
      {error && <div className="wallet-error">{error}</div>}
    </div>
  );
};

export default ConnectWallet;
