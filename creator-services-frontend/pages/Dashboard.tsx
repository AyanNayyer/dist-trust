import React, { useState, useEffect } from 'react';
import { useWallet } from "../contexts/WalletContext";
import ProfileForm from "../components/creator/ProfileForm";
import { useReputation } from '../hooks/useReputation';
import { useEscrow } from '../hooks/useEscrow';
import RatingSubmitter from '../components/reputation/RatingSubmitter';

const Dashboard = () => {
  const { isConnected, account } = useWallet();
  const { getRatingDetails, loading: ratingLoading } = useReputation();
  const { getProject, getProjectsCount } = useEscrow();
  const [ratingDetails, setRatingDetails] = useState(null);
  const [projects, setProjects] = useState({ pending: [], active: [], completed: [] });
  const [loading, setLoading] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false);

  useEffect(() => {
    const loadRating = async () => {
      if (account) {
        const details = await getRatingDetails(account);
        setRatingDetails(details);
      }
    };
    
    loadRating();
  }, [account, getRatingDetails]);

  useEffect(() => {
    // Skip if already loaded or no account
    if (projectsLoaded || !account) return;
    
    const loadProjects = async () => {
      setLoading(true);
      try {
        const pendingProjects = [];
        const activeProjects = [];
        const completedProjects = [];
        
        // Get actual count instead of hardcoded 20
        const count = await getProjectsCount();
        console.log("Total projects count:", count);
        
        // Only loop through existing projects
        for (let i = 0; i < count; i++) {
          try {
            console.log(`Fetching project ${i}...`);
            const project = await getProject(i);
            
            if (!project) {
              console.log(`Project ${i} is null, skipping`);
              continue;
            }
            
            // Only include projects where this account is the client
            if (project.client.toLowerCase() === account.toLowerCase()) {
              if (project.status === 0) { // NotStarted
                pendingProjects.push({ id: i, ...project });
              } else if (project.status === 1 || project.status === 3) { // InProgress
                activeProjects.push({ id: i, ...project });
              } else if (project.status === 2 || project.status === 4) { // Completed
                completedProjects.push({ id: i, ...project });
              }
            }
          } catch (err) {
            console.log(`Error fetching project #${i}:`, err);
          }
        }
        
        console.log("Projects found:", { pending: pendingProjects, active: activeProjects, completed: completedProjects });
        setProjects({
          pending: pendingProjects,
          active: activeProjects,
          completed: completedProjects
        });
        
        // Mark as loaded to prevent re-fetching
        setProjectsLoaded(true);
      } catch (err) {
        console.error("Error loading projects:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProjects();
  }, [account, getProject, getProjectsCount, projectsLoaded]);
  
  const handleRefresh = () => {
    setProjectsLoaded(false); // This will trigger the useEffect to run again
  };
  
  const handleRatingSubmitted = () => {
    // Refresh ratings after submission
    if (account) {
      getRatingDetails(account).then(details => setRatingDetails(details));
    }
  };
  
  if (!isConnected) {
    return (
      <div className="dashboard-container">
        <div className="alert alert-warning">
          <span className="alert-icon">⚠</span>
          Please connect your wallet to access the dashboard.
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <div className="dashboard-content">
        <div className="wallet-info">
          <p className="wallet-label">Your Wallet Address:</p>
          <p className="wallet-address">{account}</p>
        </div>
        
        <div className="dashboard-actions">
          <button 
            className="btn btn-primary" 
            onClick={handleRefresh} 
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh Projects'}
          </button>
        </div>
        
        {/* Reputation Section */}
        <div className="dashboard-section">
          <h2 className="section-title">Your Reputation</h2>
          {ratingLoading ? (
            <div className="loading">Loading reputation data...</div>
          ) : ratingDetails ? (
            <div className="reputation-card">
              <div className="reputation-stat">
                <div className="stat-label">Average Rating</div>
                <div className="stat-number">
                  {ratingDetails.average ? ratingDetails.average.toFixed(1) : 'No ratings yet'}
                  {ratingDetails.average && ' / 5'}
                </div>
              </div>
              <div className="reputation-stat">
                <div className="stat-label">Total Ratings</div>
                <div className="stat-number">{ratingDetails.count}</div>
              </div>
              {ratingDetails.average && (
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
              )}
            </div>
          ) : (
            <div className="empty-state">No reputation data available</div>
          )}
        </div>
        
        {/* Projects Section */}
        <div className="dashboard-section">
          <h2 className="section-title">Your Projects</h2>
          
          {loading ? (
            <div className="loading">Loading projects...</div>
          ) : (
            <>
              {/* Completed Projects with Rating */}
              {projects.completed && projects.completed.length > 0 && (
                <div className="projects-subsection">
                  <h3 className="subsection-title">Completed Projects</h3>
                  <div className="projects-grid">
                    {projects.completed.map(project => (
                      <div key={project.id} className="project-card">
                        <div className="project-header">
                          <h3>Project #{project.id}</h3>
                          <span className="status-badge completed">Completed</span>
                        </div>
                        <div className="project-body">
                          <p><strong>Provider:</strong> {project.provider}</p>
                          <p><strong>Amount:</strong> {project.amount} ETH</p>
                          
                          {/* Rating Component */}
                          <div className="project-rating">
                            <RatingSubmitter 
                              providerAddress={project.provider} 
                              onRatingSubmitted={handleRatingSubmitted}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Active Projects */}
              {projects.active && projects.active.length > 0 && (
                <div className="projects-subsection">
                  <h3 className="subsection-title">Active Projects</h3>
                  <div className="projects-grid">
                    {projects.active.map(project => (
                      <div key={project.id} className="project-card">
                        <div className="project-header">
                          <h3>Project #{project.id}</h3>
                          <span className="status-badge active">In Progress</span>
                        </div>
                        <div className="project-body">
                          <p><strong>Provider:</strong> {project.provider}</p>
                          <p><strong>Amount:</strong> {project.amount} ETH</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Pending Projects */}
              {projects.pending && projects.pending.length > 0 && (
                <div className="projects-subsection">
                  <h3 className="subsection-title">Pending Projects</h3>
                  <div className="projects-grid">
                    {projects.pending.map(project => (
                      <div key={project.id} className="project-card">
                        <div className="project-header">
                          <h3>Project #{project.id}</h3>
                          <span className="status-badge pending">Pending</span>
                        </div>
                        <div className="project-body">
                          <p><strong>Provider:</strong> {project.provider}</p>
                          <p><strong>Amount:</strong> {project.amount} ETH</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {(!projects.completed || projects.completed.length === 0) && 
               (!projects.active || projects.active.length === 0) && 
               (!projects.pending || projects.pending.length === 0) && (
                <div className="empty-state">No projects found</div>
              )}
            </>
          )}
        </div>
        
        <ProfileForm />
      </div>
    </div>
  );
};

export default Dashboard;
