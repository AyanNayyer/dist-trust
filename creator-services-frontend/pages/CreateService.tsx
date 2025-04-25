// src/pages/CreateService.tsx
import React from 'react';
import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useEscrow } from '../hooks/useEscrow';
import { useClientFundVerification } from '../hooks/useClientFundVerification';

const CreateService = () => {
  const { account, isConnected } = useWallet();
  const { createProject } = useEscrow();
  const { balance, verifyFunds, error: balanceError } = useClientFundVerification();
  
  const [formData, setFormData] = useState({
    provider: '',
    amount: '',
    title: '',
    description: '',
    deadline: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }
  
    if (!formData.provider || !formData.amount) {
      setError('Provider address and amount are required');
      return;
    }
  
    if (!verifyFunds(formData.amount)) {
      setError(`Insufficient funds. Your balance: ${balance} ETH`);
      return;
    }
  
    setLoading(true);
    setError(null);
    setSuccess(false);
  
    try {
      const projectId = await createProject(
        formData.provider,
        formData.amount,
        formData.title,
        formData.description,
        formData.deadline
      );
      setSuccess(true);
      setFormData({
        provider: '',
        amount: '',
        title: '',
        description: '',
        deadline: ''
      });
      alert(`Project created successfully with ID: ${projectId}`);
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="create-service-container">
      <h1 className="page-title">Create New Service Contract</h1>
      
      {balanceError && (
        <div className="alert alert-warning">
          {balanceError}
        </div>
      )}
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          Project created successfully!
        </div>
      )}
      
      <div className="wallet-info">
        <p><strong>Your Balance:</strong> {balance} HBAR</p>
      </div>
      
      <form onSubmit={handleSubmit} className="service-form">
        <div className="form-group">
          <label htmlFor="provider">Provider Address *</label>
          <input
            type="text"
            id="provider"
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            className="form-input"
            placeholder="0x..."
            required
          />
          <div className="form-help">Wallet address of the service provider</div>
        </div>
        
        <div className="form-group">
          <label htmlFor="amount">Service Amount (HBAR) *</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="form-input"
            placeholder="5"
            step="1"
            min="1"
            required
          />
          <div className="form-help">Amount to be held in escrow</div>
        </div>
        
        <div className="form-group">
          <label htmlFor="title">Service Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g. Website Design, Logo Creation"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-textarea"
            placeholder="Describe the service details and requirements"
            rows={4}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="deadline">Deadline (optional)</label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary btn-lg"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Service Contract'}
        </button>
      </form>
    </div>
  );
};

export default CreateService;
