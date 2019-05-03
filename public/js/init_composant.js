'use strict'

/**
 * information about CNRS institute on legend
 */
var portalsInfo = {
    'INSB': {
      name: 'INSB',
      color: '#9c126d',
      logo: 'bibcnrs-logo-biologie.png',
      link: 'https://bib.cnrs.fr/category/biologie/',
      count: 0
    },
    'INC': {
      name: 'INC',
      color: '#007e94',
      logo: 'bibcnrs-logo-chimie.png',
      link: 'https://bib.cnrs.fr/category/chimie/',
      count: 0
    },
    'INEE': {
      name: 'INEE',
      color: '#62ae25',
      logo: 'bibcnrs-logo-ecologie.png',
      link: 'https://bib.cnrs.fr/category/ecologie/',
      count: 0
    },
    'INSHS': {
      name: 'INSHS',
      color: '#820e12',
      logo: 'bibcnrs-logo-homme.png',
      link: 'https://bib.cnrs.fr/category/homme/',
      count: 0
    },
    'INSIS': {
      name: 'INSIS',
      color: '#d4002d',
      logo: 'bibcnrs-logo-ingenierie.png',
      link: 'https://bib.cnrs.fr/category/ingenierie/',
      count: 0
    },
    'INSMI': {
      name: 'INSMI',
      color: '#547d3d',
      logo: 'bibcnrs-logo-mathematiques.png',
      link: 'https://bib.cnrs.fr/category/mathematiques/',
      count: 0
    },
    'IN2P3': {
      name: 'IN2P3',
      color: '#e75113',
      logo: 'bibcnrs-logo-nucleaire.png',
      link: 'https://bib.cnrs.fr/category/nucleaire/',
      count: 0
    },
      'INP': {
      name: 'INP',
      color: '#004494',
      logo: 'bibcnrs-logo-physique.png',
      link: 'https://bib.cnrs.fr/category/physique/',
      count: 0
    },
      'INS2I': {
      name: 'INS2I',
      color: '#562a84',
      logo: 'bibcnrs-logo-information.png',
      link: 'https://bib.cnrs.fr/category/information/',
      count: 0
    },
      'INSU': {
      name: 'INSU',
      color: '#cc2381',
      logo: 'bibcnrs-logo-terre.png',
      link: 'https://bib.cnrs.fr/category/terre/',
      count: 0
    }
  };

  /**
   * Init the background map and the outside map
   */

  //TODO trouver un moyen d'exporter les cartes 

  var map = "";
  var map2 = "";


  function initMap(){

    const franceCenter = [46.3630104, 2.9846608]
    map = L.map('bibliomap-canvas', {
      minZoom: 3,
      maxZoom: 8,
      maxBounds: [L.latLng(-80,-180),L.latLng(80,180)]
    }).setView(franceCenter, 6);
    
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    map2 = L.map('outside_map').setView([0,0], 4);
    document.getElementById('outside_map').style.display = 'none';
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map2);
  }


  //TODO je sais pas à quoi elle sert
  /**
   * @param {*} variable 
   */
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

  /**
   * Start timer when you arrive on Bibliomap
   */
  function timer(){
    let time = 0;
    setInterval(function(){    
      const tmp = (time / 3600);
      const days = Math.floor(tmp / 24);
      const hours = Math.floor(tmp % 24);
      const minutes = Math.floor((time / 60) % 60);
      const seconds = (time % 60);
      document.getElementById("Timer").innerHTML = `${days}j ${hours}h ${minutes}m ${seconds}s` 
      time++;
    },1000);
  }
  
  /**
   * Init the message when you arrive on Bibliomap
   * with the demo mode, it appear in a regular rhythm
   */
  function initBrand(){
    //button "Fermer" on description
    var description  = $('#description');
    description.find('.close').click(function () { 
        description.slideUp(description.remove); 
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
    }

  }

  /**
   * add evenement for button and update the DOM 
   */
  function initLegend(){
    //button "fermer" on legend
    var legend  = $('#legend');
    legend.find('.close').click(function () { 
        legend.slideUp(legend.remove); 
    });

    var content = legend.find('.content').first();
    var currentPosition = legend.position();

    //button "Réduire" on legend
    legend.find('.reduce').click(function () {
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
    var institutesList = $("<div/>").addClass('institutesList');
  
    // for each institutes
    for (var i in portalsInfo) {
      var portal = portalsInfo[i];
      if (!portal.hasOwnProperty('logo')) { continue; }
  
      var institute = $("<div/>").addClass('institute');
  
      var link  = $('<a></a>');
      var img   = $('<img>');
      var span  = $('<span></span>');
  
  
      link.attr('href', portal.link);
      link.attr('target', "_blank");
      span.attr('id', i);
      img.attr('src', 'images/' + portal.logo);
      img.attr('title', portal.name);
  
      span.addClass('counter');
      img.addClass('portal-logo');
  
      link.append(img);
  
      // link to the institute's website
      institute.append($("<div/>").addClass('intra').append(link));    
      institute.append($("<div/>").addClass('intra').text(portal.name)
        .css('color', portal.color)
        .css('font-size', '20px')
        .css('font-family', 'Roboto,Arial,sans-serif')
  
        ); 
      // name of institute
      institute.append($("<div/>").addClass('intra').append(span));
  
      // consultation counter
      portal.counter = span; 
      institutesList.append(institute);
    }
     // insertion in legend
    content.append(institutesList);
  }

  /**
   * Initializatton of all parts
   */
  $(document).ready(function() {
    initMap();
    initBrand();
    initLegend();
    timer();
  });