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
        setBudget: 'set-budget'
    };

    const domObj = {};
    Object.entries(elements).forEach(([key, value]) => {
        domObj[key] = document.getElementById(value);
    });
    return domObj;
})();

// State Manager
const state = {
    allocatedBudget: 0,
    cartTotal: 0,
    cartItems: [],
    init: async function() {
        const result = await chrome.storage.local.get(['allocatedBudget', 'cartTotal', 'cartItems']);
        this.allocatedBudget = Math.max(0, Number(result.allocatedBudget) || 0);
        this.cartTotal = Math.max(0, Number(result.cartTotal) || 0);
        this.cartItems = Array.isArray(result.cartItems) ? result.cartItems : [];
        updateCartItems(this.cartItems);
        updateDisplay();
    },
    save: function() {
        chrome.storage.local.set({
            allocatedBudget: this.allocatedBudget,
            cartTotal: this.cartTotal,
            cartItems: this.cartItems
        });
    }
};

// Utility Functions
const formatCurrency = amount => {
    const safeAmount = Math.max(0, Number(amount) || 0);
    return safeAmount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

// Core Functions
function updateDisplay() {
    if (!dom.spendingAmount || !dom.cartTotal) return;

    const remainingBudget = state.allocatedBudget - state.cartTotal;

    dom.spendingAmount.textContent = formatCurrency(remainingBudget);
    dom.spendingAmount.style.color = remainingBudget < 0 ? '#ef4444' : '#34d399';
    dom.cartTotal.textContent = formatCurrency(state.cartTotal);

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
                <div class="item-source">${item.source === 'amazon' ? '🛒 Amazon' : '📝 Manual'}</div>
                <span class="item-name">${sanitizeHTML(item.name)}</span>
                <span class="item-price">${formatCurrency(item.price)}</span>
            </div>
            <div class="cart-item-details">
                <span class="quantity">Qty: ${item.quantity}</span>
                <span class="total">Total: ${formatCurrency(item.price * item.quantity)}</span>
            </div>
        `;
        dom.cartItems.appendChild(div);
    });
}

// Event Handlers
function handlePurchaseSubmit(event) {
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
        state.save();
        updateDisplay();
        updateCartItems(state.cartItems);

        dom.productName.value = '';
        dom.productPrice.value = '';
        dom.productQuantity.value = '1';
    } catch (error) {
        console.error('Purchase submission error:', error);
        alert('Failed to add purchase. Please check inputs and try again.');
    }
}

function handleCartUpdate(request) {
    try {
        if (request.type === 'CART_UPDATE') {
            const amazonItems = request.items.map(item => ({
                ...item,
                source: 'amazon',
                lineTotal: (item.price || 0) * (item.quantity || 1)
            }));

            state.cartItems = [
                ...state.cartItems.filter(item => item.source !== 'amazon'),
                ...amazonItems
            ];

            state.cartTotal = state.cartItems.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
            state.save();
            updateDisplay();
            updateCartItems(state.cartItems);
        }
    } catch (error) {
        console.error('Cart update error:', error);
    }
}

// Helper Functions
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

function handleSetBudget() {
    const budgetValue = parseFloat(dom.budgetAmount.value);
    if (!isNaN(budgetValue) && budgetValue >= 0) {
        state.allocatedBudget = budgetValue;
        state.save();
        updateDisplay();
        dom.budgetAmount.value = '';
    } else {
        alert('Please enter a valid non-negative budget amount!');
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    await state.init();

    dom.submitPurchase?.addEventListener('click', handlePurchaseSubmit);
    dom.setBudget?.addEventListener('click', handleSetBudget);
    dom.homepage?.addEventListener('click', () => {
        chrome.tabs.create({ url: 'http://localhost:3000' });
    });

    chrome.runtime.onMessage.addListener(handleCartUpdate);
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.allocatedBudget) state.allocatedBudget = Math.max(0, changes.allocatedBudget.newValue);
        if (changes.cartTotal) state.cartTotal = Math.max(0, changes.cartTotal.newValue);
        if (changes.cartItems) state.cartItems = Array.isArray(changes.cartItems.newValue) ? changes.cartItems.newValue : [];
        updateDisplay();
        updateCartItems(state.cartItems);
    });
});