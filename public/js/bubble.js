/**
 * filter informations receive
 * @param {*} ec
 */
function filter(ec) {
  // verification if informations receive and reduction of string if string > 22
  if (ec.publication_title) {
    if (ec.publication_title.length > 22) {
      ec.publication_title = `${ec.publication_title.substring(0, 22)}...`;
    }
  }

  const mime = {
    HTML: 'icon_html.png',
    PDF: 'icon_pdf.png',
    GIF: 'icon_gif.png',
    MISC: 'icon_misc.png',
    XML: 'icon_xml.png',
    JSON: 'icon_json.png',
  };

  const rtype = {
    ARTICLE: 'icon_article.png',
    BOOK: 'icon_book.png',
    BOOK_SECTION: 'icon_book.png',
    BROCHE: 'icon_book.png',
    BOOKSERIE: 'icon_book.png',
    IMAGE: 'icon_image.png',
    AUDIO: 'icon_audio.png',
    VIDEO: 'icon_video.png',
    TOC: 'icon_toc.png',
    SEARCH: 'icon_search.png',
  };

  if (mime[ec.mime]) {
    ec.mime = `<img src="images/${mime[ec.mime]}" class="icon-popup" />`;
  }

  if (rtype[ec.rtype]) {
    ec.rtype = `<img src="images/${rtype[ec.rtype]}" class="icon-popup" />`;
  }
}

// TODO voir comment changer ce val
let val = 0;
/**
 * place the view of outide map
 * @param {*} lat latitude
 * @param {*} lng longitude
 */
function startMapOutside(lat, lng) {
  map2.setView([lat, lng]);
  $('#outside_map').fadeIn(1000);
  document.querySelector('#outside_map').style.visible = 'visible';
  window.clearTimeout(val);
  val = setTimeout(() => {
    $('#outside_map').fadeOut(1000);
  }, 6000);
}

/**
 * place the puldateIcon and information bubble on map
 * @param {*} ec
 */
function showInfo(ec) {
  const bounds = map.getBounds();
  const north = bounds.getNorth();
  const south = bounds.getSouth();
  const east = bounds.getEast();
  const west = bounds.getWest();

  const nbMap = (Math.round(((east + west) / 2) / 360));

  const lng = ec['geoip-longitude'] + (nbMap * 360);
  const lat = ec['geoip-latitude'];
  const colorBubble = portalsInfo.find(portal => portal.name === ec.ezproxyName);
  // draw bubble
  const pulsingIcon = L.icon.pulse({
    iconSize: [60, 60],
    color: colorBubble.color,
    fillColor: colorBubble.color,
  });
  const bubble = L.marker([lat, lng], { icon: pulsingIcon });

  // popup with informations about consultation
  const popup = L.popup({
    closeOnClick: false,
    autoClose: false,
    autoPan: false,
    maxWidth: 100,
    closeButton: false,
  }).setLatLng([lat - 0.2, lng]).setContent(`
    <div class='text-popup'><strong>${ec.platform_name}</strong></div> 
    <div class='text-popup'> ${(ec.rtype || '')} ${(ec.mime || '')} ${(ec.publication_title || '')}</div>
  `);

  if (lat > north || lat < south || lng > east || lng < west) {
    const etat = document.getElementById('filter-button');
    if (etat.value === 'on') {
      startMapOutside(lat, lng);
    }
    map2.addLayer(bubble);
    popup.openOn(map2);
  } else {
    map.addLayer(bubble);
    popup.openOn(map);
  }

  bubble._icon.style.display = 'none';

  $(bubble._icon).fadeIn(1000);

  setTimeout(() => {
    map.removeLayer(popup);
    map2.removeLayer(popup);
    $(bubble._icon).fadeOut(1000);
  }, 5000);

  setTimeout(() => {
    map2.removeLayer(bubble);
    map.removeLayer(bubble);
  }, 6000);
}

function BibliomapOverlay(map) {
  this.ezpaarseEC = {};
  this.nbEC = 0;
  this.setMap(map);
}

$(document).ready(() => {
  const socket = io.connect();
  socket.on('ezpaarse-ec', (ec) => {
    if (BibliomapOverlay) {
      BibliomapOverlay.prototype.addEzpaarseEC(ec);
    }
  });

  /**
   * fonction who draw circles
   */
  BibliomapOverlay.prototype.addEzpaarseEC = (ec) => {
    // ignore not geolocalized EC
    if (!ec['geoip-latitude'] || !ec['geoip-longitude']) return;

    const match = /^_([a-z0-9]+)_$/i.exec(ec.ezproxyName);
    if (match) {
      ec.ezproxyName = match[1];
    }

    // update legend
    const portal = portalsInfo.find(p => p.name === ec.ezproxyName);
    if (portal) {
      portal.count += 1;
      if (portal.counter) {
        portal.counter.text(portal.count.toLocaleString());
        if (ec.mime === 'HTML') {
          extCount.html += 1;
        }
        if (ec.mime === 'PDF') {
          extCount.pdf += 1;
        }
        document.getElementById('ext_count').innerHTML = `${extCount.html}html ${extCount.pdf}pdf`;
      }
    }

    filter(ec);
    showInfo(ec);
  };
});
