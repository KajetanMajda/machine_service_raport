document.addEventListener('DOMContentLoaded', () => {
    const orderSelect = document.getElementById('order-select');
    const resetButton = document.querySelector('.resetButton');
    const searchInput = document.querySelector('.searchInput');
    const yearSelect = document.querySelector('#year-select');

    resetButton.addEventListener('click', () => {
        orderSelect.value = '';
        searchInput.value = '';
        yearSelect.value = '';
        const activeCategory = getActiveCategory();
        fetchReports(activeCategory, null, null, null);
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const year = yearSelect.value || null;
        const activeCategory = getActiveCategory();
        const status = orderSelect.value || null ;
        fetchReports(activeCategory, query, year, status);
    });
    

    yearSelect.addEventListener('change', () => {
        const year = yearSelect.value || null ;
        const activeCategory = getActiveCategory();
        const status = orderSelect.value || null ;
        fetchReports(activeCategory, null, year, status);
    });

    orderSelect.addEventListener('change', () => {
        const year = yearSelect.value || null ;
        const activeCategory = getActiveCategory();
        const status = orderSelect.value || null ;
        fetchReports(activeCategory, null, year, status);
    });

    const currentYear = new Date().getFullYear();
    yearSelect.value = currentYear;
    fetchReports('SC33', null, currentYear, null);
});

function getActiveCategory() {
    const activeElement = document.querySelector('.navbarItem.active');
    return activeElement ? activeElement.textContent.trim() : null;
}