document.addEventListener('DOMContentLoaded', () => {
    const orderSelect = document.getElementById('order-select');
    const searchButton = document.querySelector('.searchButton');
    const resetButton = document.querySelector('.resetButton');
    const searchInput = document.querySelector('.searchInput');
    const yearSelect = document.querySelector('#year-select');

    // searchButton.addEventListener('click', () => {
    //     const activeCategory = getActiveCategory();
    //     const year = yearSelect.value;
    //     fetchReports(activeCategory, null, year);
    // });

    resetButton.addEventListener('click', () => {
        orderSelect.value = '';
        searchInput.value = '';
        yearSelect.value = '';
        const activeCategory = getActiveCategory();
        fetchReports(activeCategory, null, null, null);
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const activeCategory = getActiveCategory();
        const year = yearSelect.value;
        const select = orderSelect.value
        fetchReports(activeCategory, query, year);
    });
    
    yearSelect.addEventListener('change', () => {
        const year = yearSelect.value;
        const activeCategory = getActiveCategory();
        fetchReports(activeCategory, null, year);
    });

    orderSelect.addEventListener('change', () => {
        const year = yearSelect.value;
        const activeCategory = getActiveCategory();
        fetchReports(activeCategory, null, year);
    });

    // Fetch reports initially for the current year
    const currentYear = new Date().getFullYear();
    yearSelect.value = currentYear;
    fetchReports('SC33', null, currentYear, null);
});

function getActiveCategory() {
    const activeElement = document.querySelector('.navbarItem.active');
    return activeElement ? activeElement.textContent : null;
}
