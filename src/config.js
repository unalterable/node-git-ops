const requireAll = require('require-all');

const requiredConfig = ['jenkins', 'git']
const configDirectory = __dirname + '/../' + 'config';

module.exports = () => {
  const config = requireAll(configDirectory);
  requiredConfig.forEach(configFile => {
    if(!config[configFile])
      throw new Error(`there is no ${configFile}.json file in ${configDirectory}`);
  })
  return config;
}
