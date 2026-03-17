var xhr = new XMLHttpRequest();
xhr.open('GET', '/all_products.json');
xhr.responseType = 'json';
xhr.send();

var selectedIds = [133, 100, 64, 89, 75, 91, 32, 52, 97];
var featuredProducts = []; 
xhr.onload = function () {
    var products = xhr.response.data;
    
    featuredProducts = products.filter(function(p) {
        return selectedIds.includes(p.id);
    });
    
    displayProducts(featuredProducts);
    searchProduct();
};

function displayProducts(products) {
    var cardContainer = document.getElementById('products');
    cardContainer.innerHTML = "";

    for (var product of products) {
        var card = document.createElement('div');
        card.classList.add('card');

        card.innerHTML = `
        <div class="card-img">
            <img src="${product.product_images[0]}" alt="${product.product_title}">
            <div class="favorite-product">♡</div>
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

function searchProduct() {
    var searchInput = document.getElementById('searchInput');

    searchInput.addEventListener("input", function () {
        var searchValue = searchInput.value.toLowerCase();

        var filtered = featuredProducts.filter(function(product) {
            return product.product_title.toLowerCase().includes(searchValue);
        });

        displayProducts(filtered);
    });
}