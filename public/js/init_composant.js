

/**
 * init map
 */
var map = L.map('bibliomap-canvas').setView([46.3630104, 2.9846608], 6);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var map2 = L.map('outside_map').setView([0,0], 4);
document.getElementById('outside_map').style.display = 'none';
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map2);

/**
 * information about CNRS institute on legend
 */
var portalsInfo = {
    'INSB': {
      name: 'INSB',
      color: '#9c126d',
      logo: 'bibcnrs-logo-biologie.png',
      link: 'https://bib.cnrs.fr/category/biologie/',
      desc: "Biologie",
      count: 0
    },
    'INC': {
      name: 'INC',
      color: '#007e94',
      logo: 'bibcnrs-logo-chimie.png',
      link: 'https://bib.cnrs.fr/category/chimie/',
      desc: "Chimie",
      count: 0
    },
    'INEE': {
      name: 'INEE',
      color: '#62ae25',
      logo: 'bibcnrs-logo-ecologie.png',
      link: 'https://bib.cnrs.fr/category/ecologie/',
      desc: "Ecologie & Environnement",
      count: 0
    },
    'INSHS': {
      name: 'INSHS',
      color: '#820e12',
      logo: 'bibcnrs-logo-homme.png',
      link: 'https://bib.cnrs.fr/category/homme/',
      desc: "Homme & Société",
      count: 0
    },
    'INSIS': {
      name: 'INSIS',
      color: '#d4002d',
      logo: 'bibcnrs-logo-ingenierie.png',
      link: 'https://bib.cnrs.fr/category/ingenierie/',
      desc: "Ingénierie & Systèmes",
      count: 0
    },
    'INSMI': {
      name: 'INSMI',
      color: '#547d3d',
      logo: 'bibcnrs-logo-mathematiques.png',
      link: 'https://bib.cnrs.fr/category/mathematiques/',
      desc: "Mathématiques",
      count: 0
    },
    'IN2P3': {
      name: 'IN2P3',
      color: '#e75113',
      logo: 'bibcnrs-logo-nucleaire.png',
      link: 'https://bib.cnrs.fr/category/nucleaire/',
      desc: "Nucléaire & Particules",
      count: 0
    },
      'INP': {
      name: 'INP',
      color: '#004494',
      logo: 'bibcnrs-logo-physique.png',
      link: 'https://bib.cnrs.fr/category/physique/',
      desc: "Physique",
      count: 0
    },
      'INS2I': {
      name: 'INS2I',
      color: '#562a84',
      logo: 'bibcnrs-logo-information.png',
      link: 'https://bib.cnrs.fr/category/information/',
      desc: "Sciences de l'information",
      count: 0
    },
      'INSU': {
      name: 'INSU',
      color: '#cc2381',
      logo: 'bibcnrs-logo-terre.png',
      link: 'https://bib.cnrs.fr/category/terre/',
      desc: "Terre & Univers",
      count: 0
    }
  };

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars  = query.split("&");
  
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      if (pair[0] == variable) {
        return (pair.length > 1 ? pair[1] : true);
      }
    }
  
    return false;
  }

  function hexToRGB(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
  }
  /**
   * initalize evenement on button and build the html tree for the legend
   */
  function initialize () {

    //button "fermer" on legend
    var legend  = $('#legend');
    legend.find('.close').click(function () { 
        legend.slideUp(legend.remove); 
    });

    $('#brand').click(function () { $('#description').fadeToggle(); });
    $('#description .close').click(function () { $('#description').fadeOut(); });
    $("#brand a").click(function (e) { e.stopPropagation(); });

    var expo = getQueryVariable('expo') || getQueryVariable('e');

    if (!expo) {
      $('#description').fadeIn();
    } else if (['none', '0'].indexOf(expo) == -1) {
      var showDuration = 60000;
      var hideDuration = 60000 * 10;

      if (typeof expo == 'string') {
        var durations = expo.split(',');
        showDuration = (parseInt(durations[0]) * 1000) || showDuration;
        hideDuration = (parseInt(durations[1]) * 1000) || hideDuration;
      }

      (function displayCycle() {
        $('#description').fadeIn();
        setTimeout(function() {
          $('#description').fadeOut();
          setTimeout(displayCycle, hideDuration);
        }, showDuration);
      })();
    }

    var content = legend.find('.content').first();
    var currentPosition = legend.position();

    //button "Réduire" on legend
    legend.find('.reduce').click(function () {
        legend.css('width', '10%').css('height', 'auto');
        if (content.is(':visible')) {
          legend.animate({ top: '0px', left: '0px' });
          $(this).text('Agrandir');
        } else {
          legend.animate(currentPosition);
          $(this).text('Réduire');
        }
        content.slideToggle();
      });

    //button "Fermer" on description
    var description  = $('#description');
    description.find('.close').click(function () { 
        description.slideUp(description.remove); 
    });

    // TypeError: legend.draggable is not a function
    // legend.draggable({ stop: function (event, ui) { currentPosition = ui.position; } });
  
    
    // une div pour tout ranger
    var institutesList = $("<div/>").addClass('institutesList');
  
  
    // pour chaque institut
    for (var i in portalsInfo) {
      var portal = portalsInfo[i];
      if (!portal.hasOwnProperty('logo')) { continue; }
      
      var institute = $("<div/>").addClass('institute');
      var instituteSmall = $("<div/>").addClass('instituteSmall');
      var instituteLarge =$("<div/>").addClass('instituteLarge');
      
      
        
        
      
      institute.css('background-color',hexToRGB(portal.color,0.3))
      institute.css('border-radius', 10 )

      
      const title = (`<div class="name" >${portal.name}`);
      instituteSmall.append(title);
      const link = (`<a href="${portal.link}" target="_blank"><img class="portal-logo" src="images/${portal.logo}" title="${portal.name}"></a>`);
      instituteLarge.append(link);
      const span = $(`<span id="${portal.name}" class="counter"></span>`)
      instituteSmall.append(span);
      const institute_desc = (`<div id="${portal.desc}" class="desc" >${portal.desc}`)
      instituteLarge.append(institute_desc);

      institute.append(instituteSmall,instituteLarge)

      portal.counter = span; // le compteur de consultations
      institutesList.append(institute);
    }
    content.append(institutesList); // insertion dans la légende

    time = 0;
    setInterval(function(){
      
      const tmp = (time / 3600);
      const days = Math.floor(tmp / 24);
      const hours = Math.floor(tmp % 24);
      const minutes = Math.floor((time / 60) % 60);
      const seconds = (time % 60);
      
      document.getElementById("Timer").innerHTML = `${days}j ${hours}h ${minutes}m ${seconds}s` //montre minuterie
      time++;

    },1000);
  }

  

  initialize();
  