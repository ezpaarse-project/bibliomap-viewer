/**
 * information about CNRS institute on legend
 */

// eslint-disable-next-line no-unused-vars
const extCount = {
  pdf: 0,
  html: 0,
};

/**
 * Init the background map and the outside map
 */
let map = '';
let map2 = '';
const franceCenter = [46.3630104, 2.9846608];

function initMap() {
  map = L.map('bibliomap-canvas', {
    minZoom: 3,
    maxZoom: 8,
    zoomControl: false,
  }).setView(franceCenter, 6);

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
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

  map2 = L.map('outside_map', {
    minZoom: 2,
    maxZoom: 4,
    doubleClickZoom: false,
    zoomControl: false,
  }).setView([0, 0], 4);
  document.getElementById('outside_map').style.display = 'none';

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map2);

  L.control.zoom({
    position: 'topleft',
  }).addTo(map2);

  map2.on('click', () => {
    const oldZoom = map.getZoom();
    map.flyTo(map2.getCenter(), oldZoom);
    $('#outside_map').fadeOut(1000);
  });
}

function initMenu() {
  $('#zoom2').click(() => {
    const oldZoom = map.getZoom();
    map.flyTo(franceCenter, oldZoom);
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
  $('.fixed-action-btn').floatingActionButton();
  const expo = getQueryVariable('expo') || getQueryVariable('e');
  if (!expo) {
    $('.modal').modal('open');
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
        $('.modal').modal('open');
        $('#description').scrollTop(0);
        setTimeout(() => {
          $('#description').animate({ scrollTop: $('#description')[0].scrollHeight }, 3000);

          setTimeout(() => {
            $('.modal').modal('close');

            setTimeout(displayCycle, hideDuration);
          }, showDuration / 2);
        }, showDuration / 2);
      }());
    }
  }
  $('#brand').on('click', () => {
    $('.modal').modal('open');
  });
}

/**
 * add evenement for button and update the DOM
 */
function initLegend() {
  const content = $('#legend');

  // for each institutes
  portalsInfo.forEach((portal) => {
    content.append(`<a href="${portal.link}" target="_blank">
      <li class="collection-item avatar bibliomap-collection-item">  
        <img src="${portal.logo}" class="circle bibliomap-clear-circle">
        <span id="${portal.name}-counter" class="bibliomap-counter" style="background-color: ${portal.color}">${portal.count}</span>
        <span class="title bibliomap-institut-title">${(portal.fullName ? portal.fullName : portal.name)}</span>
        <p class="bibliomap-institut-desc">${portal.desc}</p>
      </li>
    </a>`);
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

// function initFilter() {
//   const filterBouton = document.getElementById('filter-button');
//   function updateBtn() {
//     if (filterBouton.value === 'on') {
//       filterBouton.value = 'off';
//       $('#outside_map').fadeOut(1000);
//     } else {
//       filterBouton.value = 'on';
//     }
//   }
//   filterBouton.addEventListener('click', updateBtn);
// }

/**
 * Initializatton of all parts
 */
$(document).ready(() => {
  initMap();
  initBrand();
  initLegend();
  // initFilter();
  timer();
  initMenu();
});
