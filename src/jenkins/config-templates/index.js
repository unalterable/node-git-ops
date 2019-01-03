const fs = require('fs');
const { render } = require('mustache');
const indent = require('indent-string');

const defaultJenkinsSlave = 'npm-slave';

const readFile = name => fs.readFileSync(__dirname + '/' + name).toString();
const renderFile = (fileName, vars) => render(readFile(fileName), vars);
const renderDefaultScript = (fileName, vars) => render(readFile(`default-scripts/${fileName}`), vars);
const renderPipelineJob = ({ parameters, pipelineScript }) => renderFile('pipeline-job.xml', {
  parameters: indent(parameters, 4),
  pipelineScript: pipelineScript,
});
const renderJobParams = params => params.length ? `
<hudson.model.ParametersDefinitionProperty><parameterDefinitions>\n
${params.map(param => renderFile('parameter.xml', param)).join('\n')}
</parameterDefinitions></hudson.model.ParametersDefinitionProperty>\n` : '';

const gitReferenceParam = {
  name: 'gitRef',
  description: 'Can be a git commit hash, git tag, or git branch name',
  defaultValue: 'master',
  trimString: 'true',
};
const versionIncrementParam = {
  name: 'versionIncrement',
  description: 'Increment the version how? (major, minor, or patch)',
  defaultValue: 'patch',
  trimString: 'true',
};

const imageTagParam = {
  name: 'imageTag',
  description: 'The tag (usually a version number) of the image you\'re trying to deploy',
  defaultValue: 'latest',
  trimString: 'true',
};

const createBuildJobConfig = vars => {
  const jenkinsSlave = vars.jenkinsSlave || defaultJenkinsSlave;
  const prepScript = vars.prepScript || renderDefaultScript('prep-step.sh', vars);
  const testScript = vars.testScript || renderDefaultScript('test-step.sh', vars);
  const buildScript = vars.buildScript || renderDefaultScript('build-step.sh', {
    imageName: vars.projectName,
    ...vars,
  });

  const parameters = [gitReferenceParam, versionIncrementParam].concat(vars.parameters || []);

  return renderPipelineJob({
    parameters: renderJobParams(parameters),
    pipelineScript: renderDefaultScript('build-pipeline', {
      gitRepo: vars.gitRepo,
      jenkinsSlave,
      prepScript: indent(prepScript, 6),
      testScript: indent(testScript, 6),
      buildScript: indent(buildScript, 6),
    }),
  });
};

const createDeployJobConfig = vars => {
  const config = {
    namespace: vars.namespace || 'staging',
    imageName: vars.projectName,
    serviceName: vars.applicationName || vars.projectName,
    applicationName: vars.applicationName || vars.projectName,
    containerPort: 3000,
    replicas: 1,
    maxSurge: 1,
    maxUnavailable: 0,
    progressDeadlineSeconds: 300,
    ...vars,
  };

  const jenkinsSlave = vars.jenkinsSlave || defaultJenkinsSlave;
  const deployScript = vars.deployScript || renderDefaultScript('deploy-step.sh', {
    configJSON: JSON.stringify(config, null, 2),
    ...config,
  });

  const confirmScript = vars.confirmScript || renderDefaultScript('confirm-step.sh', {});

  const parameters = []
    .concat(config.imageName.includes(':') ? [] : [imageTagParam])
    .concat(vars.parameters || []);

  return renderPipelineJob({
    parameters: renderJobParams(parameters),
    pipelineScript: renderDefaultScript('deploy-pipeline', {
      deployScript,
      confirmScript,
      jenkinsSlave,
      gitRepo: 'https://github.com/unalterable/node-git-ops.git',
    }),
  });
};

const createFolderConfig = () => readFile('folder.xml');

module.exports = {
  createBuildJobConfig,
  createDeployJobConfig,
  createFolderConfig,
};
