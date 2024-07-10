function navUnderScore(event) {
    var items = document.querySelectorAll('.navbarItem');
    items.forEach(function (item) {
        item.classList.remove('active');
    });
    var clickedItem = event.target;
    clickedItem.classList.add('active');
}
