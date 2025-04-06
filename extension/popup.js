// DOM Elements Manager
const dom = (() => {
    const elements = {
        spendingAmount: 'spending-amount',
        submitPurchase: 'submit-purchase',
        productName: 'product-name',
        productPrice: 'product-price',
        productQuantity: 'product-quantity',
        homepage: 'homepage',
        cartItems: 'cart-items',
        cartTotal: 'cart-total',
        budgetAmount: 'budget-amount',
        setBudget: 'set-budget',
        weeklyAmount: 'weekly-amount',
        userNotes: 'user-notes' // notes contenteditable
    };

    const domObj = {};
    Object.entries(elements).forEach(([key, value]) => {
        domObj[key] = document.getElementById(value);
    });
    return domObj;
})();

// Configuration
const API_BASE_URL = 'http://localhost:3001';
const USER_ID = 'chrome-extension-user';

// State Manager
const state = {
    allocatedBudget: 0,
    cartTotal: 0,
    cartItems: [],
    weeklyLimit: 0,
    notes: '', // stores your notes

    init: async function() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/${USER_ID}`);
            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            this.syncState(data);
            updateCartItems(this.cartItems);
            updateDisplay();
        } catch (error) {
            console.error('Failed to initialize state:', error);
            await this.loadLocalFallback();
        }
    },

    syncState: function(data) {
        this.allocatedBudget = Number(data.allocatedBudget) || 0;
        this.cartTotal = Number(data.cartTotal) || 0;
        this.cartItems = Array.isArray(data.cartItems) ? data.cartItems : [];
        this.weeklyLimit = Number(data.weeklyLimit) || 0;
        this.notes = data.notes || '';

        if (dom.weeklyAmount) dom.weeklyAmount.textContent = this.weeklyLimit.toFixed(2);
        if (dom.userNotes) dom.userNotes.textContent = this.notes;
    },

    loadLocalFallback: async function() {
        const result = await chrome.storage.local.get([
            'allocatedBudget', 'cartTotal', 'cartItems', 'weeklyLimit', 'notes'
        ]);

        this.allocatedBudget = Math.max(0, Number(result.allocatedBudget) || 0);
        this.cartTotal = Number(result.cartTotal) || 0;
        this.cartItems = Array.isArray(result.cartItems) ? result.cartItems : [];
        this.weeklyLimit = Number(result.weeklyLimit) || 0;
        this.notes = result.notes || '';

        if (dom.weeklyAmount) dom.weeklyAmount.textContent = this.weeklyLimit.toFixed(2);
        if (dom.userNotes) dom.userNotes.textContent = this.notes;

        updateCartItems(this.cartItems);
        updateDisplay();
    },

    save: async function() {
        const data = {
            userId: USER_ID,
            allocatedBudget: this.allocatedBudget,
            cartTotal: this.cartTotal,
            cartItems: this.cartItems,
            weeklyLimit: this.weeklyLimit,
            notes: this.notes
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/user/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to save');

            const result = await response.json();
            this.syncState(result);

            await chrome.storage.local.set(data);
            console.log('Saved to server and local storage');
        } catch (error) {
            console.error('Failed to save to server:', error);
            // fallback to local storage if server fails
            await chrome.storage.local.set(data);
        }
    }
};

// Utility Functions
const formatCurrency = amount => {
    const numericValue = Number(amount) || 0;
    return numericValue.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

// Core Functions
function updateDisplay() {
    if (!dom.spendingAmount || !dom.cartTotal) return;

    const remainingWeeklyBudget = state.weeklyLimit - state.cartTotal;

    dom.spendingAmount.textContent = formatCurrency(remainingWeeklyBudget);
    dom.spendingAmount.style.color = remainingWeeklyBudget < 0 ? '#ef4444' : '#34d399';
    dom.cartTotal.textContent = formatCurrency(state.cartTotal);
    dom.weeklyAmount.textContent = state.weeklyLimit.toFixed(2);

    dom.spendingAmount.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.2)' },
        { transform: 'scale(1)' }
    ], { duration: 300 });
}

function updateCartItems(items) {
    if (!dom.cartItems) return;

    dom.cartItems.textContent = '';
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-header">
                <div class="item-source">${item.source === 'amazon' ? 'Amazon' : 'Manual'}</div>
                <span class="item-name">${item.name}</span>
            </div>
            <div class="cart-item-details">
                <span class="quantity">${item.quantity}</span>
                <span class="item-price">Total: ${formatCurrency(item.price)}</span>
            </div>
        `;
        dom.cartItems.appendChild(div);
    });
}

