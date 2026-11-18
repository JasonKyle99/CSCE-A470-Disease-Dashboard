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

    function highlightSelectedYear() {
        var dataset = chart.data.datasets[0];
        var selectedYear = slider.value;

        dataset.pointRadius = chart.data.labels.map(function (year) {
            return year === selectedYear ? 6 : 3;
        });
        dataset.pointBackgroundColor = chart.data.labels.map(function (year) {
            return year === selectedYear ? '#fff' : '#2563eb';
        });
        dataset.pointBorderColor = '#2563eb';
        dataset.pointBorderWidth = chart.data.labels.map(function (year) {
            return year === selectedYear ? 3 : 1;
        });

        chart.update('none');
    }

    slider.addEventListener('input', highlightSelectedYear);

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

        highlightSelectedYear();
    });
})();
