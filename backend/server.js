require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Data Model
const budgetSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    allocatedBudget: { type: Number, default: 0 },
    weeklyLimit: { type: Number, default: 0 },
    cartTotal: { type: Number, default: 0 },
    cartItems: [{
        name: String,
        price: Number,
        quantity: Number,
        source: String,
        lineTotal: Number
    }],
    notes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Budget = mongoose.model('Budget', budgetSchema);

// API Routes
app.put('/api/user/update', async (req, res) => {
    try {
        const {
            userId,
            allocatedBudget,
            weeklyLimit,
            cartTotal,
            cartItems,
            notes
        } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const updateData = {
            allocatedBudget: Number(allocatedBudget) || 0,
            weeklyLimit: Number(weeklyLimit) || 0,
            cartTotal: Number(cartTotal) || 0,
            cartItems: Array.isArray(cartItems) ? cartItems : [],
            notes: notes || '',
            updatedAt: new Date()
        };

        const result = await Budget.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { upsert: true, new: true, runValidators: true }
        );

        res.json(result);
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({
            error: 'Server error while updating data',
            details: error.message
        });
    }
});

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
                notes: ''
            });
        }

        res.json(data);
    } catch (error) {
        console.error('Load error:', error);
        res.status(500).json({
            error: 'Server error while loading data',
            details: error.message
        });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
