import { geoPath, geoEquirectangular } from 'd3';
import { Texture } from 'three';

function drawHighlight(canvas, geoJSON) {
  const p = geoEquirectangular().translate([1090, 512]).scale(326);

  const mapContext = canvas.getContext('2d');
  mapContext.imageSmoothingEnabled = false;
  mapContext.clearRect(0, 0, 2048, 1024);

  if (!geoJSON || !mapContext) {
    return null;
  }
  const mapPath = geoPath().projection(p).context(mapContext);

  for (let i = 0; i < geoJSON.length; i++) {
    mapContext.fillStyle = '#ffcb05'; // XXX the color of the hover
    mapContext.beginPath();
    mapPath(geoJSON[i].feature ? geoJSON[i].feature : geoJSON[i]);
    mapContext.fill();
  }

  const texture = new Texture(mapContext.canvas);
  texture.needsUpdate = true;
  mapContext.canvas.remove();

  return texture;
}

export default drawHighlight;
