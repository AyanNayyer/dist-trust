// src/pages/CreatorDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useEscrow } from '../hooks/useEscrow';

// Project status enum to match your smart contract
const ProjectStatus = {
  NotStarted: 0,
  InProgress: 1,
  Completed: 2,
  Scrapped: 3
};

const CreatorDashboard = () => {
  const { account, isConnected } = useWallet();
  const { getProject, getProjectsCount, creatorApproval, markProjectCompleted } = useEscrow();

  
  const [pendingProjects, setPendingProjects] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [approvalAmount, setApprovalAmount] = useState({});
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!account) return;
      setLoading(true);
      setError(null);
  
      try {
        const count = await getProjectsCount();
        const pending = [];
        const active = [];
        const completed = [];
        for (let i = 0; i < count; i++) {
          const project = await getProject(i);
          if (!project) continue;
          if (project.provider.toLowerCase() !== account.toLowerCase()) continue;
  
          // ProjectStatus: 0=Pending, 1=Approved, 2=Rejected, 3=InProgress, 4=Completed
          if (project.status === 0) {
            pending.push({ id: i, ...project });
          } else if (project.status === 1) {
            active.push({ id: i, ...project });
          } else if (project.status === 4) {
            completed.push({ id: i, ...project });
          }
        }
        setPendingProjects(pending);
        setActiveProjects(active);
        setCompletedProjects(completed);
      } catch (err) {
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
  
    fetchProjects();
  }, [account, getProject, getProjectsCount]);
  
  

  const handleApprovalChange = (projectId, value) => {
    setApprovalAmount(prev => ({ ...prev, [projectId]: value }));
  };

  const handleApprove = async (projectId) => {
    const amount = approvalAmount[projectId];
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    try {
      await creatorApproval(projectId, true, amount);
      alert('Project approved successfully!');
      
      // Remove from pending list
      setPendingProjects(prev => prev.filter(p => p.id !== projectId));
      
      // Refresh the project lists
      const updatedProject = await getProject(projectId);
      if (updatedProject && updatedProject.status === ProjectStatus.InProgress) {
        setActiveProjects(prev => [...prev, { id: projectId, ...updatedProject }]);
      }
    } catch (err) {
      console.error("Error approving project:", err);
      alert(`Failed to approve project: ${err.message || 'Unknown error'}`);
    }
  };

  const handleReject = async (projectId) => {
    try {
      await creatorApproval(projectId, false, "0");
      alert('Project rejected successfully!');
      
      // Remove from pending list
      setPendingProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err) {
      console.error("Error rejecting project:", err);
      alert(`Failed to reject project: ${err.message || 'Unknown error'}`);
    }
  };

  const handleMarkCompleted = async (projectId) => {
    try {
      await markProjectCompleted(projectId);
      alert('Project marked as completed!');
      
      // Move from active to completed
      const project = activeProjects.find(p => p.id === projectId);
      if (project) {
        setActiveProjects(prev => prev.filter(p => p.id !== projectId));
        setCompletedProjects(prev => [...prev, { ...project, status: ProjectStatus.Completed }]);
      }
    } catch (err) {
      console.error("Error marking project as completed:", err);
      alert(`Failed to mark project as completed: ${err.message || 'Unknown error'}`);
    }
  };

  if (!isConnected) {
    return (
      <div className="dashboard-container">
        <div className="alert alert-warning">
          Please connect your wallet to view your creator dashboard.
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Creator Dashboard</h1>
      
      {/* Debug info - remove in production */}
      {debugInfo && (
        <div className="debug-info">
          <p>Projects checked: {debugInfo.checked}</p>
          <p>Projects found for this account: {debugInfo.found}</p>
          <p>Your address: {account}</p>
        </div>
      )}
      
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading projects...</p>
        </div>
      )}
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      <div className="dashboard-section">
        <h2 className="section-title">
          Pending Approvals ({pendingProjects.length})
        </h2>
        
        {!loading && pendingProjects.length === 0 && (
          <div className="empty-state">
            No pending projects to approve.
          </div>
        )}
        
        <div className="projects-grid">
          {pendingProjects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h3>Project #{project.id}</h3>
                <span className="status-badge pending">Pending Approval</span>
              </div>
              
              <div className="project-body">
                <p><strong>Client:</strong> {project.client}</p>
                <p><strong>Initial Amount:</strong> {project.amount} ETH</p>
                
                <div className="approval-form">
                  <div className="form-group">
                    <label htmlFor={`amount-${project.id}`}>Your Price (ETH):</label>
                    <input
                      id={`amount-${project.id}`}
                      type="number"
                      className="form-input"
                      value={approvalAmount[project.id] || ''}
                      onChange={e => handleApprovalChange(project.id, e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="Enter your price"
                    />
                  </div>
                  
                  <div className="button-group">
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleApprove(project.id)}
                    >
                      Approve Project
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleReject(project.id)}
                    >
                      Reject Project
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="dashboard-section">
        <h2 className="section-title">
          Active Projects ({activeProjects.length})
        </h2>
        
        {!loading && activeProjects.length === 0 && (
          <div className="empty-state">
            No active projects.
          </div>
        )}
        
        <div className="projects-grid">
          {activeProjects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h3>Project #{project.id}</h3>
                <span className="status-badge active">In Progress</span>
              </div>
              
              <div className="project-body">
                <p><strong>Client:</strong> {project.client}</p>
                <p><strong>Amount:</strong> {project.amount} ETH</p>
                
                <div className="button-group">
                  <button 
                    className="btn btn-success" 
                    onClick={() => handleMarkCompleted(project.id)}
                  >
                    Mark as Completed
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="dashboard-section">
        <h2 className="section-title">
          Completed Projects ({completedProjects.length})
        </h2>
        
        {!loading && completedProjects.length === 0 && (
          <div className="empty-state">
            No completed projects.
          </div>
        )}
        
        <div className="projects-grid">
          {completedProjects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h3>Project #{project.id}</h3>
                <span className="status-badge completed">Completed</span>
              </div>
              
              <div className="project-body">
                <p><strong>Client:</strong> {project.client}</p>
                <p><strong>Amount:</strong> {project.amount} ETH</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
