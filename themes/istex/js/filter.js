/* eslint-disable no-unused-vars */

/**
 * filter informations receive
 * @param {*} ec
 */

function filter(ec) {
  ec.filter = ec.sid;
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
  ec.filter = 'OTHER';
  if (ec.sid) {
    if (tdm.includes(ec.sid)) {
      ec.filter = 'TDM';
    }
    if (documentaire.includes(ec.sid)) {
      ec.filter = 'DOCUMENTAIRE';
    }
  }
}

function init() {
  initTotalCounter([
    {
      name: 'json',
      id: '#extJSON',
    },
    {
      name: 'article',
      id: '#extARTICLE',
    },
  ]);
  initCounter(['json', 'article']);
}

function updateCounter(ec) {
  updateTotalCount();
  tooltip(ec);
}
