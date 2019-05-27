/**
 * filter informations receive
 * @param {*} ec
 */
// eslint-disable-next-line no-unused-vars
function filter(ec) {
  const tdm = ['istex-api-harvester', 'node-istex'];
  const documentaire = [
    'google', // résolveur de lien de Google Scholar
    'ebsco', // résolveur de lien d'EBSCO (FTF)
    'smash', // résolveur de lien de Aix-Marseille
    'istex-view',
    'istex-browser-addon',
    'istex-api-demo',
    'istex-widgets',
  ];
  ec.ezproxyName = 'OTHER';
  if (ec.sid) {
    if (tdm.includes(ec.sid)) {
      ec.ezproxyName = 'TDM';
    }
    if (documentaire.includes(ec.sid)) {
      ec.ezproxyName = 'DOCUMENTAIRE';
    }
    if (ec.mime) {
      ec.mime = `<span class="label label-bubble">${ec.mime}</span>`;
    }
    if (ec.rtype) {
      ec.rtype = `<span class="label label-bubble rtype">${ec.rtype}</span>`;
    }
  }
}
