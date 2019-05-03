'use strict'
$(document).ready(function() {

    const socket = io.connect();
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

      // ignore not geolocalized EC
      if (!ec['geoip-latitude'] || !ec['geoip-longitude']) return;
    
      let match = null;
      if ((match = /^_([a-z0-9]+)_$/i.exec(ec.ezproxyName)) !== null) {
        ec.ezproxyName = match[1];
      }

      // update legend
      let portal = portalsInfo[ec.ezproxyName];
      if (portal) {
        portal.count++;
        if (portal.counter) { portal.counter.text(portal.count.toLocaleString()); }
      }

      filter(ec);
      showInfo(ec);
    
    };
});

let val = 0;
/**
 * place the view of outide map
 * @param {*} lat latitude
 * @param {*} lng longitude
 */
function startMapOutside(lat, lng){
  map2.setView([lat,lng]);
  $("#outside_map").fadeIn(1000);
  document.querySelector("#outside_map").style.visible = "visible";
  window.clearTimeout(val)
  val = setTimeout(function(){ $("#outside_map").fadeOut(1000)}, 6000);
}

/**
 * place the puldateIcon and information bubble on map
 * @param {*} ec 
 */
function showInfo(ec){
  const lng = ec["geoip-longitude"];
  const lat = ec["geoip-latitude"];
  const colorBubble = portalsInfo[ec.ezproxyName].color;
  // draw bubble
  const pulsingIcon = L.icon.pulse({iconSize:[60,60],color: colorBubble, fillColor: colorBubble});
  const bubble = L.marker([lat, lng],{icon: pulsingIcon});
 
  //popup with informations about consultation
  const popup = L.popup({closeOnClick: false,autoClose: false, autoPan: false, maxWidth:100, closeButton: false})
  .setLatLng([lat-0.2, lng])
  .setContent(`
    <div class='text-popup'><strong>${ec.platform_name}</strong></div> 
    <div class='text-popup'>${(ec.mime || "")} ${(ec.rtype || "")} ${(ec.publication_title || "")}</div>
  `)
  
  // outside map
  if(lat > map.getBounds().getNorth() || lat < map.getBounds().getSouth() || lng >  map.getBounds().getEast() || lng <  map.getBounds().getWest()) {
    startMapOutside(lat,lng);
    map2.addLayer(bubble);
    popup.openOn(map2);
  } else {
    map.addLayer(bubble);
    popup.openOn(map);
  }
  
  bubble._icon.style.display = "none"

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
}

function filter(ec){
  //verification if informations receive and reduction of string if string > 22
  if (ec.publication_title) {
    if (ec.publication_title.length > 22) {
      ec.publication_title = ec.publication_title.substring(0, 22) + '...';
    }
  }

  //add icon
  if(ec.mime == 'HTML'){
     ec.mime = '<img src="images/icon_html.png" height="25px"/><br>';
  }
  if(ec.mime == 'PDF'){
    ec.mime = '<img src="images/icon_pdf.png" height="25px"/><br>';
  }
  if(ec.mime == 'GIF'){
    ec.mime = '<img src="images/icon_gif.png" height="25px"/><br>';
  }

  //TODO créer un icon pour misc / changer celui de html pour qu'il ressemble au autre
}
