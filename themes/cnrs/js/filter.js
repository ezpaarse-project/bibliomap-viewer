/**
 * filter informations receive
 * @param {*} ec
 */
// eslint-disable-next-line no-unused-vars
function filter(ec) {
  return ec;
}

// eslint-disable-next-line no-unused-vars
function counter(ec, portal) {
  if (!ec) {
    return;
  }
  const isDisabled = disabledInstitutes.find(institut => institut === ec.ezproxyName);
  if (ec.mime === 'HTML') {
    if (!isDisabled) {
      extCount.html += 1;
      $('#extHTML').html(extCount.html.toLocaleString());
    }
    portal.html += 1;
  }

  if (ec.mime === 'PDF') {
    if (!isDisabled) {
      extCount.pdf += 1;
      $('#extPDF').html(extCount.pdf.toLocaleString());
    }
    portal.pdf += 1;
  }
  if (ec.mime) {
    ec.mime = `<span class="label label-bubble ${ec.mime.toLowerCase()}">${ec.mime}</span>`;
  }
  if (ec.rtype) {
    ec.rtype = `<span class="label label-bubble rtype">${ec.rtype}</span>`;
  }
  if (portal.pdf === 1 || portal.html === 1) {
    $(`#${portal.name}-tooltip`).addClass('tooltipped');
    $(`#${portal.name}-tooltip`).tooltip();
  }
  $(`#${portal.name}-tooltip`).attr('data-tooltip', `HTML : ${portal.html} | PDF : ${portal.pdf}`);
}
