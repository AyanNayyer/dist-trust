import { useState } from 'react';
import {
  Box,
  Heading,
  Input,
  Button,
  VStack
} from '@chakra-ui/react';
import { FormControl, FormLabel, FormErrorMessage, FormHelperText } from '@chakra-ui/form-control';
import { useToast } from '@chakra-ui/toast';
import { useEscrow } from '../hooks/useEscrow';
import { useWallet } from '../hooks/useWallet';

const CreateService = () => {
  const { account } = useWallet();
  const { createProject, loading, error } = useEscrow();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    provider: '',
    amount: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account) {
      toast({
        title: 'Wallet not connected',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return;
    }
    
    try {
      const projectId = await createProject(formData.provider, formData.amount);
      
      toast({
        title: 'Project Created',
        description: `Project ID: ${projectId}`,
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      
      // Reset form
      setFormData({ provider: '', amount: '' });
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  return (
    <Box p={4} maxW="600px" mx="auto">
      <Heading mb={6}>Create New Service Contract</Heading>
      
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Provider Address</FormLabel>
            <Input
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              placeholder="0x..."
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Service Amount (ETH)</FormLabel>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.1"
            />
          </FormControl>
          
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={loading}
            loadingText="Creating..."
            width="full"
          >
            Create Service Contract
          </Button>
          
          {error && (
            <Text color="red.500" mt={2}>
              Error: {error}
            </Text>
          )}
        </VStack>
      </form>
    </Box>
  );
};

export default CreateService;
