document.addEventListener('DOMContentLoaded', () => {
    const shippingForm = document.querySelector('.shipping-form');

    // Load saved shipping data from localStorage
    const savedShipping = JSON.parse(localStorage.getItem('checkoutShippingData') || '{}');
    if (savedShipping.fullName) document.getElementById('fullName').value = savedShipping.fullName;
    if (savedShipping.phone) document.getElementById('phone').value = savedShipping.phone;
    if (savedShipping.email) document.getElementById('email').value = savedShipping.email;
    if (savedShipping.address) document.getElementById('address').value = savedShipping.address;
    if (savedShipping.city) document.getElementById('city').value = savedShipping.city;
    if (savedShipping.postalCode) document.getElementById('postalCode').value = savedShipping.postalCode;

    // Save shipping data to localStorage on input change
    if (shippingForm) {
        shippingForm.addEventListener('input', () => {
            const formData = {
                fullName: document.getElementById('fullName').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                postalCode: document.getElementById('postalCode').value
            };
            localStorage.setItem('checkoutShippingData', JSON.stringify(formData));
        });
    }

    // Payment method toggle logic
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const creditCardContainer = document.querySelector('.credit-card-container');
    const paymentCards = document.querySelectorAll('.payment-method-card');

    if (paymentMethods.length > 0 && creditCardContainer) {
        paymentMethods.forEach(method => {
            method.addEventListener('change', (e) => {
                // Update active class
                paymentCards.forEach(card => card.classList.remove('active'));
                const selectedCard = e.target.closest('.payment-method-card');
                if (selectedCard) {
                    selectedCard.classList.add('active');
                }

                // Toggle credit card container visibility
                if (e.target.value === 'cod') {
                    creditCardContainer.style.display = 'none';
                } else {
                    creditCardContainer.style.display = 'block';
                }
            });
        });

        // Initialize display based on currently checked option
        const checkedMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if (checkedMethod && checkedMethod.value === 'cod') {
            creditCardContainer.style.display = 'none';
        }
    }

    // Complete Purchase functionality
    const completePurchaseBtn = document.querySelector('.complete-purchase-btn');
    if (completePurchaseBtn) {
        completePurchaseBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default form submission or page reload

            // Basic validation
            const fullNameInput = document.getElementById('fullName');
            const addressInput = document.getElementById('address');
            const phoneInput = document.getElementById('phone');

            const fullName = fullNameInput.value.trim();
            const address = addressInput.value.trim();
            const phone = phoneInput.value.trim();

            fullNameInput.setCustomValidity('');
            addressInput.setCustomValidity('');
            phoneInput.setCustomValidity('');

            if (!fullName) {
                fullNameInput.setCustomValidity('Please fill in your Full Name.');
                fullNameInput.reportValidity();
                fullNameInput.focus();
                return;
            }

            if (!phone) {
                phoneInput.setCustomValidity('Please fill in your Phone Number.');
                phoneInput.reportValidity();
                phoneInput.focus();
                return;
            }

            if (!address) {
                addressInput.setCustomValidity('Please fill in your Delivery Address.');
                addressInput.reportValidity();
                addressInput.focus();
                return;
            }

            const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
            const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
            const rawTotalText = document.querySelector('.price-total span:last-child')?.textContent || '0';
            const parsedTotal = parseFloat(rawTotalText.replace(/[^\d.]/g, ''));
            const totalAmount = Number.isFinite(parsedTotal) ? parsedTotal : 0;

            const orderData = {
                id: `ORD-${Date.now()}`,
                createdAt: new Date().toISOString(),
                customer: {
                    fullName,
                    phone,
                    email: document.getElementById('email').value.trim(),
                    address,
                    city: document.getElementById('city').value.trim(),
                    postalCode: document.getElementById('postalCode').value.trim()
                },
                paymentMethod: selectedPaymentMethod ? selectedPaymentMethod.value : null,
                items: cartItems,
                total: totalAmount,
                currency: 'EGP'
            };

            const savedOrders = JSON.parse(localStorage.getItem('Orders') || '[]');
            savedOrders.push(orderData);
            localStorage.setItem('Orders', JSON.stringify(savedOrders));

            // Clear cart, shipping data, and form
            localStorage.removeItem('cart');
            localStorage.removeItem('checkoutShippingData');
            if (shippingForm) shippingForm.reset();

            // Clear credit card inputs if they exist
            const cardNumber = document.getElementById('cardNumber');
            if (cardNumber) cardNumber.value = '';
            const expiryDate = document.getElementById('expiryDate');
            if (expiryDate) expiryDate.value = '';
            const cvc = document.getElementById('cvc');
            if (cvc) cvc.value = '';

            // Redirect to success page
            window.location.href = 'orderSuccess.html';
        });
    }

    // Render Order Summary
    const renderOrderSummary = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const orderItemsContainer = document.getElementById('orderItems');
        const priceBreakdownContainer = document.querySelector('.price-breakdown');
        const priceTotalContainer = document.querySelector('.price-total');

        if (!orderItemsContainer) return;

        var xhr = new XMLHttpRequest();
        xhr.open('GET', '../all_products.json', true);
        xhr.onload = function () {
            if (this.status === 200 || this.status === 0) {
                try {
                    const data = JSON.parse(this.responseText);
                    const allProducts = data.data || data;
                    let subtotal = 0;

                    orderItemsContainer.innerHTML = ''; // Clear hardcoded items

                    const completePurchaseBtn = document.querySelector('.complete-purchase-btn');

                    if (cart.length === 0) {
                        orderItemsContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Your cart is empty.</p>';
                        if (priceBreakdownContainer) priceBreakdownContainer.innerHTML = '';
                        if (priceTotalContainer) priceTotalContainer.innerHTML = '';
                        if (completePurchaseBtn) {
                            completePurchaseBtn.disabled = true;
                            completePurchaseBtn.style.cursor = 'not-allowed';
                            completePurchaseBtn.style.opacity = '0.6';
                        }
                        return;
                    }

                    if (completePurchaseBtn) {
                        completePurchaseBtn.disabled = false;
                        completePurchaseBtn.style.cursor = 'pointer';
                        completePurchaseBtn.style.opacity = '1';
                    }

                    cart.forEach(item => {
                        const product = allProducts.find(p => p.id == item.id);
                        if (product) {
                            const priceText = product.product_price || product.price || "0";
                            const parsedPrice = parseFloat(priceText.toString().replace(/[^\d.]/g, ''));
                            const price = Number.isFinite(parsedPrice) ? parsedPrice : 0;
                            const itemTotal = price * item.quantity;
                            subtotal += itemTotal;

                            const imageUrl = product.product_images ? product.product_images[0] : (product.image || '');
                            const title = product.product_title || product.name || 'Product';
                            const metaSize = item.product_size ? `<p class="item-meta">Size: ${item.product_size}</p>` : '';

                            orderItemsContainer.innerHTML += `
                                <div class="order-item">
                                    <img src="${imageUrl}" class="item-image" alt="${title}">
                                    <div class="item-details">
                                        <h3>${title}</h3>
                                        <p class="item-meta">Quantity: ${item.quantity}</p>
                                        ${metaSize}
                                    </div>
                                    <div class="item-price">${price.toLocaleString()}<br>EGP</div>
                                </div>
                            `;
                        }
                    });

                    if (priceBreakdownContainer && priceTotalContainer) {
                        const taxRate = 0.07;
                        const tax = subtotal * taxRate;
                        const total = subtotal + tax;

                        priceBreakdownContainer.innerHTML = `
                            <div class="price-row">
                                <span>Subtotal</span>
                                <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP</span>
                            </div>
                            <div class="price-row">
                                <span>Shipping</span>
                                <span class="free-text">Free</span>
                            </div>
                            <div class="price-row">
                                <span>Estimated Tax</span>
                                <span>${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP</span>
                            </div>
                        `;

                        priceTotalContainer.innerHTML = `
                            <span>Total</span>
                            <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP</span>
                        `;
                    }
                } catch (e) {
                    console.error('Error parsing products:', e);
                }
            }
        };
        xhr.onerror = function () {
            console.error('Error fetching products via XHR (CORS or network error).');
            // Fallback instruction to user for using local server if XHR fails too
            alert('To view order details from local files, you may need to run a local web server (like VS Code Live Server).');
        };
        xhr.send();
    };

    renderOrderSummary();
});