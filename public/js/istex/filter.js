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
    if ($.inArray(ec.sid, tdm) !== -1) {
      ec.ezproxyName = 'TDM';
    } else if ($.inArray(ec.sid, documentaire) !== -1) {
      ec.ezproxyName = 'DOCUMENTAIRE';
    } else {
      ec.ezproxyName = 'OTHER';
    }
  }
}
