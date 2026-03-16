function renderCart() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../all_products.json', true);

    xhr.onload = function() {
        if (this.status === 200) {
            var response = JSON.parse(this.responseText);
            var allProducts = response.data || response;
            var cart = JSON.parse(localStorage.getItem('cart')) || [];
            
            var tableBody = document.getElementById('cart-items-body');
            var subtotalElem = document.getElementById('subtotal-val');
            var totalElem = document.getElementById('total-val');
            
            var subtotal = 0;
            tableBody.innerHTML = '';

            updateNavBadge(cart.length);

            if (cart.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 50px;">Your Cart Is Empty</td></tr>';
            } else {
                cart.forEach(function(item, index) {
                    var product = allProducts.find(function(p) { return p.id == item.id; });
                    if (product) {
                        var priceText = product.product_price || product.price || "0";
                        var price = parseFloat(priceText.toString().replace(/[^\d.]/g, ''));
                        var itemTotal = price * item.quantity;
                        subtotal += itemTotal;

                        tableBody.innerHTML += `
                            <tr>
                                <td>
                                    <div class="product-info" style="display:flex; align-items:center; gap:15px;">
                                        <img src="${product.product_images ? product.product_images[0] : product.image}" width="70" style="border-radius:10px;">
                                        <div>
                                            <h4 style="margin:0">${product.product_title || product.name}</h4>
                                            ${item.product_size ? `<small style="color: #c8a328;">Size: ${item.product_size}</small>` : ''}
                                        </div>
                                    </div>
                                </td>
                                <td>${price.toFixed(2)} EGP</td>
                                <td>
                                    <div class="qty-control">
                                        <button onclick="updateQuantity(${index}, -1)">-</button>
                                        <span>${item.quantity}</span>
                                        <button onclick="updateQuantity(${index}, 1)">+</button>
                                    </div>
                                </td>
                                <td style="font-weight:bold;">${itemTotal.toFixed(2)} EGP</td>
                                <td>
                                    <button onclick="removeItem(${index})" style="color:#ff4d4d; border:none; background:none; cursor:pointer; font-size:18px;">
                                        <i class="fa-regular fa-trash-can"></i>
                                    </button>
                                </td>
                            </tr>`;
                    }
                });
            }
            if (subtotalElem) subtotalElem.innerText = subtotal.toFixed(2) + " EGP";
            if (totalElem) totalElem.innerText = subtotal.toFixed(2) + " EGP";
        }
    };
    xhr.send();
}

function updateNavBadge(count) {
    var bagIcon = document.querySelector('.fa-bag-shopping');
    if (bagIcon) {
        var cartLink = bagIcon.parentElement;
        var badge = document.getElementById('nav-cart-count-dynamic');
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'nav-cart-count-dynamic';
            badge.style.cssText = "position: absolute; top: -8px; right: -12px; background: #c8a328; color: white; font-size: 10px; padding: 2px 6px; border-radius: 50%;";
            cartLink.appendChild(badge);
        }
        badge.innerText = count;
    }
}

var checkoutBtn = document.querySelector('.checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('mouseover', function() {
        var cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            this.style.cursor = "not-allowed";
            this.title = "Your cart is empty!";
        } else {
            this.style.cursor = "pointer";
            this.onclick = function() { window.location.href = "Checkout.html"; };
        }
    });
}

window.updateQuantity = function(index, change) {
    var cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart[index].quantity += change;
    if (cart[index].quantity < 1) cart[index].quantity = 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
};

window.removeItem = function(index) {
    var cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
};

document.addEventListener('DOMContentLoaded', renderCart);