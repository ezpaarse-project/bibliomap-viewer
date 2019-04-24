$(document).ready(function() {

    var socket = io.connect();
    socket.on('ezpaarse-ec', function (ec) {
      if (BibliomapOverlay) { 
        BibliomapOverlay.prototype.addEzpaarseEC(ec); 
      }
    });
    
    function BibliomapOverlay(map) {
      this.ezpaarseEC = {};
      this.nbEC = 0;
      this.setMap(map);
    }

    /**
     * fonction who draw circles
     */
    BibliomapOverlay.prototype.addEzpaarseEC = function (ec) {
      var self = this;
    
      // ignore not geolocalized EC
      if (!ec['geoip-latitude'] || !ec['geoip-longitude']) return;
    
      var match = null;
      if ((match = /^_([a-z0-9]+)_$/i.exec(ec.ezproxyName)) !== null) {
        ec.ezproxyName = match[1];
      }

      // update legend
      // var portal = portalsInfo[ec.ezproxyName];
      // if (portal) {
      //   portal.count++;
      //   if (portal.counter) { portal.counter.text(portal.count.toLocaleString()); }
      // }
    
      var colorbubble = portalsInfo[ec.ezproxyName].color;

      // draw bubble
      var pulsingIcon = L.icon.pulse({iconSize:[30,30],color:colorbubble, fillColor:colorbubble});
      var bubble = L.marker([ec["geoip-latitude"], ec["geoip-longitude"]],{icon: pulsingIcon});
      carte.addLayer(bubble);


      //verification if informations receive and reduction of string if string > 22
      if (ec.publication_title) {
        if (ec.publication_title.length > 22) {
          ec.publication_title = ec.publication_title.substring(0, 22) + '...';
        }
      }


      //popup with informations about consultation
      var popup = L.popup({closeOnClick: false,autoClose: false, autoPan: false, maxWidth:100})
      .setLatLng([ec["geoip-latitude"], ec["geoip-longitude"]])
      .setContent("<h1>" + ec.ezproxyName + "</h1>" 
        + "<h3>" + ec.platform_name + "</h3>" 
        + "<h5>" + (ec.rtype || "") + " " + (ec.mime || "") + " " + (ec.publication_title || "") + "</h5>"
      ).openOn(carte);
  
      setTimeout(function(){ 
        carte.removeLayer(bubble);
        carte.removeLayer(popup);
      }, 5000);

  
    };

});
