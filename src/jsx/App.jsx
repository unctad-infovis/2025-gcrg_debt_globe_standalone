import React, { useState, useEffect } from 'react';
import '../styles/styles.less';

import ThreeScene from './ThreeScene.jsx';

function App() {
  // Data states.
  const [data, setData] = useState(null);

  useEffect(() => {
    const data_file = window.location.href.includes('unctad.org')
      ? 'https://storage.unctad.org/2025-gcrg_debt_globe_standalone/assets/data/Map.geojson'
      : './assets/data/Map.geojson';
    try {
      fetch(data_file)
        .then((response) => {
          if (!response.ok) {
            throw Error(response.statusText);
          }
          return response.text();
        })
        .then((body) => setData(JSON.parse(body).features));
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <div className="app">
      <div className="title">
        <h2>A world of debt</h2>
        <h3>Report 2025</h3>
        <h4>
          <svg className="button-svg" id="Layer_1" fill="#FBAF17" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 365.5 365.5" style={{ height: '135px' }}>
            <path className="cls-1" d="M77.5,107.7l106.4,107.9,102.2-107v92.2l-102.3,117.8-106.4-110v-100.9Z" />
          </svg>
          It is time for reform
        </h4>
        <div className="qr_code_container">
          <div className="text">
            Explore
            {' '}
            <br />
            <strong>A World of Debt</strong>
          </div>
          <div className="qrcode"><img src="./assets/img/qrcode.png" alt="qrcode" /></div>
        </div>
      </div>
      {data && <ThreeScene geoJSON={data || []} />}
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

export default App;
