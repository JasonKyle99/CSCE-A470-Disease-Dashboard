var americasBounds = L.latLngBounds([[-56, -170], [72, -30]]);
var map = L.map('map', {
    maxBounds: americasBounds,
    maxBoundsViscosity: 1
});
map.fitBounds(americasBounds);
map.setMinZoom(map.getZoom());

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

fetch('data/countries.geojson')
.then(function (response) {
    if (!response.ok) {
        throw new Error('Could not load country data: ' + response.status);
    }
    return response.json();
})
.then(function (countries) {
    var americas = {
        type: countries.type,
        features: countries.features.filter(function (country) {
            return ['North America', 'South America'].includes(
                country.properties.CONTINENT
            );
        })
    };

    L.geoJSON(americas, {
        style: {
            color: '#475569',
            weight: 0.8,
            fillColor: '#cbd5e1',
            fillOpacity: 0.7
        }
    }).addTo(map);
});