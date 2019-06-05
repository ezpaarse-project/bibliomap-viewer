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
function createMarker(portal, ec, latLng, hidden) {
  // draw marker
  const pulsingIcon = L.icon.pulse({
    class: `bibliomap-pulse ${portal.name}`,
    iconSize: [60, 60],
  });
  const pulsingHiddenIcon = L.icon.pulse({
    class: `bibliomap-pulse ${portal.name}`,
    iconSize: [30, 30],
  });
  if (hidden) {
    return L.marker(latLng, {
      icon: pulsingHiddenIcon,
    }).setOpacity(0.3);
  }
  return L.marker(latLng, {
    icon: pulsingIcon,
  }).bindPopup(createPopup(ec));
}

let portalCounter;

// eslint-disable-next-line no-unused-vars
function tooltip(ec) {
  const portal = portalsInfo.find(p => p.name === ec.filter);
  const tooltips = [];
  if (!portal) { return; }
  if (portal.count === 0) {
    $(`#${ec.filter}-tooltip`).addClass('tooltipped');
    $(`#${ec.filter}-tooltip`).tooltip();
  }
  portalCounter.forEach((pc) => {
    tooltips.push(`${pc.toUpperCase()}: ${portal[pc].toLocaleString()}`);
  });
  $(`#${ec.filter}-tooltip`).attr('data-tooltip', tooltips.join(' | '));
}


// Init counters (rtype and mime) by portals set 0
// eslint-disable-next-line no-unused-vars
function initCounter(data) {
  portalsInfo.map((portal) => {
    data.forEach((c) => {
      portal[c] = 0;
    });
    return null;
  });
  portalCounter = data;
}

// Total counters HTML elements
let totalCounterElements;
// Total counters name of vars
const totalCounters = [];
// Init total counters to 0
// eslint-disable-next-line no-unused-vars
function initTotalCounter(data) {
  data.forEach((c) => {
    totalCount[c.name] = 0;
    totalCounters.push(c.name);
  });
  if (!totalCounterElements) {
    totalCounterElements = data;
  }
}

// Update total counter (rtype and mime)
// eslint-disable-next-line no-unused-vars
function updateTotalCount() {
  totalCounterElements.forEach((el) => {
    $(`${el.id}`).html(totalCount[el.name].toLocaleString());
  });
}


/**
 * place the puldateIcon and information marker on map
 * @param {*} ec
 */
function showInfo(ec, portal) {
  let enabledEditors;
  if ($('#enabled-editors').length) {
    enabledEditors = M.Chips.getInstance($('#enabled-editors')).chipsData;
  }
  let hidden = false;
  // eslint-disable-next-line no-prototype-builtins
  if (editors && !editors.hasOwnProperty(ec.platform_name)) {
    // adding new editors to autocomplete
    editors[ec.platform_name] = null;
  }
  if (enabledEditors) {
    // showing bubbles only if the editors are picked in the editor chip
    // if the chip is empty : shows all editors
    hidden = true;
    enabledEditors.forEach((el) => {
      if (ec.platform_name.toLowerCase().includes(el.tag.toLowerCase())) { hidden = false; }
    });
  }
  if (portal.isDisabled) { return; }

  const mapCenterLng = map.getCenter().lng;
  const nbMap = Math.round((mapCenterLng / 360));

  const latLng = [ec['geoip-latitude'], ec['geoip-longitude'] + (nbMap * 360)];
  /* ----------------------------- */
  if (ec.mime) {
    if (portalCounter.includes(ec.mime.toLowerCase())) {
      if (!portal.isDisabled) {
        portal[ec.mime.toLowerCase()] += 1;
      }
      totalCount[ec.mime.toLowerCase()] += 1;
    }
    ec.mime = `<span class="label label-bubble ${ec.mime.toLowerCase()}">${ec.mime}</span>`;
  }

  if (ec.rtype) {
    if (portalCounter.includes(ec.rtype.toLowerCase())) {
      if (!portal.isDisabled) {
        portal[ec.rtype.toLowerCase()] += 1;
      }
      totalCount[ec.rtype.toLowerCase()] += 1;
    }
    ec.rtype = `<span class="label label-bubble rtype">${ec.rtype}</span>`;
  }
  updateCounter(ec);
  /* ----------------------------- */

  const marker = createMarker(portal, ec, latLng, hidden);
  marker.off('click');

  // marker._icon.css('opacity', '0.2');
  const bounds = map.getBounds();
  const north = bounds.getNorth();
  const south = bounds.getSouth();
  const east = bounds.getEast();
  const west = bounds.getWest();

  if (latLng[0] > north || latLng[0] < south || latLng[1] > east || latLng[1] < west) {
    if (displayOutsideMap) {
      const markerOutside = createMarker(portal, ec, latLng, hidden);
      markerOutside.off('click');
      animation(markerOutside, outsideMap);
      startMapOutside(latLng);
    }
  }
  animation(marker, map);
}

$(document).ready(() => {
  init(totalCount);

  const socket = io.connect();
  socket.on('ezpaarse-ec', (ec) => {
    // ignore not geolocalized EC
    if (!ec || !ec['geoip-latitude'] || !ec['geoip-longitude']) { return; }

    filter(ec);

    const portal = portalsInfo.find(p => p.name === ec.filter);
    if (!portal) { return; }

    showInfo(ec, portal);
    // update legend
    portal.count += 1;
    $(`#${portal.name}-counter`).html(portal.count.toLocaleString());
  });
});
