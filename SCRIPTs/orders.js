document.addEventListener('DOMContentLoaded', () => {
    const ordersList = document.getElementById('orders-list');
    const emptyMessage = document.getElementById('empty-message');
    
    // Get all orders from localStorage
    const orders = JSON.parse(localStorage.getItem('Orders') || '[]');
    
    if (orders.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }

    // Load all products data
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '../all_products.json', true);
    
    xhr.onload = function () {
        if (this.status === 200 || this.status === 0) {
            try {
                const data = JSON.parse(this.responseText);
                const allProducts = data.data || data;
                
                // Display orders (newest first)
                const sortedOrders = [...orders].reverse();
                
                sortedOrders.forEach(order => {
                    const orderCard = createOrderCard(order, allProducts);
                    ordersList.appendChild(orderCard);
                });
            } catch (e) {
                console.error('Error parsing products:', e);
                displayError();
            }
        } else {
            displayError();
        }
    };
    
    xhr.onerror = function () {
        console.error('Error fetching products');
        displayError();
    };
    
    xhr.send();

    function createOrderCard(order, allProducts) {
        const card = document.createElement('div');
        card.className = 'order-card';
        
        // Format date
        const orderDate = new Date(order.createdAt);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        const formattedTime = orderDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Create order header
        const headerHTML = `
            <div class="order-header">
                <div class="order-header-item">
                    <span class="order-header-label">Order ID</span>
                    <span class="order-header-value">${order.id}</span>
                </div>
                <div class="order-header-item">
                    <span class="order-header-label">Date</span>
                    <span class="order-header-value">${formattedDate}</span>
                </div>
                <div class="order-header-item">
                    <span class="order-header-label">Status</span>
                    <span class="order-status">Delivered</span>
                </div>
            </div>
        `;
        
        // Create order items
        let itemsHTML = '<span class="order-items-title">Order Items</span>';
        
        order.items.forEach(item => {
            const product = allProducts.find(p => p.id == item.id);
            if (product) {
                const imageUrl = product.product_images ? product.product_images[0] : (product.image || '');
                const title = product.product_title || product.name || 'Product';
                const priceText = product.product_price || product.price || "0";
                const price = parseFloat(priceText.toString().replace(/[^\d.]/g, ''));
                const sizeInfo = item.product_size ? `<span class="order-item-meta">Size: ${item.product_size}</span>` : '';
                
                itemsHTML += `
                    <div class="order-item">
                        <img src="${imageUrl}" alt="${title}">
                        <div class="order-item-details">
                            <div class="order-item-name">${title}</div>
                            <span class="order-item-meta">Qty: ${item.quantity}</span>
                            ${sizeInfo}
                        </div>
                        <div class="order-item-price">${price.toLocaleString()} EGP</div>
                    </div>
                `;
            }
        });
        
        // Create customer info
        const customer = order.customer || {};
        const customerHTML = `
            <div class="order-customer-info">
                <div class="customer-info-row">
                    <div class="customer-info-item">
                        <span class="customer-info-label">Customer Name</span>
                        <span class="customer-info-value">${customer.fullName || 'N/A'}</span>
                    </div>
                    <div class="customer-info-item">
                        <span class="customer-info-label">Email</span>
                        <span class="customer-info-value">${customer.email || 'N/A'}</span>
                    </div>
                </div>
                <div class="customer-info-row">
                    <div class="customer-info-item">
                        <span class="customer-info-label">Phone</span>
                        <span class="customer-info-value">${customer.phone || 'N/A'}</span>
                    </div>
                    <div class="customer-info-item">
                        <span class="customer-info-label">Delivery Address</span>
                        <span class="customer-info-value">${customer.address || 'N/A'}</span>
                    </div>
                </div>
                <div class="customer-info-row">
                    <div class="customer-info-item">
                        <span class="customer-info-label">City</span>
                        <span class="customer-info-value">${customer.city || 'N/A'}</span>
                    </div>
                    <div class="customer-info-item">
                        <span class="customer-info-label">Postal Code</span>
                        <span class="customer-info-value">${customer.postalCode || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Create order footer with total and payment method
        const paymentMethodLabels = {
            'cod': 'Cash on Delivery',
            'credit': 'Credit Card',
            'debit': 'Debit Card'
        };
        const paymentMethod = paymentMethodLabels[order.paymentMethod] || order.paymentMethod || 'N/A';
        
        const footerHTML = `
            <div class="order-footer">
                <div class="payment-method">
                    <span class="payment-label">Payment Method</span>
                    <span class="payment-value">${paymentMethod}</span>
                </div>
                <div class="order-total">
                    <span class="total-label">Total Amount</span>
                    <div>
                        <span class="total-amount">${order.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span class="total-currency">${order.currency}</span>
                    </div>
                </div>
            </div>
        `;
        
        card.innerHTML = headerHTML + itemsHTML + customerHTML + footerHTML;
        return card;
    }
    
    function displayError() {
        const errorHTML = `
            <div class="order-card" style="text-align: center; padding: 40px;">
                <i class="fas fa-exclamation-circle" style="font-size: 32px; color: #9ca3af; margin-bottom: 15px;"></i>
                <p style="color: #9ca3af;">Unable to load product details. Please try refreshing the page.</p>
            </div>
        `;
        ordersList.innerHTML = errorHTML;
    }
});

// Load navbar
document.addEventListener('DOMContentLoaded', function () {
    window.updateNavbarCounts && window.updateNavbarCounts();
});
