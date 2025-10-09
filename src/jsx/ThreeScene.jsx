import React, {
  useEffect, useRef, useState, memo
} from 'react';
import '../styles/styles.less';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { scaleLinear } from 'd3';
import drawMapLayer from './helpers/DrawMap.js';
import drawHighlight from './helpers/DrawHighlight.js';
import getCountry from './helpers/getCountry.js';
import Tooltip from './Tooltip.jsx';

function ThreeScene({ geoJSON }) {
  // refs for the different divs and canvas
  const wrapperRef = useRef(null);
  const threeRef = useRef(null);
  const canvasRef = useRef(null);
  const highlightRef = useRef(null);

  // store the height and width
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [offset, setOffset] = useState({ top: 0, left: 0 });
  const [scrollHeight, setScrollHeight] = useState(window.scrollY);

  // store tooltip values
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipCoords, setTooltipCoords] = useState([0, 0]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [drag, setDrag] = useState(false);
  const [endTime, setEndTime] = useState(0);

  useEffect(() => {
    // variables
    const radius = (width > height ? height : width) / 2.2;
    const xScale = scaleLinear().domain([-1, 1]).range([0, width]);
    const yScale = scaleLinear().domain([-1, 1]).range([height, 0]);

    // scene
    const scene = new THREE.Scene();

    // camera
    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      0.1,
      10000
    );
    camera.position.z = 500;
    camera.position.y = 100;

    // renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    renderer.setClearColor('red', 0);
    renderer.setSize(width, height);

    // controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = -3;

    // light
    const light = new THREE.DirectionalLight(0xffffff, 1.1);
    light.position.set(3, 5, 3);
    scene.add(light);

    // globe sphere
    const sphereGeometry = new THREE.SphereGeometry(radius, 100, 100);
    const img_file = window.location.href.includes('unctad.org')
      ? 'https://storage.unctad.org/2025-gcrg_debt_globe_standalone/assets/img/globe3.jpg'
      : './assets/img/globe3.jpg';

    // update on move
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      light.position.copy(camera.position);
      renderer.render(scene, camera);
    };

    const imageLoad = (img) => {
      if (height > 0 && width > 0) {
        const sphereMaterial = new THREE.MeshPhongMaterial({
          map: img,
          side: THREE.DoubleSide,
        });

        const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(sphereMesh);

        animate();
      }
    };
    const image = new THREE.TextureLoader().load(img_file, (img) => imageLoad(img));
    image.colorSpace = THREE.SRGBColorSpace;

    // canvas sphere -- for country borders
    const canvasMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.8,
    });
    const canvasMesh = new THREE.Mesh(sphereGeometry, canvasMaterial);
    scene.add(canvasMesh);

    // second canvas sphere -- for showing fill of highlighted country
    const highlightMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.7,
    });

    const highlightMesh = new THREE.Mesh(sphereGeometry, highlightMaterial);
    scene.add(highlightMesh);

    // setup
    setHeight(wrapperRef.current.clientHeight);
    setWidth(wrapperRef.current.clientWidth);
    setOffset(wrapperRef.current.getBoundingClientRect());
    threeRef.current.innerHTML = '';
    threeRef.current.appendChild(renderer.domElement);

    function handleResize() {
      setHeight(wrapperRef.current.clientHeight);
      setWidth(wrapperRef.current.clientWidth);
      setOffset(wrapperRef.current.getBoundingClientRect());
      setScrollHeight(window.scrollY);
    }

    // add map layers
    canvasMaterial.map = drawMapLayer(canvasRef.current, geoJSON);
    highlightMaterial.map = drawHighlight(highlightRef.current, 'BLANK');

    // animate();

    const RAYCASTER = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      // 38 for 512?
      pointer.x = ((event.clientX - rect.left) / (rect.right - rect.left)) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;

      RAYCASTER.setFromCamera(pointer, camera);
      const intersect = RAYCASTER.intersectObjects([canvasMesh])[0];

      if (intersect) {
        controls.autoRotate = false;
        const longScale = scaleLinear().domain([0, 1]).range([-180, 180]);
        const latScale = scaleLinear().domain([0, 1]).range([-90, 90]);

        const pixelX = intersect.uv.x - 0.031;
        const pixelY = intersect.uv.y;

        const lat = latScale(pixelY);
        const long = longScale(pixelX);
        const country = getCountry(lat, long, geoJSON);

        if (country) {
          highlightMaterial.map = drawHighlight(highlightRef.current, country);
          threeRef.current.style.cursor = 'pointer';

          setTooltipData(country[0]);
          setTooltipCoords([
            xScale((event.clientX / width) * 2 - 1),
            yScale(-(event.clientY / height) * 2 + 1),
          ]);
          setShowTooltip(true);
        } else {
          highlightMaterial.map = drawHighlight(highlightRef.current, 'BLANK');
          setShowTooltip(false);
          threeRef.current.style.cursor = 'auto';
        }
      } else {
        controls.autoRotate = true;
        highlightMaterial.map = drawHighlight(highlightRef.current, 'BLANK');
        setShowTooltip(false);
        threeRef.current.style.cursor = 'auto';
      }
      return null;
    };

    const onDragStart = () => {
      setEndTime(Date.now());
      setDrag(true);
      if (highlightMaterial.opacity !== 0) {
        highlightMaterial.opacity = 0;
      }
    };

    const onDragEnd = () => {
      setDrag(false);
      highlightMaterial.opacity = 0.7;
    };

    const divRef = threeRef.current;
    divRef.addEventListener('mousemove', onPointerMove);
    controls.addEventListener('start', onDragStart);
    controls.addEventListener('end', onDragEnd);
    window.addEventListener('resize', handleResize);

    return () => {
      divRef.removeEventListener('mousemove', onPointerMove);
      controls.removeEventListener('start', onDragStart);
      controls.removeEventListener('end', onDragEnd);
      window.removeEventListener('resize', handleResize);
    };
  }, [height, width, geoJSON]);

  return (
    <div className="globe-wrapper" ref={wrapperRef}>
      {tooltipData && showTooltip && !drag && (
        <Tooltip
          data={tooltipData}
          coords={tooltipCoords}
          offset={offset}
          time={endTime}
          scroll={scrollHeight}
        />
      )}
      <div className="globe-threeCanvas" ref={threeRef} role="presentation" />
      <canvas
        className="globe-mapCanvas"
        ref={canvasRef}
        width={2048}
        height={1024}
        style={{ width: '100%', height: '100%' }}
      />
      <canvas
        className="globe-highlightCanvas"
        ref={highlightRef}
        width={2048}
        height={1024}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}

ThreeScene.propTypes = {
  geoJSON: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default memo(ThreeScene);
