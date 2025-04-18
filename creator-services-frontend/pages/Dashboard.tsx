import { Box, Heading, Text, VStack, Spinner, Alert } from "@chakra-ui/react";
import { AlertIcon } from '@chakra-ui/alert';
import { useWallet } from "../hooks/useWallet";
import ProfileForm from "../components/creator/ProfileForm";

const Dashboard = () => {
  const { isConnected, account } = useWallet();

  if (!isConnected) {
    return (
      <Box mt={10}>
        <Alert status="warning">
          <AlertIcon />
          Please connect your wallet to access the dashboard.
        </Alert>
      </Box>
    );
  }

  return (
    <Box maxW="4xl" mx="auto" mt={10} p={6}>
      <Heading mb={6}>Dashboard</Heading>
      <VStack align="stretch" spacing={8}>
        <Box>
          <Text fontWeight="bold">Your Wallet Address:</Text>
          <Text>{account}</Text>
        </Box>
        <ProfileForm />
        {/* Add more dashboard widgets/components here */}
      </VStack>
    </Box>
  );
};

export default Dashboard;
