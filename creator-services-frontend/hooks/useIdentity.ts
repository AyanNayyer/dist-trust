import { useContext } from 'react';
import { IdentityContext } from '../contexts/IdentityContext';

export const useIdentity = () => {
  const context = useContext(IdentityContext);
  
  if (context === undefined) {
    throw new Error('useIdentity must be used within an IdentityProvider');
  }
  
  return context;
};
