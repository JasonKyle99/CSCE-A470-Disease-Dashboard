const ctx = document.getElementById('myChart');

new Chart(ctx, {
    type: 'bar',
    data: {
    labels: ['January', 'February', 'March', 'April'],
    datasets: [{
        label: 'Sales',
        data: [12, 25, 8, 15],
        borderWidth: 1
    }]
    },
    options: {
    responsive: true,
    scales: {
        y: {
        beginAtZero: true
        }
    }
    }
});
