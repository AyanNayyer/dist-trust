import React from 'react';
import { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';

// Categories for the dropdown
const categories = [
  'Design',
  'Development',
  'Writing',
  'Translation',
  'Marketing',
  'Music',
  'Video',
  'Art'
];

// Mock identity functionality since we removed the Chakra UI dependencies
const useIdentity = () => {
  const [identity, setIdentity] = useState({ did: null, isVerified: false });
  const [isCreatingIdentity, setIsCreatingIdentity] = useState(false);
  const [isVerifyingIdentity, setIsVerifyingIdentity] = useState(false);

  const createIdentity = async () => {
    setIsCreatingIdentity(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIdentity({ did: "did:ethr:0x" + Math.random().toString(16).slice(2, 10), isVerified: false });
    setIsCreatingIdentity(false);
    return true;
  };

  const verifyIdentity = async () => {
    setIsVerifyingIdentity(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIdentity(prev => ({ ...prev, isVerified: true }));
    setIsVerifyingIdentity(false);
    return true;
  };

  return { identity, createIdentity, isCreatingIdentity, verifyIdentity, isVerifyingIdentity };
};

const PROFILE_STORAGE_KEY = "creator_profile";

const ProfileForm = () => {
  const { isConnected, account } = useWallet();
  const { identity, createIdentity, isCreatingIdentity, verifyIdentity, isVerifyingIdentity } = useIdentity();

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    category: '',
    skills: '',
    contactEmail: ''
  });

  const [toast, setToast] = useState({ 
    show: false, 
    title: '', 
    description: '', 
    status: '' 
  });

  // Load profile from localStorage on mount
  useEffect(() => {
    if (account) {
      const saved = localStorage.getItem(`${PROFILE_STORAGE_KEY}_${account}`);
      if (saved) setFormData(JSON.parse(saved));
    }
  }, [account]);

  const showToast = (title, description, status) => {
    setToast({ show: true, title, description, status });
    setTimeout(() => setToast({ show: false, title: '', description: '', status: '' }), 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCreateIdentity = async () => {
    try {
      await createIdentity();
      showToast(
        'Identity Created',
        'Your decentralized identity has been created successfully.',
        'success'
      );
    } catch (error) {
      showToast(
        'Error',
        error.message || 'Failed to create identity',
        'error'
      );
    }
  };

  const handleVerifyIdentity = async () => {
    try {
      await verifyIdentity();
      showToast(
        'Identity Verified',
        'Your identity has been verified successfully.',
        'success'
      );
    } catch (error) {
      showToast(
        'Error',
        error.message || 'Failed to verify identity',
        'error'
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!identity.did) {
      showToast(
        'Identity Required',
        'Please create a decentralized identity first.',
        'warning'
      );
      return;
    }
    // Save to localStorage
    if (account) {
      localStorage.setItem(`${PROFILE_STORAGE_KEY}_${account}`, JSON.stringify(formData));
    }
    showToast(
      'Profile Saved',
      'Your creator profile has been saved successfully.',
      'success'
    );
  };

  if (!isConnected) {
    return (
      <div className="form-container">
        <p>Please connect your wallet to create a profile.</p>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h2 className="form-title">Create Creator Profile</h2>
      
      {/* Toast message */}
      {toast.show && (
        <div className={`toast toast-${toast.status}`}>
          <strong>{toast.title}</strong>
          <p>{toast.description}</p>
        </div>
      )}
      
      <div className="identity-section">
        <h3>Identity Verification</h3>
        
        {identity.did ? (
          <div className="identity-info">
            <p>DID: {identity.did}</p>
            <div className="identity-status">
              <span className={`badge ${identity.isVerified ? "badge-success" : "badge-warning"}`}>
                {identity.isVerified ? "Verified" : "Unverified"}
              </span>
              
              {!identity.isVerified && (
                <button 
                  className="btn btn-small btn-verify" 
                  onClick={handleVerifyIdentity}
                  disabled={isVerifyingIdentity}
                >
                  {isVerifyingIdentity ? 'Verifying...' : 'Verify Identity'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handleCreateIdentity}
            disabled={isCreatingIdentity}
          >
            {isCreatingIdentity ? 'Creating...' : 'Create Decentralized Identity'}
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            required
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="title">Professional Title *</label>
          <input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Graphic Designer, Developer, Writer"
            required
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Tell clients about yourself and your services"
            rows={4}
            required
            className="form-textarea"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Primary Category *</label>
          <select 
            id="category"
            name="category" 
            value={formData.category} 
            onChange={handleChange}
            required
            className="form-select"
          >
            <option value="" disabled>Select category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="skills">Skills (comma separated) *</label>
          <input
            id="skills"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="e.g. React, Solidity, Web Design"
            required
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="contactEmail">Contact Email</label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={handleChange}
            placeholder="Your email address"
            className="form-input"
          />
        </div>
        
        <button 
          className="btn btn-submit" 
          type="submit" 
          disabled={!identity.did}
        >
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;
