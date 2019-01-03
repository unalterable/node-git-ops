const namespace = ({ namespace, uuid }) => ({
  apiVersion: 'v1',
  kind: 'Namespace',
  metadata: { name: namespace, labels: { uuid } },
});

const service = ({ serviceName, namespace, applicationName, containerPort, nodePort, uuid }) => ({
  apiVersion: 'v1',
  kind: 'Service',
  metadata: { name: serviceName, namespace, labels: { uuid } },
  spec: {
    type: 'NodePort',
    selector: { app: applicationName },
    ports: [nodePort ? { port: containerPort, nodePort } : { port: containerPort }]},
});

const deployment = ({ applicationName, imageName, containerPort, namespace, replicas, maxSurge, maxUnavailable, progressDeadlineSeconds, env, uuid }) => ({
  apiVersion: 'apps/v1',
  kind: 'Deployment',
  metadata: {
    name: `${applicationName}`,
    namespace,
    labels: { app: applicationName, uuid }
  },
  spec: {
    replicas,
    strategy: { type: 'RollingUpdate', rollingUpdate: { maxSurge, maxUnavailable } },
    selector: { matchLabels: { app: applicationName } },
    progressDeadlineSeconds,
    template: {
      metadata: { labels: { app: applicationName } },
      spec: {
        containers: [
          { name: applicationName, image: imageName, ports: [{ containerPort }], env },
        ]
      }
    }
  }
});

module.exports = { namespace, deployment, service };
