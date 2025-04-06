// Amazon cart detection with fallbacks and error handling
function detectAmazonCartItems() {
    try {
        const items = [];
        let cartTotal = 0;

        // Updated selector for cart items container
        const cartContainer = document.querySelector('#sc-active-cart') ||
            document.querySelector('.sc-list-body') ||
            document.body;

        // More resilient item selector
        const cartItems = cartContainer.querySelectorAll(
            '.sc-list-item, .sc-cart-item, div[data-item-count]'
        );

        cartItems.forEach(item => {
            try {
                // Product name with multiple fallback selectors
                const nameElement = item.querySelector(
                    '.sc-product-title, .a-truncate-full, [data-item-description]'
                );
                const rawName = nameElement?.textContent?.trim() || 'Unknown Item';
                const name = rawName.length > 50 ?
                    `${rawName.slice(0, 47)}...` : rawName;

                // Quantity detection with multiple fallbacks
                const quantityInput = item.querySelector(
                    'input[name="quantity"], input[data-quantity-input]'
                );
                const quantity = quantityInput ?
                    Math.max(1, parseInt(quantityInput.value) || 1) : 1;

                // Price detection with multiple format fallbacks
                const priceElement = item.querySelector(
                    '.sc-price, .a-price, [data-price]'
                );
                const priceText = priceElement?.textContent || '';
                const price = parseAmazonPrice(priceText);

                // Calculate line total
                const lineTotal = price * quantity;
                cartTotal += lineTotal;

                items.push({
                    name,
                    price,
                    quantity,
                    lineTotal
                });
            } catch (itemError) {
                console.error('Error processing cart item:', itemError);
            }
        });

        return { items, cartTotal };
    } catch (error) {
        console.error('Cart detection failed:', error);
        return { items: [], cartTotal: 0 };
    }
}

// Enhanced price parser with multiple format support
function parseAmazonPrice(priceText) {
    try {
        // Handle multiple price formats:
        // "$39.99", "£29.99", "39.99", "1,299.00"
        const cleanText = priceText
            .replace(/[^\d.,]/g, '') // Remove non-numeric chars
            .replace(/,/g, ''); // Remove thousands separators

        // Match main price and possible decimal
        const match = cleanText.match(/(\d+)(?:\.(\d{1,2}))?/);

        if (!match) return 0;

        const dollars = parseInt(match[1]) || 0;
        const cents = parseInt(match[2]?.padEnd(2, '0')) || 0;

        return dollars + (cents / 100);
    } catch (error) {
        console.error('Price parsing failed:', error);
        return 0;
    }
}

// Optimized mutation observer
const observer = new MutationObserver(mutations => {
    if (mutations.some(m =>
        m.target?.classList?.contains('sc-list-body') ||
        m.target?.id === 'sc-active-cart' ||
        m.addedNodes.length > 0
    )) {
        checkCart();
    }
});

// Start observing specific elements
const observeTarget = document.querySelector('#sc-active-cart') || document.body;
observer.observe(observeTarget, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
});

// Initial check with debounce
let checkTimeout;
function checkCart() {
    clearTimeout(checkTimeout);
    checkTimeout = setTimeout(() => {
        if (window.location.hostname.includes('amazon')) {
            const cartData = detectAmazonCartItems();
            // Explicitly send cart data structure
            chrome.runtime.sendMessage({
                type: 'CART_UPDATE',
                cartTotal: cartData.cartTotal,
                items: cartData.items
            });
        }
    }, 300); // Debounce rapid mutations
}

// First run after DOM settles
setTimeout(checkCart, 1000);