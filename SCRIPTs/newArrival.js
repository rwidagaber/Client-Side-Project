var xhr = new XMLHttpRequest();
xhr.open('GET', '/all_products.json');
xhr.responseType = 'json';
xhr.send();

xhr.onload = function () {

    var products = xhr.response.data;
    var cardContainer = document.getElementById('products');
    var selectedIds = [133, 100, 64, 89, 75, 91, 32, 52,97];

    for (var product of products) {
        if (selectedIds.includes(product.id)) {

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
};