// Event Handlers
async function handlePurchaseSubmit(event) {
    event.preventDefault();
    try {
        const productName = dom.productName.value.trim();
        const rawPrice = dom.productPrice.value.replace(/[^0-9.]/g, '');
        const price = parseFloat(rawPrice);
        const quantity = Math.max(1, parseInt(dom.productQuantity.value) || 1);

        if (!productName || isNaN(price) || price <= 0) {
            alert('Please enter valid product name and positive price!');
            return;
        }

        state.cartItems.push({
            name: productName,
            price: price,
            quantity: quantity,
            source: 'manual',
            lineTotal: price * quantity
        });

        state.cartTotal = state.cartItems.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
        await state.save();
        updateCartItems(state.cartItems);

        dom.productName.value = '';
        dom.productPrice.value = '';
        dom.productQuantity.value = '1';
    } catch (error) {
        console.error('Purchase submission error:', error);
        alert('Failed to add purchase.');
    }
}

async function handleCartUpdate(request) {
    if (request.type === 'CART_UPDATE') {
        const amazonItems = request.items.map(item => ({
            ...item,
            source: 'amazon',
            lineTotal: (item.price || 0) * (item.quantity || 1)
        }));

        // Remove old Amazon items before adding new
        state.cartItems = [
            ...state.cartItems.filter(item => item.source !== 'amazon'),
            ...amazonItems
        ];

        state.cartTotal = state.cartItems.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
        await state.save();
        updateCartItems(state.cartItems);
    }
}

async function handleSetBudget() {
    const budgetValue = parseFloat(dom.budgetAmount.value);
    if (!isNaN(budgetValue)) {
        state.allocatedBudget = budgetValue;
        await state.save();
        dom.budgetAmount.value = '';
    } else {
        alert('Please enter a valid budget amount!');
    }
}

// Listeners
function setupWeeklyLimitListener() {
    if (!dom.weeklyAmount) return;

    dom.weeklyAmount.addEventListener('blur', async () => {
        const value = parseFloat(dom.weeklyAmount.textContent);
        if (!isNaN(value)) {
            state.weeklyLimit = value;
            await state.save();
        } else {
            dom.weeklyAmount.textContent = state.weeklyLimit.toFixed(2);
            alert('Please enter a valid amount!');
        }
    });

    dom.weeklyAmount.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            dom.weeklyAmount.blur();
        }
    });

    dom.weeklyAmount.addEventListener('input', (e) => {
        // Only allow digits and decimal point
        const text = e.target.textContent;
        if (!/^[\d.]*$/.test(text)) {
            e.target.textContent = text.replace(/[^\d.]/g, '');
        }
    });
}

function setupNotesListener() {
    if (!dom.userNotes) return;

    // Save notes on blur
    dom.userNotes.addEventListener('blur', async () => {
        state.notes = dom.userNotes.textContent.trim();
        await state.save();
    });

    // If user presses Enter, also commit changes
    dom.userNotes.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            dom.userNotes.blur();
        }
    });
}

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    await state.init();

    dom.submitPurchase?.addEventListener('click', handlePurchaseSubmit);
    dom.setBudget?.addEventListener('click', handleSetBudget);
    dom.homepage?.addEventListener('click', () => {
        chrome.tabs.create({ url: 'http://localhost:3000' });
    });

    setupWeeklyLimitListener();
    setupNotesListener();

    chrome.runtime.onMessage.addListener(handleCartUpdate);

    chrome.storage.onChanged.addListener(async (changes) => {
        if (changes.allocatedBudget) {
            state.allocatedBudget = Math.max(0, changes.allocatedBudget.newValue);
        }
        if (changes.cartTotal) {
            state.cartTotal = Math.max(0, changes.cartTotal.newValue);
        }
        if (changes.cartItems) {
            state.cartItems = Array.isArray(changes.cartItems.newValue) ? changes.cartItems.newValue : [];
        }
        if (changes.weeklyLimit) {
            state.weeklyLimit = Math.max(0, changes.weeklyLimit.newValue);
        }
        if (changes.notes) {
            state.notes = changes.notes.newValue || '';
        }

        updateDisplay();
        updateCartItems(state.cartItems);
        if (dom.userNotes) dom.userNotes.textContent = state.notes;
    });
});
