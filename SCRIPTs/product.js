var xhr = new XMLHttpRequest()
xhr.open('GET', '/all_products.json');

xhr.responseType = 'json'

xhr.send()
var products
xhr.onload = function () {

  products = xhr.response.data
  displayProducts(products)

}

function displayProducts(products) {

  var cardContainer = document.getElementById('products')
  cardContainer.innerHTML = ""

  for (var product of products) {

    var card = document.createElement('div')
    card.classList.add('card')
    card.setAttribute('data-category', product.category)

    card.innerHTML = `
      <div class="card-img">
        <img src="${product.product_images[0]}" alt="${product.product_title}">
        <div class="favorite"><i class="fi fi-rr-heart"></i></div>
      </div>

      <div class="card-body">
        <h3>${product.product_title}</h3>
        <p class="category">${product.category}</p>
        <div class="price">${product.product_price}</div>

        <button class="cart-btn"
        onclick="window.open('product_details.html?id=${product.id}','_blank')">
        See Details
        </button>
      </div>
    `

    cardContainer.appendChild(card)
  }
}



