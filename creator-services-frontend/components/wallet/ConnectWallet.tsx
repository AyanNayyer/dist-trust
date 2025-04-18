import { Button, Text } from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
import { FaWallet } from 'react-icons/fa';
import { useWallet } from '../../hooks/useWallet';
import { shortenAddress } from '../../utils/formatters';

const ConnectWallet = () => {
  const { account, connectWallet, disconnectWallet, isConnecting, error } = useWallet();
  const toast = useToast();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (err: any) {
      toast({
        title: 'Connection Error',
        description: err.message || 'Failed to connect wallet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center">
        <Text color="red.500" mb={2}>{error}</Text>
        <Button colorScheme="blue" onClick={handleConnect}>
          Try Again
        </Button>
      </div>
    );
  }

  if (account) {
    return (
      <div className="flex items-center">
        <Button
          colorScheme="teal"
          variant="outline"
          leftIcon={<FaWallet />}
          onClick={disconnectWallet}
          className="mr-2"
        >
          {shortenAddress(account)}
        </Button>
      </div>
    );
  }

  return (
    <Button
      colorScheme="blue"
      leftIcon={<FaWallet />}
      onClick={handleConnect}
      isLoading={isConnecting}
      loadingText="Connecting"
    >
      Connect Wallet
    </Button>
  );
};

export default ConnectWallet;
