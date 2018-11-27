npm i

echo '{{{ configJSON }}}' > deployment-config.json

npm run kubernetesDeployment imageTag=$imageTag
