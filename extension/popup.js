// Background color changer
document.getElementById('changeColor')?.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
                document.body.style.backgroundColor =
                    '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
            }
        });
    });
});

// Expense tracking
const spendingAmountElement = document.getElementById('spending-amount');
let expenses = [50, 30, 70];

const calculateTotal = (items) => items.reduce((a, b) => a + b, 0);

function updateSpendingDisplay(amount) {
    if (spendingAmountElement) {
        spendingAmountElement.textContent = amount.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateSpendingDisplay(calculateTotal(expenses));
});

// Form submission
const submitButton = document.getElementById('submit-purchase');
if (submitButton) {
    submitButton.addEventListener('click', () => {
        const productName = document.getElementById('product-name').value;
        const price = parseFloat(document.getElementById('product-price').value);
        let quantity = parseInt(document.getElementById('product-quantity').value);

        quantity = quantity >= 1 ? quantity : 1;

        if (productName && !isNaN(price)) {
            const totalCost = price * quantity;
            expenses.push(totalCost);
            updateSpendingDisplay(calculateTotal(expenses));

            document.getElementById('product-name').value = '';
            document.getElementById('product-price').value = '';
            document.getElementById('product-quantity').value = '1';
        } else {
            alert('Please enter valid product name and price!');
        }
    });
}

// Website opener - NEW CODE
document.getElementById('homepage').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000' });
});