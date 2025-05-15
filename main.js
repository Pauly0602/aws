/* Wetterstationen Euregio Beispiel */

// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778,
    zoom: 11,
};

// Karte initialisierenn
let map = L.map("map").setView([ibk.lat, ibk.lng], ibk.zoom);

// thematische Layer
let overlays = {
    stations: L.featureGroup(),
    temperature: L.featureGroup().addTo(map),
    windspeed: L.featureGroup().addTo(map),
    snow: L.featureGroup().addTo(map),
    direction: L.featureGroup().addTo(map),
}

    // Change default options
    L.control.rainviewer({ 
        position: 'bottomleft',
        nextButtonText: '>',
        playStopButtonText: 'Play/Stop',
        prevButtonText: '<',
        positionSliderLabelText: "Hour:",
        opacitySliderLabelText: "Opacity:",
        animationInterval: 500,
        opacity: 0.5
    }).addTo(map);

// Layer control
L.control.layers({
    "Relief avalanche.report": L.tileLayer(
        "https://static.avalanche.report/tms/{z}/{x}/{y}.webp", {
        attribution: `© <a href="https://sonny.4lima.de">Sonny</a>, <a href="https://www.eea.europa.eu/en/datahub/datahubitem-view/d08852bc-7b5f-4835-a776-08362e2fbf4b">EU-DEM</a>, <a href="https://lawinen.report/">avalanche.report</a>, all licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>`,
        maxZoom: 12
    }).addTo(map),
    "OpenStreetMap": L.tileLayer.provider("OpenStreetMap.Mapnik"),
    "OpenTopoMap": L.tileLayer.provider("OpenTopoMap"),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery"),
}, {
    "Wetterstationen": overlays.stations,
    "Temperatur": overlays.temperature,
    "Windgeschwindigkeit": overlays.windspeed,
    "Schnee": overlays.snow,
    "Windrichtung & -geschwindigkeit": overlays.direction,
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

//Wetterstationen mit Icons und Popups
async function loadStations(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata, {
        attribution: "Datenquelle: <a href='https://www.data.gv.at'> Stadt Wien</a>",
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/wifi.png",
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            });
        },
        onEachFeature: function (feature, layer) {
            let pointInTime = new Date(feature.properties.date);
            layer.bindPopup("Hallo");
            layer.bindPopup(`
                    <h4></i>${feature.properties.name} (${feature.geometry.coordinates[2]}) m</h4>
                    <ul>
                    <li> Lufttemperatur (C) ${feature.properties.LT !== undefined ? feature.properties.LT : "-"}</li>
                    <li> Relative Luftfeuchtigkeit (%) ${feature.properties.RH || "-"}</li>
                    <li> Windgeschwindigkeit (km/h) ${feature.properties.WG || "-"}</li>
                    <li> Schneehöhe (cm) ${feature.properties.HS || "-"} </li>
                    <li> Windrichtung ("N", "NE", "E", "SE", "S", "SW", "W", "NW") ${feature.properties.WD || "-"} </li>
                    </ul>
                    <span> ${pointInTime.toLocaleString()} </span>
                 `);
        }
    }).addTo(overlays.stations);
    showTemperature(jsondata);
    showWindspeed(jsondata);
    showSnow(jsondata);
    showDirection(jsondata);
}
loadStations("https://static.avalanche.report/weather_stations/stations.geojson");

// Temperatur
function showTemperature(jsondata) {
    L.geoJSON(jsondata, {
        filter: function (feature) {
            if (feature.properties.LT > -50 && feature.properties.LT < 50) {
                return true;
            }
        },
        pointToLayer: function (feature, latlng) {
            let color = getColor(feature.properties.LT, COLORS.temperature);
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style="background-color:${color}">${feature.properties.LT.toFixed(1)} </span>`
                }),
            })
        },
    }).addTo(overlays.temperature);
}

// Schnee
function showSnow(jsondata) {
    L.geoJSON(jsondata, {
        filter: function (feature) {
            if (feature.properties.HS > 1 && feature.properties.HS < 500) {
                return true;
            }
        },
        pointToLayer: function (feature, latlng) {
            let color = getColor(feature.properties.HS, COLORS.snow);
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style="background-color:${color}">${feature.properties.HS.toFixed(1)} </span>`
                }),
            });
        },
    }).addTo(overlays.snow);
}


// Direction (Windgeschwindigkeit u. -richtung)
function showDirection(jsondata) {
    L.geoJSON(jsondata, {
        filter: function (feature) {
             if (feature.properties.WR > 0 && feature.properties.WR < 370) {
                return true;
            }
             },
         pointToLayer: function (feature, latlng) {
            let color = getColor(feature.properties.WG, COLORS.windspeed);
            let direction = getDirectionText(feature.properties.WR);
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "directionMarker",
                   html: `<span style="background-color:${color}">${direction}</span>`
                }),
            });
        },
    }).addTo(overlays.direction);
}

        
            


// Windgeschwindigkeit
function showWindspeed(jsondata) {
    L.geoJSON(jsondata, {
        filter: function (feature) {
            if (feature.properties.WG > 0 && feature.properties.WG < 300) {
                return true;
            }
        },
        pointToLayer: function (feature, latlng) {
            let color = getColor(feature.properties.WG, COLORS.windspeed);
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style="background-color:${color}">${feature.properties.WG.toFixed(1)} </span>`
                }),
            })
        },
    }).addTo(overlays.windspeed);

 //TODO: display temperature data 
}
console.log(COLORS);
function getColor(value, ramp) {
    for (let rule of ramp) {
        if (value >= rule.min && value < rule.max)
            return rule.color;
    }
}
function getDirectionText(deg) {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return directions[Math.round(deg / 45) % 8];
}