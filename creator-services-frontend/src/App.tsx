import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from '../contexts/WalletContext';
import Navbar from '../components/common/Navbar';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import CreateService from '../pages/CreateService';
import NotFound from '../pages/NotFound';
import './index.css';

function App() {
  return (
    <WalletProvider>
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create-service" element={<CreateService />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </Router>
    </WalletProvider>
  );
}

export default App;
