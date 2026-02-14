import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';

import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import SearchResults from './pages/SearchResults';

import { OverlayProvider } from './context/OverlayContext';
import MovieOverviewOverlay from './components/MovieOverviewOverlay';

function App() {
  return (
    <AuthProvider>
      <OverlayProvider>
        <Router>
          <div className="relative min-h-screen bg-dark">
            <MovieOverviewOverlay />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/" element={<Home />} />
              <Route path="/popular" element={<Home />} />
              {/* <Route path="/movie/:id" element={<MovieDetail />} />  -- Page effectively bypassed by overlay */}
            </Routes>
          </div>
        </Router>
      </OverlayProvider>
    </AuthProvider>
  );
}

export default App;
