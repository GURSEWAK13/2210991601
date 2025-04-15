import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TopUsers from './components/TopUsers';
import TrendingPosts from './components/TrendingPosts';
import Feed from './components/Feed';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>Social Media Analytics Dashboard</h1>
          <nav>
            <ul className="nav-links">
              <li><Link to="/">Feed</Link></li>
              <li><Link to="/trending">Trending Posts</Link></li>
              <li><Link to="/top-users">Top Users</Link></li>
            </ul>
          </nav>
        </header>
        
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/trending" element={<TrendingPosts />} />
            <Route path="/top-users" element={<TopUsers />} />
          </Routes>
        </main>
        
        <footer className="app-footer">
          <p>Social Media Analytics Dashboard &copy; 2025</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
