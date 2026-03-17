
var data = new URLSearchParams(location.search);
var id = data.get('id');
var main = document.querySelector('main');
var productImage = document.getElementById('product_image');
var productName = document.getElementById('product_name');
var productTitle = document.getElementById('product_title');
var productPrice = document.getElementById('product_price');
var productStock = document.getElementById('product_stock');
var productDescription = document.getElementById('product_description');
var galleryThumbnails = document.getElementById('gallery_thumbnails');
var galleryPrev = document.getElementById('gallery_prev');
var galleryNext = document.getElementById('gallery_next');
var sizeTitle = document.getElementById('size_title');
var sizeOptionsContainer = document.getElementById('size_options');
var qtyMinus = document.getElementById('qty_minus');
var qtyPlus = document.getElementById('qty_plus');
var qtyValue = document.getElementById('qty_value');
var addToCartBtn = document.getElementById('add_to_cart');
var productLinkBtn = document.getElementById('product_link_btn');
var visibleImagesCount = 3;
var galleryStartIndex = 0;
var currentImages = [];
var activeImageIndex = 0;
var currentQuantity = 1;
var currentStock = null;
var relatedProducts = [];
var categoryItem;
var relatedStartIndex = 0;
var relatedVisibleCount = 4;
var relatedSection = document.getElementById('related_section');
var relatedList = document.getElementById('related_list');
var relatedPrev = document.getElementById('related_prev');
var relatedNext = document.getElementById('related_next');



function setupSizeSelection() {
    var sizeOptions = document.querySelectorAll('.size-option');

    for (var i = 0; i < sizeOptions.length; i++) {
        sizeOptions[i].onclick = function () {
            for (var j = 0; j < sizeOptions.length; j++) {
                sizeOptions[j].classList.remove('active');
            }

            this.classList.add('active');
        };
    }
}

function getDisplaySize(sizeText) {
    var normalizedSize = String(sizeText).toUpperCase().trim();

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

    if (normalizedSize == 'EXTRA SMALL') {
        return 'XS';
    }

    return normalizedSize;
}

function getSizeRank(sizeText) {
    var normalizedSize = String(sizeText).toUpperCase().trim();

    if (normalizedSize == 'EXTRA SMALL' || normalizedSize == 'XS') {
        return 1;
    }

    if (normalizedSize == 'SMALL' || normalizedSize == 'S') {
        return 2;
    }

    if (normalizedSize == 'MEDIUM' || normalizedSize == 'M') {
        return 3;
    }

    if (normalizedSize == 'LARGE' || normalizedSize == 'L') {
        return 4;
    }

    if (normalizedSize == 'EXTRA LARGE' || normalizedSize == 'XL') {
        return 5;
    }

    if (normalizedSize == 'XXL' || normalizedSize == '2XL' || normalizedSize == 'EXTRA EXTRA LARGE') {
        return 6;
    }

    return 99;
}

function renderSizeOptions(sizes) {
    if (!sizeOptionsContainer) {
        return;
    }

    var validSizes = sizes || [];

    if (validSizes.length == 0) {
        sizeOptionsContainer.innerHTML = '';
        sizeOptionsContainer.style.display = 'none';

        if (sizeTitle) {
            sizeTitle.style.display = 'none';
        }

        return;
    }
    else {
        sizeOptionsContainer.style.display = 'flex';

        if (sizeTitle) {
            sizeTitle.style.display = 'block';
        }

        var sizesHtml = '';
        var uniqueSizes = [];

        for (var i = 0; i < validSizes.length; i++) {
            var item = String(validSizes[i]);

            if (uniqueSizes.indexOf(item) == -1) {
                uniqueSizes.push(item);
            }
        }

        uniqueSizes.sort(function (a, b) {
            return getSizeRank(a) - getSizeRank(b);
        });

        for (var i = 0; i < uniqueSizes.length; i++) {
            var activeClass = i == 0 ? ' active' : '';
            var sizeText = String(uniqueSizes[i]);
            var sizeLabel = getDisplaySize(sizeText);
            sizesHtml += '<button class="size-option' + activeClass + '" type="button" data-size="' + sizeText + '" title="' + sizeText + '">' + sizeLabel + '</button>';
        }

        sizeOptionsContainer.innerHTML = sizesHtml;
    }

    setupSizeSelection();
}

