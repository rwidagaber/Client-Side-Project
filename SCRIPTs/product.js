var xhr = new XMLHttpRequest()
xhr.open('GET', '/all_products.json');

xhr.responseType = 'json'

xhr.send()
var products
xhr.onload = function () {

  products = xhr.response.data
  displayProducts(products)
  filterProduct()
  searchProduct()

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

// Filter
function filterProduct() {
  const filterButtons = document.querySelectorAll('.filter-btn');



  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category');
      const allCards = document.querySelectorAll('.card');


      allCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          card.style.display = 'block'
        } else {
          card.style.display = 'none'
        }
      });


    });
  });
}


// search
function searchProduct() {
  var searchInput = document.getElementById('searchInput');

  searchInput.addEventListener("input", function () {

    var searchValue = searchInput.value.toLowerCase();

    var filteredProducts = products.filter(function (product) {

      return product.product_title.toLowerCase().includes(searchValue);

    });

    displayProducts(filteredProducts);

  });

}
