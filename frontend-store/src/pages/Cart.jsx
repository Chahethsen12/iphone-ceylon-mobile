import { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { formatCurrency } from '../utils/formatCurrency';
import { FaTrash, FaCheckCircle } from 'react-icons/fa';
import FadeInUp from '../components/animations/FadeInUp';
import api from '../utils/api';

export default function Cart() {
  const cart = useCartStore((state) => state.cart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Checkout Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    district: 'Colombo'
  });

  // Calculate Subtotal
  const subtotal = cart.reduce((total, item) => {
    const itemPrice = item.price + (item.variant ? item.variant.priceModifier : 0);
    return total + (itemPrice * item.quantity);
  }, 0);

  // Sri Lankan Delivery Logic
  const deliveryFee = formData.district === 'Colombo' ? 400 : 800;
  const grandTotal = subtotal > 0 ? subtotal + deliveryFee : 0;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setLoading(true);
    try {
      // Structure the data to match your backend OrderModel
      const orderData = {
        customerInfo: formData,
        orderItems: cart.map(item => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price + (item.variant ? item.variant.priceModifier : 0),
          selectedVariant: item.variant || {}
        })),
        deliveryFee,
        totalAmount: grandTotal,
        paymentMethod: 'COD' // Defaulting to Cash on Delivery for MVP
      };

      // Dispatch real Order to the Backend
      const { data } = await api.post('/orders', orderData);
      console.log('Order created successfully:', data);
      
      setSuccess(true);
      setLoading(false);
      clearCart(); 

    } catch (error) {
      console.error("Checkout failed", error);
      alert(error.response?.data?.message || "Checkout failed. Please try again.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center pt-20 px-4">
        <FaCheckCircle className="text-green-500 w-24 h-24 mb-6" />
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Order Placed!</h1>
        <p className="text-gray-400 text-center max-w-md">
          Thank you, {formData.name}. We will contact you at {formData.phone} shortly to confirm your Cash on Delivery order.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-28 pb-20 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold tracking-tight mb-12">Review your bag.</h1>

        {cart.length === 0 ? (
          <p className="text-gray-400 text-xl">Your bag is empty.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Side: Cart Items */}
            <div className="lg:col-span-2 space-y-8">
              {cart.map((item, index) => (
                <FadeInUp key={index} delay={index * 0.1}>
                  <div className="flex items-center bg-[#1c1c1e] p-6 rounded-3xl border border-gray-800">
                    <img 
                      src={item.images?.[0] || "https://res.cloudinary.com/dhemuaeyh/image/upload/v1704255532/iphone-15-pro_oqz6v4.png"} 
                      alt={item.name} 
                      className="w-24 h-24 object-contain mr-6"
                    />
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold">{item.name}</h3>
                      <p className="text-gray-400 text-sm mt-1">
                        {item.variant ? `${item.variant.storage} - ${item.variant.color}` : 'Standard'}
                      </p>
                      <p className="text-lg font-medium mt-2">
                        {formatCurrency(item.price + (item.variant ? item.variant.priceModifier : 0))}
                      </p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item._id, item.variant?.color)}
                      className="text-gray-500 hover:text-red-500 transition p-2"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </FadeInUp>
              ))}
            </div>

            {/* Right Side: Checkout Form */}
            <FadeInUp delay={0.3}>
              <div className="bg-[#1c1c1e] p-8 rounded-3xl border border-gray-800">
                <h2 className="text-2xl font-semibold mb-6">Checkout</h2>
                
                <div className="space-y-4 mb-8 border-b border-gray-800 pb-8">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Delivery ({formData.district})</span>
                    <span>{formatCurrency(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-semibold pt-4">
                    <span>Total</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                <form onSubmit={handleCheckout} className="space-y-4">
                  <input required type="text" name="name" placeholder="Full Name" onChange={handleInputChange} className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition" />
                  <input required type="tel" name="phone" placeholder="Phone Number (e.g., 077...)" onChange={handleInputChange} className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition" />
                  <input required type="text" name="address" placeholder="Street Address" onChange={handleInputChange} className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input required type="text" name="city" placeholder="City" onChange={handleInputChange} className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition" />
                    <select name="district" onChange={handleInputChange} className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition">
                      <option value="Colombo">Colombo</option>
                      <option value="Outstation">Outstation</option>
                    </select>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500 rounded-xl p-4 mt-6">
                    <p className="text-blue-400 text-sm font-medium text-center">Payment Method: Cash on Delivery</p>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-white text-black py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition mt-6 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </button>
                </form>
              </div>
            </FadeInUp>

          </div>
        )}
      </div>
    </div>
  );
}
