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
  $('#outside_map').fadeIn(1000);
  window.clearTimeout(val);
  val = setTimeout(() => {
    $('#outside_map').fadeOut(1000);
  }, 6000);
}

/**
 * animation the bubble and the popup on en map enter in param
 * @param {*} bubble
 * @param {*} popup
 * @param {*} map
 */
function annimation(bubble, popup, map) {
  map.addLayer(bubble);
  popup.openOn(map);
  bubble._icon.style.display = 'none';
  $(bubble._icon).fadeIn(1000);

  setTimeout(() => {
    map.removeLayer(popup);
    $(bubble._icon).fadeOut(1000);
  }, 5000);

  setTimeout(() => {
    map.removeLayer(bubble);
  }, 6000);
}

/**
 * create a object bubble with ec and position
 * @param {*} ec
 * @param {*} lat
 * @param {*} lng
 */
function createBubble(ec, lat, lng) {
  const colorBubble = portalsInfo.find(portal => portal.name === ec.ezproxyName);
  // draw bubble
  const pulsingIcon = L.icon.pulse({
    iconSize: [60, 60],
    color: colorBubble.color,
    fillColor: colorBubble.color,
  });
  const bubble = L.marker([lat, lng], { icon: pulsingIcon });
  bubble.origin = {
    lat,
    lng,
  };
  return bubble;
}

/**
 * create a object popup with ec and position
 * @param {*} ec
 * @param {*} lat
 * @param {*} lng
 */
function createPopup(ec, lat, lng) {
  const popup = L.popup({
    closeOnClick: false,
    autoClose: false,
    autoPan: false,
    maxWidth: 100,
    closeButton: false,
  }).setLatLng([lat - 0.2, lng]).setContent(`
    <div class='text-popup'><strong>${ec.platform_name}</strong></div> 
    <div class='text-popup'> ${(ec.rtype || '')} ${(ec.mime || '')} ${(ec.publication_title || '')}</div>
  `);
  popup.origin = {
    lat: lat - 0.2,
    lng,
  };
  return popup;
}

/**
 * place the puldateIcon and information bubble on map
 * @param {*} ec
 */
function showInfo(ec) {
  const mapCenterLng = map.getCenter().lng;
  const nbMap = (Math.round((mapCenterLng / 360)));

  const lng = ec['geoip-longitude'] + (nbMap * 360);
  const lat = ec['geoip-latitude'];

  const bubble = createBubble(ec, lat, lng);
  const popup = createPopup(ec, lat, lng);

  const bounds = map.getBounds();
  const north = bounds.getNorth();
  const south = bounds.getSouth();
  const east = bounds.getEast();
  const west = bounds.getWest();

  if (lat > north || lat < south || lng > east || lng < west) {
    // const etat = document.getElementById('filter-button');
    // if (etat.value === 'on') {
    // }
    const bubble2 = createBubble(ec, lat, lng);
    const popup2 = createPopup(ec, lat, lng);
    annimation(bubble2, popup2, map2);
    startMapOutside([lat, lng]);
  }
  annimation(bubble, popup, map);
}

function BibliomapOverlay(map) {
  this.ezpaarseEC = {};
  this.nbEC = 0;
  this.setMap(map);
}

$(document).ready(() => {
  const socket = io.connect();
  socket.on('ezpaarse-ec', (ec) => {
    if (BibliomapOverlay) {
      BibliomapOverlay.addEzpaarseEC(ec);
    }
  });

  /**
   * fonction who draw circles
   */
  BibliomapOverlay.addEzpaarseEC = (ec) => {
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
      if (portal.counter) {
        portal.counter.text(portal.count.toLocaleString());
      }
    }
  };
});
