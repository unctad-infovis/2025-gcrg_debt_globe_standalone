import pointInPoly from './pointInPoly.js';

function getCountry(lat, long, geoJSON) {
  const coords = { lat, lng: long };
  const data = [];
  let feature;
  for (let i = 0; i < geoJSON.length; i++) {
    feature = geoJSON[i];
    for (let j = 0; j < feature.geometry.coordinates.length; j++) {
      if (pointInPoly(coords, feature.geometry.coordinates[j][0])) {
        if (feature.properties.id === 'CN') {
          geoJSON
            .filter((d) => d.properties.id === 'CN')
            .forEach((d) => data.push(d));
        } else {
          data.push({
            id: feature.properties.id,
            id_display: feature.properties.id_display,
            feature,
          });
        }
      }
    }
  }
  return data;
}

export default getCountry;
