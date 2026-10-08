var geoJSON;
var incidentsByCountryAndYear = {};
var currentYearIncidents = [];
var maximumIncidentCount = 0;
var colorScaleMaximum = 0;
var dateSlider = document.getElementById('date-slider');
var countryNameAliases = {
    bahamas: 'thebahamas',
    unitedstates: 'unitedstatesofamerica'
};
var americasBounds = L.latLngBounds([[-56, -170], [72, -30]]);
var map = L.map('map', {
    maxBounds: americasBounds,
    maxBoundsViscosity: 1
});
var legend = L.control({ position: 'topright' });
legend.onAdd = function () {
    return L.DomUtil.create('div', 'map-legend');
};
legend.addTo(map);

function fitMapToAmericas() {
    map.setMinZoom(0);
    map.invalidateSize({ pan: false });
    map.fitBounds(americasBounds);
    map.setMinZoom(map.getZoom());
}

fitMapToAmericas();
window.addEventListener('resize', function () {
    window.requestAnimationFrame(fitMapToAmericas);
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function normalizeCountryName(name) {
    var normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return countryNameAliases[normalized] || normalized;
}

function parseCsvRow(row) {
    var fields = [];
    var field = '';
    var insideQuotes = false;

    for (var i = 0; i < row.length; i++) {
        var character = row[i];

        if (character === '"' && row[i + 1] === '"' && insideQuotes) {
            field += '"';
            i++;
        } else if (character === '"') {
            insideQuotes = !insideQuotes;
        } else if (character === ',' && !insideQuotes) {
            fields.push(field);
            field = '';
        } else {
            field += character;
        }
    }

    fields.push(field);
    return fields;
}

function loadIncidentData(csvText) {
    var rows = csvText.trim().split(/\r?\n/).map(parseCsvRow);
    var headers = rows[0].map(function (header) {
        return header.trim().replace(/^\uFEFF/, '');
    });
    var nationIndex = headers.indexOf('Nation');
    var yearIndex = headers.indexOf('Year');
    var incidentsIndex = headers.indexOf('TB Incidents Reported');

    if (nationIndex === -1 || yearIndex === -1 || incidentsIndex === -1) {
        throw new Error('The incident CSV does not have the expected columns.');
    }

    rows.slice(1).forEach(function (row) {
        var nation = normalizeCountryName(row[nationIndex].trim());
        var year = row[yearIndex].trim();
        var incidents = Number(row[incidentsIndex].trim());

        if (!nation || !year || !Number.isFinite(incidents)) {
            return;
        }

        maximumIncidentCount = Math.max(maximumIncidentCount, incidents);

        if (!incidentsByCountryAndYear[nation]) {
            incidentsByCountryAndYear[nation] = {};
        }
        incidentsByCountryAndYear[nation][year] = incidents;
    });

    colorScaleMaximum = Math.ceil(maximumIncidentCount / 100) * 100;
}

function getColor(value, minimum, maximum) {
    if (minimum === maximum) {
        return '#ffffff';
    }

    var ratio = Math.max(0, Math.min(1, (value - minimum) / (maximum - minimum)));
    var white = [255, 255, 255];
    var orange = [255, 165, 0];
    var red = [220, 38, 38];
    var start = ratio < 0.5 ? white : orange;
    var end = ratio < 0.5 ? orange : red;
    var segmentRatio = ratio < 0.5 ? ratio * 2 : (ratio - 0.5) * 2;
    var color = start.map(function (channel, index) {
        return Math.round(channel + (end[index] - channel) * segmentRatio);
    });

    return '#' + color.map(function (channel) {
        return channel.toString(16).padStart(2, '0');
    }).join('');
}

function getCountryStyle(feature) {
    var countryName = normalizeCountryName(feature.properties.ADMIN);
    var incidents = incidentsByCountryAndYear[countryName] &&
        incidentsByCountryAndYear[countryName][dateSlider.value];

    if (incidents === undefined) {
        return {
            color: '#69474a',
            weight: 0.8,
            fillColor: '#cbd5e1',
            fillOpacity: 0.7
        };
    }

    return {
        color: '#475569',
        weight: 0.8,
        fillColor: getColor(incidents, 0, colorScaleMaximum),
        fillOpacity: 0.7
    };
}

function updateMapForSelectedYear() {
    currentYearIncidents = Object.keys(incidentsByCountryAndYear).reduce(
        function (values, countryName) {
            var incidents = incidentsByCountryAndYear[countryName][dateSlider.value];
            if (incidents !== undefined) {
                values.push(incidents);
            }
            return values;
        },
        []
    );

    updateLegend();

    if (!geoJSON) {
        return;
    }

    geoJSON.setStyle(getCountryStyle);
}

function updateLegend() {
    var container = legend.getContainer();
    var year = dateSlider.value;

    if (currentYearIncidents.length === 0) {
        container.innerHTML = '<strong>TB incidents (' + year +
            ')</strong><div>No data available</div>';
        return;
    }

    var midpoint = Math.round(colorScaleMaximum / 2);

    container.innerHTML =
        '<strong>TB incidents (' + year + ')</strong>' +
        '<div class="legend-gradient" aria-hidden="true"></div>' +
        '<div class="legend-labels"><span>0</span><span>' +
        midpoint.toLocaleString() +
        '</span><span>' +
        colorScaleMaximum.toLocaleString() +
        '</span></div>' +
        '<div class="legend-no-data"><span></span>No data</div>';
}

dateSlider.addEventListener('input', updateMapForSelectedYear);

Promise.all([
    fetch('data/countries.geojson').then(function (response) {
        if (!response.ok) {
            throw new Error('Could not load country data: ' + response.status);
        }
        return response.json();
    }),
    fetch('data/sample-data.csv').then(function (response) {
        if (!response.ok) {
            throw new Error('Could not load incident data: ' + response.status);
        }
        return response.text();
    })
]).then(function (results) {
    var countries = results[0];
    loadIncidentData(results[1]);

    var americas = {
        type: countries.type,
        features: countries.features.filter(function (country) {
            return ['North America', 'South America'].includes(
                country.properties.CONTINENT
            );
        })
    };

    updateMapForSelectedYear();
    geoJSON = L.geoJSON(americas, {
        style: getCountryStyle,
        onEachFeature: onEachFeature
    }).addTo(map);
    updateMapForSelectedYear();
}).catch(function (error) {
    console.error('Could not initialize the country map:', error);
});


/* Function that highlights region hovered */
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 3,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    layer.bringToFront();
}


/* Function that resets highlight when mouse leaves */
function resetHighlight(e) {
    geoJSON.resetStyle(e.target);
}

function showFeatureName(e) {
    var featureName = e.target.feature.properties.ADMIN;
    e.target.bindPopup(featureName).openPopup();
}

/* Function that calls highlightFeature and resetHighlight */
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: showFeatureName
    });
}