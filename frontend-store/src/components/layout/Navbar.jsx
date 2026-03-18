import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiSearch } from 'react-icons/fi';
import { FaApple } from 'react-icons/fa';
import { useCartStore } from '../../store/cartStore';

export default function Navbar() {
  const cartItemCount = useCartStore((state) => state.totalItems());
  const navigate = useNavigate();

  // Helper function to navigate and filter
  const handleNavClick = (category) => {
    if (category === 'All') {
      navigate('/catalog');
    } else {
      navigate(`/catalog?category=${category}`);
    }
  };

  return (
    <nav className="fixed top-0 w-full glass-dark z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          <Link to="/" className="flex items-center text-xl font-bold tracking-tight text-white hover:text-gray-300 transition">
            <FaApple className="w-5 h-5 mb-1 mr-1" />
            <span>icm</span>
          </Link>
          
          {/* UPDATED: Nav links now trigger the filter function */}
          <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-300">
            <button onClick={() => handleNavClick('All')} className="hover:text-white transition">Store</button>
            <button onClick={() => handleNavClick('Mac')} className="hover:text-white transition">Mac</button>
            <button onClick={() => handleNavClick('iPad')} className="hover:text-white transition">iPad</button>
            <button onClick={() => handleNavClick('Phones')} className="hover:text-white transition">iPhone</button>
            <button onClick={() => handleNavClick('Accessories')} className="hover:text-white transition">Accessories</button>
          </div>

          <div className="flex space-x-6 text-gray-300 items-center">
            <FiSearch className="w-5 h-5 hover:text-white cursor-pointer transition" />
            <Link to="/cart" className="relative">
              <FiShoppingBag className="w-5 h-5 hover:text-white transition" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
