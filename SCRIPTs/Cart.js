function renderCart() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../all_products.json', true);

    xhr.onload = function () {
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
                cart.forEach(function (item, index) {
                    var product = allProducts.find(function (p) { return p.id == item.id; });
                    if (product) {
                        var isAdjustedItem = adjustedProductIds.indexOf(Number(item.id)) > -1;
                        var adjustedClass = isAdjustedItem ? 'cart-item-adjusted' : '';
                        var priceText = product.product_price || product.price || "0";
                        var price = parseFloat(priceText.toString().replace(/[^\d.]/g, ''));
                        var itemTotal = price * item.quantity;
                        subtotal += itemTotal;

                        tableBody.innerHTML += `
                            <tr class="${adjustedClass}">
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
            setCheckoutButtonState();
        }
    };
    xhr.send();
}

var adjustedProductIds = [];

function setCheckoutNotice(message) {
    var noticeElem = document.getElementById('cart-stock-notice');

    if (!noticeElem) {
        return;
    }

    if (message) {
        noticeElem.innerText = message;
        noticeElem.style.display = 'block';
    }
    else {
        noticeElem.innerText = '';
        noticeElem.style.display = 'none';
    }
}

function setCheckoutButtonState() {
    var checkoutBtn = document.querySelector('.checkout-btn');
    if (!checkoutBtn) {
        return;
    }

    var cart = JSON.parse(localStorage.getItem('cart')) || [];
    var isEmpty = cart.length === 0;

    checkoutBtn.disabled = isEmpty;
    checkoutBtn.style.cursor = isEmpty ? 'not-allowed' : 'pointer';
    checkoutBtn.title = isEmpty ? 'Your cart is empty!' : '';
}

function validateCartStockBeforeCheckout(done) {
    var cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (!Array.isArray(cart) || cart.length === 0) {
        done({ hasAdjustments: false, adjustedTitles: [], adjustedProductIds: [] });
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../all_products.json', true);

    xhr.onload = function () {
        if (this.status !== 200 && this.status !== 0) {
            done({ hasAdjustments: false, adjustedTitles: [], adjustedProductIds: [] });
            return;
        }

        try {
            var response = JSON.parse(this.responseText);
            var allProducts = response.data || response;

            if (!Array.isArray(allProducts)) {
                done({ hasAdjustments: false, adjustedTitles: [], adjustedProductIds: [] });
                return;
            }

            var quantityByProductId = {};
            var indexesByProductId = {};
            var adjustedCart = cart.map(function (item) {
                return {
                    id: item.id,
                    quantity: Number(item.quantity) || 0,
                    product_size: item.product_size
                };
            });

            cart.forEach(function (item, index) {
                var productId = Number(item.id);
                var qty = Number(item.quantity) || 0;

                if (!productId || qty <= 0) {
                    return;
                }

                quantityByProductId[productId] = (quantityByProductId[productId] || 0) + qty;

                if (!indexesByProductId[productId]) {
                    indexesByProductId[productId] = [];
                }

                indexesByProductId[productId].push(index);
            });

            var hasAdjustments = false;
            var adjustedTitles = [];
            var adjustedIds = [];

            Object.keys(quantityByProductId).forEach(function (productId) {
                var product = allProducts.find(function (p) {
                    return Number(p.id) === Number(productId);
                });

                if (!product) {
                    return;
                }

                var stock = Number(product.stock) || 0;
                var requested = quantityByProductId[productId] || 0;

                if (requested > stock) {
                    hasAdjustments = true;
                    adjustedTitles.push(product.product_title || product.name || ('Product ' + productId));

                    if (adjustedIds.indexOf(Number(productId)) === -1) {
                        adjustedIds.push(Number(productId));
                    }

                    var remaining = stock;
                    var itemIndexes = indexesByProductId[productId] || [];

                    itemIndexes.forEach(function (itemIndex) {
                        var currentQty = Number(adjustedCart[itemIndex].quantity) || 0;
                        var allowedQty = Math.min(currentQty, Math.max(remaining, 0));
                        adjustedCart[itemIndex].quantity = allowedQty;
                        remaining -= allowedQty;
                    });
                }
            });

            if (hasAdjustments) {
                adjustedCart = adjustedCart.filter(function (item) {
                    return (Number(item.quantity) || 0) > 0;
                });

                localStorage.setItem('cart', JSON.stringify(adjustedCart));
            }

            done({ hasAdjustments: hasAdjustments, adjustedTitles: adjustedTitles, adjustedProductIds: adjustedIds });
        } catch (e) {
            done({ hasAdjustments: false, adjustedTitles: [], adjustedProductIds: [] });
        }
    };

    xhr.onerror = function () {
        done({ hasAdjustments: false, adjustedTitles: [], adjustedProductIds: [] });
    };

    xhr.send();
}

function updateNavBadge(count) {
    var bagIcon = document.querySelector('.fi-rr-shopping-cart');
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

function updateWishlistBadge() {
    var wishlistBadge = document.getElementById('wishlist-count');

    if (!wishlistBadge) {
        return;
    }

    var wishlistItems = [];

    try {
        wishlistItems = JSON.parse(localStorage.getItem('whishlist')) || [];

        if (!Array.isArray(wishlistItems)) {
            wishlistItems = [];
        }
    } catch (error) {
        wishlistItems = [];
    }

    wishlistBadge.innerText = wishlistItems.length;
}

var checkoutBtn = document.querySelector('.checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function () {
        var cart = JSON.parse(localStorage.getItem('cart')) || [];

        if (!Array.isArray(cart) || cart.length === 0) {
            setCheckoutButtonState();
            return;
        }

        validateCartStockBeforeCheckout(function (result) {
            if (result.hasAdjustments) {
                adjustedProductIds = result.adjustedProductIds || [];
                renderCart();

                var uniqueTitles = [];
                (result.adjustedTitles || []).forEach(function (title) {
                    if (uniqueTitles.indexOf(title) === -1) {
                        uniqueTitles.push(title);
                    }
                });

                if (uniqueTitles.length > 0) {
                    setCheckoutNotice('Some quantities were adjusted to match available stock: ' + uniqueTitles.join(', '));
                }
                else {
                    setCheckoutNotice('Some quantities were adjusted to match available stock.');
                }

                return;
            }

            setCheckoutNotice('');
            adjustedProductIds = [];
            window.location.href = 'Checkout.html';
        });
    });
}

window.updateQuantity = function (index, change) {
    var cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart[index].quantity += change;
    if (cart[index].quantity < 1) cart[index].quantity = 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    setCheckoutNotice('');
    adjustedProductIds = [];
    renderCart();
    
    if (window.updateNavbarCounts) {
        window.updateNavbarCounts();
    }
};

window.removeItem = function (index) {
    var cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    setCheckoutNotice('');
    adjustedProductIds = [];
    renderCart();
    
    if (window.updateNavbarCounts) {
        window.updateNavbarCounts();
    }
};

document.addEventListener('DOMContentLoaded', function () {
    renderCart();
    setCheckoutButtonState();
});

document.addEventListener('navbar:ready', function () {
    var cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateNavBadge(cart.length);
    updateWishlistBadge();
});