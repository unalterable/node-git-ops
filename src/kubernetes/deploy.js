const fs = require('fs');
const shell = require('shelljs');
const manifestBuilder = require('./manifest-builder.js');
const config = require('../../deployment-config.json');

const deployManifest = (manifest) => {
  const manifestFile ='manifest.json';
  const formattedJson = JSON.stringify(manifest, null, 2);
  fs.writeFileSync(manifestFile, formattedJson);
  const command = `kubectl --kubeconfig=$KUBECONF apply -f ${manifestFile}`;
  console.info('=============');
  console.info(formattedJson);
  console.info(command);
  shell.exec(command);
  shell.exec(`rm ${manifestFile}`);
  console.info('============= Done');
};

const doDeployment = ({ imageTag }) => {
  deployManifest(manifestBuilder.namespace(config));
  deployManifest(manifestBuilder.service(config));
  deployManifest(manifestBuilder.deployment({ ...config, imageTag }));
};

doDeployment({ imageTag: 'latest' });



