const k8s = require('kubernetes-client');

module.exports = (async ({ adminConfPath }) => {
  const config = k8s.config.fromKubeconfig(adminConfPath)

  const client = new k8s.Client({ config, version: '1.11' })

  const bob = await client.api.v1.namespaces.get().catch(console.error);
  console.log('bob')
})




