const startDateInput = document.getElementById('start_date');
const endDateInput = document.getElementById('end_date');
const today = new Date().toISOString().split('T')[0];
startDateInput.value = today;

startDateInput.addEventListener('change', () => {
    endDateInput.min = startDateInput.value;
});