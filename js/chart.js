(function () {
    var slider = document.getElementById('date-slider');
    var chartYears = [];

    for (var year = Number(slider.min); year <= Number(slider.max); year++) {
        chartYears.push(String(year));
    }

    var chart = new Chart(document.getElementById('tb-chart'), {
        type: 'line',
        data: {
            labels: chartYears,
            datasets: [{
                label: 'WHO',
                data: chartYears.map(function () { return null; }),
                borderColor: '#2563eb',
                tension: 0.2
            }, {
                label: 'WAHIS',
                data: chartYears.map(function () { return null; }),
                borderColor: '#dc2626',
                tension: 0.2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'TB incidents' }
                },
                x: {
                    title: { display: true, text: 'Year' }
                }
            }
        }
    });

    function highlightSelectedYear() {
        var selectedYear = slider.value;

        chart.data.datasets.forEach(function (dataset, datasetIndex) {
            var pointColor = datasetIndex === 0 ? '#2563eb' : '#dc2626';
            dataset.pointRadius = chart.data.labels.map(function (year) {
                return year === selectedYear ? 6 : 3;
            });
            dataset.pointBackgroundColor = chart.data.labels.map(function (year) {
                return year === selectedYear ? '#fff' : pointColor;
            });
            dataset.pointBorderColor = pointColor;
            dataset.pointBorderWidth = chart.data.labels.map(function (year) {
                return year === selectedYear ? 3 : 1;
            });
        });

        chart.update('none');
    }

    slider.addEventListener('input', highlightSelectedYear);

    document.addEventListener('countrySelected', function (event) {
        var country = event.detail.country;
        var countryYears = event.detail.years;
        var wahisYears = event.detail.wahisYears || {};
        var yearSet = {};

        Object.keys(countryYears).forEach(function (year) {
            yearSet[year] = true;
        });
        Object.keys(wahisYears).forEach(function (year) {
            yearSet[year] = true;
        });

        var years = Object.keys(yearSet).sort(function (a, b) {
            return Number(a) - Number(b);
        });

        chart.data.labels = years.length > 0 ? years : chartYears;
        chart.data.datasets[0].label = 'WHO - ' + country;
        chart.data.datasets[0].data = years.map(function (year) {
            return countryYears[year];
        });
        chart.data.datasets[1].label = 'WAHIS - ' + country;
        chart.data.datasets[1].data = years.map(function (year) {
            return wahisYears[year] === undefined ? null : wahisYears[year];
        });

        highlightSelectedYear();
    });
})();
