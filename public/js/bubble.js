// TODO voir comment changer ce val
let val = 0;
/**
 * place the view of outide map
 * @param {*} lat latitude
 * @param {*} lng longitude
 */
function startMapOutside(latLng) {
  map2.setView(latLng, map2.getZoom(), {
    animation: true,
  });
  $('#outside-map').css('visibility', 'visible');
  $('#outside-map').removeClass('bounceOutRight');
  $('#outside-map').addClass('bounceInDown');
  window.clearTimeout(val);
  val = setTimeout(() => {
    $('#outside-map').addClass('bounceOutRight');
    setTimeout(() => {
      $('#outside-map').css('visibility', 'hidden');
      $('#outside-map').removeClass('bounceInDown');
    }, 1000);
  }, 6000);
}

/**
 * animation the marker and the popup on en map enter in param
 * @param {*} marker
 * @param {*} popup
 * @param {*} map
 */
function animation(marker, popup, map) {
  map.addLayer(marker);
  popup.openOn(map);
  $(marker._icon).fadeIn(1000);

  setTimeout(() => {
    $(marker._icon).fadeOut(1000);
    map.removeLayer(popup);
    popup = undefined;
  }, 5000);

  setTimeout(() => {
    map.removeLayer(marker);
    marker = undefined;
  }, 6000);
}

/**
 * create a object marker with ec and position
 * @param {*} ec
 * @param {*} lat
 * @param {*} lng
 */
function createMarker(ec, lat, lng) {
  const colormarker = portalsInfo.find(portal => portal.name === ec.ezproxyName);
  // draw marker
  const pulsingIcon = L.icon.pulse({
    iconSize: [60, 60],
    color: colormarker.color,
    fillColor: colormarker.color,
  });
  const marker = L.marker([lat, lng], { icon: pulsingIcon });
  marker.origin = {
    lat,
    lng,
  };
  return marker;
}

/**
 * create a object popup with ec and position
 * @param {*} ec
 * @param {*} lat
 * @param {*} lng
 */
function createPopup(ec, lat, lng) {
  const platformName = `<div class="leaflet-popup-content platformName">${ec.platform_name}</div>`;
  const rtypeMime = `<div class="rtypeMime">${(ec.rtype || '')} ${(ec.mime || '')}</div>`;
  const publicationTitle = `<div class="leaflet-popup-content publicationTitle">${(ec.publication_title || '')}</div>`;
  let popupContent = `${ec.platform_name ? platformName : ''}${(ec.rtype || ec.mime) ? rtypeMime : ''}`;
  if (showTitles) {
    popupContent = `${popupContent}${ec.publication_title ? publicationTitle : ''}`;
  }
  const popup = L.popup({
    closeOnClick: false,
    autoClose: false,
    autoPan: false,
    minWidth: 80,
    maxWidth: 200,
    closeButton: false,
  }).setLatLng([lat - 0.2, lng]).setContent(popupContent);
  popup.origin = {
    lat: lat - 0.2,
    lng,
  };
  return popup;
}

/**
 * place the puldateIcon and information marker on map
 * @param {*} ec
 */
function showInfo(ec) {
  const isDisabled = disabledInstitutes.find(institut => institut === ec.ezproxyName);
  if (isDisabled) { return; }
  const mapCenterLng = map.getCenter().lng;
  const nbMap = Math.round((mapCenterLng / 360));

  const lng = ec['geoip-longitude'] + (nbMap * 360);
  const lat = ec['geoip-latitude'];

  const marker = createMarker(ec, lat, lng);
  const popup = createPopup(ec, lat, lng);

  const bounds = map.getBounds();
  const north = bounds.getNorth();
  const south = bounds.getSouth();
  const east = bounds.getEast();
  const west = bounds.getWest();

  if (lat > north || lat < south || lng > east || lng < west) {
    if (displayOutsideMap) {
      const marker2 = createMarker(ec, lat, lng);
      const popup2 = createPopup(ec, lat, lng);
      animation(marker2, popup2, map2);
      startMapOutside([lat, lng]);
    }
  }
  animation(marker, popup, map);
}

$(document).ready(() => {
  const socket = io.connect();
  socket.on('ezpaarse-ec', (ec) => {
    if (ec) {
      // ignore not geolocalized EC
      if (!ec['geoip-latitude'] || !ec['geoip-longitude']) return;

      const match = /^_([a-z0-9]+)_$/i.exec(ec.ezproxyName);
      if (match) {
        ec.ezproxyName = match[1];
      }


      filter(ec);
      showInfo(ec);
      // update legend
      const portal = portalsInfo.find(p => p.name === ec.ezproxyName);
      if (portal) {
        portal.count += 1;
        $(`#${portal.name}-counter`).html(portal.count.toLocaleString());
      }
    }
  });
});
