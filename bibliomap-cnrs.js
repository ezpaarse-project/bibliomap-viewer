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


$(document).ready(function() {

var overlay = {};

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
    showDuration = (parseInt(durations[0]) * 1000) || showDuration;
    hideDuration = (parseInt(durations[1]) * 1000) || hideDuration;
  }

  (function displayCycle() {
    $('#description').fadeIn();
    setTimeout(function() {
      $('#description').fadeOut();
      setTimeout(displayCycle, hideDuration);
    }, showDuration);
  })();
}

var socket = io.connect();
socket.on('ezpaarse-ec', function (ec) {
  if (overlay) { overlay.addEzpaarseEC(ec); }
});

BibliomapOverlay.prototype = new google.maps.OverlayView();

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

function initialize () {
  var mapOptions = {
    zoom: 6,
    center: new google.maps.LatLng(46.862342, 2.806413), // france is the center
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var map = new google.maps.Map(document.getElementById('bibliomap-canvas'), mapOptions);
  overlay = new BibliomapOverlay(map);

  var legend  = $('#legend');
  var content = legend.find('.content').first();

  var currentPosition = legend.position();
  legend.draggable({ stop: function (event, ui) { currentPosition = ui.position; } });

  legend.find('.close').click(function () { legend.slideUp(legend.remove); });
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

  // une div pour tout ranger
  var institutesList = $("<div/>").addClass('institutesList');


  // pour chaque institut
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

    institute.append($("<div/>").addClass('intra').append(link));    // lien vers le site de l'institut
    institute.append($("<div/>").addClass('intra').text(portal.name)
      .css('color', portal.color)
      .css('font-size', '20px')
      .css('font-family', 'Roboto,Arial,sans-serif')

      ); // le nom de l'institut
    institute.append($("<div/>").addClass('intra').append(span));

    portal.counter = span; // le compteur de consultations
    institutesList.append(institute);
  }
  content.append(institutesList); // insertion dans la légende
}
// fhgezghhuergiheui
function BibliomapOverlay(map) {
  this.ezpaarseEC = {};
  this.nbEC = 0;
  this.setMap(map);
}

BibliomapOverlay.prototype.draw = function (ec) {
  var self = this;
  var ecList = {};
  if (ec) {
    ecList[ec.id] = ec;
  } else {
    ecList = self.ezpaarseEC;
  }

  for (var ecId in ecList) {
    var ec = ecList[ecId];
    // get and set the EC position in pixel from the Lat/Lng
    var ecPosition = self.getProjection().fromLatLngToDivPixel(
      new google.maps.LatLng(ec['geoip-latitude'], ec['geoip-longitude'])
    );
    //console.log(ecPosition);
    // ec.div.style.left   = ecPosition.x + '100px';
    // ec.div.style.top    = ecPosition.y + 'px';
    ec.div.css('left', (ecPosition.x - 64) + 'px');
    ec.div.css('top', (ecPosition.y - 64) + 'px');

  }
}

BibliomapOverlay.prototype.addEzpaarseEC = function (ec) {
  var self = this;

  // ignore not geolocalized EC
  if (!ec['geoip-latitude'] || !ec['geoip-longitude']) return;

  var portal = portalsInfo[ec.ezproxyName];
  if (portal) {
    portal.count++;
    if (portal.counter) { portal.counter.text(portal.count.toLocaleString()); }
  }

  // Create the DIV and set some basic attributes.
  ec.div = $('<div></div>');
  // ec.div.css('border', '1px solid blue')
  ec.div.css('border', '1px solid transparent')
  ec.div.css('position', 'absolute');
  ec.div.css('color', '#FFF');
  ec.div.css('font-size', '16px');
  ec.div.css('width', '128px');
  ec.div.css('height', '128px');

  var label  = $('<div></div>').text(ec.ezproxyName)
                               .css('border', '1px solid #000')
                               .css('text-align', 'center')
                               .css('position', 'absolute')
                               .css('background-color', '#FFF')
                               .css('color', '#000')
                               .css('top', '55px')
                               .css('z-index', '100')
                               .css('padding', '4px').css('margin', '0px').css('line-height', '12px')
                               .css('width', '128px');
  var extraLabel   = $('<span></span>').text(ec.platform_name)
                                       .css('font-size', '10px');
  if (ec.publication_title) {
    if (ec.publication_title.length > 22) {
      ec.publication_title = ec.publication_title.substring(0, 22) + '...';
    }
    var extraLabel2  = $('<span></span>').text(ec.publication_title)
                                         .css('font-size', '10px');
  }
  var id = ec.online_identifier ? ec.online_identifier : ec.print_identifier;
  var extraLabel3 = $('<span></span>').text(ec.rtype + ' | ' + ec.mime + (id ? ' | ' + id : ''))
                                      .css('font-size', '10px');
  label.append('<br/>');
  label.append(extraLabel);
  if (extraLabel2) {
    label.append('<br/>');
    label.append(extraLabel2);
  }
  label.append('<br/>');
  label.append(extraLabel3);


  var circle = $('<div></div>')
                               .css('width', '128px')
                               .css('height', '128px')
                               .css('margin', 'auto')
                               .css('margin-top', '35%')
                               .css('border-radius', '50%')
                               .css('background-color', portal ? (portal.color || 'blue') : 'blue');

  ec.div.append(label);
  ec.div.append(circle);


  // We add an overlay to a map via one of the map's panes.
  // We'll add this overlay to the overlayLayer pane.
  var panes = self.getPanes();
  // console.log(ec.div)
  panes.overlayLayer.appendChild(ec.div[0]);


  // annimate the EC circle
  $(circle).animate({
    width: "toggle",
    height: "toggle"
  }, 8000);

  $(ec.div).animate({ opacity: "toggle" }, 8000);


  // destroy EC after 5 seconds
  setTimeout(function () {
    panes.overlayLayer.removeChild(ec.div[0]);
    delete self.ezpaarseEC[ec.id];
    delete ec;
  }, 10000);


  ec.id = self.nbEC++;
  self.ezpaarseEC[ec.id] = ec;
  self.draw(ec);
};

google.maps.event.addDomListener(window, 'load', initialize);

});
