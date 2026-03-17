(function () {
    var wishlistGrid = document.getElementById('wishlist_grid');
    var savedCount = document.getElementById('saved_count');
    var emptyMessage = document.getElementById('empty_message');
    var moveAllBtn = document.getElementById('move_all_btn');
    var defaultMoveAllText = moveAllBtn ? moveAllBtn.innerHTML : 'MOVE ALL TO CART';
    var currentAllProducts = [];

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

    function addToCart(productId, productSize, stockCount) {
        var maxStock = Number(stockCount);

        if (Number.isFinite(maxStock) && maxStock <= 0) {
            return false;
        }

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
            var newQty = oldQty + 1;

            if (Number.isFinite(maxStock) && maxStock > 0) {
                cartItems[existingIndex].quantity = Math.min(newQty, maxStock);
            }
            else {
                cartItems[existingIndex].quantity = newQty;
            }
        }
        else {
            var itemQty = 1;

            if (Number.isFinite(maxStock) && maxStock > 0) {
                itemQty = Math.min(1, maxStock);
            }

            cartItems.push({
                id: productId,
                quantity: itemQty,
                product_size: String(productSize || '')
            });
        }

        localStorage.setItem('cart', JSON.stringify(cartItems));
        return true;
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

    function showNoMovableItemsFeedback() {
        if (!moveAllBtn) {
            return;
        }

        var originalText = moveAllBtn.innerHTML;
        moveAllBtn.innerHTML = 'NO ITEMS IN STOCK';

        setTimeout(function () {
            moveAllBtn.innerHTML = originalText;
        }, 1000);
    }

    function removeWishlistIdByValue(removeId) {
        var ids = readWishlistIds();
        var newIds = [];

        for (var i = 0; i < ids.length; i++) {
            if (ids[i] != removeId) {
                newIds.push(ids[i]);
            }
        }

        writeWishlistIds(newIds);
    }

    function moveAllWishlistItemsToCart() {
        var cards = wishlistGrid.querySelectorAll('.wishlist-card');
        var movedCount = 0;
        var movedIds = [];

        for (var i = 0; i < cards.length; i++) {
            var moveButton = cards[i].querySelector('.move-btn');

            if (!moveButton) {
                continue;
            }

            var itemId = Number(moveButton.getAttribute('data-id'));
            var stockCount = Number(moveButton.getAttribute('data-stock'));
            var activeSize = cards[i].querySelector('.wl-size-option.active');
            var selectedSize = activeSize ? String(activeSize.getAttribute('data-size') || '') : '';

            if (itemId > 0) {
                var moved = addToCart(itemId, selectedSize, stockCount);

                if (moved) {
                    movedCount++;

                    if (movedIds.indexOf(itemId) == -1) {
                        movedIds.push(itemId);
                    }
                }
            }
        }

        if (movedCount > 0) {
            var ids = readWishlistIds();
            var remainingIds = [];

            for (var x = 0; x < ids.length; x++) {
                if (movedIds.indexOf(ids[x]) == -1) {
                    remainingIds.push(ids[x]);
                }
            }

            writeWishlistIds(remainingIds);
            renderWishlist(currentAllProducts);
            showMoveAllFeedback();
            
            if (window.updateNavbarCounts) {
                window.updateNavbarCounts();
            }
        }
        else {
            showNoMovableItemsFeedback();
        }
    }

    function renderWishlist(allProducts) {
        var ids = readWishlistIds();
        var html = '';
        var foundCount = 0;
        var movableCount = 0;

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
            var stockCount = Number(currentProduct.stock) || 0;
            var isOutOfStock = stockCount <= 0;
            if (!isOutOfStock) {
                movableCount++;
            }
            var stockText = isOutOfStock ? 'Out of Stock' : ('In Stock (' + stockCount + ')');
            var stockClass = isOutOfStock ? ' out-of-stock' : '';
            var moveDisabled = isOutOfStock ? ' disabled' : '';
            var moveButtonText = isOutOfStock ? 'OUT OF STOCK' : 'MOVE TO CART';
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
                '<p class="card-stock' + stockClass + '">' + stockText + '</p>' +
                sizeHtml +
                '<button class="move-btn" data-id="' + id + '" data-stock="' + stockCount + '" type="button"' + moveDisabled + '>' + moveButtonText + '</button>' +
                '<button class="remove-link" data-id="' + id + '" type="button">REMOVE ITEM</button>' +
                '</div>' +
                '</article>';
        }

        wishlistGrid.innerHTML = html;
        savedCount.textContent = String(foundCount);
        emptyMessage.style.display = foundCount === 0 ? 'block' : 'none';

        if (moveAllBtn) {
            moveAllBtn.disabled = movableCount === 0;
            moveAllBtn.title = movableCount === 0 ? 'No in-stock items to move.' : 'Move all in-stock items to cart.';
            moveAllBtn.innerHTML = defaultMoveAllText;
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

            currentAllProducts = allProducts;

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
                    removeWishlistIdByValue(removeId);
                    renderWishlist(allProducts);
                    
                    if (window.updateNavbarCounts) {
                        window.updateNavbarCounts();
                    }
                    return;
                }

                if (moveButton) {
                    if (moveButton.disabled) {
                        return;
                    }

                    var moveId = Number(moveButton.getAttribute('data-id'));
                    var moveStock = Number(moveButton.getAttribute('data-stock'));
                    var parentCard = moveButton.closest('.wishlist-card');
                    var activeSize = parentCard ? parentCard.querySelector('.wl-size-option.active') : null;
                    var selectedSize = activeSize ? String(activeSize.getAttribute('data-size') || '') : '';
                    var moved = addToCart(moveId, selectedSize, moveStock);

                    if (moved) {
                        removeWishlistIdByValue(moveId);
                        renderWishlist(allProducts);
                        
                        if (window.updateNavbarCounts) {
                            window.updateNavbarCounts();
                        }
                    }
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
