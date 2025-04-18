import { createContext, useState, useEffect, ReactNode } from 'react';
import * as DIDKit from '@spruceid/didkit-wasm';
import { useWallet } from '../hooks/useWallet';

interface Identity {
  did: string | null;
  verifiableCredential: any | null;
  isVerified: boolean;
}

interface IdentityContextType {
  identity: Identity;
  createIdentity: () => Promise<void>;
  verifyIdentity: () => Promise<void>;
  isCreatingIdentity: boolean;
  isVerifyingIdentity: boolean;
  error: string | null;
}

export const IdentityContext = createContext<IdentityContextType>({
  identity: { did: null, verifiableCredential: null, isVerified: false },
  createIdentity: async () => {},
  verifyIdentity: async () => {},
  isCreatingIdentity: false,
  isVerifyingIdentity: false,
  error: null
});

interface IdentityProviderProps {
  children: ReactNode;
}

export const IdentityProvider = ({ children }: IdentityProviderProps) => {
  const { account, signer } = useWallet();
  const [identity, setIdentity] = useState<Identity>({
    did: null,
    verifiableCredential: null,
    isVerified: false
  });
  const [isCreatingIdentity, setIsCreatingIdentity] = useState(false);
  const [isVerifyingIdentity, setIsVerifyingIdentity] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load identity from localStorage if available
  useEffect(() => {
    if (account) {
      const savedIdentity = localStorage.getItem(`identity-${account}`);
      if (savedIdentity) {
        setIdentity(JSON.parse(savedIdentity));
      } else {
        // Reset identity if none saved for this account
        setIdentity({
          did: null,
          verifiableCredential: null,
          isVerified: false
        });
      }
    }
  }, [account]);

  // Create DID identity using SpruceID
  const createIdentity = async () => {
    if (!account || !signer) {
      setError('Wallet must be connected to create identity');
      return;
    }

    setIsCreatingIdentity(true);
    setError(null);

    try {
      // Generate a key for the DID
      const key = await DIDKit.generateEd25519Key();
      
      // Create DID from key
      const did = DIDKit.keyToDID('key', key);
      
      // Create a verifiable credential
      const verifiableCredential = {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://www.w3.org/2018/credentials/examples/v1'
        ],
        'type': ['VerifiableCredential', 'CreatorCredential'],
        'issuer': did,
        'issuanceDate': new Date().toISOString(),
        'credentialSubject': {
          'id': did,
          'ethereumAddress': account
        }
      };
      
      // Save the new identity
      const newIdentity = {
        did,
        verifiableCredential,
        isVerified: false
      };
      
      setIdentity(newIdentity);
      localStorage.setItem(`identity-${account}`, JSON.stringify(newIdentity));
      
    } catch (err: any) {
      console.error('Error creating identity:', err);
      setError(err.message || 'Failed to create identity');
    } finally {
      setIsCreatingIdentity(false);
    }
  };

  // Verify identity (this would typically involve more steps with a verification authority)
  const verifyIdentity = async () => {
    if (!account || !identity.did) {
      setError('Must have a wallet connected and identity created');
      return;
    }

    setIsVerifyingIdentity(true);
    setError(null);

    try {
      // In a real implementation, this would involve signature verification
      // and potentially interaction with a verification authority
      
      // For demo purposes, we'll just mark it as verified
      const verifiedIdentity = {
        ...identity,
        isVerified: true
      };
      
      setIdentity(verifiedIdentity);
      localStorage.setItem(`identity-${account}`, JSON.stringify(verifiedIdentity));
      
    } catch (err: any) {
      console.error('Error verifying identity:', err);
      setError(err.message || 'Failed to verify identity');
    } finally {
      setIsVerifyingIdentity(false);
    }
  };

  return (
    <IdentityContext.Provider
      value={{
        identity,
        createIdentity,
        verifyIdentity,
        isCreatingIdentity,
        isVerifyingIdentity,
        error
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
};
