// src/pages/CreatorDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useEscrow } from '../hooks/useEscrow';

// Project status enum to match your smart contract
const ProjectStatus = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
  InProgress: 3,
  Completed: 4
};

const CreatorDashboard = () => {
  const { account, isConnected, network } = useWallet();
  const { getProject, getProjectsCount, creatorApproval, markProjectCompleted } = useEscrow();

  const [pendingProjects, setPendingProjects] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projectsLoaded, setProjectsLoaded] = useState(false);

  // Determine currency symbol based on network
  const getCurrencySymbol = () => {
    return network === 'hedera-testnet' || network === 'hedera-mainnet' ? 'HBAR' : 'ETH';
  };

  useEffect(() => {
    // Skip if already loaded or no account
    if (projectsLoaded || !account) return;
    
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
    
      try {
        console.log("Fetching projects for creator:", account);
        
        const count = await getProjectsCount();
        console.log("Total projects count:", count);
        
        const pending = [];
        const active = [];
        const completed = [];
        
        for (let i = 0; i < count; i++) {
          try {
            console.log(`Fetching project ${i}...`);
            const project = await getProject(i);
            console.log(`Project ${i}:`, project);
            
            if (!project) {
              console.log(`Project ${i} is null, skipping`);
              continue;
            }
            
            if (project.provider.toLowerCase() !== account.toLowerCase()) {
              console.log(`Project ${i} provider (${project.provider}) doesn't match account (${account}), skipping`);
              continue;
            }
    
            // Add to appropriate array based on status
            if (project.status === 0) { // Pending
              pending.push(project);
            } else if (project.status === 1 || project.status === 3) { // Approved or InProgress
              active.push(project);
            } else if (project.status === 4) { // Completed
              completed.push(project);
            }
          } catch (err) {
            console.error(`Error processing project ${i}:`, err);
          }
        }
        
        console.log("Projects found:", { pending, active, completed });
        setPendingProjects(pending);
        setActiveProjects(active);
        setCompletedProjects(completed);
        
        // Mark as loaded to prevent re-fetching
        setProjectsLoaded(true);
      } catch (err) {
        console.error("Failed to load projects:", err);
        setError("Failed to load projects: " + (err.message || String(err)));
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, [account, getProject, getProjectsCount, projectsLoaded]);

  const handleRefresh = () => {
    setProjectsLoaded(false); // This will trigger the useEffect to run again
  };

  const handleApprove = async (projectId) => {
    try {
      await creatorApproval(projectId, true);
      alert('Project accepted successfully!');
      
      // Remove from pending list
      setPendingProjects(prev => prev.filter(p => p.id !== projectId));
      
      // Refresh the project lists
      const updatedProject = await getProject(projectId);
      if (updatedProject && (updatedProject.status === 1 || updatedProject.status === 3)) {
        setActiveProjects(prev => [...prev, updatedProject]);
      }
    } catch (err) {
      console.error("Error approving project:", err);
      alert(`Failed to approve project: ${err.message || 'Unknown error'}`);
    }
  };

  const handleReject = async (projectId) => {
    try {
      await creatorApproval(projectId, false);
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

  const currencySymbol = getCurrencySymbol();

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Creator Dashboard</h1>
      
      <div className="dashboard-actions">
        <button 
          className="btn btn-primary" 
          onClick={handleRefresh} 
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh Projects'}
        </button>
      </div>
      
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
                <h3>{project.title || `Project #${project.id}`}</h3>
                <span className="status-badge pending">Pending Approval</span>
              </div>
              <div className="project-body">
                <p><strong>Client:</strong> {project.client}</p>
                <p><strong>Proposed Amount:</strong> {project.amount} {currencySymbol}</p>
                {project.description && (
                  <p><strong>Description:</strong> {project.description}</p>
                )}
                {project.deadline && (
                  <p><strong>Deadline:</strong> {new Date(project.deadline * 1000).toLocaleDateString()}</p>
                )}
                
                <div className="button-group">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleApprove(project.id)}
                  >
                    Accept Project
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
                <h3>{project.title || `Project #${project.id}`}</h3>
                <span className="status-badge active">In Progress</span>
              </div>
              
              <div className="project-body">
                <p><strong>Client:</strong> {project.client}</p>
                <p><strong>Amount:</strong> {project.amount} {currencySymbol}</p>
                {project.description && (
                  <p><strong>Description:</strong> {project.description}</p>
                )}
                {project.deadline && (
                  <p><strong>Deadline:</strong> {new Date(project.deadline * 1000).toLocaleDateString()}</p>
                )}
                
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
                <h3>{project.title || `Project #${project.id}`}</h3>
                <span className="status-badge completed">Completed</span>
              </div>
              
              <div className="project-body">
                <p><strong>Client:</strong> {project.client}</p>
                <p><strong>Amount:</strong> {project.amount} {currencySymbol}</p>
                {project.description && (
                  <p><strong>Description:</strong> {project.description}</p>
                )}
                {project.deadline && (
                  <p><strong>Deadline:</strong> {new Date(project.deadline * 1000).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
