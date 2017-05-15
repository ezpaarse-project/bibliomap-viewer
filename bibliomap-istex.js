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

function getacces(arrayAcces,element) {
  for (var i = 0; i < arrayAcces.length; i++) {
    if (arrayAcces[i] == element) {
      return true;
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
  'TDM': {
    name: 'TDM',
    color: '#62ae25',
    count: 0
  },
  'DOCUMENTAIRE': {
    name: 'DOCIMENTAIRE',
    color: '#007e94',
    count: 0
  },
  'OTHER': {
    name: 'OTHER',
    color: '#9c126d',
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

  // une table pour tout ranger
  var table = $("<table/>")
        .css('text-align', 'right')
  ;

  // pour chaque institut
  for (var i in portalsInfo) {
    var portal = portalsInfo[i];
    //if (!portal.hasOwnProperty('logo')) { continue; }

    var row = $("<tr/>"); // une ligne par institut

    var div   = $('<div></div>');
    //var link  = $('<a></a>');
    var img   = $('<img>');
    var span  = $('<span></span>');


    //link.attr('href', portal.link);
    //link.attr('target', "_blank");
    span.attr('id', i);
    //img.attr('src', '/images/' + portal.logo);
    //img.attr('title', portal.name);

    span.addClass('counter');
    //img.addClass('portal-logo');

    //link.append(img);

    //row.append($("<td/>").append(link));    // lien vers le site de l'institut
    row.append($("<td/>").text(portal.name)
      .css('color', portal.color)
      .css('font-size', '20px')
      .css('font-family', 'Roboto,Arial,sans-serif')

      ); // le nom de l'institut
    row.append($("<td/>").append(span));

    portal.counter = span; // le compteur de consultations
    table.append(row);
  }
  content.append(table); // insertion de la table dans la légende
}

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
  var tdm = ['istex-api-harvester','node-istex'];
  var documentaire = ['google','istex-api-demo','istex-widgets','istex-widgets'];
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

  var circleColor = '#9c126d';
  if (ec.sid)
    switch (true) {
      case getacces(tdm,ec.sid):
        circleColor = '#62ae25';
        break;
      case getacces(documentaire,ec.sid):
        circleColor = '#007e94';
        break;
      default:
        circleColor = '#9c126d';
    }
  }
  var circle = $('<div></div>')
                               .css('width', '128px')
                               .css('height', '128px')
                               .css('margin', 'auto')
                               .css('margin-top', '35%')
                               .css('border-radius', '50%')
                               .css('background-color', circleColor);

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
