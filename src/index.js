import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { ScatterplotLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import rawData from './gundata.json';
import apiKey from './config';


let minRadius = 4;
let maxRadius = 5;
let scatterplotLayer;
const sourceData = './gundata.json';


window.initMap = () => {

    const mapOptions = {
        center: {lat: 38.0, lng: -97.0},
        zoom: 4.5,
        mapTypeControl: false,
        styles: [
            {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#a0b4f4" }],
            },
        ],
    };

    const map = new google.maps.Map(document.getElementById('map'), mapOptions);
    

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        panel: document.getElementById('directionsPanel'),
    });

    document.getElementById('submit').addEventListener('click', function () {
        calculateAndDisplayRoute(directionsService, directionsRenderer);

            // Get the reference to the div element
            document.getElementById("mySidenav").style.width = "300px";
            document.getElementById("directionsPanel").style.display = "block";
    });

    let zoomLevel = map.getZoom();

    // Adjust radius based on zoom level (you can modify this calculation as needed)
    minRadius = 1 + (zoomLevel * 0.5);
    maxRadius = 10 + (zoomLevel * 0.5);

    console.log
    const overlay = new GoogleMapsOverlay({
        layers: [
            //createScatterplot(),
            heatmap()
        ],
    });
    overlay.setMap(map);
}

function createScatterplot() {
    scatterplotLayer = new ScatterplotLayer({
        id: 'scatter',
        data: sourceData,
        opacity: 0.8,
        radiusMinPixels: minRadius,
        radiusMaxPixels: maxRadius,
        getPosition: d => [d.longitude, d.latitude],
        getFillColor: d => [247, 87, 87, 255],
        pickable: true,
        getIcon: d => ({
            url: 'her-route/public/location_pin.png',  // Replace with emoji image or URL
            width: 32, // Set the width of the icon
            height: 32, // Set the height of the icon
        }),
        onClick: ({object, x, y}) => {
            window.open(`https://www.gunviolencearchive.org/incident/${object.incident_id}`);
        },
    });

    return scatterplotLayer;
}

const heatmap = () => new HeatmapLayer({
    id: 'heat',
    data: sourceData,
    getPosition: d => [d.longitude, d.latitude],
    getWeight: d => d.n_killed + (d.n_injured * 0.5),
    radiusPixels: 60,
    colorRange: [
        [128, 162, 255],  // Blue for low values
        [0, 255, 255],  // Cyan for medium values
        [221, 255, 128],  // Yellow for higher values
        [247, 87, 87]   // Red for high values
    ],
    onClick: ({object, x, y}) => {
        window.open(`https://www.gunviolencearchive.org/incident/${object.incident_id}`);
    },
});


