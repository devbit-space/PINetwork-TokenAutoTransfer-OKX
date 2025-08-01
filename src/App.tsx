import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import WalletConnection from './components/WalletConnection';
import WalletStatus from './components/WalletStatus';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="header">
          <div className="container">
            <h1 style={{
              fontFamily: "'Cormorant Garamond', 'Crimson Text', serif",
              letterSpacing: "0.1em",
              color: "#1a365d",
              fontSize: "clamp(2.8rem, 7vw, 3rem)", 
              fontWeight: "600",
              textAlign: "center",
              textTransform: "capitalize",
              textShadow: "3px 3px 6px rgba(26,54,93,0.12)",
              position: "relative",
              padding: "0.75rem",
              lineHeight: "1.4",
              borderBottom: "2px solid rgba(26,54,93,0.08)",
              display: "inline-block",
              fontStyle: "italic"
            }}>ETH Wallet Manager</h1>
            <p>Connect your OKX wallet and manage ETH transfers</p>
          </div>
        </header>

        <nav className="navigation">
          <div className="container">
            <div className="nav-links">
              <Link to="/" className="nav-link">
                🏠 Wallet Connection
              </Link>
              <Link to="/status" className="nav-link">
                📊 Wallet Status
              </Link>
            </div>
          </div>
        </nav>

        <main className="main">
          <div className="container">
            <Routes>
              <Route path="/" element={<WalletConnection />} />
              <Route path="/status" element={<WalletStatus />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
