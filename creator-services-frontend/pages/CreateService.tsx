import React from 'react';
import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

// Mock escrow hook for development
const useEscrow = () => {
  return {
    createProject: async (provider, amount) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return Math.floor(Math.random() * 1000); // Random project ID
    },
    loading: false,
    error: null
  };
};

const CreateService = () => {
  const { account, isConnected } = useWallet();
  const { createProject, loading, error } = useEscrow();
  
  const [formData, setFormData] = useState({
    provider: '',
    amount: '',
    title: '',
    description: '',
    deadline: ''
  });

  const [toast, setToast] = useState({
    show: false,
    title: '',
    message: '',
    type: ''
  });

  const showToast = (title, message, type) => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast({ show: false, title: '', message: '', type: '' }), 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      showToast('Error', 'Please connect your wallet first', 'error');
      return;
    }
    
    if (!formData.provider || !formData.amount) {
      showToast('Error', 'Provider address and amount are required', 'error');
      return;
    }
    
    try {
      const projectId = await createProject(formData.provider, formData.amount);
      showToast('Success', `Project created with ID: ${projectId}`, 'success');
      setFormData({
        provider: '',
        amount: '',
        title: '',
        description: '',
        deadline: ''
      });
    } catch (err) {
      showToast('Error', err.message || 'Failed to create project', 'error');
    }
  };

  return (
    <div className="create-service-container">
      <h1 className="page-title">Create New Service Contract</h1>
      
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <div className="toast-header">{toast.title}</div>
          <div className="toast-body">{toast.message}</div>
        </div>
      )}
      
      <div className="service-form-container">
        <form onSubmit={handleSubmit} className="service-form">
          <div className="form-section">
            <h2 className="section-title">Service Details</h2>
            
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
          </div>
          
          <div className="form-section">
            <h2 className="section-title">Payment Details</h2>
            
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
              <div className="form-help">Ethereum address of the service provider</div>
            </div>
            
            <div className="form-group">
              <label htmlFor="amount">Service Amount (ETH) *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="form-input"
                placeholder="0.1"
                step="0.01"
                min="0"
                required
              />
              <div className="form-help">Amount to be held in escrow</div>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Service Contract'}
            </button>
          </div>
          
          {error && <div className="form-error">{error}</div>}
        </form>
        
        <div className="service-info">
          <div className="info-card">
            <h3 className="info-title">How It Works</h3>
            <ol className="info-steps">
              <li>Enter the provider's Ethereum address</li>
              <li>Specify the amount to be paid for the service</li>
              <li>Funds will be held in escrow until you approve the work</li>
              <li>Once approved, the provider will receive payment automatically</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateService;
