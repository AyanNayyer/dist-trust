import React from 'react';
import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import ProfileForm from '../components/creator/ProfileForm';

const Profile = () => {
  const { isConnected } = useWallet();
  const [activeSection, setActiveSection] = useState('profile');

  if (!isConnected) {
    return (
      <div className="profile-container">
        <div className="alert alert-warning">
          Please connect your wallet to view your profile.
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h1 className="page-title">My Profile</h1>
      
      <div className="profile-nav">
        <button 
          className={`profile-nav-item ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSection('profile')}
        >
          Profile Information
        </button>
        <button 
          className={`profile-nav-item ${activeSection === 'services' ? 'active' : ''}`}
          onClick={() => setActiveSection('services')}
        >
          My Services
        </button>
        <button 
          className={`profile-nav-item ${activeSection === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveSection('settings')}
        >
          Settings
        </button>
      </div>
      
      <div className="profile-content">
        {activeSection === 'profile' && (
          <div className="profile-section">
            <ProfileForm />
          </div>
        )}
        
        {activeSection === 'services' && (
          <div className="profile-section">
            <div className="section-header">
              <h2 className="section-title">My Services</h2>
              <button className="btn btn-primary">Add New Service</button>
            </div>
            
            <div className="empty-state">
              <p>You haven't created any services yet.</p>
              <button className="btn btn-outline">Create Your First Service</button>
            </div>
          </div>
        )}
        
        {activeSection === 'settings' && (
          <div className="profile-section">
            <h2 className="section-title">Account Settings</h2>
            
            <div className="settings-form">
              <div className="form-group">
                <label htmlFor="notification-email">Notification Email</label>
                <input 
                  type="email" 
                  id="notification-email" 
                  className="form-input" 
                  placeholder="your@email.com"
                />
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" className="checkbox-input" />
                  <span className="checkbox-text">Receive email notifications</span>
                </label>
              </div>
              
              <button className="btn btn-primary">Save Settings</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
