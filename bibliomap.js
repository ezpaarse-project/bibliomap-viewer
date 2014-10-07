var overlay;

BibliomapOverlay.prototype = new google.maps.OverlayView();

function initialize () {
  var mapOptions = {
    zoom: 6,
    center: new google.maps.LatLng(46.862342, 2.806413), // france is the center
    mapTypeId: google.maps.MapTypeId.SATELLITE
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
    console.log(ecPosition);
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
  //ec.div.css('border', '1px solid blue')
  ec.div.css('position', 'absolute');
  ec.div.css('color', '#FFF');
  ec.div.css('font-size', '16px');
  ec.div.css('width', '128px');
  ec.div.css('height', '128px');

  var label  = $('<div></div>').text(ec.ezproxyName)
                               .css('border', '1px solid #000')
                               .css('vertical-align', 'middle')
                               .css('text-align', 'center')
                               .css('position', 'absolute')
                               .css('background-color', '#FFF')
                               .css('color', '#000')
                               .css('top', '55px')
                               .css('z-index', '100')
                               .css('width', '128px');
  var circle = $('<div></div>')
                               .css('position', 'absolute') 
                               .css('top', '45px')
                               .css('left', '40px')
                               .css('text-align', 'center')
                               .css('vertical-align', 'middle')
                               .css('border-radius', '50%')
                               .css('background-color', 'red')
                               .css('width', '64px')
                               .css('height', '64px');

  ec.div.append(label);
  ec.div.append(circle);


  // We add an overlay to a map via one of the map's panes.
  // We'll add this overlay to the overlayLayer pane.
  var panes = self.getPanes();
  console.log(ec.div)
  panes.overlayLayer.appendChild(ec.div[0]);


  // annimate the EC circle
  $(circle).animate({
    width: [ "toggle" ],
    height: [ "toggle" ]
  }, 3000);

  $(ec.div).animate({
    opacity: "toggle",
  }, 3000);


  // destroy EC after 5 seconds
  setTimeout(function () {
    panes.overlayLayer.removeChild(ec.div[0]);
    delete self.ezpaarseEC[ec.id];
    delete ec;
  }, 5000);


  ec.id = self.nbEC++;
  self.ezpaarseEC[ec.id] = ec;
  self.draw(ec);
};

google.maps.event.addDomListener(window, 'load', initialize);