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

    
      //verification if informations receive 
      var publication_title = ec.publication_title || "";
      var rtype = ec.rtype || "";
      var mime =  ec.mime || "";

      //popup with informations about consultation
      var popup = L.popup({closeOnClick: false,autoClose: false, autoPan: false})
      .setLatLng([ec["geoip-latitude"], ec["geoip-longitude"]])
      .setContent("<h2>" + ec.ezproxyName + "</h2>" + "<h4>" + ec.platform_name + "</h4>" + "<h5>" + rtype + " " + mime + " " + publication_title + "</h5>")
      .openOn(carte);
  
      setTimeout(function(){ carte.removeLayer(bubble)}, 5000);
      setTimeout(function(){ carte.removeLayer(popup) }, 5000);
  
    };

});
