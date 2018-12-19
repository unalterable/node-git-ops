const fs = require('fs');
const shell = require('shelljs');
const uuid = require('uuid/v4');
const manifestBuilder = require('./manifest-builder.js');
const { getCurrentVersionFromHub } = require('../docker/hub');
const config = require('../../deployment-config.json');

const getImageTag = async () => {
  let tag;
  try { tag = process.argv[2].match(/imageTag=(.*)/)[1]; }
  catch (e) { tag = 'latest'; }
  return tag === 'latest'
   ? await getCurrentVersionFromHub({ dockerHubRepo: config.imageName })
   : tag;
};

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

const doDeployment = async () => {
  const uuid = uuid();
  const imageTag = await getImageTag();
  console.log(imageTag)
  deployManifest(manifestBuilder.namespace({ ...config, uuid }));
  deployManifest(manifestBuilder.service({ ...config, uuid }));
  deployManifest(manifestBuilder.deployment({ ...config, uuid, imageTag }));
};

doDeployment();



