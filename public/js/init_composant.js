/**
 * information about CNRS institute on legend
 */
const portalsInfo = [
  {
    name: 'INSB',
    color: '#9c126d',
    logo: 'bibcnrs-logo-biologie.png',
    link: 'https://bib.cnrs.fr/category/biologie/',
    count: 0,
  },
  {
    name: 'INC',
    color: '#007e94',
    logo: 'bibcnrs-logo-chimie.png',
    link: 'https://bib.cnrs.fr/category/chimie/',
    count: 0,
  },
  {
    name: 'INEE',
    color: '#62ae25',
    logo: 'bibcnrs-logo-ecologie.png',
    link: 'https://bib.cnrs.fr/category/ecologie/',
    count: 0,
  },
  {
    name: 'INSHS',
    color: '#820e12',
    logo: 'bibcnrs-logo-homme.png',
    link: 'https://bib.cnrs.fr/category/homme/',
    count: 0,
  },
  {
    name: 'INSIS',
    color: '#d4002d',
    logo: 'bibcnrs-logo-ingenierie.png',
    link: 'https://bib.cnrs.fr/category/ingenierie/',
    count: 0,
  },
  {
    name: 'INSMI',
    color: '#547d3d',
    logo: 'bibcnrs-logo-mathematiques.png',
    link: 'https://bib.cnrs.fr/category/mathematiques/',
    count: 0,
  },
  {
    name: 'IN2P3',
    color: '#e75113',
    logo: 'bibcnrs-logo-nucleaire.png',
    link: 'https://bib.cnrs.fr/category/nucleaire/',
    count: 0,
  },
  {
    name: 'INP',
    color: '#004494',
    logo: 'bibcnrs-logo-physique.png',
    link: 'https://bib.cnrs.fr/category/physique/',
    count: 0,
  },
  {
    name: 'INS2I',
    color: '#562a84',
    logo: 'bibcnrs-logo-information.png',
    link: 'https://bib.cnrs.fr/category/information/',
    count: 0,
  },
  {
    name: 'INSU',
    color: '#cc2381',
    logo: 'bibcnrs-logo-terre.png',
    link: 'https://bib.cnrs.fr/category/terre/',
    count: 0,
  },
];

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
  }).setView(franceCenter, 6);

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  map2 = L.map('outside_map').setView([0, 0], 4);
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
    legend.css('width', 'auto').css('height', 'auto');
    if (content.is(':visible')) {
      legend.animate({ top: '20px', left: '80px' });
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
  for (let i = 0; i < portalsInfo.length; i += 1) {
    const institute = $('<div/>').addClass('institute');
    const link = (`<a href="${portalsInfo[i].link}" target="_blank"><img class="portal-logo" src="images/${portalsInfo[i].logo}" title="${portalsInfo[i].name}"></a>`);
    institute.append($('<div/>').addClass('intra').append(link));
    const title = (`<div class="intra" style="color:${portalsInfo[i].color}">${portalsInfo[i].name}`);
    institute.append($('<div/>').addClass('intra').append(title));
    const span = $(`<span id="${portalsInfo[i].name}" class="counter"></span>`);
    institute.append($('<div/>').addClass('intra').append(span));

    // consultation counter
    portalsInfo[i].count = span;
    institutesList.append(institute);
  }
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