function updateQuantity() {
    qtyValue.innerHTML = String(currentQuantity);
}

function updateQuantityControlsByStock() {
    if (!qtyMinus || !qtyPlus) {
        return;
    }

    var hasStockValue = Number.isFinite(currentStock);

    if (hasStockValue && currentStock <= 0) {
        currentQuantity = 1;
        updateQuantity();
        qtyMinus.disabled = true;
        qtyPlus.disabled = true;
        qtyMinus.style.cursor = 'not-allowed';
        qtyPlus.style.cursor = 'not-allowed';
        return;
    }

    if (hasStockValue && currentQuantity > currentStock) {
        currentQuantity = currentStock;
        updateQuantity();
    }

    qtyMinus.disabled = currentQuantity <= 1;
    qtyMinus.style.cursor = qtyMinus.disabled ? 'not-allowed' : 'pointer';

    if (hasStockValue && currentStock > 0) {
        qtyPlus.disabled = currentQuantity >= currentStock;
    }
    else {
        qtyPlus.disabled = false;
    }

    qtyPlus.style.cursor = qtyPlus.disabled ? 'not-allowed' : 'pointer';
}

function setupQuantityControls() {
    if (!qtyMinus || !qtyPlus || !qtyValue) {
        return;
    }

    updateQuantity();
    updateQuantityControlsByStock();

    qtyMinus.onclick = function () {
        if (currentQuantity > 1) {
            currentQuantity--;
            updateQuantity();
            updateQuantityControlsByStock();
        }
    };

    qtyPlus.onclick = function () {
        if (Number.isFinite(currentStock) && currentStock > 0 && currentQuantity >= currentStock) {
            updateQuantityControlsByStock();
            return;
        }

        currentQuantity++;
        updateQuantity();
        updateQuantityControlsByStock();
    };
}

function getSelectedSizeValue() {
    if (!sizeOptionsContainer) {
        return '';
    }

    var activeSizeButton = sizeOptionsContainer.querySelector('.size-option.active');

    if (!activeSizeButton) {
        return '';
    }

    return String(activeSizeButton.getAttribute('data-size') || '').trim();
}

function getStoredCartItems() {
    var cartData = localStorage.getItem('cart');

    if (!cartData) {
        return [];
    }

    try {
        var parsedCart = JSON.parse(cartData);

        if (Array.isArray(parsedCart)) {
            return parsedCart;
        }
    }
    catch (error) {
        return [];
    }

    return [];
}

function saveCurrentProductToCart() {
    var productId = Number(id);

    if (!productId) {
        return;
    }

    var selectedSize = getSelectedSizeValue();
    var cartItems = getStoredCartItems();
    var existingItemIndex = -1;

    for (var i = 0; i < cartItems.length; i++) {
        if (Number(cartItems[i].id) == productId && String(cartItems[i].product_size || '') == selectedSize) {
            existingItemIndex = i;
            break;
        }
    }

    if (existingItemIndex > -1) {
        var existingQuantity = Number(cartItems[existingItemIndex].quantity) || 0;
        var mergedQuantity = existingQuantity + currentQuantity;

        if (Number.isFinite(currentStock) && currentStock > 0) {
            cartItems[existingItemIndex].quantity = Math.min(mergedQuantity, currentStock);
        }
        else {
            cartItems[existingItemIndex].quantity = mergedQuantity;
        }
    }
    else {
        var itemQuantity = currentQuantity;

        if (Number.isFinite(currentStock) && currentStock > 0) {
            itemQuantity = Math.min(currentQuantity, currentStock);
        }

        cartItems.push({
            id: productId,
            quantity: itemQuantity,
            product_size: selectedSize
        });
    }

    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    if (window.updateNavbarCounts) {
        window.updateNavbarCounts();
    }
}

