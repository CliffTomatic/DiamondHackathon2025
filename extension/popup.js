// popup.js
const dom = (() => {
    const elements = {
        spendingAmount: 'spending-amount',
        submitPurchase: 'submit-purchase',
        productName: 'product-name',
        productPrice: 'product-price',
        productQuantity: 'product-quantity',
        homepage: 'homepage',
        cartItems: 'cart-items',
        purchasedItems: 'purchased-items', // Element for purchased items
        cartTotal: 'cart-total',
        weeklyAmount: 'weekly-amount',
        userNotes: 'user-notes',
        dailyBreakdown: 'daily-breakdown',
        fakePurchaseAll: 'fake-purchase-all'
    };
    const domObj = {};
    Object.entries(elements).forEach(([key, value]) => {
        domObj[key] = document.getElementById(value);
    });
    return domObj;
})();

const API_BASE_URL = 'http://localhost:3001';
const USER_ID = 'chrome-extension-user';

// Extension state now includes two arrays: cartItems and purchased
const state = {
    allocatedBudget: 0,
    cartTotal: 0,
    cartItems: [],
    purchased: [],
    weeklyLimit: 0,
    notes: '',
    async init() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/user/${USER_ID}`);
            if (!res.ok) throw new Error('Failed to fetch user data.');
            const data = await res.json();
            this.syncState(data);
            renderUI();
        } catch (error) {
            console.error('Initialization error:', error);
            await this.loadLocalFallback();
        }
    },
    syncState(data) {
        this.allocatedBudget = Number(data.allocatedBudget) || 0;
        this.cartTotal = Number(data.cartTotal) || 0;
        this.cartItems = Array.isArray(data.cartItems) ? data.cartItems : [];
        this.purchased = Array.isArray(data.purchased) ? data.purchased : [];
        this.weeklyLimit = Number(data.weeklyLimit) || 0;
        this.notes = data.notes || '';
    },
    async loadLocalFallback() {
        const result = await chrome.storage.local.get([
            'allocatedBudget', 'cartTotal', 'cartItems', 'purchased', 'weeklyLimit', 'notes'
        ]);
        this.allocatedBudget = Number(result.allocatedBudget) || 0;
        this.cartTotal = Number(result.cartTotal) || 0;
        this.cartItems = Array.isArray(result.cartItems) ? result.cartItems : [];
        this.purchased = Array.isArray(result.purchased) ? result.purchased : [];
        this.weeklyLimit = Number(result.weeklyLimit) || 0;
        this.notes = result.notes || '';
        renderUI();
    },
    async save() {
        const data = {
            userId: USER_ID,
            allocatedBudget: this.allocatedBudget,
            cartTotal: this.cartTotal,
            cartItems: this.cartItems,
            purchased: this.purchased,
            weeklyLimit: this.weeklyLimit,
            notes: this.notes
        };
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to save to server');
            const result = await response.json();
            this.syncState(result);
            await chrome.storage.local.set(data);
            console.log('Data saved to backend and local storage');
        } catch (err) {
            console.error('Save error:', err);
            await chrome.storage.local.set(data);
        }
        renderUI();
    }
};

// Array of insults to use when over budget
const insults = [
    "Think about your family!",
    "Do you really need that?",
    "Save your money, genius!",
    "Your wallet called – it's crying!",
    "Impulse buys are for amateurs!",
    "Maybe skip this one, champ!"
];

function renderUI() {
    updateCartItems(state.cartItems);
    updatePurchasedItems(state.purchased);
    updateDisplay();
    if (dom.weeklyAmount) {
        dom.weeklyAmount.textContent = formatCurrency(state.weeklyLimit);
    }
    if (dom.userNotes) {
        dom.userNotes.textContent = state.notes;
    }
}

function updateCartItems(items) {
    dom.cartItems.textContent = '';
    items.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('cart-item');
        const addedDate = item.addedToCartAt ? new Date(item.addedToCartAt).toLocaleString() : 'Unknown';
        let fakePurchaseButton = '';
        if (!item.purchasedAt) {
            fakePurchaseButton = `<button class="fake-purchase-btn" data-index="${index}">
                Fake Purchase
            </button>`;
        }
        itemDiv.innerHTML = `
            <div class="cart-item-header">
                <div class="item-source">${item.source}</div>
                <span class="item-name">${item.name}</span>
            </div>
            <div class="cart-item-details">
                <span class="quantity">Qty: ${item.quantity}</span>
                <span class="item-price">Total: ${formatCurrency(item.lineTotal)}</span>
            </div>
            <div style="font-size: 0.8em; margin-top: 5px;">
                Added: ${addedDate}
            </div>
            ${fakePurchaseButton}
        `;
        dom.cartItems.appendChild(itemDiv);
    });
    const purchaseButtons = dom.cartItems.querySelectorAll('.fake-purchase-btn');
    purchaseButtons.forEach(btn => {
        btn.addEventListener('click', onFakePurchaseClick);
    });
}

function updatePurchasedItems(items) {
    dom.purchasedItems.textContent = '';
    items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('purchased-item');
        const addedDate = item.addedToCartAt ? new Date(item.addedToCartAt).toLocaleString() : 'Unknown';
        const purchasedDate = item.purchasedAt ? new Date(item.purchasedAt).toLocaleString() : 'Not purchased';
        itemDiv.innerHTML = `
            <div class="purchased-item-header">
                <span class="item-name">${item.name}</span>
            </div>
            <div class="purchased-item-details">
                <span>Qty: ${item.quantity}</span>
                <span>Total: ${formatCurrency(item.lineTotal)}</span>
            </div>
            <div style="font-size: 0.8em;">
                Added: ${addedDate} <br>
                Purchased: ${purchasedDate}
            </div>
        `;
        dom.purchasedItems.appendChild(itemDiv);
    });
}

function updateDisplay() {
    const remaining = state.weeklyLimit - state.cartTotal;
    if (dom.spendingAmount) {
        dom.spendingAmount.textContent = formatCurrency(remaining);
        dom.spendingAmount.style.color = remaining < 0 ? '#ef4444' : '#34d399';
    }
    if (dom.cartTotal) {
        dom.cartTotal.textContent = formatCurrency(state.cartTotal);
    }
    if (dom.spendingAmount) {
        dom.spendingAmount.animate(
            [{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }, { transform: 'scale(1)' }],
            { duration: 300 }
        );
    }
}

function formatCurrency(val) {
    return (Number(val) || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

// ---------------------
//   EVENT HANDLERS
// ---------------------

// Manual purchase submission with insult check when over budget
async function onManualPurchaseSubmit(evt) {
    evt.preventDefault();
    const productName = dom.productName.value.trim();
    const rawPrice = dom.productPrice.value.replace(/[^0-9.]/g, '');
    const price = parseFloat(rawPrice);
    const quantity = Math.max(1, parseInt(dom.productQuantity.value) || 1);
    const newTotal = price * quantity;

    // Debug logs for troubleshooting
    console.log("Weekly Limit:", state.weeklyLimit);
    console.log("Current Cart Total:", state.cartTotal);
    console.log("New Item Total:", newTotal);
    console.log("Sum if added:", state.cartTotal + newTotal);

    // If adding the new item would exceed the weekly limit, alert with a random insult and do not add the purchase.
    if ((state.cartTotal + newTotal) > state.weeklyLimit) {
        const randomInsult = insults[Math.floor(Math.random() * insults.length)];
        alert(randomInsult);
        return;
    }

    if (!productName || isNaN(price) || price <= 0) {
        alert('Please enter a valid product name and positive price.');
        return;
    }

    state.cartItems.push({
        name: productName,
        price,
        quantity,
        source: 'manual',
        lineTotal: newTotal,
        addedToCartAt: new Date().toISOString(),
        purchasedAt: null
    });

    state.cartTotal = state.cartItems.reduce((acc, i) => acc + (i.lineTotal || 0), 0);
    await state.save();

    dom.productName.value = '';
    dom.productPrice.value = '';
    dom.productQuantity.value = '1';
}

async function onFakePurchaseClick(evt) {
    const index = parseInt(evt.currentTarget.dataset.index, 10);
    if (isNaN(index)) return;

    // Get the item without removing it yet
    const item = state.cartItems[index];

    // Calculate total of already purchased items
    const purchasedTotal = state.purchased.reduce((acc, i) => acc + (i.lineTotal || 0), 0);

    // If purchasing this item would exceed the weekly limit, alert a random insult and exit
    if ((purchasedTotal + item.lineTotal) > state.weeklyLimit) {
        const randomInsult = insults[Math.floor(Math.random() * insults.length)];
        alert(randomInsult);
        return;
    }

    // Now process the fake purchase: remove the item from the cart and add it to purchased
    state.cartItems.splice(index, 1);
    item.purchasedAt = new Date().toISOString();
    state.purchased.push(item);

    // Recalculate the cart total after removal
    state.cartTotal = state.cartItems.reduce((acc, i) => acc + (i.lineTotal || 0), 0);
    await state.save();
}

async function onFakePurchaseAll() {
    state.cartItems.forEach(item => {
        item.purchasedAt = new Date().toISOString();
        state.purchased.push(item);
    });
    state.cartItems = [];
    state.cartTotal = 0;
    await state.save();
}

async function handleCartUpdateMessage(request) {
    if (request.type === 'CART_UPDATE') {
        const amazonItems = request.items.map(i => ({
            ...i,
            source: 'amazon',
            addedToCartAt: i.addedToCartAt || new Date().toISOString(),
            purchasedAt: null
        }));
        state.cartItems = [
            ...state.cartItems.filter(it => it.source !== 'amazon'),
            ...amazonItems
        ];
        state.cartTotal = state.cartItems.reduce((acc, it) => acc + (it.lineTotal || 0), 0);
        await state.save();
    }
}

function setupWeeklyLimitListener() {
    if (!dom.weeklyAmount) return;
    dom.weeklyAmount.addEventListener('input', e => {
        let text = e.target.textContent;
        if (!text.startsWith('$')) {
            text = '$' + text.replace(/\$/g, '');
        }
        const cleaned = text.replace(/[^\d.]/g, '').replace(/^([^\.]*\.)|\./g, '$1');
        e.target.textContent = `$${cleaned}`;
        placeCaretAtEnd(e.target);
    });
    dom.weeklyAmount.addEventListener('blur', async () => {
        const val = parseFloat(dom.weeklyAmount.textContent.replace('$', ''));
        if (!isNaN(val)) {
            state.weeklyLimit = val;
            await state.save();
        } else {
            dom.weeklyAmount.textContent = formatCurrency(state.weeklyLimit);
            alert('Please enter a valid amount!');
        }
    });
    dom.weeklyAmount.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            dom.weeklyAmount.blur();
        }
    });
}

function setupNotesListener() {
    if (!dom.userNotes) return;
    dom.userNotes.addEventListener('blur', async () => {
        state.notes = dom.userNotes.textContent.trim();
        await state.save();
    });
    dom.userNotes.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            dom.userNotes.blur();
        }
    });
}

function placeCaretAtEnd(el) {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
}

// NEW: Attach an alert to Amazon's checkout button if present in the active tab.
function attachAmazonCheckoutListener() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const tab = tabs[0];
        // Only inject script if we're on an amazon.com page
        if (tab && tab.url && tab.url.includes('amazon.com')) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: function(weeklyLimit, cartTotal, insults) {
                    const checkoutButton = document.querySelector('input[name="proceedToRetailCheckout"]');
                    if (checkoutButton) {
                        // Remove existing click listeners by cloning the node
                        const newButton = checkoutButton.cloneNode(true);
                        checkoutButton.parentNode.replaceChild(newButton, checkoutButton);

                        // Attach a capturing listener so this runs before other listeners
                        newButton.addEventListener('click', function(event) {
                            // If the cart is over budget, block checkout
                            if (cartTotal > weeklyLimit) {
                                event.preventDefault();
                                event.stopImmediatePropagation();
                                const randomInsult = insults[Math.floor(Math.random() * insults.length)];
                                alert(randomInsult);
                                return false;
                            }
                        }, true);
                    }
                },
                args: [state.weeklyLimit, state.cartTotal, insults]
            });
        }
    });
}



// ---------------------
//       INIT
// ---------------------
document.addEventListener('DOMContentLoaded', async () => {
    await state.init();
    dom.submitPurchase?.addEventListener('click', onManualPurchaseSubmit);
    dom.fakePurchaseAll?.addEventListener('click', onFakePurchaseAll);
    dom.homepage?.addEventListener('click', () => {
        chrome.tabs.create({ url: 'http://localhost:3000' });
    });
    setupWeeklyLimitListener();
    setupNotesListener();
    chrome.runtime.onMessage.addListener(handleCartUpdateMessage);
    chrome.storage.onChanged.addListener(async changes => {
        if (changes.allocatedBudget) {
            state.allocatedBudget = Math.max(0, changes.allocatedBudget.newValue);
        }
        if (changes.cartTotal) {
            state.cartTotal = Math.max(0, changes.cartTotal.newValue);
        }
        if (changes.cartItems) {
            state.cartItems = Array.isArray(changes.cartItems.newValue) ? changes.cartItems.newValue : [];
        }
        if (changes.purchased) {
            state.purchased = Array.isArray(changes.purchased.newValue) ? changes.purchased.newValue : [];
        }
        if (changes.weeklyLimit) {
            state.weeklyLimit = Math.max(0, changes.weeklyLimit.newValue);
        }
        if (changes.notes) {
            state.notes = changes.notes.newValue || '';
        }
        renderUI();
    });

    // Attach listener for Amazon checkout button if on an Amazon page.
    attachAmazonCheckoutListener();
});
