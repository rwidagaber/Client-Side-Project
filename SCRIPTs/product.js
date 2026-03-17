
var xhr = new XMLHttpRequest()
var cardContainer = document.getElementById('products')
var wishlistCount = document.getElementById('wishlist-count')

var storageKey = "whishlist"
var products
xhr.open('GET', '/all_products.json');

xhr.responseType = 'json'

xhr.send()


xhr.onload = function () {
  products = xhr.response.data

  var urlParams = new URLSearchParams(window.location.search);
  var categoryFromURL = urlParams.get('category');

  if (categoryFromURL) {
    var filtered = products.filter(function (p) {
      return p.category.toLowerCase() === categoryFromURL.toLowerCase();
    });
    displayProducts(filtered);
  } else {
    displayProducts(products);
  }

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
        <button class="wishlist-btn" data-id="${product.id}">
                    <i class="fa-regular fa-heart"></i>
                </button>
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
  setupWishlist()
  updateWishlistCount();





  

 

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

 function readWishlist() {

    var raw = localStorage.getItem(storageKey)

    if (!raw) return []

    try {
      return JSON.parse(raw)
    } catch {
      return []
    }
  }

  function writeWishlist(items) {
    localStorage.setItem(storageKey, JSON.stringify(items))
  }

// Filter
function filterProduct() {
  const filterButtons = document.querySelectorAll('.filter-btn');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category');

      if (category === 'all') {
        displayProducts(products);
      } else {
        var filtered = products.filter(function(p) {
          return p.category.toLowerCase() === category.toLowerCase();
        });
        displayProducts(filtered);
      }

      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
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


