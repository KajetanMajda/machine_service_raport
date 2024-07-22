document.addEventListener('DOMContentLoaded', () => {
    const criteriaSelect = document.getElementById('criteria-select');
    const orderSelect = document.getElementById('order-select');
    const searchButton = document.querySelector('.searchButton');
    const resetButton = document.querySelector('.resetButton');
    const searchInput = document.querySelector('.searchInput');

    const optionsMap = {
        description: [
            { value: 'Sort', text: 'Sortuj', disabled: true, selected: true, hidden: true },
            { value: 'az', text: 'A-Z' },
            { value: 'za', text: 'Z-A' }
        ],
        start_date: [
            { value: 'Sort', text: 'Sortuj', disabled: true, selected: true, hidden: true },
            { value: 'asc', text: 'Najwcześniejsza do najnowszej' },
            { value: 'desc', text: 'Najnowsza do najwcześniejszej' }
        ],
        end_date: [
            { value: 'Sort', text: 'Sortuj', disabled: true, selected: true, hidden: true },
            { value: 'asc', text: 'Najwcześniejsza do najnowszej' },
            { value: 'desc', text: 'Najnowsza do najwcześniejszej' }
        ],
        status: [
            { value: 'Sort', text: 'Sortuj', disabled: true, selected: true, hidden: true },
            { value: 'Zrobione', text: 'Zrobione' },
            { value: 'W trakcie', text: 'W trakcie' },
            { value: 'Do zrobienia', text: 'Do zrobienia' },
            { value: '', text: 'Brak statusu' }
        ],
        comments: [
            { value: 'Sort', text: 'Sortuj', disabled: true, selected: true, hidden: true },
            { value: 'az', text: 'A-Z' },
            { value: 'za', text: 'Z-A' }
        ]
    };

    criteriaSelect.addEventListener('change', () => {
        const selectedCriteria = criteriaSelect.value;
        const options = optionsMap[selectedCriteria] || [];

        orderSelect.innerHTML = '';
        options.forEach(optionData => {
            const option = document.createElement('option');
            option.value = optionData.value;
            option.textContent = optionData.text;
            if (optionData.disabled) option.disabled = true;
            if (optionData.selected) option.selected = true;
            if (optionData.hidden) option.hidden = true;
            orderSelect.appendChild(option);
        });

        if (selectedCriteria === 'status') {
            orderSelect.onchange = sortStatusFromSelect;
        }
    });

    criteriaSelect.dispatchEvent(new Event('change'));

    searchButton.addEventListener('click', () => {
        const criteria = criteriaSelect.value;
        const order = orderSelect.value;
        const activeCategory = getActiveCategory();
        fetchReports(activeCategory, criteria, order);
    });

    resetButton.addEventListener('click', () => {
        criteriaSelect.value = '';
        orderSelect.innerHTML = '<option value=""></option>';
        searchInput.value = '';
        const activeCategory = getActiveCategory();
        fetchReports(activeCategory);
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const activeCategory = getActiveCategory();
        fetchReports(activeCategory, null, null, query);
    });
    fetchReports('SC33');
});

function getActiveCategory() {
  const activeElement = document.querySelector('.navbarItem.active');
  return activeElement ? activeElement.textContent : null;
}