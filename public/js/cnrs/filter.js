/**
 * filter informations receive
 * @param {*} ec
 */
// eslint-disable-next-line no-unused-vars
function filter(ec) {
  if (ec && ec.mime) {
    let mime = '';
    if (ec.mime === 'HTML') {
      extCount.html += 1;
      $('#extHTML').html(extCount.html.toLocaleString());
      mime = 'html';
    }

    if (ec.mime === 'PDF') {
      extCount.pdf += 1;
      $('#extPDF').html(extCount.pdf.toLocaleString());
      mime = 'pdf';
    }
    ec.mime = `<span class="label label-bubble ${mime}">${ec.mime}</span>`;
  }

  if (ec && ec.rtype) {
    ec.rtype = `<span class="label label-bubble rtype">${ec.rtype}</span>`;
  }
}
