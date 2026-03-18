import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import FadeInUp from '../animations/FadeInUp';

export default function ProductCard({ product }) {
  // Use the first image if available, else a placeholder
  const imageUrl = product.images?.length > 0 
    ? product.images[0] 
    : "https://res.cloudinary.com/dhemuaeyh/image/upload/v1704255532/iphone-15-pro_oqz6v4.png";

  return (
    <FadeInUp>
      <Link to={`/product/${product._id}`} className="group block">
        <div className="bg-[#1c1c1e] rounded-3xl p-6 flex flex-col items-center justify-between h-[450px] hover:scale-[1.02] transition-transform duration-500 cursor-pointer">
          
          <div className="text-center mt-4">
            <h3 className="text-2xl font-semibold text-white tracking-tight">{product.name}</h3>
            <p className="text-gray-400 mt-1 text-sm line-clamp-2">{product.description}</p>
          </div>

          <img 
            src={imageUrl} 
            alt={product.name} 
            className="w-48 h-48 object-contain my-6 group-hover:scale-105 transition-transform duration-500"
          />

          <div className="text-center">
            <p className="text-white text-lg font-medium">{formatCurrency(product.price)}</p>
            <div className="mt-4 px-4 py-2 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-200 transition">
              Buy
            </div>
          </div>

        </div>
      </Link>
    </FadeInUp>
  );
}
