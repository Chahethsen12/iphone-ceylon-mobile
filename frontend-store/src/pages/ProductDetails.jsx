import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCartStore } from '../store/cartStore';
import { formatCurrency } from '../utils/formatCurrency';
import FadeInUp from '../components/animations/FadeInUp';
import { FaChevronLeft, FaCheck } from 'react-icons/fa';

export default function ProductDetails() {
  const { id } = useParams(); // Grab the product ID from the URL
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
        // Auto-select the first variant if available
        if (response.data.variants && response.data.variants.length > 0) {
          setSelectedVariant(response.data.variants[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product", error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, selectedVariant);
    setAdded(true);
    // Reset the "Added" button state after 2 seconds
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center pt-20">Loading...</div>;
  if (!product) return <div className="min-h-screen bg-black text-white flex items-center justify-center pt-20">Product not found.</div>;

  // Calculate the final price based on the selected storage variant
  const finalPrice = product.price + (selectedVariant ? selectedVariant.priceModifier : 0);
  const imageUrl = product.images?.length > 0 ? product.images[0] : "https://res.cloudinary.com/dhemuaeyh/image/upload/v1704255532/iphone-15-pro_oqz6v4.png";

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white transition mb-12">
          <FaChevronLeft className="mr-2" /> Back to Store
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Product Image */}
          <FadeInUp>
            <div className="bg-[#1c1c1e] rounded-3xl p-12 flex justify-center items-center h-[500px]">
              <img src={imageUrl} alt={product.name} className="max-h-full object-contain" />
            </div>
          </FadeInUp>

          {/* Right Side: Product Info & Actions */}
          <FadeInUp delay={0.2}>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">{product.name}</h1>
              <p className="text-xl text-gray-400 mb-8">{product.description}</p>
              
              <div className="text-3xl font-semibold mb-8">
                {formatCurrency(finalPrice)}
              </div>

              {/* Variants Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Storage Options</h3>
                  <div className="flex flex-col space-y-3">
                    {product.variants.map((variant) => (
                      <button
                        key={variant._id || variant.storage}
                        onClick={() => setSelectedVariant(variant)}
                        className={`flex justify-between items-center p-4 rounded-xl border-2 transition-all ${
                          selectedVariant?.storage === variant.storage 
                            ? 'border-blue-500 bg-blue-500/10' 
                            : 'border-gray-800 hover:border-gray-600'
                        }`}
                      >
                        <span className="font-medium">{variant.storage} - {variant.color}</span>
                        {variant.priceModifier > 0 && (
                          <span className="text-gray-400 text-sm">+ {formatCurrency(variant.priceModifier)}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`w-full py-4 rounded-full font-bold text-lg flex items-center justify-center transition-all ${
                  product.stock <= 0 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : added 
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-black hover:bg-gray-200'
                }`}
              >
                {product.stock <= 0 ? 'Out of Stock' : added ? <><FaCheck className="mr-2"/> Added to Cart</> : 'Add to Bag'}
              </button>
              
            </div>
          </FadeInUp>

        </div>
      </div>
    </div>
  );
}
