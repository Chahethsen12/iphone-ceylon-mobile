import { useState, useEffect } from 'react';
import { User, Phone, MapPin, ShoppingBag, DollarSign, Search } from 'lucide-react';
import apiAuth from '../utils/apiAuth';
import Skeleton from 'react-loading-skeleton';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCustomers = async () => {
    try {
      const { data } = await apiAuth.get('/orders');
      
      // Group unique customers by phone number
      const customerMap = {};
      data.forEach(order => {
        const phone = order.customerInfo.phone;
        if (!customerMap[phone]) {
          customerMap[phone] = {
            name: order.customerInfo.name,
            phone: phone,
            city: order.customerInfo.city,
            totalSpent: 0,
            orderCount: 0,
            orders: []
          };
        }
        customerMap[phone].totalSpent += order.totalAmount;
        customerMap[phone].orderCount += 1;
        customerMap[phone].orders.push(order);
      });

      setCustomers(Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent));
    } catch (error) {
      console.error("Failed to fetch customer data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  if (loading) return <div className="p-8"><Skeleton count={6} height={100} className="mb-4" /></div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Customer Relationship Manager</h1>
           <p className="text-gray-500 mt-1">Analyze customer loyalty and spending patterns.</p>
        </div>
        <div className="relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-64 bg-white shadow-sm transition"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredCustomers.map((customer, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between hover:border-blue-200 transition duration-300">
             <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                   {customer.name.charAt(0)}
                </div>
                <div>
                   <h3 className="text-lg font-bold text-gray-900">{customer.name}</h3>
                   <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                      <span className="flex items-center"><Phone size={14} className="mr-1" /> {customer.phone}</span>
                      <span className="flex items-center"><MapPin size={14} className="mr-1" /> {customer.city}</span>
                   </div>
                </div>
             </div>

             <div className="flex items-center space-x-8 mt-4 md:mt-0">
                <div className="text-center">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Spent</p>
                   <p className="text-lg font-black text-blue-600">Rs. {customer.totalSpent.toLocaleString()}</p>
                </div>
                <div className="text-center">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Orders</p>
                   <p className="text-lg font-black text-gray-900">{customer.orderCount}</p>
                </div>
                <div className="text-center pt-1">
                   {customer.totalSpent > 500000 ? (
                      <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase">VIP MEMBER</span>
                   ) : (
                      <span className="bg-gray-100 text-gray-400 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase">Standard</span>
                   )}
                </div>
             </div>
          </div>
        ))}

        {filteredCustomers.length === 0 && (
          <div className="py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
             <User size={48} className="mx-auto text-gray-300 mb-4" />
             <p className="text-gray-500 font-bold">No customers found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
