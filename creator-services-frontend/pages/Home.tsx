import { Box, Heading, Text, Button, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const Home = () => (
  <Box maxW="2xl" mx="auto" mt={20} p={8} textAlign="center">
    <VStack spacing={6}>
      <Heading size="2xl">Decentralized Creator Services</Heading>
      <Text fontSize="xl">
        Connect, collaborate, and transact securely with creators using blockchain-powered escrow and reputation.
      </Text>
      <Button as={RouterLink} to="/dashboard" colorScheme="blue" size="lg">
        Go to Dashboard
      </Button>
      <Button as={RouterLink} to="/create-service" colorScheme="teal" variant="outline">
        Create a Service
      </Button>
    </VStack>
  </Box>
);

export default Home;
