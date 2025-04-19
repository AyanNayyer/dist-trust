import React from 'react';
import { Link } from "react-router-dom";
import ConnectWallet from "../wallet/ConnectWallet";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Creator Services
        </Link>
        
        {/* Mobile menu button */}
        <button 
          className="navbar-toggle" 
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span className="navbar-toggle-icon"></span>
        </button>
        
        {/* Desktop navigation */}
        <div className="navbar-menu">
          <div className="navbar-links">
            <Link to="/" className="navbar-link">Home</Link>
            <Link to="/dashboard" className="navbar-link">Dashboard</Link>
            <Link to="/create-service" className="navbar-link">Create Service</Link>
            <Link to="/profile" className="navbar-link">Profile</Link>
          </div>
          <div className="navbar-wallet">
            <ConnectWallet />
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className={`navbar-mobile ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" className="navbar-mobile-link" onClick={toggleMenu}>Home</Link>
          <Link to="/dashboard" className="navbar-mobile-link" onClick={toggleMenu}>Dashboard</Link>
          <Link to="/create-service" className="navbar-mobile-link" onClick={toggleMenu}>Create Service</Link>
          <Link to="/profile" className="navbar-mobile-link" onClick={toggleMenu}>Profile</Link>
          <div className="navbar-mobile-wallet">
            <ConnectWallet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
