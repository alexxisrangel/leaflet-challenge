// Creation of map object, creating Leaflet object
let myMap = L.map("map", {
    center: [37.5934, -122.0439],
    zoom: 11
});

// Adding the tile layer, defining the tiles that I'll be using
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Adding link that will get us the JSON data we will be using
let link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


d3.json(link).then(function (data) {
    console.log("Total Features:", data.features.length);

    for (let i = 0; i < Math.min(5, data.features.length); i++) {
        console.log("Feature", i + 1, "properties:", data.features[i].properties);
    }

    function getMarkerSize(magnitude) {
        console.log('Magnitude: ', magnitude);

        const scalingFactor = 5;
        return Math.sqrt(magnitude) * scalingFactor;
    }

    let overlay = d3.select(myMap.getPanes().overlayPane);

    let svg = overlay.append('svg').attr('class', 'leaflet-zoom-hide');

    let g = svg.append('g').attr('class', 'leaflet-zoom-hide');

    let marker = g.selectAll('circle')
        .data(data.features)
        .enter()
        .append('circle')
        .attr('class', 'marker')
        .style('fill-opacity', 1)
        .attr('r', feature => {
            const magnitude = feature.properties.mag;
            console.log("Magnitude for circle:", magnitude);
            return isNaN(magnitude) ? 0 : getMarkerSize(magnitude);
        })
        .attr('cx', feature => {
            if (feature.geometry && feature.geometry.coordinates) {
                return myMap.latLngToLayerPoint([feature.geometry.coordinates[1], feature.geometry.coordinates[0]]).x;
            } else {
                return -1000;
            }
        })
        .attr('cy', feature => {
            if (feature.geometry && feature.geometry.coordinates) {
                return myMap.latLngToLayerPoint([feature.geometry.coordinates[1], feature.geometry.coordinates[0]]).y;
            } else {
                return -1000;
            }
        })
        .on('mouseout', function () {
            d3.select('#tooltip').style('display', 'none');
        })
        marker.each(function (d) {
            const self = this; // Capture the context of this
            myMap.on('zoomend', update);
            update();

            function update() {
                d3.select(self) // Use the captured context here
                    .attr('cx', myMap.latLngToLayerPoint([d.geometry.coordinates[1], d.geometry.coordinates[0]]).x)
                    .attr('cy', myMap.latLngToLayerPoint([d.geometry.coordinates[1], d.geometry.coordinates[0]]).y);
            }
        });

    g.selectAll('.marker').each(function () {
        myMap.getPanes().overlayPane.appendChild(this);
    });

     // Add the 'g' group containing markers to the map overlay
     myMap.getPanes().overlayPane.appendChild(g.node());

}).catch(function (error) {
    console.error('Error fetching data: ', error);
});


