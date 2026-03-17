(function () {
    window.updateNavbarCounts = function () {
        var wishlistBadge = document.getElementById('wishlist-count');
        if (wishlistBadge) {
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

        var bagIcon = document.querySelector('.fi-rr-shopping-cart');
        if (bagIcon && bagIcon.parentElement) {
            var cartItems = [];
            try {
                cartItems = JSON.parse(localStorage.getItem('cart')) || [];
                if (!Array.isArray(cartItems)) {
                    cartItems = [];
                }
            } catch (error) {
                cartItems = [];
            }

            var cartBadge = document.getElementById('nav-cart-count-dynamic');
            if (!cartBadge) {
                cartBadge = document.createElement('span');
                cartBadge.id = 'nav-cart-count-dynamic';
                cartBadge.style.cssText = 'position: absolute; top: -8px; right: -12px; background: #c8a328; color: white; font-size: 10px; padding: 2px 6px; border-radius: 50%;';
                bagIcon.parentElement.appendChild(cartBadge);
            }
            cartBadge.innerText = cartItems.length;
        }
    };

    function bindNavbarActions() {
        var userMenuToggle = document.getElementById('user-menu-toggle');
        var userDropdown = document.getElementById('user-dropdown');
        var logoutBtn = document.getElementById('logout-btn');

        if (userMenuToggle && userDropdown) {
            userMenuToggle.addEventListener('click', function (e) {
                e.preventDefault();
                userDropdown.classList.toggle('active');
            });
        }

        document.addEventListener('click', function (e) {
            if (!e.target.closest('.user-profile') && userDropdown) {
                userDropdown.classList.remove('active');
            }
        });

        if (logoutBtn) {
            logoutBtn.addEventListener('click', function (e) {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                localStorage.removeItem('cart');
                localStorage.removeItem('whishlist');
                window.location.href = '/HTMLs/Login.html';
            });
        }
    }

    function loadNavbar() {
        var container = document.getElementById('navbar-root');
        if (!container) {
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open('GET', '../HTMLs/components/navbar.html', true);

        xhr.onload = function () {
            if (this.status === 200 || this.status === 0) {
                container.innerHTML = this.responseText;
                updateNavbarCounts();
                bindNavbarActions();
                document.dispatchEvent(new CustomEvent('navbar:ready'));
            }
        };

        xhr.send();
    }

    window.updateQuantity = function (index, change) {
    var cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart[index].quantity += change;
    if (cart[index].quantity < 1) cart[index].quantity = 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    // setCheckoutNotice('');
    adjustedProductIds = [];
    updateNavbarCounts();
};

    window.addEventListener('storage', function () {
        window.updateNavbarCounts();
    });

    document.addEventListener('DOMContentLoaded', loadNavbar);
})();
