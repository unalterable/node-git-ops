const shell = require('shelljs');
const config = require('../../deployment-config.json');

const kubeConf = '--kubeconfig=$KUBECONF';
const namespace = `--namespace=${config.namespace}`;
const kubectlCmd = `kubectl ${kubeConf} ${namespace}`;
const rolloutStatusCommand = `${kubectlCmd} rollout status deployment ${config.applicationName}`;
const rollbackCommand = `${kubectlCmd} rollout undo deployment ${config.applicationName}`;

const exec = cmd => console.info(cmd) || shell.exec(cmd);

console.info('=============');

exec(rolloutStatusCommand);
if (shell.error()) {
  console.info();
  console.info('DEPLOYMENT FAILURE - ATTEMPTING ROLLBACK');
  exec(rollbackCommand);
  process.exit(1);
}

console.info('============= Done');
