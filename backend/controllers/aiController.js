import { askGemini } from '../services/geminiService.js';
import Product from '../models/ProductModel.js';
import AiLog from '../models/AiLog.js';
import { rtdb } from '../config/firebase.js';

// @desc    Get AI product recommendations
// @route   POST /api/ai/chat
// @access  Public
export const getAiRecommendation = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Please provide a prompt' });
    }

    // 1. Fetch only IN-STOCK products
    let availableProducts = [];
    try {
      availableProducts = await Product.find({ stock: { $gt: 0 } }).select(
        'name category price description variants'
      ).maxTimeMS(3000);
    } catch (mongoErr) {
      console.error('MongoDB failed to fetch products for AI, falling back to Firebase...', mongoErr.message);
      try {
        const snapshot = await rtdb.ref('products').once('value');
        const data = snapshot.val();
        if (data) {
          availableProducts = Object.keys(data)
            .map(key => ({ _id: key, ...data[key] }))
            .filter(p => p.stock > 0);
        }
      } catch (fbError) {
        console.error('Firebase AI fallback also failed', fbError.message);
      }
    }

    // 2. Send the user's prompt and the inventory to Gemini
    const aiResponse = await askGemini(prompt, availableProducts);

    // 3. Persist Log for Admin review
    try {
       await AiLog.create({ question: prompt, answer: aiResponse });
    } catch (logErr) {
       console.error('Failed to save AI log:', logErr.message);
    }

    // 4. Return the AI's intelligent response to the frontend
    res.status(200).json({
      success: true,
      answer: aiResponse,
    });
  } catch (error) {
    res.status(500).json({ message: 'AI Recommendation failed', error: error.message });
  }
};

// @desc    Get all AI interaction logs
// @route   GET /api/ai/logs
// @access  Private/Admin
export const getAiLogs = async (req, res) => {
  try {
    const logs = await AiLog.find({}).sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch AI logs' });
  }
};
