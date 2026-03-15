(function () {
    var wishlistGrid = document.getElementById('wishlist_grid');
    var savedCount = document.getElementById('saved_count');
    var emptyMessage = document.getElementById('empty_message');
    var moveAllBtn = document.getElementById('move_all_btn');

    if (!wishlistGrid || !savedCount || !emptyMessage) {
        return;
    }

    function readWishlistIds() {
        var rawWishlist = localStorage.getItem('whishlist');

        if (!rawWishlist) {
            return [];
        }

        try {
            var parsed = JSON.parse(rawWishlist);

            if (!Array.isArray(parsed)) {
                return [];
            }

            var ids = [];

            for (var i = 0; i < parsed.length; i++) {
                var currentId = Number(parsed[i]);

                if (currentId > 0 && ids.indexOf(currentId) == -1) {
                    ids.push(currentId);
                }
            }

            return ids;
        }
        catch (error) {
            return [];
        }
    }

    function writeWishlistIds(ids) {
        localStorage.setItem('whishlist', JSON.stringify(ids));
    }

    function getDisplaySize(sizeText) {
        var normalizedSize = String(sizeText).toUpperCase().trim();

        if (normalizedSize == 'EXTRA SMALL') {
            return 'XS';
        }

        if (normalizedSize == 'SMALL') {
            return 'S';
        }

        if (normalizedSize == 'MEDIUM') {
            return 'M';
        }

        if (normalizedSize == 'LARGE') {
            return 'L';
        }

        if (normalizedSize == 'EXTRA LARGE') {
            return 'XL';
        }

        return normalizedSize;
    }

    function addToCart(productId, productSize) {
        var cartRaw = localStorage.getItem('cart');
        var cartItems = [];

        if (cartRaw) {
            try {
                var parsedCart = JSON.parse(cartRaw);

                if (Array.isArray(parsedCart)) {
                    cartItems = parsedCart;
                }
            }
            catch (error) {
                cartItems = [];
            }
        }

        var existingIndex = -1;

        for (var i = 0; i < cartItems.length; i++) {
            if (Number(cartItems[i].id) == productId && String(cartItems[i].product_size || '') == String(productSize || '')) {
                existingIndex = i;
                break;
            }
        }

        if (existingIndex > -1) {
            var oldQty = Number(cartItems[existingIndex].quantity) || 1;
            cartItems[existingIndex].quantity = oldQty + 1;
        }
        else {
            cartItems.push({
                id: productId,
                quantity: 1,
                product_size: String(productSize || '')
            });
        }

        localStorage.setItem('cart', JSON.stringify(cartItems));
    }

    function showMoveAllFeedback() {
        if (!moveAllBtn) {
            return;
        }

        var originalText = moveAllBtn.innerHTML;
        moveAllBtn.classList.remove('added-all-feedback');
        void moveAllBtn.offsetWidth;
        moveAllBtn.classList.add('added-all-feedback');
        moveAllBtn.innerHTML = 'ADDED ALL ✓';

        setTimeout(function () {
            moveAllBtn.innerHTML = originalText;
            moveAllBtn.classList.remove('added-all-feedback');
        }, 1000);
    }

    function moveAllWishlistItemsToCart() {
        var cards = wishlistGrid.querySelectorAll('.wishlist-card');

        for (var i = 0; i < cards.length; i++) {
            var moveButton = cards[i].querySelector('.move-btn');

            if (!moveButton) {
                continue;
            }

            var itemId = Number(moveButton.getAttribute('data-id'));
            var activeSize = cards[i].querySelector('.wl-size-option.active');
            var selectedSize = activeSize ? String(activeSize.getAttribute('data-size') || '') : '';

            if (itemId > 0) {
                addToCart(itemId, selectedSize);
            }
        }

        showMoveAllFeedback();
    }

    function renderWishlist(allProducts) {
        var ids = readWishlistIds();
        var html = '';
        var foundCount = 0;

        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            var currentProduct = null;

            for (var j = 0; j < allProducts.length; j++) {
                if (Number(allProducts[j].id) == id) {
                    currentProduct = allProducts[j];
                    break;
                }
            }

            if (!currentProduct) {
                continue;
            }

            foundCount++;

            var image = '';

            if (currentProduct.product_images && currentProduct.product_images.length > 0) {
                image = currentProduct.product_images[0];
            }

            var title = currentProduct.product_title || 'Product';
            var price = currentProduct.product_price || '';
            var meta = currentProduct.subcategory || '';
            var sizes = currentProduct.product_size || [];
            var sizeHtml = '<div class="size-row"><span class="size-label">SELECT SIZE</span><div class="size-options">';

            if (sizes.length == 0) {
                sizeHtml += '<button class="wl-size-option active" type="button" data-size="">ONE SIZE</button>';
            }
            else {
                for (var k = 0; k < sizes.length; k++) {
                    var sizeValue = String(sizes[k]);
                    var activeClass = k == 0 ? ' active' : '';
                    sizeHtml += '<button class="wl-size-option' + activeClass + '" type="button" data-size="' + sizeValue + '">' + getDisplaySize(sizeValue) + '</button>';
                }
            }

            sizeHtml += '</div></div>';

            html += '<article class="wishlist-card">' +
                '<div class="card-image">' +
                '<button class="remove-icon" data-id="' + id + '" type="button" aria-label="Remove item">x</button>' +
                '<img src="' + image + '" alt="' + title + '">' +
                '</div>' +
                '<div class="card-info">' +
                '<div class="card-title-row">' +
                '<h3 class="card-title">' + title + '</h3>' +
                '<span class="card-price">' + price + '</span>' +
                '</div>' +
                '<p class="card-meta">' + meta + '</p>' +
                sizeHtml +
                '<button class="move-btn" data-id="' + id + '" type="button">MOVE TO CART</button>' +
                '<button class="remove-link" data-id="' + id + '" type="button">REMOVE ITEM</button>' +
                '</div>' +
                '</article>';
        }

        wishlistGrid.innerHTML = html;
        savedCount.textContent = String(foundCount);
        emptyMessage.style.display = foundCount === 0 ? 'block' : 'none';

        if (moveAllBtn) {
            moveAllBtn.disabled = foundCount === 0;
        }
    }

    function loadProductsAndRender() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '../all_products.json');
        xhr.responseType = 'json';
        xhr.send();

        xhr.onload = function () {
            if (xhr.status != 200 || !xhr.response) {
                wishlistGrid.innerHTML = '';
                savedCount.textContent = '0';
                emptyMessage.style.display = 'block';
                return;
            }

            var allProducts = xhr.response.data || [];

            if (!Array.isArray(allProducts)) {
                allProducts = [];
            }

            renderWishlist(allProducts);

            wishlistGrid.onclick = function (event) {
                var sizeButton = event.target.closest('.wl-size-option');
                var removeButton = event.target.closest('.remove-icon, .remove-link');
                var moveButton = event.target.closest('.move-btn');

                if (sizeButton) {
                    var sizeContainer = sizeButton.closest('.size-options');

                    if (sizeContainer) {
                        var options = sizeContainer.querySelectorAll('.wl-size-option');

                        for (var s = 0; s < options.length; s++) {
                            options[s].classList.remove('active');
                        }

                        sizeButton.classList.add('active');
                    }

                    return;
                }

                if (removeButton) {
                    var removeId = Number(removeButton.getAttribute('data-id'));
                    var ids = readWishlistIds();
                    var newIds = [];

                    for (var i = 0; i < ids.length; i++) {
                        if (ids[i] != removeId) {
                            newIds.push(ids[i]);
                        }
                    }

                    writeWishlistIds(newIds);
                    renderWishlist(allProducts);
                    return;
                }

                if (moveButton) {
                    var moveId = Number(moveButton.getAttribute('data-id'));
                    var parentCard = moveButton.closest('.wishlist-card');
                    var activeSize = parentCard ? parentCard.querySelector('.wl-size-option.active') : null;
                    var selectedSize = activeSize ? String(activeSize.getAttribute('data-size') || '') : '';
                    addToCart(moveId, selectedSize);
                }
            };
        };

        xhr.onerror = function () {
            wishlistGrid.innerHTML = '';
            savedCount.textContent = '0';
            emptyMessage.style.display = 'block';
        };
    }

    if (moveAllBtn) {
        moveAllBtn.onclick = function () {
            moveAllWishlistItemsToCart();
        };
    }

    loadProductsAndRender();
})();
