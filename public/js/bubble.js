// TODO voir comment changer ce val
let val = 0;
let outsideMapOpened = false;
/**
 * place the view of outide map
 * @param {*} lat latitude
 * @param {*} lng longitude
 */
function startMapOutside(latLng) {
  outsideMap.setView(latLng);

  if (!outsideMapOpened) {
    outsideMapOpened = true;
    $('#outside-map')
      .removeClass('bounceOutRight')
      .css('visibility', 'visible')
      .addClass('bounceInDown');
  }
  window.clearTimeout(val);
  val = setTimeout(() => {
    $('#outside-map')
      .addClass('bounceOutRight')
      .removeClass('bounceInDown');
    outsideMapOpened = false;
    setTimeout(() => {
      $('#outside-map').css('visibility', 'hidden');
    }, 1000);
  }, 6000);
}

/**
 * animation the marker and the popup on en map enter in param
 * @param {*} marker
 * @param {*} popup
 * @param {*} map
 */
function animation(marker, map) {
  map.addLayer(marker);
  marker.openPopup();
  $(marker._icon).fadeIn(1000);

  $(marker._icon).delay(5000).fadeOut(1000, () => {
    map.removeLayer(marker);
  });
}

/**
 * create a object popup with ec and position
 * @param {*} ec
 * @param {*} lat
 * @param {*} lng
 */
function createPopup(ec) {
  const platformName = `<div class="leaflet-popup-content platformName">${ec.platform_name}</div>`;
  const rtypeMime = `<div class="rtypeMime">${(ec.rtype || '')} ${(ec.mime || '')}</div>`;
  const publicationTitle = `<div class="leaflet-popup-content publicationTitle">${(ec.publication_title || '')}</div>`;
  let popupContent = `${ec.platform_name ? platformName : ''}${(ec.rtype || ec.mime) ? rtypeMime : ''}`;
  if (showTitles) {
    popupContent = `${popupContent}${ec.publication_title ? publicationTitle : ''}`;
  }
  return L.popup({
    closeOnClick: false,
    autoClose: false,
    autoPan: false,
    minWidth: 80,
    maxWidth: 200,
    closeButton: false,
  }).setContent(popupContent);
}

/**
 * create a object marker with ec and position
 * @param {*} ec
 * @param {*} lat
 * @param {*} lng
 */
function createMarker(portal, ec, latLng) {
  // draw marker
  const pulsingIcon = L.icon.pulse({
    class: `bibliomap-pulse ${portal.name}`,
    iconSize: [60, 60],
  });
  return L.marker(latLng, {
    icon: pulsingIcon,
  }).bindPopup(createPopup(ec));
}

/**
 * place the puldateIcon and information marker on map
 * @param {*} ec
 */
function showInfo(ec, portal) {
  const isDisabled = disabledInstitutes.find(institut => institut === ec.ezproxyName);
  if (isDisabled) { return; }

  const mapCenterLng = map.getCenter().lng;
  const nbMap = Math.round((mapCenterLng / 360));

  const latLng = [ec['geoip-latitude'], ec['geoip-longitude'] + (nbMap * 360)];

  const marker = createMarker(portal, ec, latLng);
  marker.off('click');

  // marker._icon.css('opacity', '0.2');
  const bounds = map.getBounds();
  const north = bounds.getNorth();
  const south = bounds.getSouth();
  const east = bounds.getEast();
  const west = bounds.getWest();

  if (latLng[0] > north || latLng[0] < south || latLng[1] > east || latLng[1] < west) {
    if (displayOutsideMap) {
      const markerOutside = createMarker(portal, ec, latLng);
      markerOutside.off('click');
      animation(markerOutside, outsideMap);
      startMapOutside(latLng);
    }
  }
  animation(marker, map);
}

$(document).ready(() => {
  const socket = io.connect();
  socket.on('ezpaarse-ec', (ec) => {
    // ignore not geolocalized EC
    if (!ec || !ec['geoip-latitude'] || !ec['geoip-longitude']) { return; }

    const match = /^_([a-z0-9]+)_$/i.exec(ec.ezproxyName);
    if (match) {
      ec.ezproxyName = match[1];
    }

    const portal = portalsInfo.find(p => p.name === ec.ezproxyName);
    if (!portal) { return; }

    filter(ec, portal);
    showInfo(ec, portal);
    // update legend
    portal.count += 1;
    $(`#${portal.name}-counter`).html(portal.count.toLocaleString());
  });
});
