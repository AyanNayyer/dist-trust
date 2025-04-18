import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { IdentityProvider } from './contexts/IdentityContext';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import CreateService from './pages/CreateService';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ChakraProvider>
      <WalletProvider>
        <IdentityProvider>
          <Router>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/create-service" element={<CreateService />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </IdentityProvider>
      </WalletProvider>
    </ChakraProvider>
  );
}

export default App;