function calculateAndDisplayRoute(directionsService, directionsRenderer) {
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;

    directionsService.route(
        {
            origin: origin,
            destination: destination,
            travelMode: 'WALKING',
            provideRouteAlternatives: true, // Request multiple alternative routes
        },
        function (response, status) {
            if (status === 'OK') {
                const scores = [];
                const summaries = [];
                const directionsPanel = document.getElementById("directionsPanel"); // Custom panel for directions and scores

                // Clear previous content in the directions panel
                directionsPanel.innerHTML = "";

                // Display each route on the map
                for (var i = 0; i < response.routes.length; i++) {
                    new google.maps.DirectionsRenderer({
                        map: map,
                        directions: response,
                        routeIndex: i,
                    });

                    const interval = 25; // interval of point draw in meters
                    console.log("ROUTE " + i + " ------------");
                    const route_raw = samplePointsAlongRoute(response.routes[i], interval);
                    console.log("AVG ROUTE DIST " + route_raw);

                    let route_score = route_raw;
                    console.log(route_score);
                    scores.push(route_score);

                    summaries.push(response.routes[i].summary);

                    // Create a list item for the route and its score
                    const listItem = document.createElement("div");
                    listItem.className = "route-item";

                    // Define the color for the score text and background circle based on the score
                    const scoreStyle = getScoreStyle(route_score);

                    // Construct the text content with summary and score
                    listItem.innerHTML = `
                    <div class="route-entry">
                        <strong><span style="padding-bottom: 10px;">Route ${i + 1}:</span></strong> ${response.routes[i].legs[0].duration.text}
                        <span class="score" style="${scoreStyle}">${route_score}</span>
                        <br>
                    </div>
                    `;

                    // Append the route item to the custom directions panel
                    directionsPanel.appendChild(listItem);
                }

                // Optionally: Set the directions for the route with the best score (lowest score in this case)
                var min = Math.min(...scores);
                var index = scores.indexOf(min);
                directionsRenderer.setDirections(response, { routeIndex: index });
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        }
    );
}

// Function to get score style based on the score value
function getScoreStyle(score) {
    let color, backgroundColor;
    if (score >= 70) {
        color = '#dc3545'; // Red for unsafe
        backgroundColor = '#f8d7da'; // Light red for background
    } else if (score >= 35) {
        color = '#ffc107'; // Yellow for medium safety
        backgroundColor = '#fff3cd'; // Light yellow for background
    } else {
        color = '#28a745'; // Green for safe
        backgroundColor = '#d4edda'; // Light green for background
    }
    
    // CSS style for the score text and circle
    return `color: ${color}; background-color: ${backgroundColor}; padding: 1px 5px; border-radius: 50%; font-weight: bold;`;
}



function calculateDistance(lat1, lon1, lat2, lon2) {
    // Radius of the Earth in kilometers
    const R = 6371;

    // Convert latitude and longitude from degrees to radians
    const radLat1 = (lat1 * Math.PI) / 180;
    const radLon1 = (lon1 * Math.PI) / 180;
    const radLat2 = (lat2 * Math.PI) / 180;
    const radLon2 = (lon2 * Math.PI) / 180;

    // Calculate differences in coordinates
    const dLat = radLat2 - radLat1;
    const dLon = radLon2 - radLon1;

    // Haversine formula to calculate distance
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}




function samplePointsAlongRoute(route, interval) {
    const start =  route.legs[0].start_location;
    const end =  route.legs[route.legs.length - 1].end_location;

    const midPoint_lat = (start.lat() + end.lat()) / 2;
    const midPoint_lng = (start.lng() + end.lng()) / 2;

    const radius = 5; // radius in kilometers

    const visibleData = rawData.filter(point => calculateDistance(point.latitude, point.longitude, midPoint_lat, midPoint_lng) <= radius);

    var total_sum = 0;
    var total_points = 0;

    let near_radius = 1; // kilometer radius per point
    if (visibleData.length > 1000) {
        near_radius = 0.5;
    }

    route.legs.forEach(leg => {
        leg.steps.forEach(step => {
            const sampledPoints = [];
            const startLatLng = step.start_location;
            const endLatLng = step.end_location;

            const totalDistance = google.maps.geometry.spherical.computeDistanceBetween(startLatLng, endLatLng);
            const numPoints = Math.floor(totalDistance / interval);

            for (let i = 0; i <= numPoints; i++) {
                const fraction = i / numPoints;
                const interpolatedLatLng = google.maps.geometry.spherical.interpolate(startLatLng, endLatLng, fraction);
                sampledPoints.push(interpolatedLatLng);
            }

            sampledPoints.forEach(point => {
                total_points += 1;
                const latitude = point.lat();
                const longitude = point.lng();

                const near_crimes = visibleData.filter(crime => calculateDistance(latitude, longitude, crime.latitude, crime.longitude) <= near_radius);

                near_crimes.forEach(crime => {
                    const distance = calculateDistance(latitude, longitude, crime.latitude, crime.longitude);
                    total_sum += Math.log(near_radius / distance); // Logarithmic decay of crime impact
                });
            });
        });
    });

    const avg_dist = (total_sum / total_points) * 1.2;
    return Math.min(100, Math.max(0, Math.round(avg_dist))); // Normalize to 0-100 scale
}