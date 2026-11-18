var geoJSON;
var incidentsByCountryAndYear = {};
var wahisCasesByCountryAndYear = {};
var currentYearIncidents = [];
var maximumIncidentCount = 0;
var colorScaleMaximum = 0;
var dateSlider = document.getElementById('date-slider');
dateSlider.addEventListener('input', updateMapForSelectedYear);
var countryNameAliases = {
    bahamas: 'thebahamas',
    unitedstates: 'unitedstatesofamerica'
};
var americasBounds = L.latLngBounds([[-70, -190], [85, -10]]);
var map = L.map('map', {
    maxBounds: americasBounds,
    maxBoundsViscosity: 1
});

map.fitBounds(americasBounds);

var legend = L.control({ position: 'topright' });
legend.onAdd = function () {
    return L.DomUtil.create('div', 'map-legend');
};
legend.addTo(map);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function normalizeCountryName(name) {
    var normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return countryNameAliases[normalized] || normalized;
}

function loadIncidentData(countries) {
    if (!Array.isArray(countries)) {
        throw new Error('The incident JSON must contain a list of countries.');
    }

    countries.forEach(function (country) {
        if (!country.country || !country.years || typeof country.years !== 'object') {
            throw new Error('The incident JSON contains an invalid country entry.');
        }

        var nation = normalizeCountryName(country.country);
        incidentsByCountryAndYear[nation] = country.years;

        Object.keys(country.years).forEach(function (year) {
            var incidents = Number(country.years[year]);
            if (Number.isFinite(incidents)) {
                maximumIncidentCount = Math.max(maximumIncidentCount, incidents);
            }
        });
    });

    colorScaleMaximum = Math.ceil(maximumIncidentCount / 100) * 100;
}

function loadWahisData(countries) {
    if (!countries || typeof countries !== 'object') {
        throw new Error('The WAHIS JSON must contain country data.');
    }

    Object.keys(countries).forEach(function (country) {
        var nation = normalizeCountryName(country);
        var years = countries[country];
        var casesByYear = {};

        Object.keys(years).forEach(function (year) {
            var diseaseEntries = years[year];
            var totalCases = null;

            Object.keys(diseaseEntries).forEach(function (diseaseName) {
                var disease = diseaseEntries[diseaseName];
                if (!disease || !disease.species) {
                    return;
                }

                Object.keys(disease.species).forEach(function (speciesName) {
                    var cases = disease.species[speciesName].cases;
                    if (Number.isFinite(cases)) {
                        totalCases = (totalCases || 0) + cases;
                    }
                });
            });

            casesByYear[year] = totalCases;
        });

        wahisCasesByCountryAndYear[nation] = casesByYear;
    });
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
    fetch('data/TB/Output%20Data/data.json').then(function (response) {
        if (!response.ok) {
            throw new Error('Could not load incident data: ' + response.status);
        }
        return response.json();
    }),
    fetch('data/WAHIS-Data.json').then(function (response) {
        if (!response.ok) {
            throw new Error('Could not load WAHIS data: ' + response.status);
        }
        return response.json();
    })
]).then(function (results) {
    var countries = results[0];
    loadIncidentData(results[1]);
    loadWahisData(results[2]);

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
    var feature = e.target.feature;
    var countryName = normalizeCountryName(feature.properties.ADMIN);
    var incidentsByYear = incidentsByCountryAndYear[countryName];
    var wahisCasesByYear = wahisCasesByCountryAndYear[countryName];
    var incidents = incidentsByYear && incidentsByYear[dateSlider.value];
    var animalCases = wahisCasesByYear && wahisCasesByYear[dateSlider.value];

    var humanIncidentText = incidents === undefined || incidents === null
        ? 'No data'
        : incidents.toLocaleString();
    var animalCaseText = animalCases === undefined || animalCases === null
        ? 'No data'
        : animalCases.toLocaleString();
    var popupText = feature.properties.ADMIN + ':<br>' +
        humanIncidentText + ' Human TB Incidents' + ' in ' + dateSlider.value + '<br>' +
        animalCaseText + ' Animal TB Incidents ' +
        'in ' + dateSlider.value;

    e.target.bindPopup(popupText).openPopup();

    document.dispatchEvent(new CustomEvent('countrySelected', {
        detail: {
            country: feature.properties.ADMIN,
            years: incidentsByYear || {},
            wahisYears: wahisCasesByYear || {}
        }
    }));
}

/* Function that calls highlightFeature and resetHighlight */
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: showFeatureName
    });
}