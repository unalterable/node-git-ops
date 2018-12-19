const shell = require('shelljs');
const config = require('../../deployment-config.json');

const rolloutStatusCommand = `kubectl --kubeconfig=$KUBECONF rollout status deploy ${config.imageName}`;

console.info('=============');

console.info(rolloutStatusCommand);
shell.exec(rolloutStatusCommand);

console.info('============= Done');
