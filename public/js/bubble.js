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
      var portal = portalsInfo[ec.ezproxyName];
      if (portal) {
        portal.count++;
        if (portal.counter) { portal.counter.text(portal.count.toLocaleString()); }
      }
    
      var colorbubble = portalsInfo[ec.ezproxyName].color;

      //verification if informations receive and reduction of string if string > 22
      if (ec.publication_title) {
        if (ec.publication_title.length > 22) {
          ec.publication_title = ec.publication_title.substring(0, 22) + '...';
        }
      }

      // draw bubble
      var pulsingIcon = L.icon.pulse({iconSize:[50,50],color:colorbubble, fillColor:colorbubble});
      var bubble = L.marker([ec["geoip-latitude"], ec["geoip-longitude"]],{icon: pulsingIcon});
     

      //popup with informations about consultation
      var popup = L.popup({closeOnClick: false,autoClose: false, autoPan: false, maxWidth:75})
      .setLatLng([ec["geoip-latitude"], ec["geoip-longitude"]])
      .setContent(
         "<div id='text-popup'><strong>" + ec.platform_name + "</strong></div>" 
        + "<div id='text-popup'>" + (ec.rtype || "") + " " + (ec.mime || "") + " " + (ec.publication_title || "") + "</div>"
      )
      
      if(ec["geoip-latitude"] > map.getBounds().getNorth() || ec["geoip-latitude"] < map.getBounds().getSouth() || ec["geoip-longitude"] >  map.getBounds().getEast() || ec["geoip-longitude"] <  map.getBounds().getWest()) {
        StartMapOutside(ec["geoip-latitude"],ec["geoip-longitude"]);
        map2.addLayer(bubble);
        popup.openOn(map2);
        popup._container.style.opacity = 0.8
        bubble._icon.style.display = "none"
      } else {
        map.addLayer(bubble);
        popup.openOn(map);
        popup._container.style.opacity = 0.8
        bubble._icon.style.display = "none"
      }

      $(bubble._icon).fadeIn(1000)

      setTimeout(function(){ 
        map.removeLayer(popup);
        map2.removeLayer(popup);
        $(bubble._icon).fadeOut(1000)
      }, 5000);

      setTimeout(function(){
        map2.removeLayer(bubble);
        map.removeLayer(bubble);
      },6000); 

    };

});

val = 0;
function StartMapOutside(lat, lng){
  map2.setView([lat,lng]);
  $("#outside_map").fadeIn(1000);
  c = document.querySelector("#outside_map");
  c.style.visible = "visible"
  window.clearTimeout(val)
  val = setTimeout(function(){ $("#outside_map").fadeOut(1000)}, 6000);
}
