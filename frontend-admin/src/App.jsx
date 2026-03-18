import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProductsDashboard from './pages/ProductsDashboard';
import OrdersDashboard from './pages/OrdersDashboard';
import CouponsDashboard from './pages/CouponsDashboard';
import ChatLogs from './pages/ChatLogs';
import Monitoring from './pages/Monitoring';
import Customers from './pages/Customers';

export default function App() {
  const { admin } = useAuth();

  if (!admin) {
    return <Login />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<ProductsDashboard />} />
          <Route path="/orders" element={<OrdersDashboard />} />
          <Route path="/coupons" element={<CouponsDashboard />} />
          <Route path="/chat-logs" element={<ChatLogs />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/customers" element={<Customers />} />
        </Routes>
      </Layout>
    </Router>
  );
}
