/**
 * information about CNRS institute on legend
 */

// eslint-disable-next-line no-unused-vars
const extCount = {
  pdf: 0,
  html: 0,
};
// eslint-disable-next-line no-unused-vars
let displayOutsideMap = true;
// eslint-disable-next-line no-unused-vars
let showTitles = false;
let disabledInstitutes = [];
/**
 * Init the background map and the outside map
 */
// eslint-disable-next-line prefer-const
let Editors = {};
let map = '';
let outsideMap = '';
const franceCenter = [46.3630104, 2.9846608];
const lightenMap = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const darkenMap = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

function initMap() {
  map = L.map('bibliomap-canvas', {
    minZoom: 3,
    maxZoom: 8,
    zoomControl: false,
  }).setView(franceCenter, 6);

  L.tileLayer(lightenMap, {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  L.control.zoom({
    position: 'topright',
  }).addTo(map);

  map.on('dragend', () => {
    const mapCenterLng = map.getCenter().lng;
    const nbMap = (Math.round(((mapCenterLng) / 360)));

    Object.keys(map._layers).forEach((element) => {
      const layer = map._layers[element];
      if (layer._latlng) {
        const nbMapBulle = (Math.round((layer._latlng.lng) / 360));
        const lng = layer._latlng.lng + ((nbMap - nbMapBulle) * 360);
        layer.setLatLng([layer._latlng.lat, lng]).update();
      }
    });
  });

  outsideMap = L.map('outside-map', {
    minZoom: 2,
    maxZoom: 4,
    doubleClickZoom: false,
    zoomControl: false,
  }).setView([0, 0], 4);

  L.tileLayer(lightenMap).addTo(outsideMap);

  L.control.zoom({
    position: 'topleft',
  }).addTo(outsideMap);

  outsideMap.on('click', () => {
    const oldZoom = map.getZoom();
    map.flyTo(outsideMap.getCenter(), oldZoom);
    $('#outside-map').removeClass('fadeIn');
  });
}

/**
 * filter URL for expo mode
 * @param * variable
 */
function getQueryVariable(variable) {
  const query = window.location.search.substring(1);
  const vars = query.split('&');

  for (let i = 0; i < vars.length; i += 1) {
    const pair = vars[i].split('=');
    if (pair[0] === variable) {
      return (pair.length > 1 ? pair[1] : true);
    }
  }
  return false;
}

/**
 * Start timer when you arrive on Bibliomap
 */
function timer() {
  let time = 0;
  setInterval(() => {
    const tmp = (time / 3600);
    const days = Math.floor(tmp / 24);
    const hours = Math.floor(tmp % 24);
    const minutes = Math.floor((time / 60) % 60);
    const seconds = (time % 60);
    document.getElementById('Timer').innerHTML = `${days}j ${hours}h ${minutes}m ${seconds}s`;
    time += 1;
  }, 1000);
}

/**
 * Init the message when you arrive on Bibliomap
 * with the demo mode, it appear in a regular rhythm
 */
function initBrand() {
  $('.modal').modal({
    opacity: 0,
  });
  const expo = getQueryVariable('expo') || getQueryVariable('e');
  if (!expo) {
    $('#description').modal('open');
  }

  if (expo) {
    // add /?expo=<showDuration>,<hideDuration> at the end of the url to have custom durations
    // or add /?expo=true to have the default durations

    // default durations when expo=true
    let showDuration = 60000;
    let hideDuration = 60000 * 15;

    if (typeof expo === 'string') {
      const durations = expo.split(',');
      showDuration = (parseInt(durations[0], 10) * 1000) || showDuration;
      hideDuration = (parseInt(durations[1], 10) * 1000) || hideDuration;

      (function displayCycle() {
        $('#description').modal('open');
        $('#description-content').scrollTop(0);
        setTimeout(() => {
          $('#description-content').animate({ scrollTop: $('#description')[0].scrollHeight }, 3000);

          setTimeout(() => {
            $('.modal').modal('close');

            setTimeout(displayCycle, hideDuration);
          }, showDuration / 2);
        }, showDuration / 2);
      }());
    }
  }
  $('#brand').on('click', () => {
    $('#description').modal('open');
  });
}

/**
 * add evenement for button and update the DOM
 */
function initLegend() {
  const content = $('#legend');
  let locale = getQueryVariable('lang') || 'fr';
  if (locale !== 'en' && locale !== 'fr') {
    locale = 'fr';
  }
  // for each institutes
  portalsInfo.forEach((portal) => {
    let portalLogo = (`<img src="${portal.logo}" class="circle bibliomap-clear-circle"></img>`);
    if (!portal.logo) {
      portalLogo = (`<div class = "logoDefault" style = "background-color: ${portal.color}"></div>`);
    }
    let portalLink = (`<a href="${portal.link}" id="${portal.name}-tooltip" data-position="right" data-tooltip="" target="_blank">`);
    if (!portal.link) {
      portalLink = (`<a id="${portal.name}-tooltip" data-position="right" data-tooltip="">`);
    }
    content.append(`${portalLink}
      <li id="${portal.name}-legend" class="collection-item avatar bibliomap-collection-item"> 
        ${portalLogo}
        <span id="${portal.name}-counter" class="bibliomap-counter" style="background-color: ${portal.color}">${portal.count}</span>
        <span class="title bibliomap-institut-title">${(portal.name)}</span>
        <p class="bibliomap-institut-desc">${portal.desc ? portal.desc[locale] : ''}</p>
      </li>
    </a>`);

    $('#disabled').append(`
    <div class="col s6">
      <label>
        <input id="${portal.name}-switch" type="checkbox" checked="checked" />
        <span>${portal.name}</span>
      </label>
    </div>`);

    // update legend with filter
    $(`#${portal.name}-switch`).on('change', (el) => {
      const isDisabled = disabledInstitutes.find(institut => institut === portal.name);
      if (el.currentTarget.checked && isDisabled) {
        disabledInstitutes = disabledInstitutes.filter(institut => institut !== portal.name);
        $(`#${portal.name}-legend`).css('display', 'block');
        extCount.html += portal.html;
        $('#extHTML').html(extCount.html.toLocaleString());

        extCount.pdf += portal.pdf;
        $('#extPDF').html(extCount.pdf.toLocaleString());
      }

      if (!el.currentTarget.checked && !isDisabled) {
        disabledInstitutes.push(portal.name);
        $(`#${portal.name}-legend`).css('display', 'none');
        $(`#${portal.name}-counter`).html(portal.count);

        extCount.html -= portal.html;
        $('#extHTML').html(extCount.html.toLocaleString());

        extCount.pdf -= portal.pdf;
        $('#extPDF').html(extCount.pdf.toLocaleString());
      }
    });
  });

  $('.sidenav').sidenav({
    isFixed: false,
    isOpen: true,
  });
  $('#close-side').on('click', () => {
    $('.sidenav').sidenav('close');
  });
  $('#open-side').on('click', () => {
    $('.sidenav').sidenav('open');
  });
}

function changeMap(m) {
  const layer = m._layers[Object.keys(m._layers)[0]];
  if (layer._url === lightenMap) {
    layer._url = darkenMap;
    return layer.redraw();
  }
  if (layer._url === darkenMap) {
    layer._url = lightenMap;
    return layer.redraw();
  }
  return null;
}

function initMenu() {
  $('.fixed-action-btn').floatingActionButton({
    hoverEnabled: false,
    direction: 'top',
  });
  $('#center').on('click', () => {
    map.flyTo(franceCenter, 6);
  });
  $('select').formSelect();
  $('#outside-map-switch').on('change', (el) => {
    if (el.currentTarget.checked) {
      displayOutsideMap = true;
    } else {
      displayOutsideMap = false;
      $('#outside-map').removeClass('fadeIn');
    }
  });
  $('#show-titles').on('change', (el) => {
    if (el.currentTarget.checked) {
      showTitles = true;
    } else {
      showTitles = false;
    }
  });
  $('#institute-all').on('click', () => {
    portalsInfo.forEach((portal) => {
      $(`#${portal.name}-switch`).prop('checked', true);
      $(`#${portal.name}-switch`).trigger('change');
    });
  });
  $('#institute-none').on('click', () => {
    portalsInfo.forEach((portal) => {
      $(`#${portal.name}-switch`).prop('checked', false);
      $(`#${portal.name}-switch`).trigger('change');
    });
  });
  $('.chips-autocomplete').chips({
    placeholder: 'ex: Wiley',
    autocompleteOptions: {
      data: Editors,
      limit: Infinity,
      minLength: 1,
    },
  });
  // eslint-disable-next-line consistent-return
  $('#changeMap').on('click', () => {
    changeMap(map);
    changeMap(outsideMap);
  });
}

function initCSS() {
  portalsInfo.forEach((portal) => {
    const css = `.${portal.name} { background-color: ${portal.color} !important; } .${portal.name}:after { box-shadow: 0 0 6px 2px ${portal.color} !important; }`;
    const el = document.createElement('style');
    if (el.styleSheet) {
      el.styleSheet.cssText = css;
    } else {
      el.appendChild(document.createTextNode(css));
    }
    document.getElementsByTagName('head')[0].appendChild(el);
  });
}

/**
 * Initializatton of all parts
 */
$(document).ready(() => {
  initMap();
  initBrand();
  initLegend();
  initMenu();
  initCSS();
  timer();
});
