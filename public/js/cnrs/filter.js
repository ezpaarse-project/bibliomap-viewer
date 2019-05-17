/**
 * filter informations receive
 * @param {*} ec
 */
// eslint-disable-next-line no-unused-vars
function filter(ec) {
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
  if (ec.mime === 'HTML') {
    extCount.html += 1;
    document.getElementById('extCountHTML').innerHTML = `${extCount.html}`;
  }
  if (ec.mime === 'PDF') {
    extCount.pdf += 1;
    document.getElementById('extCountPDF').innerHTML = `${extCount.pdf}`;
  }
  if (mime[ec.mime]) {
    ec.mime = `<img src="/public/images/${mime[ec.mime]}" class="icon-popup" />`;
  }
  if (rtype[ec.rtype]) {
    ec.rtype = `<img src="/public/images/${rtype[ec.rtype]}" class="icon-popup" />`;
  }
}
