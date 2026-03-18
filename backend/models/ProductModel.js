import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // e.g., 'iPhone', 'MacBook', 'Accessories'
  price: { type: Number, required: true }, // Base price in LKR
  stock: { type: Number, required: true, default: 0 },
  images: [{ type: String }], // Array of image URLs (Cloudinary)
  variants: [{
    color: String,
    storage: String,
    priceModifier: Number // Extra cost for higher storage (e.g., 256GB adds Rs. 40,000)
  }],
  isFeatured: { type: Boolean, default: false }, // True for products in the GSAP hero section
  isFlashSale: { type: Boolean, default: false } // Trigger for discounted/marketing highlights
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
