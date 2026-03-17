
var xhr = new XMLHttpRequest();
var wishlistCount = document.getElementById('wishlist-count');
var storageKey = "whishlist";
var products;
var PRODUCTS_PER_PAGE = 8;
var currentPage = 1;
var currentProducts = [];

// ============ Load Products ============
xhr.open('GET', '/all_products.json');
xhr.responseType = 'json';
xhr.send();

xhr.onload = function () {
  products = xhr.response.data;

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

  filterProduct();
  searchProduct();
};

// ============ Display ============
function displayProducts(prods) {
  currentProducts = prods;
  currentPage = 1;
  renderPage();
}


// ============ Pagination ============//

function renderPage() {
  var cardContainer = document.getElementById('products');
  cardContainer.innerHTML = "";

  var start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  var pageProducts = currentProducts.slice(start, start + PRODUCTS_PER_PAGE);

  for (var product of pageProducts) {
    var card = document.createElement('div');
    card.classList.add('card');
    card.setAttribute('data-category', product.category);

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
        
        <div class="price">${parseFloat(product.product_price).toFixed(2)}</div>
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
  renderPagination();
}


function renderPagination() {
  var totalPages = Math.ceil(currentProducts.length / PRODUCTS_PER_PAGE);
  var container = document.getElementById('pagination');
  container.innerHTML = "";

  if (totalPages <= 1) return;


  container.innerHTML += `<button onclick="changePage(currentPage - 1)" ${currentPage === 1 ? 'disabled' : ''}>← Prev</button>`;


  for (var i = 1; i <= totalPages; i++) {


    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      container.innerHTML += `<button class="pg-num ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }

    else if (i === currentPage - 2 || i === currentPage + 2) {
      container.innerHTML += `<span class="pg-dots">...</span>`;
    }

  }

  container.innerHTML += `<button onclick="changePage(currentPage + 1)" ${currentPage === totalPages ? 'disabled' : ''}>Next →</button>`;


  var start = (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
  var end = Math.min(currentPage * PRODUCTS_PER_PAGE, currentProducts.length);

}

function changePage(page) {
  currentPage = page;
  renderPage();
  window.scrollTo(0, 0);
}

// ============ Wishlist ============
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
      setTimeout(function () { btn.classList.remove("animate"); }, 400);

      var index = items.indexOf(productId);
      if (index > -1) {
        items.splice(index, 1);
        heart.classList.replace('fa-solid', 'fa-regular');
      } else {
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
  if (wishlistCount) { wishlistCount.innerText = items.length; }
}

function readWishlist() {
  var raw = localStorage.getItem(storageKey);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function writeWishlist(items) {
  localStorage.setItem(storageKey, JSON.stringify(items));
}

// ============ Filter ============
function filterProduct() {
  var filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var category = button.getAttribute('data-category');
      if (category === 'all') {
        displayProducts(products);
      } else {
        var filtered = products.filter(function (p) {
          return p.category.toLowerCase() === category.toLowerCase();
        });
        displayProducts(filtered);
      }
      filterButtons.forEach(function (btn) { btn.classList.remove('active'); });
      button.classList.add('active');
    });
  });
}

// ============ Search ============
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