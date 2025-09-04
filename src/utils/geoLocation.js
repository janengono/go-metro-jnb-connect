import * as turf from "@turf/turf";
import { normalizeRoute } from "./mapUtils";
import { useRef } from "react";

export function trackUserPosition(trailCoordsRef,map, routeGeoJSON, onOffRoute) {
  const hasRoute = !!routeGeoJSON?.features?.length;


  const handlePosition = (pos) => {
    const gpsCoords = [pos.coords.longitude, pos.coords.latitude];
    let userCoords = gpsCoords;
    

    if (hasRoute) {
      const routeLine = normalizeRoute(routeGeoJSON);
      const gpsPoint = turf.point(gpsCoords);
      const snapped = turf.nearestPointOnLine(routeLine, gpsPoint);
      userCoords = snapped.geometry.coordinates;

      /////////////////////////////////////////////////////////////////
        trailCoordsRef.current.push(userCoords);
        const trailSource = map.getSource("user-trail");
        if (trailSource) {
        trailSource.setData({
            type: "Feature",
            geometry: {
            type: "LineString",
            coordinates: trailCoordsRef.current
            }
        });
        }
        ////////////////////////////////////////////////////////

      const distance = turf.pointToLineDistance(gpsPoint, routeLine, { units: "meters" });
      if (distance > 20) onOffRoute?.();
    }

    const userSource = map.getSource("user");
    if (userSource) {
      userSource.setData({
        type: "FeatureCollection",
        features: [{ type: "Feature", geometry: { type: "Point", coordinates: userCoords } }]
      });
    }

    map.easeTo({ center: userCoords, duration: 1000, zoom: 15 });
  };


  navigator.geolocation.getCurrentPosition(handlePosition, console.error, { enableHighAccuracy: true });


  const watchId = navigator.geolocation.watchPosition(handlePosition, console.error, { enableHighAccuracy: true });

  return () => navigator.geolocation.clearWatch(watchId);
}