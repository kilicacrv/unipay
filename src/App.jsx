import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import Venues from './pages/Venues';
import BusinessForm from './pages/BusinessForm';
import Register from './pages/Register';
import VerifyStudent from './pages/VerifyStudent';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col font-inter bg-background text-dark">
        <Navbar />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mekanlar" element={<Venues />} />
            <Route path="/isletme-basvurusu" element={<BusinessForm />} />
            <Route path="/kayit" element={<Register />} />
            <Route path="/dogrulama" element={<VerifyStudent />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
