import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Ticket, MessageSquare, Activity, Users, LogOut } from 'lucide-react';

export default function Layout({ children }) {
  const { admin, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-800">
          icm Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link 
            to="/dashboard" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition ${location.pathname === '/dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </Link>
          <Link 
            to="/products" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition ${location.pathname === '/products' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Package size={20} />
            <span>Inventory</span>
          </Link>
          <Link 
            to="/orders" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition ${location.pathname === '/orders' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <ShoppingBag size={20} />
            <span>Orders</span>
          </Link>
          <Link 
            to="/coupons" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition ${location.pathname === '/coupons' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Ticket size={20} />
            <span>Promotions</span>
          </Link>
          <Link 
            to="/customers" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition ${location.pathname === '/customers' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Users size={20} />
            <span>Customers</span>
          </Link>
          
          <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            System
          </div>
          <Link 
            to="/chat-logs" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition ${location.pathname === '/chat-logs' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <MessageSquare size={20} />
            <span>AI Logs</span>
          </Link>
          <Link 
            to="/monitoring" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition ${location.pathname === '/monitoring' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Activity size={20} />
            <span>System Health</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-800">
          {admin?.fallbackMode && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/50 rounded-lg text-amber-500 text-xs">
              <p className="font-bold uppercase mb-1 flex items-center">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse mr-2"></span>
                Fallback Active
              </p>
              Primary database is offline. Viewing backup data.
            </div>
          )}
          <p className="text-sm text-gray-400 mb-4 px-2">Logged in as {admin?.name}</p>
          <button onClick={logout} className="w-full flex items-center justify-center space-x-2 bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white py-2.5 rounded-xl transition duration-300 font-bold text-sm">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
