function pointInPoly(point, poly) {
  let toggle = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    if (
      poly[i][1] > point.lat !== poly[j][1] > point.lat
      && point.lng
        < poly[i][0]
          + ((poly[j][0] - poly[i][0]) * (point.lat - poly[i][1]))
            / (poly[j][1] - poly[i][1])
    ) {
      toggle = !toggle;
    }
  }
  return toggle;
}

export default pointInPoly;
