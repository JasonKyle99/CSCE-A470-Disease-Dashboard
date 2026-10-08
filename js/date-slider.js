var dateSlider = document.getElementById('date-slider');
var dateFilter = document.querySelector('.date-filter');
var selectedYear = document.getElementById('selected-year');
var currentYear = new Date().getFullYear();
var minimumYear = 2000;
var storageKey = 'disease-dashboard-selected-year';
var savedYear = Number(localStorage.getItem(storageKey));

L.DomEvent.disableClickPropagation(dateFilter);
L.DomEvent.disableScrollPropagation(dateFilter);

dateSlider.min = minimumYear;
dateSlider.max = currentYear;
dateSlider.step = 1;
dateSlider.value = Number.isInteger(savedYear) &&
    savedYear >= minimumYear &&
    savedYear <= currentYear
    ? savedYear
    : currentYear;

function updateSelectedYear() {
    selectedYear.value = dateSlider.value;
    localStorage.setItem(storageKey, dateSlider.value);
}

dateSlider.addEventListener('input', updateSelectedYear);
updateSelectedYear();
