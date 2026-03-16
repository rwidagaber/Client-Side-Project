var fashionImg = document.getElementById('fashion-category');
var skinImg = document.getElementById('skincare-category');
var foodImg = document.getElementById('food-category')
var footImg = document.getElementById('footwear-category')
var homeImg = document.getElementById('home-category')


var xhr = new XMLHttpRequest();
xhr.open('GET', '/all_products.json')
xhr.send()
xhr.responseType = 'json';

xhr.onload = function () {
    var products = xhr.response.data;
    var cardContainer = document.getElementById('products')
    for (var product of products) {
        if (product.id == 66) {
            footImg.src = product.product_images[0];
        }
        if (product.id == 58) {
            fashionImg.src = product.product_images[0];
        }
        if (product.id == 24) {
            foodImg.src = product.product_images[2];
        }
        if (product.id == 113) {
            homeImg.src = product.product_images[0];
        }
        if (product.id == 98) {
            skinImg.src = product.product_images[0]
        }


        var card = document.createElement('div')
        card.classList.add('card')

        if (product.id == 33||product.id==40||product.id==64||product.id==99) {
            card.innerHTML =
                `<div class="card-img">
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
           </div>`
            cardContainer.appendChild(card)
        }
    }
}

