/**
 * information about CNRS institute on legend
 */
const portalsInfo = [
  {
    name: 'INSB',
    color: '#9c126d',
    logo: 'bibcnrs-logo-biologie.png',
    link: 'https://bib.cnrs.fr/category/biologie/',
    desc: 'Biologie',
    count: 0,
  },
  {
    name: 'INC',
    color: '#007e94',
    logo: 'bibcnrs-logo-chimie.png',
    link: 'https://bib.cnrs.fr/category/chimie/',
    desc: 'Chimie',
    count: 0,
  },
  {
    name: 'INEE',
    color: '#62ae25',
    logo: 'bibcnrs-logo-ecologie.png',
    link: 'https://bib.cnrs.fr/category/ecologie/',
    desc: 'Ecologie & Environnement',
    count: 0,
  },
  {
    name: 'INSHS',
    color: '#820e12',
    logo: 'bibcnrs-logo-homme.png',
    link: 'https://bib.cnrs.fr/category/homme/',
    desc: 'Homme & Société',
    count: 0,
  },
  {
    name: 'INSIS',
    color: '#d4002d',
    logo: 'bibcnrs-logo-ingenierie.png',
    link: 'https://bib.cnrs.fr/category/ingenierie/',
    desc: 'Ingénierie & Systèmes',
    count: 0,
  },
  {
    name: 'INSMI',
    color: '#547d3d',
    logo: 'bibcnrs-logo-mathematiques.png',
    link: 'https://bib.cnrs.fr/category/mathematiques/',
    desc: 'Mathématiques',
    count: 0,
  },
  {
    name: 'IN2P3',
    color: '#e75113',
    logo: 'bibcnrs-logo-nucleaire.png',
    link: 'https://bib.cnrs.fr/category/nucleaire/',
    desc: 'Nucléaire & Particules',
    count: 0,
  },
  {
    name: 'INP',
    color: '#004494',
    logo: 'bibcnrs-logo-physique.png',
    link: 'https://bib.cnrs.fr/category/physique/',
    desc: 'Physique',
    count: 0,
  },
  {
    name: 'INS2I',
    color: '#562a84',
    logo: 'bibcnrs-logo-information.png',
    link: 'https://bib.cnrs.fr/category/information/',
    desc: "Sciences de l'information",
    count: 0,
  },
  {
    name: 'INSU',
    color: '#cc2381',
    logo: 'bibcnrs-logo-terre.png',
    link: 'https://bib.cnrs.fr/category/terre/',
    desc: 'Terre & Univers',
    count: 0,
  },
];

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
    maxBounds: [L.latLng(-80, -180), L.latLng(80, 180)],
    zoomControl: false,
  }).setView(franceCenter, 6);

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  L.control.zoom({
    position: 'topright',
  }).addTo(map);

  map2 = L.map('outside_map', {
    minZoom: 4,
    maxZoom: 4,
    dragging: false,
    doubleClickZoom: false,
    zoomControl: false,
  }).setView([0, 0], 4);
  document.getElementById('outside_map').style.display = 'none';
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map2);
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

function hexToRGB(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(${r}, ${g}, ${b})`;
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
    let showDuration = 60000;
    let hideDuration = 60000 * 10;

    if (typeof expo === 'string') {
      const durations = expo.split(',');
      showDuration = (parseInt(durations[0], 10) * 1000) || showDuration;
      hideDuration = (parseInt(durations[1], 10) * 1000) || hideDuration;
      (function displayCycle() {
        $('#description').fadeIn();
        setTimeout(() => {
          $('#description').fadeOut();
          setTimeout(displayCycle, hideDuration);
        }, showDuration);
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
    institute.css('background-color', hexToRGB(portal.color, 0.3));
    institute.css('border-radius', 10);
    const title = (`<div class="name" >${portal.name}`);
    instituteSmall.append(title);
    const link = (`<a href="${portal.link}" target="_blank"><img class="portal-logo" src="images/${portal.logo}" title="${portal.name}"></a>`);
    instituteLarge.append(link);
    const span = $(`<span id="${portal.name}" class="counter">0</span>`);
    instituteSmall.append(span);
    const instituteDesc = (`<div id="${portal.desc}" class="desc" >${portal.desc}`);
    instituteLarge.append(instituteDesc);

    institute.append(instituteSmall, instituteLarge);
    console.log(extCount);

    portal.counter = span; // le compteur de consultations
    institutesList.append(institute);
  });

  // insertion in legend
  content.append(institutesList);
}

/**
 * Initializatton of all parts
 */
$(document).ready(() => {
  initMap();
  initBrand();
  initLegend();
  timer();
});
