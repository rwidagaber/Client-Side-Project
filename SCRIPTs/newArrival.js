var xhr = new XMLHttpRequest();
xhr.open('GET', '/all_products.json');
xhr.responseType = 'json';
xhr.send();

var storageKey = 'whishlist';
var wishlistCount = document.getElementById('wishlist-count');

var selectedIds = [133, 100, 64, 89, 75, 91, 32, 52, 97];
var featuredProducts = [];
xhr.onload = function () {
    var products = xhr.response.data;

    featuredProducts = products.filter(function (p) {
        return selectedIds.includes(p.id);
    });

    displayProducts(featuredProducts);
    searchProduct();
};

function displayProducts(products) {

    var cardContainer = document.getElementById('products');
    cardContainer.innerHTML = "";

    for (var product of products) {

        var priceText = product.product_price || product.price || "0";
        var price = parseFloat(priceText.toString().replace(/[^\d.]/g, ''));

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
                <div class="price">${price.toFixed(2)} EGP</div>

                <button class="cart-btn"
                    onclick="window.open('product_details.html?id=${product.id}','_blank')">
                    See Details
                </button>
            </div>
            `;

        cardContainer.appendChild(card);
    }
    setupWishlist();
    updateWishlistCount();
}

function searchProduct() {
    var searchInput = document.getElementById('searchInput');

    searchInput.addEventListener("input", function () {
        var searchValue = searchInput.value.toLowerCase();

        var filtered = featuredProducts.filter(function (product) {
            return product.product_title.toLowerCase().includes(searchValue);
        });

        displayProducts(filtered);
    });
}


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