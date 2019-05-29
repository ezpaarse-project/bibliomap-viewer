/**
 * filter informations receive
 * @param {*} ec
 */
// eslint-disable-next-line no-unused-vars
function filter(ec, portal) {
  if (ec && ec.mime) {
    let mime = '';
    const isDisabled = disabledInstitutes.find(institut => institut === ec.ezproxyName);
    if (ec.mime === 'HTML') {
      if (!isDisabled) {
        extCount.html += 1;
        $('#extHTML').html(extCount.html.toLocaleString());
      }
      portal.html += 1;
      mime = 'html';
    }

    if (ec.mime === 'PDF') {
      if (!isDisabled) {
        extCount.pdf += 1;
        $('#extPDF').html(extCount.pdf.toLocaleString());
      }
      portal.pdf += 1;
      mime = 'pdf';
    }
    ec.mime = `<span class="label label-bubble ${mime}">${ec.mime}</span>`;
  }

  if (ec && ec.rtype) {
    ec.rtype = `<span class="label label-bubble rtype">${ec.rtype}</span>`;
  }

  $(`#${portal.name}-tooltip`).attr('data-tooltip', `HTML : ${portal.html} | PDF : ${portal.pdf}`);
}
