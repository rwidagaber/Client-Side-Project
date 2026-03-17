var fashionImg = document.getElementById('fashion-category');
var skinImg = document.getElementById('skincare-category');
var foodImg = document.getElementById('food-category');
var footImg = document.getElementById('footwear-category');
var homeImg = document.getElementById('home-category');

var cardContainer = document.getElementById('products');
var wishlistCount = document.getElementById('wishlist-count');

var storageKey = 'whishlist';

var xhr = new XMLHttpRequest();
xhr.open('GET', '/all_products.json');
xhr.responseType = 'json';
xhr.send();

xhr.onload = function () {

    var products = xhr.response.data;

    var featuredProducts = [33, 40, 64, 99];

    for (var product of products) {

        if (product.id == 66) footImg.src = product.product_images[0];
        if (product.id == 58) fashionImg.src = product.product_images[0];
        if (product.id == 24) foodImg.src = product.product_images[2];
        if (product.id == 113) homeImg.src = product.product_images[0];
        if (product.id == 98) skinImg.src = product.product_images[0];

        if (featuredProducts.includes(product.id)) {

            var card = document.createElement('div');
            card.classList.add('card');

            card.innerHTML = `
            <div class="card-img">
                <img src="${product.product_images[0]}" alt="${product.product_title}">
                
                <button class="wishlist-btn" data-id="${product.id}">
                    <i class="fa-regular fa-heart"></i>
                </button>
            </div>

            <div class="card-body">
                <h3>${product.product_title}</h3>
                <p class="category-product">${product.category}</p>
                <div class="price">${product.product_price}</div>

                <button class="cart-btn"
                    onclick="window.open('product_details.html?id=${product.id}','_blank')">
                    See Details
                </button>
            </div>
            `;

            cardContainer.appendChild(card);
        }
    }

    setupWishlist();
    updateWishlistCount();

    var categoryItems = document.querySelectorAll('.category-img .item');
    var categoryNames = ['Fashion', 'Beauty & Health', 'Footwear', 'Food & Drink', 'Homeware'];
    categoryItems.forEach(function (item, index) {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function () {
            var cat = categoryNames[index];

            window.location.href = '/HTMLs/Product.html?category=' + encodeURIComponent(cat);
        });
    });
};

function readWishlist() {

    var raw = localStorage.getItem(storageKey);

    if (!raw) return [];

    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function writeWishlist(items) {
    localStorage.setItem(storageKey, JSON.stringify(items));
}



function setupWishlist() {

    var buttons = document.querySelectorAll('.wishlist-btn');
    var items = readWishlist();

    buttons.forEach(function (btn) {

        var productId = Number(btn.dataset.id);
        var heart = btn.querySelector('i');

        if (items.includes(productId)) {
            heart.classList.replace('fa-regular', 'fa-solid');
        }

        btn.addEventListener('click', function () {

            btn.classList.add("animate");

            setTimeout(function () {
                btn.classList.remove("animate");
            }, 400);

            var index = items.indexOf(productId);

            if (index > -1) {
                items.splice(index, 1);
                heart.classList.replace('fa-solid', 'fa-regular');
            }
            else {
                items.push(productId);
                heart.classList.replace('fa-regular', 'fa-solid');
            }

            writeWishlist(items);
            updateWishlistCount();
        });

    });

}

function updateWishlistCount() {

    var items = readWishlist();

    if (wishlistCount) {
        wishlistCount.innerText = items.length;
    }

}