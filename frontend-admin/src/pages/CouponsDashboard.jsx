import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaToggleOn, FaToggleOff, FaTicketAlt } from 'react-icons/fa';
import apiAuth from '../utils/apiAuth';
import Skeleton from 'react-loading-skeleton';

export default function CouponsDashboard() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    expiryDate: '',
    minPurchase: '0'
  });

  const fetchCoupons = async () => {
    try {
      const { data } = await apiAuth.get('/coupons');
      setCoupons(data);
    } catch (error) {
      console.error("Failed to fetch coupons", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiAuth.post('/coupons', formData);
      setIsModalOpen(false);
      setFormData({ code: '', discountType: 'percentage', discountValue: '', expiryDate: '', minPurchase: '0' });
      fetchCoupons();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create coupon");
    }
  };

  const handleToggle = async (id) => {
    try {
      await apiAuth.put(`/coupons/${id}/toggle`);
      setCoupons(coupons.map(c => c._id === id ? { ...c, isActive: !c.isActive } : c));
    } catch (error) {
      console.error("Failed to toggle coupon", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this coupon code?")) {
      try {
        await apiAuth.delete(`/coupons/${id}`);
        setCoupons(coupons.filter(c => c._id !== id));
      } catch (error) {
        console.error("Failed to delete coupon", error);
      }
    }
  };

  if (loading) return <div className="p-8"><Skeleton count={5} height={60} /></div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Promotions & Coupons</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold flex items-center transition shadow-md"
        >
          <FaPlus className="mr-2" /> Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div key={coupon._id} className={`bg-white p-6 rounded-2xl border ${coupon.isActive ? 'border-gray-100 shadow-sm' : 'border-gray-200 opacity-60'} relative group transition duration-300`}>
             <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                   <FaTicketAlt size={24} />
                </div>
                <div className="flex space-x-1">
                   <button onClick={() => handleToggle(coupon._id)} className="p-2 text-gray-400 hover:text-blue-600 transition">
                      {coupon.isActive ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                   </button>
                   <button onClick={() => handleDelete(coupon._id)} className="p-2 text-gray-400 hover:text-red-500 transition">
                      <FaTrash size={18} />
                   </button>
                </div>
             </div>
             <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase mb-1">{coupon.code}</h3>
                <p className="text-sm text-gray-500 font-medium">
                   {coupon.discountType === 'percentage' ? `${coupon.discountValue}% Off` : `Rs. ${coupon.discountValue.toLocaleString()} Off`}
                </p>
             </div>
             <div className="mt-6 pt-6 border-t border-gray-50 space-y-2">
                <div className="flex justify-between text-xs">
                   <span className="text-gray-400">Min. Purchase:</span>
                   <span className="font-bold text-gray-700">Rs. {coupon.minPurchase.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                   <span className="text-gray-400">Expires:</span>
                   <span className={`font-bold ${new Date(coupon.expiryDate) < new Date() ? 'text-red-500' : 'text-gray-700'}`}>
                      {new Date(coupon.expiryDate).toLocaleDateString()}
                   </span>
                </div>
             </div>
          </div>
        ))}

        {coupons.length === 0 && (
          <div className="col-span-full py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
             <FaTicketAlt size={48} className="mb-4 opacity-20" />
             <p className="font-medium text-lg text-gray-500">No active promotions.</p>
             <p className="text-sm">Click "Create Coupon" to start a campaign.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-50">
              <h2 className="text-2xl font-black text-gray-900">New Promotion</h2>
              <p className="text-sm text-gray-500">Create a discount code for your customers.</p>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Coupon Code</label>
                <input required type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-lg font-black focus:ring-2 focus:ring-blue-500 outline-none" placeholder="E.G. PROMO2026" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Type</label>
                  <select value={formData.discountType} onChange={(e) => setFormData({...formData, discountType: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="percentage">Percent</option>
                    <option value="fixed">Fixed Rs.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Value</label>
                  <input required type="number" value={formData.discountValue} onChange={(e) => setFormData({...formData, discountValue: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="10" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Min. Purchase (Rs.)</label>
                <input required type="number" value={formData.minPurchase} onChange={(e) => setFormData({...formData, minPurchase: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="5000" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Expiry Date</label>
                <input required type="date" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
