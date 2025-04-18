import { ChakraProvider, Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from '../contexts/WalletContext';
import { IdentityProvider } from '../contexts/IdentityContext';
import Navbar from '../components/common/Navbar';
import Home from '../pages/Home';
import Profile from '../pages/Profile';
import CreateService from '../pages/CreateService';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';

function App() {
  return (
    <ChakraProvider>
      <WalletProvider>
        <IdentityProvider>
          <Router>
            <Navbar />
            <Box as="main" p={4} maxW="container.xl" mx="auto">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/create-service" element={<CreateService />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Box>
          </Router>
        </IdentityProvider>
      </WalletProvider>
    </ChakraProvider>
  );
}

export default App;

