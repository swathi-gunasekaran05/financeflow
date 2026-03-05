import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Shared from './pages/Shared';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">💰</span>
          <span>FinanceFlow</span>
        </div>
        <span className="header-tagline">Your personal finance tracker</span>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddTransaction />} />
          <Route path="/history" element={<History />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/shared" element={<Shared />} />
        </Routes>
      </main>

      <Navbar />
    </div>
  );
}

export default App;
