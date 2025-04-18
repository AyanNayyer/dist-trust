// Shorten Ethereum address for display
export const shortenAddress = (address: string, chars = 4): string => {
    if (!address) return '';
    return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`;
  };
  
  // Format ETH amount with 4 decimal places
  export const formatEth = (wei: string | number): string => {
    if (!wei) return '0';
    return parseFloat(ethers.utils.formatEther(wei)).toFixed(4);
  };
  