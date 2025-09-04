import * as turf from "@turf/turf";

export function normalizeRoute(geojson) {
  if (!geojson?.features?.length) return null;

  const { type, coordinates } = geojson.features[0].geometry;
  if (type === "MultiLineString") {
    return turf.lineString(coordinates.flat().map(([lon, lat]) => [lon, lat]));
  }
  if (type === "LineString") {
    return turf.lineString(coordinates.map(([lon, lat]) => [lon, lat]));
  }

  console.warn("Unsupported geometry type:", type);
  return null;
}
