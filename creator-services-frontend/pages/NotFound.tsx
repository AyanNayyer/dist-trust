import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const NotFound = () => (
  <Box textAlign="center" py={20}>
    <Heading size="2xl" mb={4}>404</Heading>
    <Text fontSize="xl" mb={8}>Page Not Found</Text>
    <Button as={RouterLink} to="/" colorScheme="blue">
      Go Home
    </Button>
  </Box>
);

export default NotFound;
