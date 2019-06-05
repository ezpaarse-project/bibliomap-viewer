
/* eslint-disable no-unused-vars */
/**
 * filter informations receive
 * @param {*} ec
 */

function filter(ec) {
  ec.filter = ec.ezproxyName;
  return ec;
}

function updateCounter(ec) {
  updateTotalCount();
  tooltip(ec);
}

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
