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
    
      //switch to define bubble color with the institute name
      var colorbubble = "";
      switch (ec.ezproxyName){
        case "INSB":
          colorbubble = "#9c126d";
          break;
        case "INC":
          colorbubble = "#007e94";
          break;
        case "INEE":
          colorbubble = "#62ae25";
           break;
        case "INSHS":
          colorbubble = "#820e12";
          break;
        case "INSIS":
          colorbubble = "#d4002d";
          break;
        case "INSMI":
          colorbubble = "#547d3d";
          break;
        case "IN2P3":
          colorbubble = "#e75113";
          break;
        case "INP":
          colorbubble = "#004494";
          break;
        case "INS2I":
          colorbubble = "#562a84";
          break;
        case "INSU":
          colorbubble = "#cc2381";
          break;
        }

      // draw bubble
      var pulsingIcon = L.icon.pulse({iconSize:[30,30],color:colorbubble, fillColor:colorbubble});
      var bubble = L.marker([ec["geoip-latitude"], ec["geoip-longitude"]],{icon: pulsingIcon});
      carte.addLayer(bubble);

    
      //verification if informations receive 
      var publication_title = "";
      var rtype = "";
      var mime = "";

      if(ec.publication_title != undefined){
        publication_title = ec.publication_title;
      }
      if(ec.rtype != undefined){
        rtype = ec.rtype;
      }
      if(ec.mime != undefined){
        mime = ec.mime;
      }

      //popup with informations about consultation
      var popup = L.popup({closeOnClick: false,autoClose: false, autoPan: false})
      .setLatLng([ec["geoip-latitude"], ec["geoip-longitude"]])
      .setContent("<h2>" + ec.ezproxyName + "</h2>" + "<h4>" + ec.platform_name + "</h4>" + "<h5>" + rtype + " " + mime + " " + publication_title + "</h5>")
      .openOn(carte);
  
      setTimeout(function(){ carte.removeLayer(bubble)}, 5000);
      setTimeout(function(){ carte.removeLayer(popup) }, 5000);
  
    };

});