function showAddToCartFeedback() {
    if (!addToCartBtn) {
        return;
    }

    var originalText = addToCartBtn.innerHTML;
    addToCartBtn.classList.remove('added-feedback');
    void addToCartBtn.offsetWidth;
    addToCartBtn.classList.add('added-feedback');
    addToCartBtn.innerHTML = 'ADDED TO CART ✓';
    addToCartBtn.disabled = true;

    setTimeout(function () {
        addToCartBtn.innerHTML = originalText;
        addToCartBtn.disabled = false;
        addToCartBtn.classList.remove('added-feedback');
    }, 1400);
}

function setupAddToCartButton() {
    if (!addToCartBtn) {
        return;
    }

    addToCartBtn.onclick = function () {
        saveCurrentProductToCart();
        showAddToCartFeedback();
    };
}

function setupProductLinkButton(websiteLink) {
    if (!productLinkBtn) {
        return;
    }

    var linkValue = String(websiteLink || '').trim();

    if (!linkValue) {
        productLinkBtn.disabled = true;
        productLinkBtn.style.cursor = 'not-allowed';
        return;
    }

    productLinkBtn.disabled = false;
    productLinkBtn.style.cursor = 'pointer';
    productLinkBtn.onclick = function () {
        window.open(linkValue, '_blank');
    };
}

function updateStockStatus(stockValue) {
    if (!addToCartBtn || !productStock) {
        return;
    }

    var stockCount = Number(stockValue);
    currentStock = Number.isFinite(stockCount) ? stockCount : null;

    if (Number.isFinite(currentStock) && currentStock > 0 && currentQuantity > currentStock) {
        currentQuantity = currentStock;
        updateQuantity();
    }

    updateQuantityControlsByStock();

    if (!Number.isFinite(stockCount) || stockCount <= 0) {
        productStock.innerHTML = 'Out of Stock';
        productStock.classList.add('out-of-stock');
        addToCartBtn.innerHTML = 'OUT OF STOCK';
        addToCartBtn.disabled = true;
        addToCartBtn.classList.add('out-of-stock');
        addToCartBtn.style.cursor = 'not-allowed';
        return;
    }

    productStock.innerHTML = 'In Stock (' + stockCount + ')';
    productStock.classList.remove('out-of-stock');
    addToCartBtn.innerHTML = 'ADD TO CART';
    addToCartBtn.disabled = false;
    addToCartBtn.classList.remove('out-of-stock');
    addToCartBtn.style.cursor = 'pointer';
}

function renderNotFound() {
    document.title = 'Not Found';

    if (main) {
        main.innerHTML = '<section class="not-found-section"><div class="not-found-box"><h1>Product Not Found</h1><p>The product you are looking for does not exist or is no longer available.</p><a href="index.html">Back to Home</a></div></section>';
    }
}

function updateMainImage(imageIndex) {
    activeImageIndex = imageIndex;
    productImage.src = currentImages[imageIndex];
    renderGallery();
}

function renderGallery() {
    var thumbnailsHtml = '';
    var lastIndex = galleryStartIndex + visibleImagesCount;
    var visibleImages = currentImages.slice(galleryStartIndex, lastIndex);

    for (var i = 0; i < visibleImages.length; i++) {
        var imageIndex = galleryStartIndex + i;
        var activeClass = imageIndex == activeImageIndex ? ' active' : '';
        thumbnailsHtml += '<button class="gallery-thumbnail' + activeClass + '" type="button" data-index="' + imageIndex + '"><img src="' + visibleImages[i] + '" alt="Product thumbnail"></button>';
    }

    galleryThumbnails.innerHTML = thumbnailsHtml;
    galleryPrev.disabled = galleryStartIndex == 0;
    galleryNext.disabled = lastIndex >= currentImages.length;

    var thumbnailButtons = galleryThumbnails.querySelectorAll('.gallery-thumbnail');

    for (var j = 0; j < thumbnailButtons.length; j++) {
        thumbnailButtons[j].onclick = function () {
            updateMainImage(Number(this.getAttribute('data-index')));
        };
    }
}

