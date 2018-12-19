const namespace = ({ namespace, uuid }) => ({
  apiVersion: 'v1',
  kind: 'Namespace',
  metadata: { name: `${namespace}-${uuid}` },
});

const service = ({ serviceName, namespace, applicationName, containerPort, nodePort, uuid }) => ({
  apiVersion: 'v1',
  kind: 'Service',
  metadata: { name: `${serviceName}-${uuid}`, namespace },
  spec: {
    type: 'NodePort',
    selector: { app: applicationName },
    ports: [nodePort ? { port: containerPort, nodePort } : { port: containerPort }]},
});

const deployment = ({ applicationName, imageName, imageTag, containerPort, namespace, replicas, maxSurge, maxUnavailable, uuid }) => ({
  apiVersion: 'apps/v1',
  kind: 'Deployment',
  metadata: {
    name: `${applicationName}-deployment${uuid}`,
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
