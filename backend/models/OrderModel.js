import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerInfo: {
    name: { type: String, required: true },
    phone: { type: String, required: true }, // Critical for WhatsApp/Courier contact
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true } // Determines delivery fee
  },
  orderItems: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    selectedVariant: { color: String, storage: String }
  }],
  deliveryFee: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['COD', 'Bank Transfer'], required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Verified', 'Failed'], default: 'Pending' },
  bankSlipUrl: { type: String }, // Only filled if Bank Transfer is chosen
  orderStatus: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
