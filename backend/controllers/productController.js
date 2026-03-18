import Product from '../models/ProductModel.js';
import mongoose from 'mongoose';
import { rtdb } from '../config/firebase.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public (Anyone can see products)
export const getProducts = async (req, res) => {
  try {
    // 1. Try fetching from MongoDB first
    const products = await Product.find({});
    return res.status(200).json(products);
  } catch (error) {
    console.error('MongoDB failed to fetch products, falling back to Firebase...', error.message);
    
    // 2. Read Fallback: If Mongo fails, fetch from Firebase Realtime Database
    try {
      const snapshot = await rtdb.ref('products').once('value');
      const data = snapshot.val();
      const backupProducts = data ? Object.keys(data).map(key => ({ _id: key, ...data[key] })) : [];
      res.setHeader('X-Fallback-Mode', 'true');
      return res.status(200).json(backupProducts);
    } catch (fbError) {
      console.error('Firebase fallback also failed', fbError);
      return res.status(500).json({ message: 'Failed to fetch products from both databases' });
    }
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      return res.status(200).json(product);
    }
    return res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    console.error('MongoDB failed to fetch product by ID, falling back to Firebase...', error.message);
    
    try {
      const snapshot = await rtdb.ref('products/' + req.params.id).once('value');
      const data = snapshot.val();
      if (data) {
        return res.status(200).json({ _id: req.params.id, ...data });
      }
      return res.status(404).json({ message: 'Product not found in fallback DB' });
    } catch (fbError) {
      return res.status(500).json({ message: 'Failed to fetch product from both databases' });
    }
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock, variants, isFeatured, isFlashSale } = req.body;

    const productData = {
      name,
      description,
      category,
      price,
      stock,
      variants: variants || [],
      isFeatured: isFeatured || false,
      isFlashSale: isFlashSale || false,
      createdAt: new Date().toISOString()
    };

    let createdProduct = productData;
    let mongoSuccess = false;

    // 1. Try Primary MongoDB Save
    if (mongoose.connection.readyState === 1) {
      try {
        const product = new Product(productData);
        const savedProduct = await product.save();
        createdProduct = savedProduct.toObject();
        mongoSuccess = true;
      } catch (mongoErr) {
        console.error('MongoDB failed to create product:', mongoErr.message);
      }
    } else {
      createdProduct._id = new mongoose.Types.ObjectId().toString();
    }

    // 2. Dual Write: Replicate to Firebase
    try {
      const docId = createdProduct._id.toString();
      await rtdb.ref('products/' + docId).set({
        name: createdProduct.name,
        description: createdProduct.description,
        category: createdProduct.category,
        price: createdProduct.price,
        stock: createdProduct.stock,
        variants: createdProduct.variants || [],
        isFeatured: createdProduct.isFeatured || false,
        isFlashSale: createdProduct.isFlashSale || false,
        createdAt: createdProduct.createdAt
      });
      console.log('Firebase mirrored product creation successfully');
    } catch (fbError) {
      console.error('Firebase mirroring failed:', fbError.message);
      if (!mongoSuccess) throw new Error(`Total database failure: ${fbError.message}`);
    }

    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create product', error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock, variants, isFeatured } = req.body;

    let product = null;
    if (mongoose.connection.readyState === 1) {
       product = await Product.findById(req.params.id);
    }

    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.category = category || product.category;
      product.price = price || product.price;
        product.stock = stock !== undefined ? stock : product.stock;
      product.variants = variants || product.variants;
      product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
      product.isFlashSale = isFlashSale !== undefined ? isFlashSale : product.isFlashSale;

      const updatedProduct = await product.save();

      // Dual Write: Update in Firebase
      try {
        await rtdb.ref('products/' + req.params.id).update({
          name: updatedProduct.name,
          description: updatedProduct.description,
          category: updatedProduct.category,
          price: updatedProduct.price,
          stock: updatedProduct.stock,
          variants: updatedProduct.variants || [],
          isFeatured: updatedProduct.isFeatured,
          isFlashSale: updatedProduct.isFlashSale
        });
        console.log('Firebase mirrored product update successfully');
      } catch (fbError) {
        console.error('Firebase mirroring failed:', fbError.message);
      }

      res.status(200).json(updatedProduct);
    } else {
      // If mongo fails, we still try to update Firebase if the mongo ID exists
      try {
        await rtdb.ref('products/' + req.params.id).update({
          ...(name && { name }),
          ...(description && { description }),
          ...(category && { category }),
          ...(price && { price }),
          ...(stock !== undefined && { stock }),
          ...(variants && { variants }),
          ...(isFeatured !== undefined && { isFeatured }),
          ...(isFlashSale !== undefined && { isFlashSale })
        });
        return res.status(200).json({ message: 'Updated in fallback database only' });
      } catch (fbError) {
        res.status(404).json({ message: 'Product not found in both databases' });
      }
    }
  } catch (error) {
    res.status(400).json({ message: 'Failed to update product', error: error.message });
  }
};

// @desc    Bulk update product prices by category
// @route   POST /api/products/bulk-price
// @access  Private/Admin
export const bulkUpdatePrice = async (req, res) => {
  try {
    const { category, percentage } = req.body;
    const factor = 1 + (percentage / 100);

    const query = category === 'All' ? {} : { category };
    
    // 1. Update in MongoDB
    if (mongoose.connection.readyState === 1) {
       await Product.updateMany(query, { $mul: { price: factor } });
    }

    // 2. Replicate to Firebase (More intensive since Firebase doesn't have updateMany)
    try {
       const snapshot = await rtdb.ref('products').once('value');
       const data = snapshot.val();
       if (data) {
          const updates = {};
          Object.keys(data).forEach(key => {
             if (category === 'All' || data[key].category === category) {
                updates[`products/${key}/price`] = Math.round(data[key].price * factor);
             }
          });
          await rtdb.ref().update(updates);
       }
    } catch (fbError) {
       console.error('Firebase bulk update failed:', fbError.message);
    }

    res.status(200).json({ message: 'Bulk price update successful' });
  } catch (error) {
    res.status(500).json({ message: 'Bulk update failed', error: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    let productDeleted = false;
    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(req.params.id);
      if (product) {
        await product.deleteOne();
        productDeleted = true;
      }
    }

    // Dual Write: Remove from Firebase
    try {
      await rtdb.ref('products/' + req.params.id).remove();
      console.log('Firebase mirrored product deletion successfully');
      res.status(200).json({ message: 'Product removed' });
    } catch (fbError) {
      if (productDeleted) {
        res.status(200).json({ message: 'Product removed from Mongo, but Firebase mirror failed' });
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};
