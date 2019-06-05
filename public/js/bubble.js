// TODO voir comment changer ce val
let val = 0;
let outsideMapOpened = false;

/**
 * display and set view of outsidemap with coordinate
 * @param {Array.<number>} latLng coordinate
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
    setTimeout(() => {
      $('#outside-map').css('visibility', 'hidden');
    }, 1000);
    outsideMapOpened = false;
  }, 5000);
}


/**
 * add marker on layer and display it
 * @param {layer} marker
 * @param {Map} map
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
 * create a object popup with ec
 * @param {*} ec
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
 * css marker is set with the portal
 * @param {*} portal
 * @param {*} ec
 * @param {Array.<number>} latLng
 * @param {boolean} hidden
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

/**
 * update the tooltip with the ec
 * @param {*} ec
 */
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

/**
 * Init counters (rtype and mime) set 0 by portals
 * @param {Array.<number>} data
 */
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

/**
 * Update total counter (rtype and mime)
 */
// eslint-disable-next-line no-unused-vars
function updateTotalCount() {
  totalCounterElements.forEach((el) => {
    $(`${el.id}`).html(totalCount[el.name].toLocaleString());
  });
}

/**
 * hide ec if filter is apply
 * @param {*} ec
 */
function filterbyEditor(ec) {
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
    if (enabledEditors.length) {
      // showing bubbles only if the editors are picked in the editor chip
      // if the chip is empty : shows all editors
      hidden = true;
      enabledEditors.forEach((el) => {
        if (ec.platform_name.toLowerCase().includes(el.tag.toLowerCase())) { hidden = false; }
      });
    }
  }
  return hidden;
}

/**
 * update counterType in the tooltip with ec
 * @param {*} ec
 * @param {*} portal
 */
function counterTypeByPortal(ec, portal) {
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
}

/**
 * place the puldateIcon and information marker on map
 * @param {*} ec
 * @param {*} portal
 */
function showInfo(ec, portal) {
  hidden = filterbyEditor(ec);
  if (portal.isDisabled) { return; }
  const mapCenterLng = map.getCenter().lng;
  const nbMap = Math.round((mapCenterLng / 360));

  const latLng = [ec['geoip-latitude'], ec['geoip-longitude'] + (nbMap * 360)];

  counterTypeByPortal(ec, portal);
  updateCounter(ec);

  const marker = createMarker(portal, ec, latLng, hidden);
  marker.off('click');

  const bounds = map.getBounds();

  if (!bounds.contains(latLng)) {
    if (displayOutsideMap) {
      const markerOutside = createMarker(portal, ec, latLng, hidden);
      markerOutside.off('click');
      animation(markerOutside, outsideMap);
      startMapOutside(latLng);
    }
  }
  animation(marker, map);
}

// connect and listen socket
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
