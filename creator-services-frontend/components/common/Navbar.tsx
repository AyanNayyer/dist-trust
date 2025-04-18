import { Link as RouterLink } from "react-router-dom";
import { Box, Flex, HStack, Link, Spacer, Heading } from "@chakra-ui/react";
import ConnectWallet from "../wallet/ConnectWallet";

const Navbar = () => (
  <Box bg="blue.700" px={4} py={3} color="white" boxShadow="sm">
    <Flex align="center">
      <Heading as={RouterLink} to="/" size="md" color="white">
        Creator Services
      </Heading>
      <HStack spacing={6} ml={10}>
        <Link as={RouterLink} to="/" _hover={{ textDecoration: "underline" }}>
          Home
        </Link>
        <Link as={RouterLink} to="/dashboard" _hover={{ textDecoration: "underline" }}>
          Dashboard
        </Link>
        <Link as={RouterLink} to="/create-service" _hover={{ textDecoration: "underline" }}>
          Create Service
        </Link>
        <Link as={RouterLink} to="/profile" _hover={{ textDecoration: "underline" }}>
          Profile
        </Link>
      </HStack>
      <Spacer />
      <ConnectWallet />
    </Flex>
  </Box>
);

export default Navbar;
