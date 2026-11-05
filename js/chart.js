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
                label: 'TB incidents',
                data: chartYears.map(function () { return null; }),
                borderColor: '#2563eb',
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

    document.addEventListener('countrySelected', function (event) {
        var country = event.detail.country;
        var countryYears = event.detail.years;
        var years = Object.keys(countryYears).sort(function (a, b) {
            return Number(a) - Number(b);
        });

        chart.data.labels = years.length > 0 ? years : chartYears;
        chart.data.datasets[0].label = 'TB incidents - ' + country;
        chart.data.datasets[0].data = years.map(function (year) {
            return countryYears[year];
        });

        chart.update();
    });
})();
