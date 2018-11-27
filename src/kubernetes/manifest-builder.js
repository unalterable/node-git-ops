const namespace = ({ namespace }) => ({
  apiVersion: 'v1',
  kind: 'Namespace',
  metadata: { name: namespace },
});

const service = ({ serviceName, namespace, applicationName, containerPort, nodePort }) => ({
  apiVersion: 'v1',
  kind: 'Service',
  metadata: { name: serviceName, namespace },
  spec: {
    type: 'NodePort',
    selector: { app: applicationName },
    ports: [nodePort ? { port: containerPort, nodePort } : { port: containerPort }]},
});

const deployment = ({ applicationName, imageName, imageTag, containerPort, namespace, replicas, maxSurge, maxUnavailable }) => ({
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

module.exports = { namespace, deployment, service };
