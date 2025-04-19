import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">Decentralized Creator Services</h1>
        <p className="hero-subtitle">
          Connect, collaborate, and transact securely with creators using blockchain-powered 
          escrow and reputation.
        </p>
        <div className="hero-buttons">
          <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
          <Link to="/create-service" className="btn btn-outline">Create a Service</Link>
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">Secure Escrow</h3>
            <p className="feature-description">
              Smart contract escrow ensures funds are only released when work is completed.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3 className="feature-title">Reputation System</h3>
            <p className="feature-description">
              Transparent, on-chain reputation helps you find trusted creators.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🆔</div>
            <h3 className="feature-title">Decentralized Identity</h3>
            <p className="feature-description">
              Verify creator identities with blockchain-based DIDs.
            </p>
          </div>
        </div>
      </div>

      <div className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3 className="step-title">Connect Wallet</h3>
            <p className="step-description">Link your Ethereum wallet to get started.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3 className="step-title">Create Profile</h3>
            <p className="step-description">Set up your creator profile with verified credentials.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3 className="step-title">Offer Services</h3>
            <p className="step-description">List your services or hire a creator.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3 className="step-title">Secure Payment</h3>
            <p className="step-description">Funds are held in escrow until work is approved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
