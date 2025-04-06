require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ------------------
//  SCHEMA & MODEL
// ------------------
const budgetSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    allocatedBudget: { type: Number, default: 0 },
    weeklyLimit: { type: Number, default: 0 },
    cartTotal: { type: Number, default: 0 },
    // Items still in the cart (not purchased)
    cartItems: [{
        name: String,
        price: Number,
        quantity: Number,
        source: String,
        lineTotal: Number,
        addedToCartAt: { type: Date },
        purchasedAt: { type: Date, default: null }
    }],
    // Items that have been purchased
    purchased: [{
        name: String,
        price: Number,
        quantity: Number,
        source: String,
        lineTotal: Number,
        addedToCartAt: { type: Date },
        purchasedAt: { type: Date }
    }],
    notes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Budget = mongoose.model('Budget', budgetSchema);

// ------------------
//   UPDATE API
// ------------------
app.put('/api/user/update', async (req, res) => {
    try {
        const {
            userId,
            allocatedBudget,
            weeklyLimit,
            cartTotal,
            cartItems,
            purchased,
            notes
        } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        // Normalize cartItems
        const normalizedCartItems = (Array.isArray(cartItems) ? cartItems : []).map(item => {
            const now = new Date();
            return {
                ...item,
                addedToCartAt: item.addedToCartAt ? new Date(item.addedToCartAt) : now,
                purchasedAt: item.purchasedAt ? new Date(item.purchasedAt) : null
            };
        });

        // Normalize purchased items
        const normalizedPurchased = (Array.isArray(purchased) ? purchased : []).map(item => {
            const now = new Date();
            return {
                ...item,
                addedToCartAt: item.addedToCartAt ? new Date(item.addedToCartAt) : now,
                purchasedAt: item.purchasedAt ? new Date(item.purchasedAt) : now
            };
        });

        const updateData = {
            allocatedBudget: Number(allocatedBudget) || 0,
            weeklyLimit: Number(weeklyLimit) || 0,
            cartTotal: Number(cartTotal) || 0,
            cartItems: normalizedCartItems,
            purchased: normalizedPurchased,
            notes: notes || '',
            updatedAt: new Date()
        };

        const result = await Budget.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { upsert: true, new: true, runValidators: true }
        );

        return res.json(result);
    } catch (error) {
        console.error('Update error:', error);
        return res.status(500).json({
            error: 'Server error while updating data',
            details: error.message
        });
    }
});

// ------------------
//    GET API
// ------------------
app.get('/api/user/:userId', async (req, res) => {
    try {
        const data = await Budget.findOne({ userId: req.params.userId });
        if (!data) {
            return res.json({
                userId: req.params.userId,
                allocatedBudget: 0,
                weeklyLimit: 0,
                cartTotal: 0,
                cartItems: [],
                purchased: [],
                notes: ''
            });
        }
        return res.json(data);
    } catch (error) {
        console.error('Load error:', error);
        return res.status(500).json({
            error: 'Server error while loading data',
            details: error.message
        });
    }
});

// ------------------
//    MONGODB INIT
// ------------------
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
