// Amazon cart detection with fallbacks and error handling
function detectAmazonCartItems() {
    try {
        const items = [];
        let cartTotal = 0;

        const cartContainer = document.querySelector('#sc-active-cart')
            || document.querySelector('.sc-list-body')
            || document.body;

        const cartItems = cartContainer.querySelectorAll(
            '.sc-list-item, .sc-cart-item, div[data-item-count]'
        );

        cartItems.forEach(item => {
            try {
                // Product name
                const nameElement = item.querySelector(
                    '.sc-product-title, .a-truncate-full, [data-item-description]'
                );
                const rawName = nameElement?.textContent?.trim() || 'Unknown Item';
                const name = rawName.length > 50
                    ? `${rawName.slice(0, 47)}...`
                    : rawName;

                // Quantity
                const quantityInput = item.querySelector(
                    'input[name="quantity"], input[data-quantity-input]'
                );
                const quantity = quantityInput
                    ? Math.max(1, parseInt(quantityInput.value) || 1)
                    : 1;

                // Price
                const priceElement = item.querySelector(
                    '.sc-price, .a-price, [data-price]'
                );
                const priceText = priceElement?.textContent || '';
                const price = parseAmazonPrice(priceText);

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

// Enhanced price parser
function parseAmazonPrice(priceText) {
    try {
        // Remove non-numeric and thousands separators
        const cleanText = priceText
            .replace(/[^\d.,]/g, '')
            .replace(/,/g, '');

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

// Observe cart changes
const observer = new MutationObserver(mutations => {
    if (mutations.some(m =>
        m.target?.classList?.contains('sc-list-body') ||
        m.target?.id === 'sc-active-cart' ||
        m.addedNodes.length > 0
    )) {
        checkCart();
    }
});

const observeTarget = document.querySelector('#sc-active-cart') || document.body;
observer.observe(observeTarget, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
});

let checkTimeout;
function checkCart() {
    clearTimeout(checkTimeout);
    checkTimeout = setTimeout(() => {
        if (window.location.hostname.includes('amazon')) {
            const cartData = detectAmazonCartItems();
            chrome.runtime.sendMessage({
                type: 'CART_UPDATE',
                cartTotal: cartData.cartTotal,
                items: cartData.items
            });
        }
    }, 300);
}

// Initial run
setTimeout(checkCart, 1000);
