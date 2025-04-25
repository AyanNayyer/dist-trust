import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';

// Replace with your deployed ProjectManager contract address
const PROJECT_MANAGER_ADDRESS = "0xDA0bab807633f07f013f94DD0E6A4F96F8742B53";
const PROJECT_MANAGER_ABI = [
  "function createProject(address,string,string,uint256) external payable returns (uint256)",
  "function approveProject(uint256) external",
  "function rejectProject(uint256) external",
  "function getProject(uint256) external view returns (address,address,uint256,string,string,uint256,uint8)",
  "function getProjectsCount() external view returns (uint256)",
];

export const useEscrow = () => {
  const { signer } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contract = signer
    ? new ethers.Contract(PROJECT_MANAGER_ADDRESS, PROJECT_MANAGER_ABI, signer)
    : null;

  // For CreateService
  const createProject = useCallback(
    async (provider, amount, title, description, deadline) => {
      if (!contract) return null;
      setLoading(true);
      setError(null);
      try {
        const tx = await contract.createProject(
          provider,
          title,
          description,
          deadline ? Math.floor(new Date(deadline).getTime() / 1000) : 0,
          { value: ethers.utils.parseEther(amount) }
        );
        const receipt = await tx.wait();
        // Find the ProjectCreated event
        const event = receipt.events.find(e => e.event === "ProjectCreated");
        const projectId = event?.args?.projectId?.toNumber();
        return projectId;
      } catch (err: any) {
        setError(err.message || "Failed to create project");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [contract]
  );

  // For CreatorDashboard
  const getProject = useCallback(
    async (projectId) => {
      if (!contract) return null;
      try {
        const [
          client,
          creator,
          amount,
          title,
          description,
          deadline,
          status,
        ] = await contract.getProject(projectId);
        return {
          client,
          provider: creator,
          amount: ethers.utils.formatEther(amount),
          title,
          description,
          deadline: deadline.toNumber(),
          status: status,
        };
      } catch (err: any) {
        setError(err.message || "Failed to get project");
        return null;
      }
    },
    [contract]
  );

  const getProjectsCount = useCallback(async () => {
    if (!contract) return 0;
    return await contract.getProjectsCount();
  }, [contract]);

  const creatorApproval = useCallback(
    async (projectId, approval) => {
      if (!contract) return false;
      setLoading(true);
      setError(null);
      try {
        if (approval) {
          await contract.approveProject(projectId);
        } else {
          await contract.rejectProject(projectId);
        }
        return true;
      } catch (err: any) {
        setError(err.message || "Failed to approve/reject project");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [contract]
  );

  // You can implement markProjectCompleted if you extend the contract

  return {
    createProject,
    getProject,
    getProjectsCount,
    creatorApproval,
    loading,
    error,
  };
};
