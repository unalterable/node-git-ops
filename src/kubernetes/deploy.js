const fs = require('fs');
const shell = require('shelljs');
const config = require('../../deployment-config.json');

const namespaceFileName = 'namespace.json';
const serviceFileName = 'service.json';
const deploymentFileName = 'deployment.json';
/* const { namespace, imageName, serviceName, applicationName, containerPort, nodePort, replicas, maxSurge, maxUnavailable } = config; */

const deployManifest = ({ manifest, fileName }) => {
  const formattedJson = JSON.stringify(manifest, null, 2);
  const command = `kubectl --kubeconfig=$KUBECONF apply -f ${fileName}`;
  fs.writeFileSync(fileName, formattedJson);
  console.info('=============');
  console.info(formattedJson);
  console.info(command);
  shell.exec(command);
  console.info('============= Done');
};

const doDeployment = ({ imageTag }) => {
  const namespaceManifest = ({ namespace }) => ({
    apiVersion: 'v1',
    kind: 'Namespace',
    metadata: { name: namespace },
  });

  const serviceManifest = ({ serviceName, namespace, applicationName, containerPort, nodePort }) => ({
    apiVersion: 'v1',
    kind: 'Service',
    metadata: { name: serviceName, namespace },
    spec: {
      type: 'NodePort',
      selector: { app: applicationName },
      ports: [nodePort ? { port: containerPort, nodePort } : { port: containerPort }]},
  });

  const deploymentManifest = ({ applicationName, imageName, imageTag, containerPort, namespace, replicas, maxSurge, maxUnavailable }) => ({
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: `${applicationName}-deployment`,
      namespace,
      labels: { app: applicationName }
    },
    spec: {
      replicas,
      strategy: {
        type: 'RollingUpdate',
        rollingUpdate: { maxSurge, maxUnavailable },
      },
      selector: {
        matchLabels: { app: applicationName }
      },
      template: {
        metadata: { labels: { app: applicationName } },
        spec: {
          containers: [
            { name: applicationName, image: `${imageName}:${imageTag}`, ports: [{ containerPort }] },
          ]
        }
      }
    }
  });


  deployManifest({ manifest: namespaceManifest(config), fileName: namespaceFileName });
  deployManifest({ manifest: serviceManifest(config), fileName: serviceFileName });
  deployManifest({ manifest: deploymentManifest(config), fileName: deploymentFileName });
};

doDeployment({ imageTag: 'latest' });
/* run kubectl apply manifests */



