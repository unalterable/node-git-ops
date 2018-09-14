const _ = require('lodash');

const configDir = 'config/';

module.exports = (requestedConfig) => {
  const configPath = requestedConfig.split('.');
  const fileName = configPath[0];
  const path = configPath.slice(1);

  let json;
  try {
    json = require(`../${configDir}${fileName}.json`)
  } catch (e) {
    throw new Error(`there is no ${fileName}.json file in ${configDir}`);
  }

  const config = _.get(json, path)
  if(config === undefined)
    throw new Error(`there is no config '${path.join('.')}' in ${configDir}${fileName}.json`);

  return config;
}