function setupGallery(images) {
    currentImages = images || [];
    galleryStartIndex = 0;
    activeImageIndex = 0;

    if (currentImages.length == 0) {
        galleryThumbnails.innerHTML = '';
        galleryPrev.disabled = true;
        galleryNext.disabled = true;
        return;
    }

    updateMainImage(0);

    galleryPrev.onclick = function () {
        if (galleryStartIndex > 0) {
            galleryStartIndex--;
            renderGallery();
        }
    };

    galleryNext.onclick = function () {
        if (galleryStartIndex + visibleImagesCount < currentImages.length) {
            galleryStartIndex++;
            renderGallery();
        }
    };
}

if (!id) {
    renderNotFound();
}
else {
    setupQuantityControls();
    setupAddToCartButton();

    var xhr = new XMLHttpRequest();
    xhr.open('GET', `http://localhost:3000/data/${id}`);
    xhr.responseType = 'json';
    xhr.send();

    xhr.onload = function () {
        if (xhr.status == 200 && xhr.response) {
            var product = xhr.response;
            var productImages = product.product_images || [];
            var productSizes = product.product_size || [];

            // if (productImages.length == 0) {
            //     renderNotFound();
            //     return;
            // }

            categoryItem = product.subcategory;
            productName.innerHTML = product.product_title;
            productTitle.innerHTML = product.product_title;
            productPrice.innerHTML = product.product_price;
            setupGallery(productImages);
            renderSizeOptions(productSizes);
            updateStockStatus(product.stock);
            setupProductLinkButton(product.website_link);

            if (product.description) {
                productDescription.innerHTML = product.description;
            }

            if (categoryItem) {
                loadRelatedProducts(categoryItem, Number(id));
            }
        }
        else {
            renderNotFound();
        }
    };

    xhr.onerror = function () {
        renderNotFound();
    };
}

function renderRelatedProducts() {
    if (!relatedList) {
        return;
    }

    var html = '';
    var end = relatedStartIndex + relatedVisibleCount;
    var visible = relatedProducts.slice(relatedStartIndex, end);

    for (var i = 0; i < visible.length; i++) {
        var p = visible[i];
        var img = (p.product_images && p.product_images[0]) ? p.product_images[0] : '';
        var badge = p.is_new ? '<span class="related-badge">NEW</span>' : '';
        html += '<a class="related-card" href="product_details.html?id=' + p.id + '">' +
            '<div class="related-card-img">' + badge + '<img src="' + img + '" alt="' + p.product_title + '"><span class="related-cart-icon"><i class="fa-solid fa-cart-shopping"></i></span></div>' +
            '<div class="related-card-info"><span class="related-card-name">' + p.product_title + '</span><span class="related-card-price">' + p.product_price + '</span></div>' +
            '</a>';
    }

    relatedList.innerHTML = html;

    if (relatedPrev) {
        relatedPrev.disabled = relatedStartIndex === 0;
    }

    if (relatedNext) {
        relatedNext.disabled = end >= relatedProducts.length;
    }
}

function loadRelatedProducts(subcategory, currentId) {
    var xhrAll = new XMLHttpRequest();
    xhrAll.open('GET', 'http://localhost:3000/data');
    xhrAll.responseType = 'json';
    xhrAll.send();

    xhrAll.onload = function () {
        if (xhrAll.status == 200 && xhrAll.response) {
            var all = xhrAll.response.data || xhrAll.response;

            if (!Array.isArray(all)) {
                return;
            }

            relatedProducts = [];

            for (var i = 0; i < all.length; i++) {
                if (all[i].subcategory == subcategory && all[i].id != currentId) {
                    relatedProducts.push(all[i]);
                }
            }

            if (relatedProducts.length == 0) {
                return;
            }

            if (relatedSection) {
                relatedSection.style.display = 'block';
            }

            renderRelatedProducts();

            if (relatedPrev) {
                relatedPrev.onclick = function () {
                    if (relatedStartIndex > 0) {
                        relatedStartIndex--;
                        renderRelatedProducts();
                    }
                };
            }

            if (relatedNext) {
                relatedNext.onclick = function () {
                    if (relatedStartIndex + relatedVisibleCount < relatedProducts.length) {
                        relatedStartIndex++;
                        renderRelatedProducts();
                    }
                };
            }
        }
    };
}