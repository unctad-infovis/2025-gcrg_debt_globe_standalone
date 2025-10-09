import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

function Tooltip({
  data, coords, offset, time, scroll
}) {
  const onClickofGlobeCountry = () => {
    const difference = Date.now() - time;
    if (difference < 200) {
      const url = window.location.href.includes('unctad.org')
        ? `https://unctad-infovis.github.io/2025-gcrg_debt_standalone/?id=${data.id}`
        : `https://unctad-infovis.github.io/2025-gcrg_debt_standalone/?id=${
          data.id || data.properties.id
        }`;
      window.location = url;
    }
  };

  useEffect(() => {
    onClickofGlobeCountry();
    window.addEventListener('click', onClickofGlobeCountry);
    return () => {
      window.removeEventListener('click', onClickofGlobeCountry);
    };
  });

  return (
    <div
      className="globe-tooltip"
      style={{
        left: coords[0] + 3 - offset.left,
        top: coords[1] + 3 - offset.top - scroll + window.scrollY,
      }}
    >
      <span className="globe-title">
        {' '}
        {data.id_display || data.properties.id_display}
      </span>

      <hr className="globe-hr" />
      <p className="globe-switch">Click to navigate to dashboard</p>
    </div>
  );
}

Tooltip.propTypes = {
  data: PropTypes.shape({
    id_display: PropTypes.string,
    id: PropTypes.string,
    properties: PropTypes.shape({
      id_display: PropTypes.string,
      id: PropTypes.string,
    }),
  }).isRequired,
  coords: PropTypes.arrayOf(PropTypes.number).isRequired,
  offset: PropTypes.shape({
    left: PropTypes.number,
    top: PropTypes.number,
  }).isRequired,
  time: PropTypes.number.isRequired,
  scroll: PropTypes.number.isRequired,
};

export default Tooltip;
