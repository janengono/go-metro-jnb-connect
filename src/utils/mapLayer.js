import di from "../assets/directionArrow.png"

export function addRouteLayers(map, routeGeoJSON) {
  map.addSource("route", { type: "geojson", data: routeGeoJSON });
  map.addLayer({
    id: "route-line",
    type: "line",
    source: "route",
    paint: { "line-color": "#007cbf", "line-width": 4 }
  });
}



export function addStartEndMarkers(map, coords) {
  map.addSource("route-start", {
    type: "geojson",
    data: { type: "Feature", geometry: { type: "Point", coordinates: coords[0] } }
  });
  map.addLayer({
    id: "route-start-layer",
    type: "circle",
    source: "route-start",
    paint: { "circle-radius": 8, "circle-color": "green" }
  });

  map.addSource("route-end", {
    type: "geojson",
    data: { type: "Feature", geometry: { type: "Point", coordinates: coords[coords.length - 1] } }
  });
  map.addLayer({
    id: "route-end-layer",
    type: "circle",
    source: "route-end",
    paint: { "circle-radius": 8, "circle-color": "red" }
  });
}


export function addUserLayer(map) {
  map.addSource("user", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
  map.addLayer({
    id: "user-layer",
    type: "circle",
    source: "user",
    paint: { "circle-radius": 8, "circle-color": "blue" }
  });
}




export function addDirectionLineLayer(map){
map.loadImage(di, (error, image) => {
  if (error) throw error;
  if (!map.hasImage("arrow")) {
    map.addImage("arrow", image);
  }

  map.addLayer({
    id: "route-arrows",
    type: "symbol",
    source: "route",   // same GeoJSON source as the line
    layout: {
      "symbol-placement": "line",
      "symbol-spacing": 50,   // adjust frequency
      "icon-image": "arrow",
      "icon-size": 0.6,
      "icon-rotation-alignment": "map",  // align to route direction
      "icon-keep-upright": false,        // allow proper rotation
      "icon-allow-overlap": true,
      "icon-ignore-placement": true
    }
  });
});


}

export function addTrailLine(map){
map.addSource("user-trail", {
  type: "geojson",
  data: {
    type: "Feature",
    geometry: { type: "LineString", coordinates: [] }
  }
});

// Layer to render the trail
map.addLayer({
  id: "user-trail-layer",
  type: "line",
  source: "user-trail",
  paint: {
    "line-color": "#0000FF", // blue trail
    "line-width": 4,
    "line-opacity": 0.7
  }
});


}