// src/components/wallet/ConnectWallet.tsx
import React from 'react';
import { useWallet } from '../../contexts/WalletContext';

const ConnectWallet = () => {
  const { 
    account, 
    isConnected, 
    isConnecting, 
    connectWallet, 
    disconnectWallet, 
    switchToHedera,
    error,
    network
  } = useWallet();

  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleSwitchToHedera = async () => {
    await switchToHedera('testnet');
  };

  const isHederaNetwork = network === 'hedera-testnet' || network === 'hedera-mainnet';

  return (
    <div className="wallet-container">
      {isConnected ? (
        <div className="wallet-connected">
          <span className="wallet-address">{shortenAddress(account!)}</span>
          <span className="network-badge">
            {isHederaNetwork ? 
              <span className="hedera-badge">Hedera {network === 'hedera-testnet' ? 'Testnet' : 'Mainnet'}</span> : 
              <span className="other-network-badge">{network}</span>
            }
          </span>
          
          {!isHederaNetwork && (
            <button 
              className="btn btn-switch-network" 
              onClick={handleSwitchToHedera}
              disabled={isConnecting}
            >
              Switch to Hedera
            </button>
          )}
          
          <button 
            className="btn btn-disconnect" 
            onClick={disconnectWallet}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="wallet-actions">
          <button 
            className="btn btn-connect" 
            onClick={connectWallet} 
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          
          <button 
            className="btn btn-switch-network" 
            onClick={handleSwitchToHedera}
            disabled={isConnecting}
          >
            Connect to Hedera
          </button>
        </div>
      )}
      {error && <div className="wallet-error">{error}</div>}
    </div>
  );
};

export default ConnectWallet;
