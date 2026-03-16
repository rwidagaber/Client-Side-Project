
// 4. تشغيل دالة الرسم عشان الجدول يملى والزرار يبقى Pointer
// renderCart();





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
            var navCount = document.getElementById('nav-cart-count');

            var subtotal = 0;
            tableBody.innerHTML = '';

            if (navCount) navCount.innerText = cart.length;

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
                                    <div style="display:flex; align-items:center; gap:10px;">
                                        <img src="${product.product_images ? product.product_images[0] : product.image}" width="50" style="border-radius:5px;">
                                        <div>
                                            <h4 style="margin:0">${product.product_title || product.name}</h4>
                                            ${item.product_size ? `<small style="color: #c49a45;">Size: ${item.product_size}</small>` : ''}
                                        </div>
                                    </div>
                                </td>
                                <td>${price.toFixed(2)} EGP</td>
                                <td>
                                    <div class="qty-control">
                                        <button onclick="updateQuantity(${index}, -1)">-</button>
                                        <span style="padding:0 10px">${item.quantity}</span>
                                        <button onclick="updateQuantity(${index}, 1)">+</button>
                                    </div>
                                </td>
                                <td>${itemTotal.toFixed(2)} EGP</td>
                                <td>
                                    <button onclick="removeItem(${index})" style="color:red; cursor:pointer; border:none; background:none;">
                                        <i class="fa-regular fa-trash-can"></i>
                                    </button>
                                </td>
                            </tr>`;
                    }
                });
            }
            
            if (subtotalElem) subtotalElem.innerText = subtotal.toFixed(2) + " EGP";
            if (document.getElementById('total-val')) {
                document.getElementById('total-val').innerText = subtotal.toFixed(2) + " EGP";
            }
        }
    };
    xhr.send();
}

var checkoutBtn = document.querySelector('.checkout-btn');

checkoutBtn.addEventListener('mouseover', function() {
    var cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        this.style.cursor = "not-allowed";
        this.title = "Your cart is empty!"; 
    } else {
        this.style.cursor = "pointer";
        this.title = "";
        checkoutBtn.onclick = function() {
        window.location.href = "https://www.google.com/"; 
    };
    }
});

window.addEventListener('storage', function(event) {
    if (event.key === 'cart') renderCart();
});

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