import { useState, useEffect } from 'react';
import { FaCheckCircle, FaClock, FaBox, FaTruck, FaBan, FaEllipsisH } from 'react-icons/fa';
import { ShoppingBag, Filter, FileText, ChevronRight } from 'lucide-react';
import apiAuth from '../utils/apiAuth';

export default function OrdersDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchOrders = async () => {
    try {
      const { data } = await apiAuth.get('/orders');
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.orderStatus === filter);

  const statusIcons = {
    'Processing': <FaClock className="mr-1.5" />,
    'Packed': <FaBox className="mr-1.5" />,
    'Shipped': <FaTruck className="mr-1.5" />,
    'Delivered': <FaCheckCircle className="mr-1.5" />,
    'Cancelled': <FaBan className="mr-1.5" />
  };

  const generateInvoice = async (order) => {
    try {
      const response = await apiAuth.get(`/orders/${order._id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${order._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Failed to download invoice", error);
      alert("Failed to download invoice.");
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await apiAuth.put(`/orders/${id}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update order status.");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Packed': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Processing': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <FaCheckCircle className="mr-1.5" />;
      case 'Shipped': return <FaTruck className="mr-1.5" />;
      case 'Packed': return <FaBox className="mr-1.5" />;
      case 'Processing': return <FaClock className="mr-1.5" />;
      case 'Cancelled': return <FaBan className="mr-1.5" />;
      default: return <FaEllipsisH className="mr-1.5" />;
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-xl text-gray-500">Loading orders...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
           <p className="text-gray-500 mt-1">Track and fulfill customer shipments.</p>
        </div>
        
        <div className="flex items-center bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
           <div className="px-3 text-gray-400">
              <Filter size={16} />
           </div>
           <div className="flex space-x-1">
              {['All', 'Pending', 'Processing', 'Shipped', 'Delivered'].map(s => (
                 <button 
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${filter === s ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                 >
                    {s}
                 </button>
              ))}
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[10px] uppercase font-black tracking-widest">
              <th className="p-6">Order ID</th>
              <th className="p-6">Customer</th>
              <th className="p-6">Date</th>
              <th className="p-6">Total Amount</th>
              <th className="p-6">Status</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredOrders.map((order) => (
              <tr key={order._id} className="group hover:bg-gray-50/80 transition duration-200">
                <td className="p-6 font-mono text-xs text-gray-400">
                  #{order._id.substring(order._id.length - 8).toUpperCase()}
                </td>
                <td className="p-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{order.customerInfo.name}</span>
                    <span className="text-xs text-gray-400">{order.customerInfo.city}</span>
                  </div>
                </td>
                <td className="p-6 text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="p-6">
                  <span className="font-black text-gray-900 text-lg">Rs. {order.totalAmount.toLocaleString()}</span>
                </td>
                <td className="p-6">
                  <div className="relative inline-block">
                    <select 
                      value={order.orderStatus}
                      onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                      className={`appearance-none pl-10 pr-8 py-2 rounded-xl text-xs font-bold border transition focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer ${
                        order.orderStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        order.orderStatus === 'Cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}
                    >
                      {Object.keys(statusIcons).map(status => (
                         <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {statusIcons[order.orderStatus] || statusIcons['Processing']}
                    </div>
                  </div>
                </td>
                <td className="p-6 text-right">
                   <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => generateInvoice(order)}
                        title="Download Invoice"
                        className="p-3 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition duration-300"
                      >
                         <FileText size={16} />
                      </button>
                      <button className="p-3 text-gray-400 hover:bg-gray-100 rounded-xl transition">
                         <ChevronRight size={16} />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="6" className="p-20 text-center">
                  <div className="flex flex-col items-center">
                    <ShoppingBag size={48} className="text-gray-100 mb-4" />
                    <p className="text-gray-400 font-bold italic text-lg">No orders found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
