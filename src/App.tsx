import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import Help from './pages/Help';
import Examples from './pages/Examples';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/help" element={<Help />} />
        <Route path="/examples" element={<Examples />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </Router>
  );
}

export default App;
