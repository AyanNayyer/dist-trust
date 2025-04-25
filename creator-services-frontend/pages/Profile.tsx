import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import ProfileForm from '../components/creator/ProfileForm';

const SERVICES_STORAGE_KEY = "creator_services";
const SETTINGS_STORAGE_KEY = "creator_settings";

const Profile = () => {
  const { isConnected, account } = useWallet();
  const [activeSection, setActiveSection] = useState('profile');
  const [services, setServices] = useState([]);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [newService, setNewService] = useState({ title: "", description: "", price: "" });
  const [settings, setSettings] = useState({
    notificationEmail: '',
    receiveEmails: false
  });
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Load services from localStorage
  useEffect(() => {
    if (account) {
      // Load services
      const savedServices = localStorage.getItem(`${SERVICES_STORAGE_KEY}_${account}`);
      if (savedServices) setServices(JSON.parse(savedServices));
      
      // Load settings
      const savedSettings = localStorage.getItem(`${SETTINGS_STORAGE_KEY}_${account}`);
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    }
  }, [account]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleAddService = () => setShowServiceForm(true);

  const handleServiceChange = (e) => {
    const { name, value } = e.target;
    setNewService(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceSubmit = (e) => {
    e.preventDefault();
    const updated = [...services, { 
      ...newService, 
      id: Date.now().toString(), // Simple unique ID
      createdAt: new Date().toISOString() 
    }];
    setServices(updated);
    if (account) {
      localStorage.setItem(`${SERVICES_STORAGE_KEY}_${account}`, JSON.stringify(updated));
    }
    setShowServiceForm(false);
    setNewService({ title: "", description: "", price: "" });
    showToast('Service created successfully');
  };

  const handleDeleteService = (id) => {
    const updated = services.filter(service => service.id !== id);
    setServices(updated);
    if (account) {
      localStorage.setItem(`${SERVICES_STORAGE_KEY}_${account}`, JSON.stringify(updated));
    }
    showToast('Service deleted successfully');
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSettingsSave = (e) => {
    e.preventDefault();
    if (account) {
      localStorage.setItem(`${SETTINGS_STORAGE_KEY}_${account}`, JSON.stringify(settings));
    }
    showToast('Settings saved successfully');
  };

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
      
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
      
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
              <button className="btn btn-primary" onClick={handleAddService}>Add New Service</button>
            </div>
            
            {showServiceForm && (
              <div className="form-container">
                <h3>Create New Service</h3>
                <form onSubmit={handleServiceSubmit} className="service-form">
                  <div className="form-group">
                    <label htmlFor="service-title">Title</label>
                    <input 
                      id="service-title"
                      name="title" 
                      value={newService.title} 
                      onChange={handleServiceChange} 
                      className="form-input"
                      placeholder="e.g. Logo Design, Web Development"
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="service-description">Description</label>
                    <textarea 
                      id="service-description"
                      name="description" 
                      value={newService.description} 
                      onChange={handleServiceChange} 
                      className="form-textarea"
                      placeholder="Describe your service in detail"
                      rows={4}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="service-price">Starting Price</label>
                    <div className="price-input-wrapper">
                      <input 
                        id="service-price"
                        name="price" 
                        type="number"
                        min="0"
                        step="0.01"
                        value={newService.price} 
                        onChange={handleServiceChange} 
                        className="form-input"
                        placeholder="0.00"
                        required 
                      />
                      <span className="price-currency">ETH</span>
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button className="btn btn-success" type="submit">Save Service</button>
                    <button 
                      className="btn btn-outline" 
                      type="button" 
                      onClick={() => setShowServiceForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {!showServiceForm && services.length === 0 ? (
              <div className="empty-state">
                <p>You haven't created any services yet.</p>
              </div>
            ) : (
              <div className="services-list">
                {services.map((service) => (
                  <div key={service.id} className="service-card">
                    <div className="service-header">
                      <h3>{service.title}</h3>
                      <div className="service-price">{service.price} ETH</div>
                    </div>
                    <p className="service-description">{service.description}</p>
                    <div className="service-actions">
                      <button 
                        className="btn btn-small btn-outline"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeSection === 'settings' && (
          <div className="profile-section">
            <h2 className="section-title">Account Settings</h2>
            
            <form className="settings-form" onSubmit={handleSettingsSave}>
              <div className="form-group">
                <label htmlFor="notification-email">Notification Email</label>
                <input 
                  type="email" 
                  id="notification-email"
                  name="notificationEmail"
                  value={settings.notificationEmail}
                  onChange={handleSettingsChange}
                  className="form-input" 
                  placeholder="your@email.com"
                />
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="receiveEmails"
                    checked={settings.receiveEmails}
                    onChange={handleSettingsChange}
                    className="checkbox-input" 
                  />
                  <span className="checkbox-text">Receive email notifications</span>
                </label>
              </div>
              
              <button className="btn btn-primary" type="submit">Save Settings</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
