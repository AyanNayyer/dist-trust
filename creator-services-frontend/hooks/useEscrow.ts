// src/hooks/useEscrow.ts
import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';

const PROJECT_MANAGER_ADDRESS = "0xEDee3CE33063b5BeFc38584475093Ec88eF51305";

const PROJECT_MANAGER_ABI = [
  "event ProjectCreated(uint256 indexed projectId, address indexed client, address indexed creator, uint256 amount, string title, string description, uint256 deadline)",
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
          
          // The way to properly extract event args in ethers.js
          if (receipt.logs) {
            for (const log of receipt.logs) {
              try {
                const parsedLog = contract.interface.parseLog(log);
                if (parsedLog && parsedLog.name === 'ProjectCreated') {
                  return parsedLog.args.projectId.toNumber();
                }
              } catch (e) {
                console.warn("Failed to parse log:", e);
              }
            }
          }
          
          console.warn("Could not extract projectId from logs:", receipt);
          return null;
        } catch (err) {
          setError(err.message || "Failed to create project");
          return null;
        } finally {
          setLoading(false);
        }
      },
      [contract]
    );

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
            id: projectId,
            client,
            provider: creator,
            amount: ethers.utils.formatEther(amount),
            title,
            description,
            deadline: deadline.toNumber(),
            status: status,
          };
        } catch (err) {
          console.error(`Error fetching project ${projectId}:`, err);
          // Don't set global error for individual project fetch failures
          // This allows the loop to continue with other projects
          return null;
        }
      },
      [contract]
    );
    

    const getProjectsCount = useCallback(async () => {
      console.log("Calling getProjectsCount");
      
      if (!contract) {
        console.log("No contract instance available");
        return 0;
      }
      
      try {
        const count = await contract.getProjectsCount();
        console.log("Projects count:", count.toString());
        // Convert BigNumber to number
        return count.toNumber();
      } catch (err) {
        console.error("Error in getProjectsCount:", err);
        throw err;
      }
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

  return {
    createProject,
    getProject,
    getProjectsCount,
    creatorApproval,
    loading,
    error,
  };
};
