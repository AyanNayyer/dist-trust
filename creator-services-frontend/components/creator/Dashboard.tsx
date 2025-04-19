import { useEffect, useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import ProfileForm from '../../components/creator/ProfileForm';

// Mock hooks for development
const useIdentity = () => {
  return {
    identity: {
      did: "did:ethr:0x123456789abcdef",
      isVerified: true
    }
  };
};

const useReputation = () => {
  return {
    getRatingDetails: async (address) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      return { average: 4.5, total: 45, count: 10 };
    }
  };
};

const useEscrow = () => {
  return {
    getProject: async (id) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        client: "0x9876543210fedcba",
        provider: "0x1234567890abcdef", // This should match the connected account
        amount: "0.5",
        status: id % 2 === 0 // Alternate between completed and in progress
      };
    }
  };
};

const Dashboard = () => {
  const { isConnected, account } = useWallet();
  const { identity } = useIdentity();
  const { getRatingDetails } = useReputation();
  const { getProject } = useEscrow();
  
  const [projects, setProjects] = useState([]);
  const [ratingDetails, setRatingDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  useEffect(() => {
    const loadData = async () => {
      if (account) {
        setLoading(true);
        try {
          // Load rating details
          const ratingData = await getRatingDetails(account);
          setRatingDetails(ratingData);
          
          // Load projects (mock implementation)
          const tempProjects = [];
          for (let i = 0; i < 3; i++) {
            const project = await getProject(i);
            if (project) tempProjects.push(project);
          }
          // Filter projects where the user is the provider
          setProjects(tempProjects.filter(p => p.provider === account));
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, [account, getRatingDetails, getProject]);
  
  if (!isConnected) {
    return (
      <div className="alert alert-warning">
        Please connect your wallet to view your dashboard.
      </div>
    );
  }
  
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Creator Dashboard</h1>
      
      {/* Identity Status */}
      <div className="dashboard-card identity-card">
        <h2 className="card-title">Identity Status</h2>
        {identity.did ? (
          <div className="identity-info">
            <div className="info-row">
              <span className="info-label">DID:</span>
              <span className="info-value">{`${identity.did.substring(0, 20)}...`}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Status:</span>
              <span className={`badge ${identity.isVerified ? "badge-success" : "badge-warning"}`}>
                {identity.isVerified ? "Verified" : "Unverified"}
              </span>
            </div>
          </div>
        ) : (
          <div className="alert alert-info">
            Create an identity in the Profile tab to start offering services
          </div>
        )}
      </div>
      
      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Active Projects</div>
          <div className="stat-number">{projects.length}</div>
          <div className="stat-help">Currently in progress</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Total Earnings</div>
          <div className="stat-number">
            {projects
              .filter(p => p.status)
              .reduce((sum, p) => sum + parseFloat(p.amount), 0)
              .toFixed(2)} ETH
          </div>
          <div className="stat-help">Completed projects</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Average Rating</div>
          <div className="stat-number">
            {loading ? <div className="spinner"></div> : ratingDetails?.average ?? 'N/A'}
          </div>
          <div className="stat-help">
            {ratingDetails ? `From ${ratingDetails.count} reviews` : 'No reviews yet'}
          </div>
        </div>
      </div>
      
      {/* Main Dashboard Tabs */}
      <div className="tabs-container">
        <div className="tabs-header">
          <button 
            className={`tab-button ${activeTab === 0 ? 'active' : ''}`}
            onClick={() => setActiveTab(0)}
          >
            Active Projects
          </button>
          <button 
            className={`tab-button ${activeTab === 1 ? 'active' : ''}`}
            onClick={() => setActiveTab(1)}
          >
            Reputation
          </button>
          <button 
            className={`tab-button ${activeTab === 2 ? 'active' : ''}`}
            onClick={() => setActiveTab(2)}
          >
            Profile
          </button>
        </div>
        
        <div className="tab-content">
          {/* Active Projects Tab */}
          {activeTab === 0 && (
            <div className="tab-panel">
              {projects.length > 0 ? (
                <div className="projects-list">
                  {projects.map((project, index) => (
                    <div key={index} className="project-card">
                      <div className="project-header">
                        <h3>Project #{index}</h3>
                      </div>
                      <div className="project-body">
                        <div className="project-info">
                          <p><strong>Client:</strong> {project.client}</p>
                          <p><strong>Amount:</strong> {project.amount} ETH</p>
                          <p><strong>Status:</strong> {project.status ? 'Completed' : 'In Progress'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No active projects found</p>
                </div>
              )}
            </div>
          )}
          
          {/* Reputation Tab */}
          {activeTab === 1 && (
            <div className="tab-panel">
              {ratingDetails ? (
                <div className="reputation-card">
                  <div className="reputation-stat">
                    <div className="stat-label">Average Rating</div>
                    <div className="stat-number">{ratingDetails.average}/5</div>
                  </div>
                  <div className="reputation-stat">
                    <div className="stat-label">Total Ratings</div>
                    <div className="stat-number">{ratingDetails.count}</div>
                  </div>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span 
                        key={star} 
                        className={`star ${star <= Math.round(ratingDetails.average) ? 'filled' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="alert alert-info">
                  No reputation data available yet
                </div>
              )}
            </div>
          )}
          
          {/* Profile Tab */}
          {activeTab === 2 && (
            <div className="tab-panel">
              <ProfileForm />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
