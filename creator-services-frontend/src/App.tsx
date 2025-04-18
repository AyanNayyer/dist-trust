import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="navbar">
    <div className="navbar-container container">
      <h1>Creator Services</h1>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/create-service">Create Service</Link>
        <Link to="/profile">Profile</Link>
      </div>
      <button className="btn">Connect Wallet</button>
    </div>
  </nav>
);

const Home = () => (
  <div className="container">
    <h1>Decentralized Creator Services</h1>
    <p>Connect, collaborate, and transact securely with creators.</p>
    <button className="btn">Get Started</button>
  </div>
);

const Dashboard = () => (
  <div className="container">
    <h1>Dashboard</h1>
    <p>Your dashboard content will appear here.</p>
  </div>
);

const Profile = () => (
  <div className="container">
    <h1>Profile</h1>
    <p>Your profile information will appear here.</p>
  </div>
);

const CreateService = () => (
  <div className="container">
    <h1>Create Service</h1>
    <p>Service creation form will appear here.</p>
  </div>
);

const NotFound = () => (
  <div className="container">
    <h1>404 - Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
  </div>
);

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-service" element={<CreateService />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

