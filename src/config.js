const _ = require('lodash');

const configDir = 'config/';

const isTestMode = () => process.env.NODE_ENV === 'test';
const fileName = isTestMode() ? 'test.json' : 'default.json';
const overrides = {};

const getFile = (fileName) => {
  let json;
  try {
    json = require(`../${configDir}${fileName}`);
  } catch (e) {
    throw new Error(`there is no ${fileName}.json file in ${configDir}`);
  }
  return json;
};

module.exports = {
  getConfig: (requestedConfig) => {
    const configPath = requestedConfig.split('.');

    const config = _.get(overrides, configPath) || _.get(getFile(fileName), configPath);

    if(config === undefined)
      throw new Error(`there is no config '${configPath.join('.')}' in ${configDir}${fileName}.json`);

    return config;
  },
  setConfigOverride: (path, value) => _.set(overrides, path, value),
};
