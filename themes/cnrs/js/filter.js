/* eslint-disable no-unused-vars */

/**
 * filter informations receive
 * @param {*} ec
 */
function filter(ec) {
  ec.filter = ec.ezproxyName;
  return ec;
}

/**
 * update total counter and tooltip counter of portal
 * @param {*} ec
 */
function updateCounter(ec) {
  updateTotalCount();
  tooltip(ec);
}

/**
 * init counter of rtype and mime
 */
function init() {
  initTotalCounter([
    {
      name: 'html',
      id: '#extHTML',
    },
    {
      name: 'pdf',
      id: '#extPDF',
    },
  ]);
  initCounter(['html', 'pdf']);
}
