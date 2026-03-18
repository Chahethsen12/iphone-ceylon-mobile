import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails'; // <--- Added this import!
import GeminiChatbot from './components/ai/GeminiChatbot';
import Cart from './pages/Cart'; 

// Dummy component for the route we haven't built yet
import Footer from './components/layout/Footer';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-black">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </main>
        <Footer />
        <GeminiChatbot />
      </div>
    </Router>
  );
}
