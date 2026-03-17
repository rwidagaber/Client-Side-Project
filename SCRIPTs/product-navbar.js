document.addEventListener('navbar:ready', function () {
    var iconsList = document.querySelector('.main-navbar .icons');
    if (!iconsList) {
        return;
    }

    if (iconsList.querySelector('.search-box')) {
        return;
    }

    var searchItem = document.createElement('li');
    searchItem.className = 'search-box';
    searchItem.innerHTML = '<i class="fi fi-rr-search"></i><input type="text" name="search" placeholder="Search Egyptian craft..." id="searchInput">';

    // Keep search before heart/cart/profile icons, matching old Product page layout.
    iconsList.insertBefore(searchItem, iconsList.firstChild);
});
