// background.js
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url.includes('amazon.com')) {
        chrome.scripting.executeScript({
            target: { tabId },
            function: function() {
                const checkoutButton = document.querySelector('input[name="proceedToRetailCheckout"]');
                if (checkoutButton) {
                    checkoutButton.addEventListener('click', function() {
                        alert('You clicked the Proceed to checkout button!');
                    });
                }
            }
        });
    }
});
