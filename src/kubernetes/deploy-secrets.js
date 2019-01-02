const shell = require('shelljs');

const deploySecrets = ({ namespace, name, secrets }) => {
  if (!namespace) throw 'Please include a namespace';

  if (!name) throw 'Please include a secret name';

  if (!secrets.split(' ').length) throw 'Please include at least one secret';

  const secretFlags = secrets.split(' ').map(secret => {
    if(!secret.match(/^[^=]+=[^=]+$/)) throw 'Please ensure secrets are written as key=value, separated by a space';
    return `--from-literal=${secret}`;
  });

  const censoredSecretFlags = secrets.split(' ').map(secret => `--from-literal=${secret.split('=')[0]}=***`);

  const cmd = `kubectl --kubeconfig="$KUBECONF" --namespace=${namespace} create secret generic ${name}`;

  console.info(`${cmd} ${censoredSecretFlags.join(' ')}`);
  const response = shell.exec(`${cmd} ${secretFlags.join(' ')}`);
  if (response.code !== 0) throw `Error: ${response.stderr}`;
};

module.exports = deploySecrets;
