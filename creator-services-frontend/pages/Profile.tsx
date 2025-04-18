import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import ProfileForm from "../components/creator/ProfileForm";

const Profile = () => (
  <Box maxW="2xl" mx="auto" mt={10} p={6}>
    <VStack align="stretch" spacing={8}>
      <Heading>My Profile</Heading>
      <Text mb={4}>Manage your creator profile and identity information here.</Text>
      <ProfileForm />
    </VStack>
  </Box>
);

export default Profile;
