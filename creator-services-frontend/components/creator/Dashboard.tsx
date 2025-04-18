import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  HStack,
  VStack,
  Badge,
  Text,
  Card,
  CardHeader,
  CardBody,
  Button,
  useColorModeValue,
  Alert,
  AlertIcon,
  Spinner,
  Center
} from '@chakra-ui/react';
import { useWallet } from '../hooks/useWallet';
import { useIdentity } from '../hooks/useIdentity';
import { useEscrow } from '../hooks/useEscrow';
import { useReputation } from '../hooks/useReputation';
import ProfileForm from '../components/creator/ProfileForm';

const Dashboard = () => {
  const { isConnected, account } = useWallet();
  const { identity } = useIdentity();
  const { getRatingDetails } = useReputation();
  const { getProject } = useEscrow();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [ratingDetails, setRatingDetails] = useState<{ average: number; total: number; count: number } | null>(null);
  const [loading, setLoading] = useState(false);
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const statsBg = useColorModeValue('blue.50', 'blue.900');
  
  useEffect(() => {
    const loadData = async () => {
      if (account) {
        setLoading(true);
        try {
          // Load rating details
          const ratingData = await getRatingDetails(account);
          setRatingDetails(ratingData);
          
          // Load projects (mock implementation - replace with actual contract calls)
          const tempProjects = [];
          for (let i = 0; i < 3; i++) {
            const project = await getProject(i);
            if (project) tempProjects.push(project);
          }
          setProjects(tempProjects.filter(p => p.provider === account));
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, [account, getRatingDetails, getProject]);
  
  if (!isConnected) {
    return (
      <Box p={5}>
        <Alert status="warning">
          <AlertIcon />
          Please connect your wallet to view your dashboard.
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box p={4}>
      <Heading as="h1" size="xl" mb={6}>Creator Dashboard</Heading>
      
      {/* Identity Status */}
      <Box mb={6} p={4} borderWidth="1px" borderRadius="lg" bg={cardBg}>
        <Heading as="h2" size="md" mb={3}>Identity Status</Heading>
        {identity.did ? (
          <VStack align="start" spacing={2}>
            <HStack>
              <Text fontWeight="bold">DID:</Text>
              <Text>{`${identity.did.substring(0, 20)}...`}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold">Status:</Text>
              <Badge colorScheme={identity.isVerified ? "green" : "yellow"}>
                {identity.isVerified ? "Verified" : "Unverified"}
              </Badge>
            </HStack>
          </VStack>
        ) : (
          <Alert status="info">
            <AlertIcon />
            Create an identity in the Profile tab to start offering services
          </Alert>
        )}
      </Box>
      
      {/* Stats Overview */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} mb={6}>
        <Stat p={4} borderRadius="lg" bg={statsBg}>
          <StatLabel>Active Projects</StatLabel>
          <StatNumber>{projects.length}</StatNumber>
          <StatHelpText>Currently in progress</StatHelpText>
        </Stat>
        
        <Stat p={4} borderRadius="lg" bg={statsBg}>
          <StatLabel>Total Earnings</StatNumber>
          <StatNumber>
            {projects
              .filter(p => p.status)
              .reduce((sum, p) => sum + parseFloat(p.amount), 0)
              .toFixed(2)} ETH
          </StatNumber>
          <StatHelpText>Completed projects</StatHelpText>
        </Stat>
        
        <Stat p={4} borderRadius="lg" bg={statsBg}>
          <StatLabel>Average Rating</StatLabel>
          <StatNumber>
            {loading ? <Spinner size="sm" /> : ratingDetails?.average ?? 'N/A'}
          </StatNumber>
          <StatHelpText>
            {ratingDetails ? `From ${ratingDetails.count} reviews` : 'No reviews yet'}
          </StatHelpText>
        </Stat>
      </Grid>
      
      {/* Main Dashboard Tabs */}
      <Tabs colorScheme="blue" variant="enclosed">
        <TabList>
          <Tab>Active Projects</Tab>
          <Tab>Reputation</Tab>
          <Tab>Profile</Tab>
        </TabList>
        
        <TabPanels>
          {/* Active Projects Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              {projects.length > 0 ? (
                projects.map((project, index) => (
                  <Card key={index} borderWidth="1px" borderRadius="lg">
                    <CardHeader bg="gray.50">
                      <Heading size="md">Project #{index}</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack align="start" spacing={2}>
                        <Text>Client: {project.client}</Text>
                        <Text>Amount: {project.amount} ETH</Text>
                        <Text>Status: {project.status ? 'Completed' : 'In Progress'}</Text>
