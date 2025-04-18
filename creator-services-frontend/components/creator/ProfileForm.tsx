import { useState } from 'react';
import {
  Box,
  Button,
  Input,
  Textarea,
  VStack,
  Heading,
  Text,
  Select,
  HStack,
  Badge
} from '@chakra-ui/react';
import { FormControl, FormLabel, FormErrorMessage, FormHelperText } from '@chakra-ui/form-control';
import { useToast } from '@chakra-ui/toast';
import { useWallet } from '../../hooks/useWallet';
import { useIdentity } from '../../hooks/useIdentity';

const categories = [
  'Design',
  'Development',
  'Writing',
  'Translation',
  'Marketing',
  'Music',
  'Video',
  'Art'
];

const ProfileForm = () => {
  const { isConnected } = useWallet();
  const { identity, createIdentity, isCreatingIdentity, verifyIdentity, isVerifyingIdentity } = useIdentity();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    category: '',
    skills: '',
    contactEmail: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCreateIdentity = async () => {
    try {
      await createIdentity();
      toast({
        title: 'Identity Created',
        description: 'Your decentralized identity has been created successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create identity',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleVerifyIdentity = async () => {
    try {
      await verifyIdentity();
      toast({
        title: 'Identity Verified',
        description: 'Your identity has been verified successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify identity',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identity.did) {
      toast({
        title: 'Identity Required',
        description: 'Please create a decentralized identity first.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // In a real implementation, this would save profile data to a database or IPFS
    // and potentially register the profile on the blockchain
    console.log('Submitting profile data:', { ...formData, did: identity.did });
    
    toast({
      title: 'Profile Saved',
      description: 'Your creator profile has been saved successfully.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  if (!isConnected) {
    return (
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
        <Text>Please connect your wallet to create a profile.</Text>
      </Box>
    );
  }

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
      <Heading as="h2" size="lg" mb={6}>Create Creator Profile</Heading>
      
      <Box mb={6}>
        <Heading as="h3" size="md" mb={2}>Identity Verification</Heading>
        
        {identity.did ? (
          <Box p={3} bg="gray.50" borderRadius="md">
            <Text mb={2}>DID: {identity.did}</Text>
            <HStack>
              <Badge colorScheme={identity.isVerified ? "green" : "yellow"}>
                {identity.isVerified ? "Verified" : "Unverified"}
              </Badge>
              
              {!identity.isVerified && (
                <Button 
                  size="sm" 
                  colorScheme="teal" 
                  onClick={handleVerifyIdentity}
                  isLoading={isVerifyingIdentity}
                >
                  Verify Identity
                </Button>
              )}
            </HStack>
          </Box>
        ) : (
          <Button
            colorScheme="blue"
            onClick={handleCreateIdentity}
            isLoading={isCreatingIdentity}
            mb={3}
          >
            Create Decentralized Identity
          </Button>
        )}
      </Box>
      
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="flex-start">
          <FormControl isRequired>
            <FormLabel>Full Name</FormLabel>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Professional Title</FormLabel>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Graphic Designer, Developer, Writer"
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell clients about yourself and your services"
              rows={4}
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Primary Category</FormLabel>
            <Select 
              name="category" 
              value={formData.category} 
              onChange={handleChange}
              placeholder="Select category"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Select>
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Skills (comma separated)</FormLabel>
            <Input
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. React, Solidity, Web Design"
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Contact Email</FormLabel>
            <Input
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="Your email address"
            />
          </FormControl>
          
          <Button 
            mt={4} 
            colorScheme="teal" 
            type="submit" 
            isDisabled={!identity.did}
            width="100%"
          >
            Save Profile
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default ProfileForm;
