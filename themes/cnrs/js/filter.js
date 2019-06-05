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
    // if the institute is enabled : update total html counter
    if (!isDisabled) {
      extCount.html += 1;
      $('#extHTML').html(extCount.html.toLocaleString());
    }
    // update institute html counter
    portal.html += 1;
  }

  if (ec.mime === 'PDF') {
    // if the institute is enabled : update total pdf counter
    if (!isDisabled) {
      extCount.pdf += 1;
      $('#extPDF').html(extCount.pdf.toLocaleString());
    }
    // update institute pdf counter
    portal.pdf += 1;
  }
  if (ec.mime) {
    ec.mime = `<span class="label label-bubble ${ec.mime.toLowerCase()}">${ec.mime}</span>`;
  }
  if (ec.rtype) {
    ec.rtype = `<span class="label label-bubble rtype">${ec.rtype}</span>`;
  }
  // initialize the tooltips for each institute when the counter starts (at least one html or pdf)
  if (portal.pdf === 1 || portal.html === 1) {
    $(`#${portal.name}-tooltip`).addClass('tooltipped');
    $(`#${portal.name}-tooltip`).tooltip();
  }
  // update the tooltips content
  $(`#${portal.name}-tooltip`).attr('data-tooltip', `HTML : ${portal.html} | PDF : ${portal.pdf}`);
}
