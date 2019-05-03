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

      if(ec.mime){
        if(ec.mime == 'HTML'){
          ec.mime = '<img src="images/icon_html.png" height="25px"/><br>';
        }
        if(ec.mime == 'PDF'){
          ec.mime = '<img src="images/icon_pdf.png" height="25px"/><br>';
        }
        if(ec.mime == 'GIF'){
          ec.mime = '<img src="images/icon_gif.png" height="25px"/><br>';
        }
      }

      // draw bubble
      var pulsingIcon = L.icon.pulse({iconSize:[60,60],color:colorbubble, fillColor:colorbubble});
      var bubble = L.marker([ec["geoip-latitude"], ec["geoip-longitude"]],{icon: pulsingIcon});
     
      //popup with informations about consultation
      var popup = L.popup({closeOnClick: false,autoClose: false, autoPan: false, maxWidth:100, closeButton: false})
      .setLatLng([ec["geoip-latitude"]-0.2, ec["geoip-longitude"]])
      .setContent(
         "<div class='text-popup'><strong>" + ec.platform_name + "</strong></div>" 
        + "<div class='text-popup'>" + " " + (ec.mime || "") + " " + (ec.rtype || "") + " " + (ec.publication_title || "") + "</div>"
      )
      
      // outside map
      if(ec["geoip-latitude"] > map.getBounds().getNorth() || ec["geoip-latitude"] < map.getBounds().getSouth() || ec["geoip-longitude"] >  map.getBounds().getEast() || ec["geoip-longitude"] <  map.getBounds().getWest()) {
        StartMapOutside(ec["geoip-latitude"],ec["geoip-longitude"]);
        map2.addLayer(bubble);
        popup.openOn(map2);
      } else {
        map.addLayer(bubble);
        popup.openOn(map);
      }
      
      bubble._icon.style.display = "none"

      //Timeour for animation
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
/**
 * place the view of outide map
 * @param {*} lat latitude
 * @param {*} lng longitude
 */
function StartMapOutside(lat, lng){
  map2.setView([lat,lng]);
  $("#outside_map").fadeIn(1000);
  c = document.querySelector("#outside_map");
  c.style.visible = "visible"
  window.clearTimeout(val)
  val = setTimeout(function(){ $("#outside_map").fadeOut(1000)}, 6000);
}
