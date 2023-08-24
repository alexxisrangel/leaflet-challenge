// Creation of map object, creating Leaflet object
let myMap = L.map("map", {
    center: [37.5934, -122.0439],
    zoom: 11
});


//Define Layers 

// Adding the tile layer, defining the tiles that I'll be using
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>"
}).addTo(myMap);

//function to calculate the darkness in color based off depth of earthquake 
//Function to determine circle color based on the depth of earthquake 
function circleColor(depth) {
    var color="#FFEDA0";
    switch(true) {
        case (depth < 10):
            color="#FFEDA0";
            break;
        case (depth < 30):
            color="#FEB24C";
            break;
        case (depth < 50):
            color="#FD8D3C";
            break;
        case (depth < 70):
            color="#E31A1C";
            break;
        case (depth < 90):
            color="#BD0026";
            break;
        case (depth >= 90):
            color="#800026";
            break;
    }
    return color;
}




// Adding link that will get us the JSON data we will be using
fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
    .then(response => response.json())
    
    .then(data => {
        data.features.forEach(feature => {
            const magnitude = feature.properties.mag;
            // Selecting the depth from the coordinates section 
            const depth = feature.geometry.coordinates[2];
            const [longitude, latitude] = feature.geometry.coordinates;

            const circle = L.circle([latitude, longitude],{
                color: circleColor(depth),
                //Here we will adjust the darkness of the circle based off the depth of the earthquake 
                fillColor: circleColor(depth),
                fillOpacity:.8,
                opacity:.8,
                radius: magnitude * 2500
            }).addTo(myMap);

            //Adding popup with earthquake info
            circle.bindPopup(`Magnitude: ${magnitude}`);
        });
        console.log("Total Features:", data.features.length)
        
        // Create a legend to display information about our map
        var info = L.control({
            position: "bottomright"
        });
        // When the layer control is added, insert a div with the class of "legend"
        info.onAdd = function() {
            var div = L.DomUtil.create("div", "legend");
            div.innerHTML=[
                "<h2>Depth (km)</h2>",
                "<p class='l10'>Less than 10</p>",
                "<p class='l30'>Between 10 and 30</p>",
                "<p class='l50'>Between 30 and 50</p>",
                "<p class='l70'>Between 50 and 70</p>",
                "<p class='l90'>Between 70 and 90</p>",
                "<p class='g90'>Greater than 90</p>"
            ].join("");

            return div;
        };
        // Add the info legend to the map
        info.addTo(myMap);
    })
        
    .catch(error => console.error('Error fetching data:', error));

    