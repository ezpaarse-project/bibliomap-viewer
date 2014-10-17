 
$(document).ready(function() {

var overlay = {};

var socket = io.connect();
socket.on('ezpaarse-ec', function (ec) {
  if (overlay) { overlay.addEzpaarseEC(ec); }
});

BibliomapOverlay.prototype = new google.maps.OverlayView();

var ezproxyColor = {
  'bibliovie': { 'color': '#4D9022', 'name': 'Science de la Vie'},
  'biblioplanets': { 'color': '#CE2984', 'name': 'Science de la Vie'},
  'titanesciences': { 'color': '#007E93', 'name': 'Sciences Chimiques'},
  'biblioinserm': { 'color': '#F04E23', 'name': 'INSERM'},
  'bibliost2i': {'color': '#803689', 'name': 'Sciences et Techniques de l\'ingenieur' },
  'biblioshs': { 'color': '#F38E00', 'name': 'Sciences Humaines et Sociales'}
};

  // var cList = $('<ul></ul>')
  //     .css('top', '250px')
  //     .css('left', '100px')
  //     .css('z-index', '99')
  //     .css('position', 'absolute');

  // Object.keys(ezproxyColor).forEach(function(k) {
  //   console.log(k);
  //   var li = $('<li/>')
  //       .text(ezproxyColor[k].name)
  //       .css('background-color', ezproxyColor[k].color)
  //       .appendTo(cList);
  // });
  // console.log(cList);
  // $('#bibliomap-canvas').append(cList);

function initialize () {
  var mapOptions = {
    zoom: 6,
    center: new google.maps.LatLng(46.862342, 2.806413), // france is the center
    mapTypeId: google.maps.MapTypeId.ROADMAP 
  };

  var map = new google.maps.Map(document.getElementById('bibliomap-canvas'), mapOptions);
  overlay = new BibliomapOverlay(map);
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

  Object.keys(ecList).forEach(function (ecId) {
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

  });
}


BibliomapOverlay.prototype.addEzpaarseEC = function (ec) {
  var self = this;

  // ignore not geolocalized EC
  if (!ec['geoip-latitude'] || !ec['geoip-longitude']) return;

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
                               .css('background-color', ezproxyColor[ec.ezproxyName] ? (ezproxyColor[ec.ezproxyName].color || 'blue') : 'blue');

  ec.div.append(label);
  ec.div.append(circle);


  // We add an overlay to a map via one of the map's panes.
  // We'll add this overlay to the overlayLayer pane.
  var panes = self.getPanes();
  // console.log(ec.div)
  panes.overlayLayer.appendChild(ec.div[0]);


  // annimate the EC circle
  $(circle).animate({
    width: [ "toggle" ],
    height: [ "toggle" ]
  }, 8000);

  $(ec.div).animate({
    opacity: "toggle",
  }, 8000);


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

