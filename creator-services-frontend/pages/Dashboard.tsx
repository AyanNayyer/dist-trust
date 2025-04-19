import React from 'react';
import { useWallet } from "../contexts/WalletContext";
import ProfileForm from "../components/creator/ProfileForm";

const Dashboard = () => {
  const { isConnected, account } = useWallet();

  if (!isConnected) {
    return (
      <div className="dashboard-container">
        <div className="alert alert-warning">
          <span className="alert-icon">⚠️</span>
          Please connect your wallet to access the dashboard.
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <div className="dashboard-content">
        <div className="wallet-info">
          <p className="wallet-label">Your Wallet Address:</p>
          <p className="wallet-address">{account}</p>
        </div>
        <ProfileForm />
        {/* Add more dashboard widgets/components here */}
      </div>
    </div>
  );
};

export default Dashboard;
