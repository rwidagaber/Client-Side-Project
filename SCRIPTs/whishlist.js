(function () {
    var storageKey = 'whishlist';
    var wishlistButton = document.querySelector('.wishlist-btn');

    if (!wishlistButton) {
        return;
    }

    function getCurrentProductId() {
        var params = new URLSearchParams(window.location.search);
        return Number(params.get('id'));
    }

    function readWhishlist() {
        var rawValue = localStorage.getItem(storageKey);

        if (!rawValue) {
            return [];
        }

        try {
            var parsedValue = JSON.parse(rawValue);

            if (!Array.isArray(parsedValue)) {
                return [];
            }

            var normalizedItems = [];

            for (var i = 0; i < parsedValue.length; i++) {
                var item = parsedValue[i];
                var itemId = Number(typeof item == 'object' && item !== null ? item.id : item);

                if (itemId > 0 && normalizedItems.indexOf(itemId) == -1) {
                    normalizedItems.push(itemId);
                }
            }

            return normalizedItems;
        }
        catch (error) {
            return [];
        }
    }

    function writeWhishlist(items) {
        localStorage.setItem(storageKey, JSON.stringify(items));
    }

    function setHeartState(isActive) {
        var heartIcon = wishlistButton.querySelector('i');

        wishlistButton.classList.toggle('active', isActive);

        if (heartIcon) {
            heartIcon.classList.toggle('fa-solid', isActive);
            heartIcon.classList.toggle('fa-regular', !isActive);
        }
    }

    function isInWhishlist(items, productId) {
        return items.indexOf(productId) > -1;
    }

    function syncButtonWithStorage() {
        var productId = getCurrentProductId();

        if (!productId) {
            setHeartState(false);
            return;
        }

        var whishlistItems = readWhishlist();
        setHeartState(isInWhishlist(whishlistItems, productId));
    }

    wishlistButton.addEventListener('click', function () {
        var productId = getCurrentProductId();

        if (!productId) {
            return;
        }

        var whishlistItems = readWhishlist();
        var existingIndex = whishlistItems.indexOf(productId);

        if (existingIndex > -1) {
            whishlistItems.splice(existingIndex, 1);
            setHeartState(false);
        }
        else {
            whishlistItems.push(productId);
            setHeartState(true);
        }

        writeWhishlist(whishlistItems);
        
        if (window.updateNavbarCounts) {
            window.updateNavbarCounts();
        }
    });

    syncButtonWithStorage();
})();
