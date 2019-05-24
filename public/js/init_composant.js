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
let disabledInstitutes = [];
/**
 * Init the background map and the outside map
 */
let map = '';
let map2 = '';
const franceCenter = [46.3630104, 2.9846608];
const urlMap = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

function initMap() {
  map = L.map('bibliomap-canvas', {
    minZoom: 3,
    maxZoom: 8,
    zoomControl: false,
  }).setView(franceCenter, 6);

  L.tileLayer(urlMap, {
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

  map2 = L.map('outside-map', {
    minZoom: 2,
    maxZoom: 4,
    doubleClickZoom: false,
    zoomControl: false,
  }).setView([0, 0], 4);

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map2);

  L.control.zoom({
    position: 'topleft',
  }).addTo(map2);

  map2.on('click', () => {
    const oldZoom = map.getZoom();
    map.flyTo(map2.getCenter(), oldZoom);
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

  // for each institutes
  portalsInfo.forEach((portal) => {
    content.append(`<a href="${portal.link}" id="${portal.name}-tooltip" class="tooltipped" data-position="right" data-tooltip="" target="_blank">
      <li id="${portal.name}-legend" class="collection-item avatar bibliomap-collection-item">  
        <img src="${portal.logo}" class="circle bibliomap-clear-circle">
        <span id="${portal.name}-counter" class="bibliomap-counter" style="background-color: ${portal.color}">${portal.count}</span>
        <span class="title bibliomap-institut-title">${(portal.fullName ? portal.fullName : portal.name)}</span>
        <p class="bibliomap-institut-desc">${portal.desc || portal.name}</p>
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
      if (el.currentTarget.checked) {
        if (isDisabled) {
          disabledInstitutes = disabledInstitutes.filter(institut => institut !== portal.name);
          $(`#${portal.name}-legend`).css('display', 'block');
          extCount.html += portal.html;
          $('#extHTML').html(extCount.html.toLocaleString());

          extCount.pdf += portal.pdf;
          $('#extPDF').html(extCount.pdf.toLocaleString());
        }
      }

      if (!el.currentTarget.checked) {
        if (!isDisabled) {
          disabledInstitutes.push(portal.name);
          $(`#${portal.name}-legend`).css('display', 'none');
          $(`#${portal.name}-counter`).html(portal.count);

          extCount.html -= portal.html;
          $('#extHTML').html(extCount.html.toLocaleString());

          extCount.pdf -= portal.pdf;
          $('#extPDF').html(extCount.pdf.toLocaleString());
        }
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


function initMenu() {
  $('#zoom2').click(() => {
    const oldZoom = map.getZoom();
    map.flyTo(franceCenter, oldZoom);
  });
  $('.fixed-action-btn').floatingActionButton({
    hoverEnabled: false,
    direction: 'top',
  });
  $('#center').on('click', () => {
    map.flyTo(franceCenter, 6);
  });
  $('.tooltipped').tooltip();
  $('select').formSelect();
  $('#outside-map-switch').on('change', (el) => {
    if (el.currentTarget.checked) {
      displayOutsideMap = true;
    } else {
      displayOutsideMap = false;
      $('#outside-map').removeClass('fadeIn');
    }
  });
  $('#institute-all').on('click', () => {
    portalsInfo.forEach((portal) => {
      console.log($(`#${portal.name}-switch`));
      $(`#${portal.name}-switch`).prop('checked', true);
      $(`#${portal.name}-switch`).trigger('change');
    });
  });
  $('#institute-none').on('click', () => {
    portalsInfo.forEach((portal) => {
      console.log($(`#${portal.name}-switch`));
      $(`#${portal.name}-switch`).prop('checked', false);
      $(`#${portal.name}-switch`).trigger('change');
    });
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
  timer();
});
