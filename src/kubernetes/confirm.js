const shell = require('shelljs');
const config = require('../../deployment-config.json');

const kubeConf = '--kubeconfig=$KUBECONF';
const namespace = `--namespace=${config.namespace}`;
const rolloutStatusCommand = `kubectl ${kubeConf} ${namespace} rollout status deployment ${config.applicationName}`;

console.info('=============');

console.info(rolloutStatusCommand);
shell.exec(rolloutStatusCommand);
if (shell.error()) throw Error('Failed');

console.info('============= Done');
