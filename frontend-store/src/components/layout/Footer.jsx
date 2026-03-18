import { FaApple, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-900 pt-20 pb-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center text-2xl font-bold tracking-tight text-white mb-6">
              <FaApple className="mr-2" /> icm
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Experience the future of mobile excellence. Hand-selected, premium iPhones delivered across Sri Lanka.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Explore</h4>
            <ul className="space-y-4 text-gray-500 text-sm">
              <li><Link to="/catalog" className="hover:text-white transition">Store</Link></li>
              <li><Link to="/catalog?category=Mac" className="hover:text-white transition">Mac</Link></li>
              <li><Link to="/catalog?category=iPad" className="hover:text-white transition">iPad</Link></li>
              <li><Link to="/catalog?category=Phones" className="hover:text-white transition">iPhone</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Support</h4>
            <ul className="space-y-4 text-gray-500 text-sm">
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition">Shipping Info</a></li>
              <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Follow</h4>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-white transition text-2xl"><FaInstagram /></a>
              <a href="#" className="text-gray-500 hover:text-white transition text-2xl"><FaTwitter /></a>
              <a href="#" className="text-gray-500 hover:text-white transition text-2xl"><FaYoutube /></a>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-600 text-xs gap-4">
          <p>© 2026 iPhone Ceylon Mobile (icm). All rights reserved.</p>
          <div className="flex space-x-6">
            <span>Powered by Gemini AI</span>
            <span>Sri Lanka</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
