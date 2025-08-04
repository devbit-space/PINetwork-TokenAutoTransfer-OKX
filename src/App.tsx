import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import WalletConnection from './components/WalletConnection';
import WalletStatus from './components/WalletStatus';
import ConfigValidator from './components/ConfigValidator';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <h1>Wallet Manager</h1>
          <p>Connect your OKX wallet and manage ETH transactions across multiple networks</p>
        </header>

        <nav className="navigation">
          <div className="nav-links">
            <Link to="/" className="nav-link">Wallet Connection</Link>
            <Link to="/status" className="nav-link">Wallet Status</Link>
          </div>
        </nav>

        <main className="app-main">
          <ConfigValidator />
          
          <Routes>
            <Route path="/" element={<WalletConnection />} />
            <Route path="/status" element={<WalletStatus />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
