import { geoPath, geoEquirectangular } from 'd3';
import { Texture } from 'three';

function drawMapLayer(canvas, geoJSON) {
  const p = geoEquirectangular().translate([1090, 512]).scale(326);

  const mapContext = canvas.getContext('2d');
  mapContext.imageSmoothingEnabled = false;
  mapContext.clearRect(0, 0, 2048, 1024);

  const mapPath = geoPath().projection(p).context(mapContext);

  geoJSON.forEach((d) => {
    mapContext.lineWidth = 2;
    mapContext.strokeStyle = 'white';
    mapContext.beginPath();
    mapPath(d);
    mapContext.stroke();
  });

  const texture = new Texture(mapContext.canvas);
  texture.needsUpdate = true;
  mapContext.canvas.remove();
  return texture;
}

export default drawMapLayer;
