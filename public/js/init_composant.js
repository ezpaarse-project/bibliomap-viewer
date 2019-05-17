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

function initMap() {
  const franceCenter = [46.3630104, 2.9846608];
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
    $('#outside_map').fadeOut(100);
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
  // button "Fermer" on description
  const description = $('#description');
  description.find('.close').click(() => {
    description.slideUp(description.remove);
  });

  $('#brand').click(() => { $('#description').fadeToggle(); });
  $('#description .close').click(() => { $('#description').fadeOut(); });
  $('#brand a').click((e) => { e.stopPropagation(); });

  const expo = getQueryVariable('expo') || getQueryVariable('e');

  if (!expo) {
    $('#description').fadeIn();
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
        $('#description').fadeIn();
        $('#description').scrollTop(0);
        setTimeout(() => {
          $('#description').animate({ scrollTop: $('#description')[0].scrollHeight }, 3000);

          setTimeout(() => {
            $('#description').fadeOut();

            setTimeout(displayCycle, hideDuration);
          }, showDuration / 2);
        }, showDuration / 2);
      }());
    }
  }
}

/**
 * add evenement for button and update the DOM
 */
function initLegend() {
  // button "fermer" on legend
  const legend = $('#legend');
  legend.find('.close').click(() => {
    legend.slideUp(legend.remove);
  });

  const content = legend.find('.content').first();
  const currentPosition = legend.position();

  // button "Réduire" on legend
  legend.find('.reduce').click(() => {
    if (content.is(':visible')) {
      legend.animate({ top: '0px', left: '0px' });
      $(this).text('Agrandir');
    } else {
      legend.animate(currentPosition);
      $(this).text('Réduire');
    }
    content.slideToggle();
  });

  // a div to put everything away
  const institutesList = $('<div/>').addClass('institutesList');

  // for each institutes
  portalsInfo.forEach((portal) => {
    const institute = $('<div/>').addClass('institute');
    const instituteSmall = $('<div/>').addClass('instituteSmall');
    const instituteLarge = $('<div/>').addClass('instituteLarge');
    institute.css('color', portal.color);
    institute.css('border-radius', 10);
    const title = (`<div class="name" >${(portal.fullName ? portal.fullName : portal.name)}`);
    instituteSmall.append(title);

    if (portal.logo) {
      const link = (`<a href="${portal.link}" target="_blank"><img class="portal-logo" src="${portal.logo}" title="${portal.name}"></a>`);
      instituteLarge.append(link);
    }
    const span = $(`<span id="${portal.name}" class="counter">0</span>`);
    instituteSmall.append(span);
    if (portal.desc) {
      const instituteDesc = (`<div id="${portal.desc}" class="desc" >${portal.desc}`);
      instituteLarge.append(instituteDesc);
    }

    institute.append(instituteSmall, instituteLarge);

    portal.counter = span; // le compteur de consultations
    institutesList.append(institute);
  });

  // insertion in legend
  content.append(institutesList);
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
});
