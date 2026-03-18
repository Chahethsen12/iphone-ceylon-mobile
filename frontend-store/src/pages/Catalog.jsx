import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import FadeInUp from '../components/animations/FadeInUp';
import { FaChevronDown } from 'react-icons/fa';

// Reusable Typewriter Component
const TypewriterText = ({ text, delay = 40 }) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let i = 0;
    setDisplayText(''); // Reset text when navigating between categories
    
    const intervalId = setInterval(() => {
      setDisplayText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(intervalId);
      }
    }, delay);

    return () => clearInterval(intervalId);
  }, [text, delay]);

  return (
    <span className="relative">
      {displayText}
      {/* Blinking cursor effect */}
      <span className="animate-pulse border-r-2 border-gray-500 ml-1 h-full"></span>
    </span>
  );
};

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [sortBy, setSortBy] = useState('Latest');
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Read the category from the URL (set by the Navbar)
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeCategory = searchParams.get('category') || 'All';

  // Fetch products on initial load
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load catalog products', err);
        setError('Failed to load products. Please check your connection.');
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 1. FILTER products based on the URL category
  let displayProducts = activeCategory === 'All' 
    ? [...products] 
    : products.filter(product => product.category === activeCategory);

  // 2. SORT products based on dropdown selection
  if (sortBy === 'Price: Low to High') {
    displayProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'Price: High to Low') {
    displayProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'In Stock') {
    displayProducts = displayProducts.filter(product => product.stock > 0);
  } else {
    // 'Latest' - default sorting by database creation date
    displayProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const sortOptions = ['Latest', 'Price: Low to High', 'Price: High to Low', 'In Stock'];

  // Loading and Error States
  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center pt-20 text-white text-xl">Loading Store...</div>;
  if (error) return <div className="min-h-screen bg-black flex items-center justify-center pt-20 text-red-500 text-xl">{error}</div>;

  return (
    <div className="min-h-screen bg-black pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <FadeInUp>
          <div className="mb-12 border-b border-gray-800 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            
            {/* Title & Typewriter Subtitle */}
            <div className="flex flex-col">
              {activeCategory === 'All' ? (
                <>
                  <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-2">
                    Store.
                  </h1>
                  <div className="text-2xl md:text-3xl font-medium text-gray-500 tracking-tight">
                    <TypewriterText text="The best way to buy the products you love." delay={50} />
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-2">
                    Shop {activeCategory}.
                  </h1>
                  <div className="text-2xl md:text-3xl font-medium text-gray-500 tracking-tight">
                    <TypewriterText text={`Explore our latest ${activeCategory} lineup.`} delay={50} />
                  </div>
                </>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative z-20 mb-2">
              <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#1c1c1e] text-gray-300 border border-gray-800 hover:text-white hover:border-gray-500 transition-all text-sm font-medium"
              >
                <span>Sort: {sortBy}</span>
                <FaChevronDown className={`w-3 h-3 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#2c2c2e] border border-gray-700 rounded-2xl shadow-xl overflow-hidden z-30">
                  {sortOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setIsSortOpen(false); // Close menu after click
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        sortBy === option 
                          ? 'bg-blue-600 text-white font-semibold' 
                          : 'text-gray-300 hover:bg-[#3a3a3c] hover:text-white'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        </FadeInUp>

        {/* Product Grid */}
        {displayProducts.length === 0 ? (
          <FadeInUp delay={0.2}>
            <div className="text-gray-400 text-center text-xl mt-20">
              No {activeCategory !== 'All' ? activeCategory : 'products'} available right now. Check back soon!
            </div>
          </FadeInUp>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {displayProducts.map((product, index) => (
              <div key={product._id} style={{ animationDelay: `${index * 0.1}s` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
