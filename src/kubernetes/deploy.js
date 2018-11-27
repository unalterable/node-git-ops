const fs = require('fs');
const shell = require('shelljs');
const manifestBuilder = require('./manifest-builder.js');
const config = require('../../deployment-config.json');

const namespaceFileName = 'namespace.json';
const serviceFileName = 'service.json';
const deploymentFileName = 'deployment.json';

const deployManifest = ({ manifest, fileName }) => {
  /* const formattedJson = JSON.stringify(manifest, null, 2); */
  const formattedJson = JSON.stringify(manifest);
  const command = `kubectl --kubeconfig=$KUBECONF apply ${formattedJson}`;
  /* fs.writeFileSync(fileName, formattedJson); */
  console.info('=============');
  /* console.info(formattedJson); */
  console.info(command);
  shell.exec(command);
  console.info('============= Done');
};

const doDeployment = ({ imageTag }) => {
  deployManifest({
    manifest: manifestBuilder.namespace(config),
    fileName: namespaceFileName,
  });
  deployManifest({
    manifest: manifestBuilder.service(config),
    fileName: serviceFileName,
  });
  deployManifest({
    manifest: manifestBuilder.deployment({ ...config, imageTag }),
    fileName: deploymentFileName,
  });
};

doDeployment({ imageTag: 'latest' });
/* run kubectl apply manifests */



